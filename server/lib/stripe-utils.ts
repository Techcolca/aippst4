import Stripe from 'stripe';
import { PricingPlan } from '@shared/schema';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

/**
 * Crea o actualiza un producto y su precio en Stripe
 * @param plan Plan de precios desde la base de datos
 * @returns Objeto con los IDs de producto y precio de Stripe
 */
export async function createOrUpdateStripeProduct(plan: PricingPlan): Promise<{ 
  stripeProductId: string, 
  stripePriceId: string 
}> {
  try {
    // 1. Crear o actualizar el producto
    let stripeProductId = plan.stripeProductId;
    let productName = `${plan.name}${plan.isAnnual ? ' (Anual)' : ''}`;
    let productDescription = plan.description;
    
    let product;
    if (stripeProductId) {
      // Actualizar producto existente
      product = await stripe.products.update(stripeProductId, {
        name: productName,
        description: productDescription,
        active: plan.available,
      });
    } else {
      // Crear nuevo producto
      product = await stripe.products.create({
        name: productName,
        description: productDescription,
        metadata: {
          planId: plan.planId,
          tier: plan.tier,
          isAnnual: plan.isAnnual ? 'true' : 'false',
        },
      });
      stripeProductId = product.id;
    }

    // 2. Crear o actualizar el precio
    let stripePriceId = plan.stripePriceId;
    const priceInCents = Math.round(plan.price * 100); // Convertir a centavos para Stripe
    
    let price;
    if (!stripePriceId) {
      // Siempre crear un nuevo precio (Stripe no permite actualizar precios)
      price = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: priceInCents,
        currency: plan.currency,
        recurring: {
          interval: plan.interval === 'year' ? 'year' : 'month',
        },
        metadata: {
          planId: plan.planId,
          tier: plan.tier,
          isAnnual: plan.isAnnual ? 'true' : 'false',
        },
      });
      stripePriceId = price.id;
    } else {
      // Verificar si el precio ha cambiado
      const existingPrice = await stripe.prices.retrieve(stripePriceId);
      if (existingPrice.unit_amount !== priceInCents || 
          existingPrice.currency !== plan.currency || 
          existingPrice.recurring?.interval !== (plan.interval === 'year' ? 'year' : 'month')) {
        
        // Desactivar el precio anterior
        await stripe.prices.update(stripePriceId, { active: false });
        
        // Crear un nuevo precio
        price = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: priceInCents,
          currency: plan.currency,
          recurring: {
            interval: plan.interval === 'year' ? 'year' : 'month',
          },
          metadata: {
            planId: plan.planId,
            tier: plan.tier,
            isAnnual: plan.isAnnual ? 'true' : 'false',
          },
        });
        stripePriceId = price.id;
      }
    }

    return { stripeProductId, stripePriceId };
  } catch (error) {
    console.error('Error al crear/actualizar producto en Stripe:', error);
    throw new Error(`Error al sincronizar con Stripe: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Sincroniza todos los planes de precios con Stripe
 * @param plans Lista de planes de precios desde la base de datos
 * @returns Lista de planes actualizados con IDs de Stripe
 */
export async function syncPlansWithStripe(plans: PricingPlan[]): Promise<PricingPlan[]> {
  const updatedPlans: PricingPlan[] = [];

  for (const plan of plans) {
    try {
      const { stripeProductId, stripePriceId } = await createOrUpdateStripeProduct(plan);
      
      // Actualizar el plan con los IDs de Stripe
      updatedPlans.push({
        ...plan,
        stripeProductId,
        stripePriceId
      });
    } catch (error) {
      console.error(`Error al sincronizar plan ${plan.planId} con Stripe:`, error);
      // Añadir el plan sin cambios en caso de error
      updatedPlans.push(plan);
    }
  }

  return updatedPlans;
}