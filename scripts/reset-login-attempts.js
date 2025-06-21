/**
 * CodePath - Script de Reset de Tentativas de Login
 * 
 * Este script limpa todas as tentativas antigas de login,
 * reseta o rate limiting e garante que o sistema esteja funcional.
 */

const { initializeDatabase } = require('../models/database');
const ValidationModel = require('../models/validationModel');

async function resetLoginAttempts() {
    console.log('🔧 Iniciando reset de tentativas de login...');
    
    try {
        // Inicializar database
        const database = await initializeDatabase();
        console.log('✅ Database inicializado');
        
        // Limpar tentativas antigas de login
        await database.run('DELETE FROM login_attempts');
        console.log('✅ Tentativas de login limpas');
        
        // Limpar requisições de API antigas
        await database.run('DELETE FROM api_requests');
        console.log('✅ Requisições de API limpas');
        
        // Limpar sessões expiradas
        await database.run(`
            DELETE FROM user_sessions 
            WHERE expires_at < datetime('now') OR last_activity < datetime('now', '-7 days')
        `);
        console.log('✅ Sessões expiradas limpas');
        
        // Verificar se usuário carlos existe
        const carlos = await database.get(
            'SELECT id, email, name FROM users WHERE email = ?',
            ['carlos@codepath.com']
        );
        
        if (carlos) {
            console.log(`✅ Usuário encontrado: ${carlos.name} (${carlos.email})`);
        } else {
            console.log('⚠️  Usuário carlos@codepath.com não encontrado');
        }
        
        // Fechar conexão
        await database.close();
        
        console.log('🎉 Reset concluído com sucesso!');
        console.log('');
        console.log('📋 Resumo:');
        console.log('- Tentativas de login: LIMPAS');
        console.log('- Rate limiting: RESETADO');
        console.log('- Sessões expiradas: REMOVIDAS');
        console.log('- Sistema: PRONTO PARA USO');
        
    } catch (error) {
        console.error('❌ Erro durante reset:', error);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    resetLoginAttempts();
}

module.exports = { resetLoginAttempts }; 