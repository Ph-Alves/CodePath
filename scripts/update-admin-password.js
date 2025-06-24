#!/usr/bin/env node

/**
 * Script para atualizar senha do usuário admin
 */

const bcrypt = require('bcrypt');
const { initializeDatabase } = require('../models/database');
const { setDatabaseInstance, getDatabase } = require('../models/databaseConnection');

async function updateAdminPassword() {
  try {
    console.log('🔧 Atualizando senha do usuário admin...');
    
    // Inicializar database
    const db = await initializeDatabase();
    setDatabaseInstance(db);
    
    console.log('✅ Database inicializado');
    
    // Gerar novo hash para admin123
    const password = 'admin123';
    const saltRounds = 10;
    const newHash = await bcrypt.hash(password, saltRounds);
    
    console.log('🔑 Novo hash gerado:', newHash);
    
    // Atualizar no banco
    const database = getDatabase();
    const result = await database.run(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [newHash, 'admin@codepath.com']
    );
    
    if (result.changes > 0) {
      console.log('✅ Senha atualizada com sucesso!');
    } else {
      console.log('❌ Nenhuma linha foi atualizada');
    }
    
    // Verificar se funcionou
    const user = await database.get(
      'SELECT * FROM users WHERE email = ?',
      ['admin@codepath.com']
    );
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('🧪 Teste de validação:', isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA');
    
    console.log('\n📋 Credenciais atualizadas:');
    console.log('📧 Email: admin@codepath.com');
    console.log('🔑 Senha: admin123');
    
  } catch (error) {
    console.error('💥 Erro ao atualizar senha:', error);
  }
}

updateAdminPassword(); 