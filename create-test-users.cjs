const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const sql = neon(process.env.DATABASE_URL);

async function createTestUsers() {
  console.log('Creando usuarios de prueba con diferentes planes...');

  try {
    // Datos de los usuarios de prueba
    const testUsers = [
      {
        username: 'usuario_basico',
        email: 'basico@test.com',
        password: 'Test123!',
        fullName: 'Usuario Plan Básico',
        tier: 'basic',
        interactionsLimit: 500
      },
      {
        username: 'usuario_startup',
        email: 'startup@test.com', 
        password: 'Test123!',
        fullName: 'Usuario Plan Startup',
        tier: 'startup',
        interactionsLimit: 2000
      },
      {
        username: 'usuario_profesional',
        email: 'profesional@test.com',
        password: 'Test123!',
        fullName: 'Usuario Plan Profesional', 
        tier: 'professional',
        interactionsLimit: 10000
      }
    ];

    console.log('\n=== CREDENCIALES DE USUARIOS DE PRUEBA ===\n');

    for (const userData of testUsers) {
      // Verificar si el usuario ya existe
      const existingUser = await sql`
        SELECT id FROM users WHERE username = ${userData.username} OR email = ${userData.email}
      `;

      if (existingUser.length > 0) {
        console.log(`⚠️  Usuario ${userData.username} ya existe, actualizando...`);
        
        // Actualizar usuario existente
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await sql`
          UPDATE users 
          SET password = ${hashedPassword}, full_name = ${userData.fullName}
          WHERE username = ${userData.username}
        `;
        
        // Actualizar suscripción
        await sql`
          UPDATE subscriptions 
          SET tier = ${userData.tier}, 
              interactions_limit = ${userData.interactionsLimit},
              status = 'active',
              start_date = NOW(),
              end_date = NOW() + INTERVAL '1 year'
          WHERE user_id = ${existingUser[0].id}
        `;
      } else {
        // Crear nuevo usuario
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const apiKey = crypto.randomBytes(32).toString('hex');
        
        const newUser = await sql`
          INSERT INTO users (username, password, email, full_name, api_key)
          VALUES (${userData.username}, ${hashedPassword}, ${userData.email}, ${userData.fullName}, ${apiKey})
          RETURNING id
        `;
        
        const userId = newUser[0].id;
        
        // Crear suscripción
        await sql`
          INSERT INTO subscriptions (
            user_id, 
            status, 
            tier, 
            interactions_limit, 
            interactions_used, 
            start_date, 
            end_date
          )
          VALUES (
            ${userId}, 
            'active', 
            ${userData.tier}, 
            ${userData.interactionsLimit}, 
            0, 
            NOW(), 
            NOW() + INTERVAL '1 year'
          )
        `;
        
        console.log(`✅ Usuario ${userData.username} creado exitosamente`);
      }

      // Mostrar credenciales
      console.log(`📧 Email: ${userData.email}`);
      console.log(`👤 Usuario: ${userData.username}`);
      console.log(`🔑 Contraseña: ${userData.password}`);
      console.log(`💼 Plan: ${userData.tier.toUpperCase()}`);
      console.log(`📊 Límite: ${userData.interactionsLimit} conversaciones/mes`);
      console.log('─'.repeat(50));
    }

    console.log('\n✅ Todos los usuarios de prueba han sido creados/actualizados exitosamente');
    console.log('\n📝 INSTRUCCIONES:');
    console.log('1. Usa estas credenciales para iniciar sesión en la aplicación');
    console.log('2. Cada usuario tiene un plan diferente con límites específicos');
    console.log('3. Puedes probar las funcionalidades según el plan asignado');
    
  } catch (error) {
    console.error('❌ Error creando usuarios de prueba:', error);
  }
}

createTestUsers();