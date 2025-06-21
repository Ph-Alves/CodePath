#!/usr/bin/env node

/**
 * Script para atualizar senha do usuário carlos
 */

const bcrypt = require('bcrypt');
const { initializeDatabase } = require('../models/database');
const { setDatabaseInstance, getDatabase } = require('../models/databaseConnection');

async function updateCarlosPassword() {
  try {
    console.log('🔧 Atualizando senha do usuário carlos...');
    
    // Inicializar database
    const db = await initializeDatabase();
    setDatabaseInstance(db);
    
    console.log('✅ Database inicializado');
    
    // Gerar novo hash para senha123
    const password = 'senha123';
    const saltRounds = 10;
    const newHash = await bcrypt.hash(password, saltRounds);
    
    console.log('🔑 Novo hash gerado:', newHash);
    
    // Atualizar no banco
    const database = getDatabase();
    const result = await database.run(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [newHash, 'carlos@codepath.com']
    );
    
    if (result.changes > 0) {
      console.log('✅ Senha atualizada com sucesso!');
    } else {
      console.log('❌ Nenhuma linha foi atualizada');
    }
    
    // Verificar se funcionou
    const user = await database.get(
      'SELECT * FROM users WHERE email = ?',
      ['carlos@codepath.com']
    );
    
    const isValid = await bcrypt.compare(password, user.password_hash);
    console.log('🧪 Teste de validação:', isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA');
    
    console.log('\n📋 Credenciais atualizadas:');
    console.log('📧 Email: carlos@codepath.com');
    console.log('🔑 Senha: senha123');
    
  } catch (error) {
    console.error('💥 Erro ao atualizar senha:', error);
  }
}

updateCarlosPassword(); 