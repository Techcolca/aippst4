import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, desc, sql, gt, gte } from 'drizzle-orm';
import { actionCosts, userBudgets, usageTracking, sentAlerts } from '../../shared/schema';
import type { ActionCost, UserBudget, InsertUsageTracking, SentAlert } from '../../shared/schema';

const connection = postgres(process.env.DATABASE_URL!);
const db = drizzle(connection);

// Cache para costos (5 minutos)
const costCache = new Map<string, { cost: ActionCost; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Tipos de acciones costeables en el sistema
 */
export type ActionType = 'create_integration' | 'create_form' | 'send_email' | 'chat_conversation';

/**
 * Resultado de verificación de presupuesto
 */
export interface BudgetCheckResult {
  allowed: boolean;
  userBudget: UserBudget | null;
  actionCost: ActionCost | null;
  costToApply: string;
  remainingBudget: string;
  percentageUsed: number;
  reason?: string;
  willTriggerAlert?: {
    threshold: number;
    type: 'threshold_50' | 'threshold_80' | 'threshold_90' | 'budget_exceeded';
  };
}

/**
 * Resultado de carga de costo a usuario
 */
export interface ChargeResult {
  success: boolean;
  transactionId?: number;
  newCurrentSpent?: string;
  budgetExceeded?: boolean;
  alertTriggered?: {
    threshold: number;
    type: string;
    alertId?: number;
  };
  error?: string;
}

/**
 * Obtiene el costo actual para un tipo de acción, con cache
 */
export async function getActionCost(actionType: ActionType): Promise<ActionCost | null> {
  const cacheKey = actionType;
  const cached = costCache.get(cacheKey);
  
  // Verificar cache
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.cost;
  }

  try {
    const cost = await db
      .select()
      .from(actionCosts)
      .where(and(
        eq(actionCosts.actionType, actionType),
        eq(actionCosts.isActive, true)
      ))
      .limit(1);

    if (cost.length === 0) {
      console.warn(`No se encontró costo para acción: ${actionType}`);
      return null;
    }

    // Actualizar cache
    costCache.set(cacheKey, {
      cost: cost[0],
      timestamp: Date.now()
    });

    return cost[0];
  } catch (error) {
    console.error(`Error al obtener costo para ${actionType}:`, error);
    return null;
  }
}

/**
 * Calcula el precio final aplicando markup sobre costo base usando NUMERIC de DB
 * ELIMINADO: Esta función no se debe usar más para evitar errores de precisión
 * El cálculo de final_cost debe hacerse directamente en la base de datos
 */
// DEPRECATED: No usar - usar cálculo directo en DB
// export function calculateFinalCost(baseCost: string, markupPercentage: number): string

/**
 * Obtiene el presupuesto actual de un usuario
 */
export async function getUserBudget(userId: number): Promise<UserBudget | null> {
  try {
    const budget = await db
      .select()
      .from(userBudgets)
      .where(eq(userBudgets.userId, userId))
      .limit(1);

    return budget.length > 0 ? budget[0] : null;
  } catch (error) {
    console.error(`Error al obtener presupuesto para usuario ${userId}:`, error);
    return null;
  }
}

/**
 * Verifica si un usuario puede realizar una acción dentro de su presupuesto
 * OPTIMIZADO: Sin FOR UPDATE innecesario, verificación eficiente con SQL
 */
export async function checkBudgetAvailability(
  userId: number, 
  actionType: ActionType
): Promise<BudgetCheckResult> {
  try {
    // Verificación optimizada sin transacción ni locks innecesarios
    const verificationQuery = await db
      .select({
        // Datos del presupuesto
        userBudgetId: userBudgets.id,
        monthlyBudget: userBudgets.monthlyBudget,
        currentSpent: userBudgets.currentSpent,
        currency: userBudgets.currency,
        isSuspended: userBudgets.isSuspended,
        alertThreshold50: userBudgets.alertThreshold50,
        alertThreshold80: userBudgets.alertThreshold80,
        alertThreshold90: userBudgets.alertThreshold90,
        alertThreshold100: userBudgets.alertThreshold100,
        
        // Datos del costo de acción
        actionCostId: actionCosts.id,
        actionType: actionCosts.actionType,
        finalCost: actionCosts.finalCost,
        costCurrency: actionCosts.currency,
        isActive: actionCosts.isActive,
        
        // Cálculos SQL para evitar JavaScript arithmetic
        hasEnoughFunds: sql<boolean>`(${userBudgets.monthlyBudget} - ${userBudgets.currentSpent}) >= ${actionCosts.finalCost}`,
        remainingBudget: sql<string>`(${userBudgets.monthlyBudget} - ${userBudgets.currentSpent})::numeric(12,2)::text`,
        currentPercentage: sql<number>`(${userBudgets.currentSpent}::numeric / ${userBudgets.monthlyBudget}::numeric * 100)::numeric(5,2)`,
        newPercentage: sql<number>`((${userBudgets.currentSpent} + ${actionCosts.finalCost})::numeric / ${userBudgets.monthlyBudget}::numeric * 100)::numeric(5,2)`
      })
      .from(userBudgets)
      .leftJoin(actionCosts, and(
        eq(actionCosts.actionType, actionType),
        eq(actionCosts.isActive, true)
      ))
      .where(eq(userBudgets.userId, userId))
      .limit(1);

    if (verificationQuery.length === 0) {
      return {
        allowed: false,
        userBudget: null,
        actionCost: null,
        costToApply: "0.00",
        remainingBudget: "0.00",
        percentageUsed: 0,
        reason: "Usuario no tiene presupuesto configurado. Contacte al administrador."
      };
    }

    const result = verificationQuery[0];

    // Verificar si se encontró el costo de acción
    if (!result.actionCostId || !result.isActive) {
      return {
        allowed: false,
        userBudget: {
          id: result.userBudgetId,
          userId,
          monthlyBudget: result.monthlyBudget,
          currentSpent: result.currentSpent,
          currency: result.currency,
          isSuspended: result.isSuspended,
          alertThreshold50: result.alertThreshold50,
          alertThreshold80: result.alertThreshold80,
          alertThreshold90: result.alertThreshold90,
          alertThreshold100: result.alertThreshold100
        } as UserBudget,
        actionCost: null,
        costToApply: "0.00",
        remainingBudget: result.remainingBudget,
        percentageUsed: result.currentPercentage,
        reason: `Costo no configurado para acción: ${actionType}`
      };
    }

    // Verificar si está suspendido
    if (result.isSuspended) {
      return {
        allowed: false,
        userBudget: {
          id: result.userBudgetId,
          userId,
          monthlyBudget: result.monthlyBudget,
          currentSpent: result.currentSpent,
          currency: result.currency,
          isSuspended: result.isSuspended,
          alertThreshold50: result.alertThreshold50,
          alertThreshold80: result.alertThreshold80,
          alertThreshold90: result.alertThreshold90,
          alertThreshold100: result.alertThreshold100
        } as UserBudget,
        actionCost: {
          id: result.actionCostId,
          actionType: result.actionType,
          finalCost: result.finalCost,
          currency: result.costCurrency,
          isActive: result.isActive
        } as ActionCost,
        costToApply: result.finalCost || "0.00",
        remainingBudget: result.remainingBudget || "0.00",
        percentageUsed: Math.min(result.currentPercentage, 100),
        reason: "Presupuesto mensual agotado. Aumente su presupuesto para continuar."
      };
    }

    // Verificar fondos suficientes
    if (!result.hasEnoughFunds) {
      return {
        allowed: false,
        userBudget: {
          id: result.userBudgetId,
          userId,
          monthlyBudget: result.monthlyBudget,
          currentSpent: result.currentSpent,
          currency: result.currency,
          isSuspended: result.isSuspended,
          alertThreshold50: result.alertThreshold50,
          alertThreshold80: result.alertThreshold80,
          alertThreshold90: result.alertThreshold90,
          alertThreshold100: result.alertThreshold100
        } as UserBudget,
        actionCost: {
          id: result.actionCostId,
          actionType: result.actionType,
          finalCost: result.finalCost,
          currency: result.costCurrency,
          isActive: result.isActive
        } as ActionCost,
        costToApply: result.finalCost || "0.00",
        remainingBudget: result.remainingBudget || "0.00",
        percentageUsed: Math.min(result.currentPercentage, 100),
        reason: `Fondos insuficientes. Costo: $${result.finalCost || "0.00"} ${result.currency}, Disponible: $${result.remainingBudget || "0.00"} ${result.currency}`
      };
    }

    // Determinar si se activará una alerta al realizar esta acción
    let willTriggerAlert = undefined;
    if (result.currentPercentage < 50 && result.newPercentage >= 50 && result.alertThreshold50) {
      willTriggerAlert = { threshold: 50, type: 'threshold_50' as const };
    } else if (result.currentPercentage < 80 && result.newPercentage >= 80 && result.alertThreshold80) {
      willTriggerAlert = { threshold: 80, type: 'threshold_80' as const };
    } else if (result.currentPercentage < 90 && result.newPercentage >= 90 && result.alertThreshold90) {
      willTriggerAlert = { threshold: 90, type: 'threshold_90' as const };
    } else if (result.newPercentage >= 100 && result.alertThreshold100) {
      willTriggerAlert = { threshold: 100, type: 'budget_exceeded' as const };
    }

    // Calcular remaining budget después de la acción usando SQL precision
    const remainingAfterActionResult = await db.execute(
      sql`SELECT (${result.monthlyBudget} - ${result.currentSpent} - ${result.finalCost || "0.00"})::numeric(12,2)::text as remaining`
    );
    const remainingAfterAction = remainingAfterActionResult;

    return {
      allowed: true,
      userBudget: {
        id: result.userBudgetId,
        userId,
        monthlyBudget: result.monthlyBudget,
        currentSpent: result.currentSpent,
        currency: result.currency,
        isSuspended: result.isSuspended,
        alertThreshold50: result.alertThreshold50,
        alertThreshold80: result.alertThreshold80,
        alertThreshold90: result.alertThreshold90,
        alertThreshold100: result.alertThreshold100
      } as UserBudget,
      actionCost: {
        id: result.actionCostId,
        actionType: result.actionType,
        finalCost: result.finalCost,
        currency: result.costCurrency,
        isActive: result.isActive
      } as ActionCost,
      costToApply: result.finalCost || "0.00",
      remainingBudget: (remainingAfterAction[0] as any)?.remaining || "0.00",
      percentageUsed: Math.min(result.newPercentage, 100),
      willTriggerAlert
    };

  } catch (error) {
    console.error(`Error al verificar presupuesto para usuario ${userId}:`, error);
    return {
      allowed: false,
      userBudget: null,
      actionCost: null,
      costToApply: "0.00",
      remainingBudget: "0.00",
      percentageUsed: 0,
      reason: "Error interno al verificar presupuesto"
    };
  }
}

/**
 * Cobra una acción al presupuesto del usuario y registra el uso
 * CORREGIDO: Usa operaciones atómicas con SELECT FOR UPDATE y NUMERIC precision
 */
export async function chargeUserBudget(
  userId: number,
  actionType: ActionType,
  resourceId?: number,
  resourceType?: string,
  metadata?: any
): Promise<ChargeResult> {
  try {
    // Generar billing month (YYYY-MM)
    const now = new Date();
    const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Transacción atómica para evitar race conditions
    const result = await db.transaction(async (tx) => {
      // 1. SELECT FOR UPDATE para lock atómico del presupuesto
      const userBudgetQuery = await tx
        .select()
        .from(userBudgets)
        .where(eq(userBudgets.userId, userId))
        .for('update')
        .limit(1);

      if (userBudgetQuery.length === 0) {
        throw new Error("Usuario no tiene presupuesto configurado");
      }

      const userBudget = userBudgetQuery[0];

      // 2. Verificar si está suspendido
      if (userBudget.isSuspended) {
        throw new Error("Presupuesto mensual agotado");
      }

      // 3. Obtener costo de la acción
      const actionCostQuery = await tx
        .select()
        .from(actionCosts)
        .where(and(
          eq(actionCosts.actionType, actionType),
          eq(actionCosts.isActive, true)
        ))
        .limit(1);

      if (actionCostQuery.length === 0) {
        throw new Error(`Costo no configurado para acción: ${actionType}`);
      }

      const actionCost = actionCostQuery[0];

      // 4. Verificar fondos suficientes usando SQL para evitar problemas de precisión
      const budgetCheck = await tx
        .select({
          hasEnoughFunds: sql<boolean>`(monthly_budget - current_spent) >= ${actionCost.finalCost}`,
          remainingBudget: sql<string>`(monthly_budget - current_spent)::numeric(12,2)::text`,
          monthlyBudget: userBudgets.monthlyBudget,
          currentSpent: userBudgets.currentSpent
        })
        .from(userBudgets)
        .where(eq(userBudgets.userId, userId))
        .limit(1);

      if (budgetCheck.length === 0 || !budgetCheck[0].hasEnoughFunds) {
        throw new Error(`Fondos insuficientes para realizar la acción. Disponible: $${budgetCheck[0]?.remainingBudget || "0.00"} ${userBudget.currency}, Requerido: $${actionCost.finalCost} ${userBudget.currency}`);
      }
      
      // 5. Actualizar presupuesto completamente en SQL con NUMERIC precision
      const updateResult = await tx
        .update(userBudgets)
        .set({
          currentSpent: sql`current_spent + ${actionCost.finalCost}`,
          isSuspended: sql`(current_spent + ${actionCost.finalCost}) >= monthly_budget`,
          suspendedAt: sql`CASE WHEN (current_spent + ${actionCost.finalCost}) >= monthly_budget THEN NOW() ELSE suspended_at END`,
          updatedAt: new Date()
        })
        .where(eq(userBudgets.userId, userId))
        .returning({
          id: userBudgets.id,
          newCurrentSpent: userBudgets.currentSpent,
          monthlyBudget: userBudgets.monthlyBudget,
          isSuspended: userBudgets.isSuspended,
          currency: userBudgets.currency,
          previousSpent: sql<string>`(${userBudgets.currentSpent} - ${actionCost.finalCost})::numeric(12,2)::text`
        });

      if (updateResult.length === 0) {
        throw new Error("Error al actualizar presupuesto");
      }

      const updatedBudget = updateResult[0];

      // 6. Registrar uso con actionCostId para auditoría
      const usageRecord = {
        userId,
        actionType,
        actionCostId: actionCost.id, // NUEVO: Versionado de precios
        costApplied: actionCost.finalCost,
        currency: userBudget.currency,
        resourceId,
        resourceType,
        billingMonth,
        metadata
      };

      const insertedUsage = await tx.insert(usageTracking).values([usageRecord]).returning();

      // 7. Calcular porcentajes usando SQL para precisión correcta
      const percentagesResult = await tx.execute(
        sql`SELECT 
          ((${updatedBudget.newCurrentSpent})::numeric / (${updatedBudget.monthlyBudget})::numeric * 100)::numeric(5,2) as current_percentage,
          ((${updatedBudget.previousSpent})::numeric / (${updatedBudget.monthlyBudget})::numeric * 100)::numeric(5,2) as previous_percentage`
      );
      const percentagesRow = percentagesResult[0] as any;
      const percentages = {
        currentPercentage: parseFloat(percentagesRow.current_percentage as string),
        previousPercentage: parseFloat(percentagesRow.previous_percentage as string)
      };

      return {
        transactionId: insertedUsage[0]?.id,
        updatedBudget,
        actionCost,
        percentages,
        userBudget: updatedBudget // CRITICAL FIX: Use updated budget, not obsolete userBudget
      };
    });

    // 8. Procesar alerta FUERA de la transacción para evitar bloqueos largos
    let alertTriggered = undefined;
    if (result.percentages && result.updatedBudget) {
      alertTriggered = await processAlertIfNeeded(
        userId,
        {
          ...result.updatedBudget,
          isSuspended: result.updatedBudget.isSuspended || false
        }, // CRITICAL FIX: Use updated budget values, handle null isSuspended
        result.percentages.previousPercentage,
        result.percentages.currentPercentage,
        billingMonth
      );
    }

    return {
      success: true,
      transactionId: result.transactionId,
      newCurrentSpent: result.updatedBudget.newCurrentSpent,
      budgetExceeded: result.updatedBudget.isSuspended || false,
      alertTriggered
    };

  } catch (error) {
    console.error(`Error al cobrar presupuesto para usuario ${userId}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error interno al procesar el cobro"
    };
  }
}

/**
 * Procesa y persiste alertas de presupuesto cuando se cruzan umbrales
 * CORREGIDO: Usa valores actualizados del presupuesto, no valores obsoletos
 */
async function processAlertIfNeeded(
  userId: number,
  updatedBudget: {
    id: number;
    newCurrentSpent: string;
    monthlyBudget: string;
    isSuspended: boolean | null;
    currency: string;
    previousSpent: string;
  },
  previousPercentage: number,
  currentPercentage: number,
  billingMonth: string
): Promise<{ threshold: number; type: string; alertId?: number } | undefined> {
  try {
    // Obtener configuración de alertas del usuario para verificar umbrales habilitados
    const userBudgetSettings = await db
      .select({
        alertThreshold50: userBudgets.alertThreshold50,
        alertThreshold80: userBudgets.alertThreshold80,
        alertThreshold90: userBudgets.alertThreshold90,
        alertThreshold100: userBudgets.alertThreshold100,
      })
      .from(userBudgets)
      .where(eq(userBudgets.userId, userId))
      .limit(1);

    if (userBudgetSettings.length === 0) {
      return undefined;
    }

    const settings = userBudgetSettings[0];
    let alertToSend = undefined;

    // Determinar qué alerta enviar basado en umbrales cruzados
    if (previousPercentage < 50 && currentPercentage >= 50 && settings.alertThreshold50) {
      alertToSend = { threshold: 50, type: 'threshold_50' };
    } else if (previousPercentage < 80 && currentPercentage >= 80 && settings.alertThreshold80) {
      alertToSend = { threshold: 80, type: 'threshold_80' };
    } else if (previousPercentage < 90 && currentPercentage >= 90 && settings.alertThreshold90) {
      alertToSend = { threshold: 90, type: 'threshold_90' };
    } else if (currentPercentage >= 100 && settings.alertThreshold100) {
      alertToSend = { threshold: 100, type: 'budget_exceeded' };
    }

    if (!alertToSend) {
      return undefined;
    }

    // Persistir alerta en la base de datos usando valores ACTUALIZADOS
    const alertRecord = {
      userId,
      alertType: alertToSend.type,
      thresholdReached: alertToSend.threshold,
      currentSpent: updatedBudget.newCurrentSpent, // CRITICAL FIX: Usar valores actualizados
      monthlyBudget: updatedBudget.monthlyBudget,   // CRITICAL FIX: Usar valores actualizados
      deliveryMethod: 'email', // Por defecto email, se puede expandir
      deliveryStatus: 'pending',
      emailAddress: null, // Se llenará cuando se implemente el envío
      messageContent: `Alerta de presupuesto: Has alcanzado el ${alertToSend.threshold}% de tu presupuesto mensual.`,
      billingMonth
    };

    try {
      const insertedAlert = await db
        .insert(sentAlerts)
        .values([alertRecord])
        .onConflictDoNothing() // Evitar duplicados por el constraint único
        .returning({ id: sentAlerts.id });

      const alertId = insertedAlert[0]?.id;

      console.log(`🚨 Alerta persistida: ${alertToSend.type} para usuario ${userId} - ${currentPercentage.toFixed(1)}% del presupuesto`);

      return {
        ...alertToSend,
        alertId
      };
    } catch (alertError) {
      // Si falla por constraint único (alerta duplicada), simplemente logear
      console.log(`ℹ️ Alerta ${alertToSend.type} ya enviada para usuario ${userId} en ${billingMonth}`);
      return alertToSend;
    }

  } catch (error) {
    console.error(`Error al procesar alerta para usuario ${userId}:`, error);
    return undefined;
  }
}

/**
 * Crear presupuesto inicial para un usuario nuevo
 */
export async function createDefaultUserBudget(userId: number, initialBudget: string = "50.00"): Promise<UserBudget | null> {
  try {
    const budgetData = {
      userId,
      monthlyBudget: initialBudget,
      currency: "CAD",
      billingCycleDay: 1,
      alertThreshold50: true,
      alertThreshold80: true,
      alertThreshold90: true,
      alertThreshold100: true,
    };

    const inserted = await db.insert(userBudgets).values(budgetData).returning();
    console.log(`✅ Presupuesto inicial creado para usuario ${userId}: $${initialBudget} CAD`);
    return inserted[0];
  } catch (error) {
    console.error(`Error al crear presupuesto para usuario ${userId}:`, error);
    return null;
  }
}

/**
 * Limpiar cache de costos (útil cuando se actualizan precios)
 */
export function clearCostCache(): void {
  costCache.clear();
  console.log('🧹 Cache de costos limpiado');
}

/**
 * Obtener estadísticas de uso mensual para un usuario
 */
export async function getUserMonthlyStats(userId: number, billingMonth?: string) {
  if (!billingMonth) {
    const now = new Date();
    billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  try {
    // CORREGIDO: Usar agregación SQL en lugar de parseFloat en JavaScript
    const statsQuery = await db
      .select({
        totalTransactions: sql<number>`COUNT(*)::integer`,
        totalSpent: sql<string>`COALESCE(SUM(cost_applied), 0)::numeric(12,2)::text`
      })
      .from(usageTracking)
      .where(and(
        eq(usageTracking.userId, userId),
        eq(usageTracking.billingMonth, billingMonth)
      ))
      .limit(1);
      
    // Obtener transacciones separadamente para evitar problemas de agregación
    const transactions = await db
      .select({
        id: usageTracking.id,
        actionType: usageTracking.actionType,
        costApplied: usageTracking.costApplied,
        resourceType: usageTracking.resourceType,
        createdAt: usageTracking.createdAt
      })
      .from(usageTracking)
      .where(and(
        eq(usageTracking.userId, userId),
        eq(usageTracking.billingMonth, billingMonth)
      ))
      .orderBy(desc(usageTracking.createdAt))
      .limit(20);

    if (statsQuery.length === 0) {
      return {
        billingMonth,
        totalTransactions: 0,
        totalSpent: "0.00",
        actionBreakdown: {},
        recentTransactions: []
      };
    }

    const stats = statsQuery[0];
    const actionCounts = transactions.reduce((counts: Record<string, number>, record) => {
      counts[record.actionType] = (counts[record.actionType] || 0) + 1;
      return counts;
    }, {});

    return {
      billingMonth,
      totalTransactions: stats.totalTransactions,
      totalSpent: stats.totalSpent,
      actionBreakdown: actionCounts,
      recentTransactions: transactions.slice(0, 10)
    };
  } catch (error) {
    console.error(`Error al obtener estadísticas para usuario ${userId}:`, error);
    return null;
  }
}

/**
 * Get all action costs (admin function)
 */
export async function getActionCosts() {
  try {
    const result = await db.select().from(actionCosts);
    return result;
  } catch (error) {
    console.error("Error fetching action costs:", error);
    throw error;
  }
}

/**
 * Update action cost (admin function)
 */
export async function updateActionCost(
  costId: number, 
  updates: {
    baseCost?: string;
    description?: string;
    isActive?: boolean;
  }
) {
  try {
    const result = await db.update(actionCosts)
      .set({
        baseCost: updates.baseCost,
        description: updates.description,
        isActive: updates.isActive,
        updatedAt: new Date()
      })
      .where(eq(actionCosts.id, costId))
      .returning();

    // Clear cache after update
    clearCostCache();
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error updating action cost:", error);
    throw error;
  }
}

/**
 * Get user budgets summary (admin function)
 */
export async function getUserBudgetsSummary() {
  try {
    const result = await db.execute(sql`
      SELECT 
        ub.id,
        ub.user_id,
        u.username,
        u.email,
        ub.monthly_budget,
        ub.current_spent,
        ub.currency,
        ub.billing_month,
        ub.is_suspended,
        ub.suspended_at,
        ROUND((ub.current_spent::numeric / NULLIF(ub.monthly_budget::numeric, 0)) * 100, 2) as usage_percentage,
        ub.created_at,
        ub.updated_at
      FROM user_budgets ub
      JOIN users u ON ub.user_id = u.id
      ORDER BY ub.billing_month DESC, usage_percentage DESC
    `);
    
    return result.rows;
  } catch (error) {
    console.error("Error fetching user budgets summary:", error);
    throw error;
  }
}

// Exportar instancia de DB para uso externo si es necesario
export { db as costEngineDb };