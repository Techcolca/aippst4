import Stripe from "stripe";
import { getInteractionLimitByTier } from "../middleware/subscription";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY no está establecido. Los pagos no estarán disponibles.");
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })
  : null;

export interface ProductInfo {
  tier: string;
  name: string;
  description: string;
  price: number; // en centavos
  priceDisplay: string;
  features: string[];
  interactionsLimit: number;
  popular?: boolean;
  available: boolean;
  currency?: string; // 'cad' por defecto
  interval?: string; // 'month' por defecto
  metadata?: {
    tier: string;
    interactions: number;
  };
}

// Definición de los productos/planes disponibles
export const PRODUCTS: Record<string, ProductInfo> = {
  free: {
    tier: "free",
    name: "Gratuito",
    description: "Ideal para comenzar con AIPI",
    price: 0,
    priceDisplay: "$0",
    features: [
      "20 interacciones por día",
      "Widget flotante (burbuja)",
      "Respuestas de IA básicas",
      "Estadísticas básicas",
    ],
    interactionsLimit: getInteractionLimitByTier("free"),
    available: true,
    currency: "cad",
    interval: "month",
    metadata: {
      tier: "free",
      interactions: getInteractionLimitByTier("free")
    }
  },
  basic: {
    tier: "basic",
    name: "Básico",
    description: "Para sitios web con tráfico moderado",
    price: 5000, // $50
    priceDisplay: "$50 CAD",
    features: [
      "500 interacciones por mes",
      "Widget flotante (burbuja)",
      "Carga de documentos para entrenar a la IA",
      "Estadísticas básicas",
      "Captura de leads",
    ],
    interactionsLimit: getInteractionLimitByTier("basic"),
    popular: true,
    available: true,
    currency: "cad",
    interval: "month",
    metadata: {
      tier: "basic",
      interactions: getInteractionLimitByTier("basic")
    }
  },
  professional: {
    tier: "professional",
    name: "Profesional",
    description: "Para negocios en crecimiento",
    price: 15000, // $150
    priceDisplay: "$150 CAD",
    features: [
      "2,000 interacciones por mes",
      "Widget flotante y pantalla completa",
      "Carga de documentos para entrenar a la IA",
      "Estadísticas detalladas",
      "Captura de leads",
      "Automatización de tareas",
    ],
    interactionsLimit: getInteractionLimitByTier("professional"),
    available: true,
    currency: "cad",
    interval: "month",
    metadata: {
      tier: "professional",
      interactions: getInteractionLimitByTier("professional")
    }
  },
  enterprise: {
    tier: "enterprise",
    name: "Empresa",
    description: "Para negocios de gran escala",
    price: 50000, // $500
    priceDisplay: "$500 CAD",
    features: [
      "Interacciones ilimitadas",
      "Todas las características de Profesional",
      "Personalización de marca",
      "Integración con CRM",
      "Soporte prioritario",
      "API personalizada",
    ],
    interactionsLimit: getInteractionLimitByTier("enterprise"),
    available: true,
    currency: "cad",
    interval: "month",
    metadata: {
      tier: "enterprise",
      interactions: getInteractionLimitByTier("enterprise")
    }
  }
};

// Función para crear o recuperar un producto en Stripe
export async function createOrRetrieveProduct(productInfo: ProductInfo) {
  if (!stripe) return null;

  try {
    // Buscar producto existente por nombre
    const existingProducts = await stripe.products.list({
      active: true
    });

    const existingProduct = existingProducts.data.find(
      product => product.name === productInfo.name
    );

    // Si el producto ya existe, usarlo
    if (existingProduct) {
      return existingProduct;
    }

    // Si no existe, crear el producto
    return await stripe.products.create({
      name: productInfo.name,
      description: productInfo.description,
      metadata: {
        tier: productInfo.tier,
        interactionsLimit: productInfo.interactionsLimit.toString()
      }
    });
  } catch (error) {
    console.error("Error al crear/recuperar producto en Stripe:", error);
    return null;
  }
}

// Función para crear o actualizar un precio en Stripe
export async function createOrUpdatePrice(product: Stripe.Product, amount: number) {
  if (!stripe) return null;

  try {
    // Buscar precios existentes para este producto
    const existingPrices = await stripe.prices.list({
      product: product.id,
      active: true
    });

    // Crear nuevo precio si no existe o si el monto ha cambiado
    if (existingPrices.data.length === 0 || 
        existingPrices.data[0].unit_amount !== amount) {
      
      // Desactivar precios antiguos si existen y el monto ha cambiado
      if (existingPrices.data.length > 0 && 
          existingPrices.data[0].unit_amount !== amount) {
        for (const price of existingPrices.data) {
          await stripe.prices.update(price.id, { active: false });
        }
      }
      
      // Crear nuevo precio
      return await stripe.prices.create({
        product: product.id,
        unit_amount: amount,
        currency: 'cad',
        recurring: {
          interval: 'month'
        },
      });
    }
    
    // Usar el precio existente si el monto es el mismo
    return existingPrices.data[0];
  } catch (error) {
    console.error("Error al crear/actualizar precio en Stripe:", error);
    return null;
  }
}

// Crear una sesión de checkout para suscripción
export async function createCheckoutSession(
  customerId: string | undefined,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  if (!stripe) return null;

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return session;
  } catch (error) {
    console.error("Error al crear sesión de checkout:", error);
    return null;
  }
}

// Función para crear o actualizar un cliente en Stripe
export async function createOrUpdateCustomer(
  email: string,
  name: string,
  existingCustomerId?: string
) {
  if (!stripe) return null;

  try {
    // Si ya hay un ID de cliente, actualizar ese cliente
    if (existingCustomerId) {
      return await stripe.customers.update(existingCustomerId, {
        email,
        name,
      });
    }

    // Si no hay ID, buscar si existe un cliente con ese email
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Si no existe, crear nuevo cliente
    return await stripe.customers.create({
      email,
      name,
    });
  } catch (error) {
    console.error("Error al crear/actualizar cliente en Stripe:", error);
    return null;
  }
}

// Recuperar subscripción
export async function retrieveSubscription(subscriptionId: string) {
  if (!stripe) return null;

  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error("Error al recuperar subscripción:", error);
    return null;
  }
}

// Actualizar subscripción
export async function updateSubscription(subscriptionId: string, data: Stripe.SubscriptionUpdateParams) {
  if (!stripe) return null;

  try {
    return await stripe.subscriptions.update(subscriptionId, data);
  } catch (error) {
    console.error("Error al actualizar subscripción:", error);
    return null;
  }
}

// Cancelar subscripción
export async function cancelSubscription(subscriptionId: string) {
  if (!stripe) return null;

  try {
    return await stripe.subscriptions.cancel(subscriptionId);
  } catch (error) {
    console.error("Error al cancelar subscripción:", error);
    return null;
  }
}

// Manejar eventos de webhook de Stripe
export async function handleWebhookEvent(event: Stripe.Event) {
  if (!stripe) return;

  try {
    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extraer información de metadata si está disponible
        const userId = session.metadata?.userId ? parseInt(session.metadata.userId) : undefined;
        const tier = session.metadata?.tier;
        
        // Verificar que tenemos datos suficientes
        if (!userId || !session.customer || !session.subscription) {
          console.error('Información incompleta en checkout.session.completed', { userId, customer: session.customer, subscription: session.subscription });
          return;
        }
        
        // Actualizar la información del usuario en nuestra base de datos
        // Aquí deberíamos guardar el ID de cliente y suscripción
        console.log(`Usuario ${userId} ha completado el checkout. Customer: ${session.customer}, Subscription: ${session.subscription}`);
        
        // Esta función debería estar implementada en el storage
        /* await storage.updateUserStripeInfo(userId, {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string
        }); */
        
        break;
        
      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        
        // Verificar que tenemos una suscripción asociada
        if (!invoice.subscription) {
          console.error('invoice.payment_succeeded sin suscripción asociada', invoice.id);
          return;
        }
        
        console.log(`Pago exitoso para la suscripción ${invoice.subscription}`);
        
        // Aquí podrías actualizar el estado de la suscripción a 'active' si es necesario
        break;
        
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        
        console.log(`Suscripción ${subscription.id} actualizada. Nuevo estado: ${subscription.status}`);
        
        // Aquí podrías actualizar el estado y otros detalles de la suscripción en tu base de datos
        break;
        
      case 'customer.subscription.deleted':
        const canceledSubscription = event.data.object as Stripe.Subscription;
        
        console.log(`Suscripción ${canceledSubscription.id} cancelada`);
        
        // Aquí deberías actualizar el estado de la suscripción en tu base de datos a 'canceled'
        // y posiblemente revertir al usuario a un plan gratuito
        break;
        
      default:
        console.log(`Evento de Stripe no manejado: ${event.type}`);
    }
  } catch (error) {
    console.error('Error procesando evento de Stripe:', error);
    throw error; // Re-lanzar para manejo en el controlador de ruta
  }
}

export default stripe;