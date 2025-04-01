import { storage } from './server/storage';
import { PRODUCTS } from './server/lib/stripe';

/**
 * Script para crear planes de precios predeterminados en la base de datos.
 * Este script utiliza la configuración definida en server/lib/stripe.ts.
 */
async function createDefaultPricingPlans() {
  console.log('Comenzando la creación de planes de precios predeterminados...');
  
  try {
    // Verificar si ya existen planes en la base de datos
    const existingPlans = await storage.getPricingPlans();
    
    if (existingPlans.length > 0) {
      console.log(`Ya existen ${existingPlans.length} planes de precios en la base de datos. No se crearán nuevos planes.`);
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
        features: product.features, // Ya es un array
        tier: product.tier,
        interactionsLimit: product.interactionsLimit,
        isAnnual: !!product.isAnnual, // Convertir a booleano
        discount: product.discount || null,
        popular: !!product.popular, // Convertir a booleano
        available: product.available === undefined ? true : product.available, // Predeterminado a true si no se especifica
      };
      
      // Insertar plan en la base de datos
      await storage.createPricingPlan(planData);
      
      console.log(`✓ Plan creado: ${planData.name} (${planData.planId})`);
    }
    
    console.log('Todos los planes de precios se han creado correctamente.');
  } catch (error) {
    console.error('Error al crear planes de precios:', error);
  }
}

// Ejecutar la función
createDefaultPricingPlans();