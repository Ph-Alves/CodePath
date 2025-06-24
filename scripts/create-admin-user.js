const bcrypt = require('bcrypt');
const { initializeDatabase } = require('../models/database');

async function createAdminUser() {
  try {
    console.log('🔧 Criando usuário administrador...');
    
    // Inicializar banco de dados
    const db = await initializeDatabase();
    
    const adminEmail = 'admin@codepath.com';
    const adminPassword = '123456';
    const adminName = 'Administrador CodePath';
    
    // Hash da senha
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    
    // Verificar se já existe
    const existingUser = await db.get(
      'SELECT id FROM users WHERE email = ?',
      [adminEmail]
    );
    
    if (existingUser) {
      console.log('⚠️  Usuário admin já existe! Atualizando...');
      
      // Atualizar usuário existente para ser admin
      await db.run(`
        UPDATE users 
        SET password_hash = ?, name = ?, isAdmin = 1
        WHERE email = ?
      `, [passwordHash, adminName, adminEmail]);
      
      console.log('✅ Usuário existente atualizado para admin');
    } else {
      // Criar novo usuário admin
      await db.run(`
        INSERT INTO users (
          name, email, password_hash, isAdmin,
          level, total_xp, current_streak, last_login_date
        ) VALUES (?, ?, ?, 1, 10, 5000, 0, datetime('now'))
      `, [adminName, adminEmail, passwordHash]);
      
      console.log('✅ Novo usuário admin criado');
    }
    
    console.log('\n📋 Credenciais do Administrador:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Senha: ${adminPassword}`);
    console.log('\n🔐 Use estas credenciais para acessar: http://localhost:4000/admin/packages');
    console.log('\n⚠️  ATENÇÃO: Altere a senha em produção!');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createAdminUser().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = { createAdminUser }; 