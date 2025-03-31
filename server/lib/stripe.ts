import Stripe from 'stripe';
import { storage } from '../storage';

// Verificar que existe la clave secreta de Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Error: La variable de entorno STRIPE_SECRET_KEY no está definida');
}

// Inicializar Stripe con la clave secreta
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

// Definición de productos que ofrecemos
// Las descripciones y características se obtienen de getFeaturesByTier en routes.ts
export const PRODUCTS = {
  BASIC: {
    name: 'Plan Básico',
    description: 'Hasta 500 interacciones mensuales',
    price: 5000, // en centavos = $50 CAD
    currency: 'cad',
    interval: 'month',
    metadata: {
      tier: 'basic',
      interactions: 500,
    }
  },
  PROFESSIONAL: {
    name: 'Plan Profesional',
    description: 'Hasta 2,000 interacciones mensuales',
    price: 15000, // en centavos = $150 CAD
    currency: 'cad',
    interval: 'month',
    metadata: {
      tier: 'professional',
      interactions: 2000,
    }
  },
  ENTERPRISE: {
    name: 'Plan Empresarial',
    description: 'Interacciones ilimitadas',
    price: 50000, // en centavos = $500 CAD
    currency: 'cad',
    interval: 'month',
    metadata: {
      tier: 'enterprise',
      interactions: 99999, // valor alto para representar "ilimitado"
    }
  }
};

/**
 * Crea o actualiza un producto y su precio en Stripe
 */
export async function createOrUpdatePrice(product: any) {
  try {
    // Crear o actualizar el producto en Stripe
    let stripeProduct;
    
    // Buscar si el producto ya existe (por nombre para simplificar)
    const existingProducts = await stripe.products.list({
      active: true,
    });
    
    const matchingProduct = existingProducts.data.find(p => 
      p.name.toLowerCase() === product.name.toLowerCase()
    );
    
    if (matchingProduct) {
      console.log(`Actualizando producto existente: ${matchingProduct.id}`);
      stripeProduct = await stripe.products.update(matchingProduct.id, {
        description: product.description,
        metadata: product.metadata
      });
    } else {
      console.log(`Creando nuevo producto: ${product.name}`);
      stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description,
        metadata: product.metadata
      });
    }
    
    // Crear o actualizar el precio
    let stripePrice;
    
    // Buscar si el precio ya existe para este producto
    const existingPrices = await stripe.prices.list({
      product: stripeProduct.id,
      active: true,
    });
    
    const matchingPrice = existingPrices.data.find(p => 
      p.unit_amount === product.price && 
      p.currency === product.currency &&
      p.recurring?.interval === product.interval
    );
    
    if (matchingPrice) {
      console.log(`Usando precio existente: ${matchingPrice.id}`);
      stripePrice = matchingPrice;
    } else {
      console.log(`Creando nuevo precio para ${product.name}`);
      stripePrice = await stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: product.price,
        currency: product.currency,
        recurring: {
          interval: product.interval,
        },
        metadata: product.metadata
      });
    }
    
    return { 
      productId: stripeProduct.id, 
      priceId: stripePrice.id 
    };
  } catch (error) {
    console.error('Error al crear/actualizar producto en Stripe:', error);
    throw error;
  }
}

/**
 * Inicializa los productos en Stripe al iniciar el servidor
 */
export async function initializeProducts() {
  try {
    console.log('Inicializando productos en Stripe...');
    
    for (const [key, product] of Object.entries(PRODUCTS)) {
      await createOrUpdatePrice(product);
    }
    
    console.log('Productos inicializados correctamente en Stripe');
  } catch (error) {
    console.error('Error al inicializar productos en Stripe:', error);
    throw error;
  }
}

/**
 * Crea una sesión de checkout en Stripe para un plan de pago
 */
export async function createCheckoutSession(priceId: string, userId: number, email?: string) {
  try {
    const SESSION_MODE = 'subscription';
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: SESSION_MODE,
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/pricing?cancelled=true`,
      customer_email: email,
      client_reference_id: userId.toString(),
      metadata: {
        userId: userId.toString(),
      },
    });
    
    return session;
  } catch (error) {
    console.error('Error al crear sesión de checkout en Stripe:', error);
    throw error;
  }
}

/**
 * Maneja eventos del webhook de Stripe
 */
export async function handleWebhookEvent(event: Stripe.Event) {
  try {
    console.log(`Procesando evento de Stripe: ${event.type}`);
    
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulSubscription(session);
        break;
        
      case 'invoice.paid':
        const invoice = event.data.object as Stripe.Invoice;
        await handleSuccessfulPayment(invoice);
        break;
        
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
        
      default:
        console.log(`Evento de Stripe no manejado: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error al manejar evento de Stripe ${event.type}:`, error);
    throw error;
  }
}

/**
 * Maneja una suscripción exitosa desde una sesión de checkout
 */
async function handleSuccessfulSubscription(session: Stripe.Checkout.Session) {
  try {
    if (!session.client_reference_id) {
      throw new Error('No se encontró el ID de usuario en la sesión de checkout');
    }
    
    const userId = parseInt(session.client_reference_id);
    
    // Obtener la suscripción de Stripe
    if (!session.subscription) {
      console.warn('No se encontró información de suscripción en la sesión');
      return;
    }
    
    const subscriptionId = typeof session.subscription === 'string' 
      ? session.subscription 
      : session.subscription.id;
      
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = subscription.customer as string;
    
    // Determinar el nivel (tier) del plan
    const price = subscription.items.data[0].price;
    const tier = price.metadata?.tier || 'basic'; // valor por defecto
    
    // Actualizar la información de suscripción del usuario
    // TODO: Implementar actualización de suscripción en la base de datos
    console.log(`Suscripción creada/actualizada para el usuario ${userId}: ${subscriptionId} (Tier: ${tier})`);
    
    // Ejemplo de cómo podría verse la actualización (ajustar según tu schema)
    // await storage.updateUserSubscription(userId, {
    //   stripeCustomerId: customerId,
    //   stripeSubscriptionId: subscriptionId,
    //   tier: tier,
    //   status: 'active',
    //   currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    // });
  } catch (error) {
    console.error('Error al procesar suscripción exitosa:', error);
    throw error;
  }
}

/**
 * Maneja un pago exitoso de factura
 */
async function handleSuccessfulPayment(invoice: Stripe.Invoice) {
  try {
    if (!invoice.subscription) {
      console.warn('No se encontró información de suscripción en la factura');
      return;
    }
    
    const subscriptionId = typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription.id;
      
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Buscar el usuario por el ID de cliente de Stripe
    const customerId = subscription.customer as string;
    
    // TODO: Implementar búsqueda de usuario por customerId y actualización de estado
    console.log(`Pago exitoso para la suscripción ${subscriptionId} (Cliente: ${customerId})`);
    
    // Ejemplo de cómo podría verse la actualización
    // const user = await storage.getUserByStripeCustomerId(customerId);
    // if (user) {
    //   await storage.updateUserSubscription(user.id, {
    //     status: 'active',
    //     currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    //   });
    // }
  } catch (error) {
    console.error('Error al procesar pago exitoso:', error);
    throw error;
  }
}

/**
 * Maneja cambios en una suscripción (actualización, cancelación, etc.)
 */
async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    const status = subscription.status;
    
    // TODO: Implementar búsqueda de usuario por customerId y actualización de estado
    console.log(`Suscripción ${subscription.id} actualizada: Estado = ${status} (Cliente: ${customerId})`);
    
    // Ejemplo de cómo podría verse la actualización
    // const user = await storage.getUserByStripeCustomerId(customerId);
    // if (user) {
    //   await storage.updateUserSubscription(user.id, {
    //     status: status === 'active' ? 'active' : 'inactive',
    //     currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    //   });
    // }
  } catch (error) {
    console.error('Error al procesar cambio de suscripción:', error);
    throw error;
  }
}