/**
 * Script para crear el usuario administrador en Supabase Auth
 * 
 * IMPORTANTE: Este script solo se debe ejecutar UNA VEZ
 * 
 * Uso: node scripts/create-admin-user.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Necesitamos la Service Role Key para crear usuarios
// Esta clave tiene permisos elevados, NO la expongas en el frontend
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Error: REACT_APP_SUPABASE_URL no está configurada en .env');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.log('\n⚠️  SUPABASE_SERVICE_ROLE_KEY no está configurada en .env');
  console.log('\nPara obtenerla:');
  console.log('1. Ve a https://supabase.com/dashboard');
  console.log('2. Selecciona tu proyecto');
  console.log('3. Ve a Settings > API');
  console.log('4. Copia la "service_role" key (secret)');
  console.log('5. Añádela a tu archivo .env como SUPABASE_SERVICE_ROLE_KEY=tu_clave\n');
  
  console.log('Alternativamente, puedes crear el usuario manualmente:');
  console.log('1. Ve a https://supabase.com/dashboard');
  console.log('2. Selecciona tu proyecto');
  console.log('3. Ve a Authentication > Users');
  console.log('4. Click en "Add user"');
  console.log('5. Ingresa: thespanishgipsoteca@gmail.com y una contraseña segura\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function createAdminUser() {
  console.log('\n🔐 Crear Usuario Administrador\n');
  console.log('Email: thespanishgipsoteca@gmail.com\n');

  const password = await question('Ingresa la contraseña para el admin: ');
  
  if (password.length < 6) {
    console.error('\n❌ La contraseña debe tener al menos 6 caracteres');
    rl.close();
    process.exit(1);
  }

  console.log('\nCreando usuario...');

  try {
    // Verificar si el usuario ya existe
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(
      u => u.email === 'thespanishgipsoteca@gmail.com'
    );

    if (userExists) {
      console.log('\n⚠️  El usuario ya existe.');
      const update = await question('¿Quieres actualizar la contraseña? (s/n): ');
      
      if (update.toLowerCase() === 's') {
        const existingUser = existingUsers.users.find(
          u => u.email === 'thespanishgipsoteca@gmail.com'
        );
        
        const { error } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { password }
        );

        if (error) throw error;
        console.log('\n✅ Contraseña actualizada correctamente');
      }
    } else {
      // Crear nuevo usuario
      const { data, error } = await supabase.auth.admin.createUser({
        email: 'thespanishgipsoteca@gmail.com',
        password: password,
        email_confirm: true, // Marcar email como confirmado
      });

      if (error) throw error;

      console.log('\n✅ Usuario creado correctamente');
      console.log('   Email:', data.user.email);
      console.log('   ID:', data.user.id);
    }

    console.log('\n🚀 Ya puedes acceder al panel de administración:');
    console.log('   URL: http://localhost:3000/admin-jdm-private');
    console.log('   Email: thespanishgipsoteca@gmail.com');
    console.log('   Password: (la que acabas de configurar)\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.message.includes('service_role')) {
      console.log('\nAsegúrate de usar la Service Role Key, no la Anon Key.');
    }
  }

  rl.close();
}

createAdminUser();
