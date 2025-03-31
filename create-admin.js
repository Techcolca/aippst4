import bcrypt from 'bcrypt';
import pg from 'pg';
import crypto from 'crypto';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function createAdminUser() {
  try {
    // Generar una API key única
    const apiKey = 'aipi_' + crypto.randomBytes(16).toString('hex');
    
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash('admin1726', 10);
    
    // Verificar si el usuario ya existe
    const checkResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      ['admin']
    );
    
    if (checkResult.rowCount > 0) {
      // Actualizar el usuario existente
      await pool.query(
        `UPDATE users 
         SET password = $1, 
             api_key = $2
         WHERE username = $3`,
        [hashedPassword, apiKey, 'admin']
      );
      console.log('Usuario admin actualizado con nueva contraseña');
    } else {
      // Crear nuevo usuario admin
      await pool.query(
        `INSERT INTO users 
         (username, password, email, full_name, api_key, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        ['admin', hashedPassword, 'admin@example.com', 'Administrador', apiKey]
      );
      console.log('Usuario admin creado exitosamente');
    }
    
    // Obtener el ID del usuario admin
    const userResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      ['admin']
    );
    
    const userId = userResult.rows[0].id;
    
    // Crear una suscripción Enterprise con acceso ilimitado
    const checkSubscription = await pool.query(
      'SELECT id FROM subscriptions WHERE user_id = $1 AND tier = $2',
      [userId, 'enterprise']
    );
    
    if (checkSubscription.rowCount === 0) {
      // Crear una nueva suscripción Enterprise
      await pool.query(
        `INSERT INTO subscriptions 
         (user_id, tier, status, interactions_limit, interactions_used, 
          created_at, updated_at, start_date, end_date, 
          stripe_customer_id, stripe_price_id, stripe_subscription_id)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW(), $6, $7, $8, $9)`,
        [
          userId, 
          'enterprise', 
          'active', 
          99999, // Límite prácticamente ilimitado
          0,
          new Date(new Date().setFullYear(new Date().getFullYear() + 10)), // 10 años de suscripción
          'admin_customer', // ID de cliente ficticio para admin
          'price_enterprise', // ID de precio ficticio
          'sub_admin_enterprise' // ID de suscripción ficticio
        ]
      );
      console.log('Suscripción Enterprise creada para usuario admin');
    } else {
      console.log('El usuario admin ya tiene una suscripción Enterprise');
    }
    
    console.log('Proceso completado exitosamente');
  } catch (error) {
    console.error('Error al crear usuario admin:', error);
  } finally {
    // Cerrar la conexión
    pool.end();
  }
}

createAdminUser();