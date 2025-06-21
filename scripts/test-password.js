#!/usr/bin/env node

/**
 * Script para testar validação de senha
 */

const bcrypt = require('bcrypt');
const { initializeDatabase } = require('../models/database');
const { setDatabaseInstance, getDatabase } = require('../models/databaseConnection');

async function testPassword() {
  try {
    console.log('🔧 Inicializando teste de senha...');
    
    // Inicializar database
    const db = await initializeDatabase();
    setDatabaseInstance(db);
    
    console.log('✅ Database inicializado');
    
    // Buscar usuário
    const database = getDatabase();
    const user = await database.get(
      'SELECT * FROM users WHERE email = ?',
      ['carlos@codepath.com']
    );
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    console.log('✅ Usuário encontrado:', user.name);
    console.log('📧 Email:', user.email);
    console.log('🔑 Hash:', user.password_hash);
    
    // Testar senha
    const testPassword = 'senha123';
    console.log('\n🧪 Testando senha:', testPassword);
    
    const isValid = await bcrypt.compare(testPassword, user.password_hash);
    
    if (isValid) {
      console.log('✅ Senha VÁLIDA');
    } else {
      console.log('❌ Senha INVÁLIDA');
      
      // Tentar criar novo hash para comparar
      console.log('\n🔧 Gerando novo hash para comparação...');
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('🆕 Novo hash:', newHash);
      
      const newTest = await bcrypt.compare(testPassword, newHash);
      console.log('🧪 Teste com novo hash:', newTest ? 'VÁLIDO' : 'INVÁLIDO');
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

testPassword(); 