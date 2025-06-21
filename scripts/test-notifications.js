/**
 * Script de Teste - Sistema de Notificações Automáticas
 * Testa todas as funcionalidades do sistema de notificações
 */

const path = require('path');
const { initializeDatabase } = require('../models/database');
const notificationController = require('../controllers/notificationController');

/**
 * Inicializar banco de dados para testes
 */
async function initializeTestDatabase() {
    try {
        console.log('🔄 Inicializando banco de dados para testes...');
        await initializeDatabase();
        console.log('✅ Banco de dados inicializado com sucesso');
        return true;
    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error);
        return false;
    }
}

/**
 * Limpar notificações de teste
 */
async function cleanupTestNotifications() {
    try {
        const { database } = require('../models/database');
        await database.run(`DELETE FROM notifications WHERE message LIKE '%[TESTE]%'`);
        console.log('✅ Notificações de teste limpas');
    } catch (error) {
        console.error('❌ Erro ao limpar notificações de teste:', error);
    }
}

/**
 * Testar criação de notificações automáticas
 */
async function testAutoNotifications() {
    console.log('\n🧪 Testando Sistema de Notificações Automáticas...\n');
    
    const testUserId = 1; // Carlos (usuário de teste)
    
    try {
        // Teste 1: Notificação de boas-vindas
        console.log('1. Testando notificação de boas-vindas...');
        await notificationController.processAutoNotification('user_registered', testUserId, {
            userName: 'Carlos [TESTE]'
        });
        console.log('✅ Notificação de boas-vindas criada');
        
        // Teste 2: Notificação de level up
        console.log('2. Testando notificação de level up...');
        await notificationController.processAutoNotification('level_up', testUserId, {
            newLevel: 5,
            xpGained: 150
        });
        console.log('✅ Notificação de level up criada');
        
        // Teste 3: Notificação de conquista
        console.log('3. Testando notificação de conquista...');
        await notificationController.processAutoNotification('achievement_unlocked', testUserId, {
            achievementName: 'Primeiro Passo [TESTE]',
            achievementDescription: 'Completou sua primeira aula'
        });
        console.log('✅ Notificação de conquista criada');
        
        // Teste 4: Notificação de streak
        console.log('4. Testando notificação de streak...');
        await notificationController.processAutoNotification('daily_streak', testUserId, {
            streakDays: 7
        });
        console.log('✅ Notificação de streak criada');
        
        // Teste 5: Notificação de aula concluída
        console.log('5. Testando notificação de aula concluída...');
        await notificationController.processAutoNotification('lesson_completed', testUserId, {
            lessonName: 'Introdução ao JavaScript [TESTE]',
            xpGained: 50
        });
        console.log('✅ Notificação de aula concluída criada');
        
        // Teste 6: Notificação de quiz completado
        console.log('6. Testando notificação de quiz completado...');
        await notificationController.processAutoNotification('quiz_completed', testUserId, {
            quizName: 'Quiz JavaScript Básico [TESTE]',
            score: 85,
            xpGained: 100
        });
        console.log('✅ Notificação de quiz completado criada');
        
        // Teste 7: Notificação de quiz perfeito
        console.log('7. Testando notificação de quiz perfeito...');
        await notificationController.processAutoNotification('quiz_completed', testUserId, {
            quizName: 'Quiz Avançado [TESTE]',
            score: 100,
            xpGained: 150,
            bonusXP: 50
        });
        console.log('✅ Notificação de quiz perfeito criada');
        
        // Teste 8: Notificação de pacote concluído
        console.log('8. Testando notificação de pacote concluído...');
        await notificationController.processAutoNotification('package_completed', testUserId, {
            packageName: 'Fundamentos Web [TESTE]',
            xpGained: 500
        });
        console.log('✅ Notificação de pacote concluído criada');
        
        // Teste 9: Notificação de login diário
        console.log('9. Testando notificação de login diário...');
        await notificationController.processAutoNotification('daily_login', testUserId, {
            xpGained: 10,
            streakDays: 3
        });
        console.log('✅ Notificação de login diário criada');
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error);
    }
}

/**
 * Verificar notificações criadas
 */
async function checkCreatedNotifications() {
    try {
        console.log('\n📊 Verificando notificações criadas...\n');
        
        const { database } = require('../models/database');
        const notifications = await database.all(`
            SELECT type, title, message, created_at 
            FROM notifications 
            WHERE message LIKE '%[TESTE]%' 
            ORDER BY created_at DESC
        `);
        
        console.log(`📋 Total de notificações de teste: ${notifications.length}\n`);
        
        notifications.forEach((notification, index) => {
            console.log(`${index + 1}. [${notification.type}] ${notification.title}`);
            console.log(`   📝 ${notification.message}`);
            console.log(`   🕒 ${notification.created_at}\n`);
        });
        
    } catch (error) {
        console.error('❌ Erro ao verificar notificações:', error);
    }
}

/**
 * Testar contagem de notificações não lidas
 */
async function testUnreadCount() {
    try {
        console.log('📊 Testando contagem de não lidas...');
        
        const notificationModel = require('../models/notificationModel');
        const count = await notificationModel.getUnreadCount(1);
        
        console.log(`✅ Notificações não lidas para usuário 1: ${count}`);
        
    } catch (error) {
        console.error('❌ Erro ao testar contagem:', error);
    }
}

/**
 * Executar todos os testes
 */
async function runAllTests() {
    console.log('🚀 Iniciando Testes do Sistema de Notificações\n');
    console.log('=' .repeat(50));
    
    // Inicializar banco de dados
    const dbInitialized = await initializeTestDatabase();
    if (!dbInitialized) {
        console.error('❌ Falha na inicialização do banco. Encerrando testes.');
        process.exit(1);
    }
    
    // Limpar notificações antigas de teste
    await cleanupTestNotifications();
    
    // Executar testes
    await testAutoNotifications();
    await checkCreatedNotifications();
    await testUnreadCount();
    
    console.log('=' .repeat(50));
    console.log('✅ Testes concluídos!\n');
    console.log('💡 Dicas:');
    console.log('   - Acesse http://localhost:4000/dashboard para ver as notificações');
    console.log('   - As notificações de teste contêm [TESTE] no texto');
    console.log('   - Use o script novamente para limpar e recriar os testes\n');
    
    process.exit(0);
}

// Executar se chamado diretamente
if (require.main === module) {
    runAllTests().catch(error => {
        console.error('❌ Erro fatal nos testes:', error);
        process.exit(1);
    });
}

module.exports = {
    testAutoNotifications,
    cleanupTestNotifications,
    checkCreatedNotifications,
    testUnreadCount
}; 