import pg from 'pg';
const { Pool } = pg;
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Importar PRODUCTS desde el archivo stripe.ts mediante un pequeño hack
const stripePath = resolve(__dirname, './server/lib/stripe.js');
const { PRODUCTS } = await import(stripePath);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createDefaultPricingPlans() {
  console.log('Comenzando la creación de planes de precios predeterminados...');
  
  try {
    // Verificar si ya existen planes en la base de datos
    const { rows: existingPlans } = await pool.query('SELECT COUNT(*) as count FROM pricing_plans');
    const planCount = parseInt(existingPlans[0].count);
    
    if (planCount > 0) {
      console.log(`Ya existen ${planCount} planes de precios en la base de datos. No se crearán nuevos planes.`);
      return;
    }
    
    console.log('No se encontraron planes de precios. Creando planes predeterminados...');
    
    // Crear planes de precios a partir de la constante PRODUCTS
    for (const [key, product] of Object.entries(PRODUCTS)) {
      // Preparar datos para la inserción
      const planData = {
        planId: key.toLowerCase(),
        name: product.name,
        description: product.description,
        price: product.price / 100, // Convertir de centavos a unidades para mantener consistencia con el frontend
        priceDisplay: product.priceDisplay,
        currency: product.currency || 'cad',
        interval: product.interval || 'month',
        features: JSON.stringify(product.features), // Almacenar características como JSON
        tier: product.tier,
        interactionsLimit: product.interactionsLimit,
        isAnnual: !!product.isAnnual, // Convertir a booleano
        discount: product.discount || null,
        popular: !!product.popular, // Convertir a booleano
        available: product.available === undefined ? true : product.available, // Predeterminado a true si no se especifica
      };
      
      // Insertar plan en la base de datos
      await pool.query(`
        INSERT INTO pricing_plans 
        (plan_id, name, description, price, price_display, currency, interval, features, tier, interactions_limit, is_annual, discount, popular, available)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        planData.planId,
        planData.name,
        planData.description,
        planData.price,
        planData.priceDisplay,
        planData.currency,
        planData.interval,
        planData.features,
        planData.tier,
        planData.interactionsLimit,
        planData.isAnnual,
        planData.discount,
        planData.popular,
        planData.available
      ]);
      
      console.log(`✓ Plan creado: ${planData.name} (${planData.planId})`);
    }
    
    console.log('Todos los planes de precios se han creado correctamente.');
  } catch (error) {
    console.error('Error al crear planes de precios:', error);
  } finally {
    // Cerrar la conexión
    await pool.end();
  }
}

// Ejecutar la función
createDefaultPricingPlans();