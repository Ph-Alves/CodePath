/**
 * Controller de Notificações - CodePath
 * Gerencia sistema completo de notificações da plataforma
 * 
 * Funcionalidades:
 * - Criar notificações automáticas
 * - Marcar como lida/não lida
 * - Listar notificações por usuário
 * - Limpar notificações antigas
 */

const notificationModel = require('../models/notificationModel');

/**
 * Criar nova notificação para usuário
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const createNotification = async (req, res) => {
    try {
        const { userId, type, title, message, actionUrl } = req.body;
        
        // Validar dados obrigatórios
        if (!userId || !type || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'Dados obrigatórios não fornecidos'
            });
        }

        const notification = await notificationModel.createNotification({
            userId,
            type,
            title,
            message,
            actionUrl: actionUrl || null
        });

        res.status(201).json({
            success: true,
            message: 'Notificação criada com sucesso',
            notification
        });

    } catch (error) {
        console.error('Erro ao criar notificação:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
};

/**
 * Listar notificações do usuário logado
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { limit = 10, offset = 0 } = req.query;

        const notifications = await notificationModel.getUserNotifications(
            userId, 
            parseInt(limit), 
            parseInt(offset)
        );

        const unreadCount = await notificationModel.getUnreadCount(userId);

        res.json({
            success: true,
            notifications,
            unreadCount,
            hasMore: notifications.length === parseInt(limit)
        });

    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao carregar notificações'
        });
    }
};

/**
 * Marcar notificação como lida
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.session.userId;

        await notificationModel.markAsRead(notificationId, userId);

        res.json({
            success: true,
            message: 'Notificação marcada como lida'
        });

    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar notificação'
        });
    }
};

/**
 * Marcar todas as notificações como lidas
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.session.userId;

        await notificationModel.markAllAsRead(userId);

        res.json({
            success: true,
            message: 'Todas as notificações foram marcadas como lidas'
        });

    } catch (error) {
        console.error('Erro ao marcar todas como lidas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar notificações'
        });
    }
};

/**
 * Excluir notificação
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.session.userId;

        await notificationModel.deleteNotification(notificationId, userId);

        res.json({
            success: true,
            message: 'Notificação excluída com sucesso'
        });

    } catch (error) {
        console.error('Erro ao excluir notificação:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir notificação'
        });
    }
};

/**
 * Limpar notificações antigas (mais de 30 dias)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const cleanupOldNotifications = async (req, res) => {
    try {
        const userId = req.session.userId;
        const deletedCount = await notificationModel.cleanupOldNotifications(userId);

        res.json({
            success: true,
            message: `${deletedCount} notificações antigas foram removidas`
        });

    } catch (error) {
        console.error('Erro ao limpar notificações antigas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao limpar notificações'
        });
    }
};

/**
 * Criar notificações automáticas do sistema
 */
const createSystemNotifications = {
    /**
     * Notificação de boas-vindas para novos usuários
     */
    welcome: async (userId, userName) => {
        await notificationModel.createNotification({
            userId,
            type: 'welcome',
            title: '🎉 Bem-vindo ao CodePath!',
            message: `Olá ${userName}! Comece sua jornada de aprendizado explorando nossas trilhas de carreira.`,
            actionUrl: '/careers'
        });
    },

    /**
     * Notificação de subida de nível
     */
    levelUp: async (userId, newLevel, xpGained) => {
        await notificationModel.createNotification({
            userId,
            type: 'level_up',
            title: '🎊 Parabéns! Você subiu de nível!',
            message: `Você alcançou o nível ${newLevel} e ganhou ${xpGained} XP! Continue assim!`,
            actionUrl: '/progress'
        });
    },

    /**
     * Notificação de conquista desbloqueada
     */
    achievementUnlocked: async (userId, achievementName, achievementDescription) => {
        await notificationModel.createNotification({
            userId,
            type: 'achievement',
            title: '🏆 Nova conquista desbloqueada!',
            message: `${achievementName}: ${achievementDescription}`,
            actionUrl: '/progress'
        });
    },

    /**
     * Notificação de streak diário
     */
    dailyStreak: async (userId, streakDays) => {
        const streakIcon = streakDays >= 7 ? '🔥' : '⭐';
        await notificationModel.createNotification({
            userId,
            type: 'streak',
            title: `${streakIcon} Streak de ${streakDays} dias!`,
            message: `Você está mantendo uma sequência incrível de ${streakDays} dias consecutivos!`,
            actionUrl: '/dashboard'
        });
    },

    /**
     * Notificação de aula concluída
     */
    lessonCompleted: async (userId, lessonName, xpGained) => {
        await notificationModel.createNotification({
            userId,
            type: 'lesson_complete',
            title: '📚 Aula concluída!',
            message: `Você completou "${lessonName}" e ganhou ${xpGained} XP!`,
            actionUrl: '/progress'
        });
    },

    /**
     * Notificação de quiz completado
     */
    quizCompleted: async (userId, quizName, score, xpGained) => {
        const scoreIcon = score >= 90 ? '🎯' : score >= 70 ? '👍' : '📝';
        await notificationModel.createNotification({
            userId,
            type: 'quiz_complete',
            title: `${scoreIcon} Quiz completado!`,
            message: `Você completou "${quizName}" com ${score}% de acerto e ganhou ${xpGained} XP!`,
            actionUrl: '/progress'
        });
    },

    /**
     * Notificação de pacote concluído
     */
    packageCompleted: async (userId, packageName, xpGained) => {
        await notificationModel.createNotification({
            userId,
            type: 'package_complete',
            title: '🎉 Pacote concluído!',
            message: `Parabéns! Você completou o pacote "${packageName}" e ganhou ${xpGained} XP!`,
            actionUrl: '/careers'
        });
    },

    /**
     * Notificação de login diário
     */
    dailyLogin: async (userId, xpGained, streakDays) => {
        await notificationModel.createNotification({
            userId,
            type: 'daily_login',
            title: '🌟 Login diário!',
            message: `Bem-vindo de volta! Você ganhou ${xpGained} XP pelo login diário. Streak: ${streakDays} dias.`,
            actionUrl: '/dashboard'
        });
    },

    /**
     * Notificação de quiz perfeito
     */
    perfectQuiz: async (userId, quizName, bonusXP) => {
        await notificationModel.createNotification({
            userId,
            type: 'perfect_quiz',
            title: '🎯 Quiz perfeito!',
            message: `Incrível! Você acertou 100% do quiz "${quizName}" e ganhou ${bonusXP} XP de bônus!`,
            actionUrl: '/progress'
        });
    }
};

/**
 * Processar eventos automáticos de notificação
 * Esta função é chamada por outros controladores para disparar notificações
 */
const processAutoNotification = async (eventType, userId, eventData) => {
    try {
        switch (eventType) {
            case 'user_registered':
                await createSystemNotifications.welcome(userId, eventData.userName);
                break;

            case 'level_up':
                await createSystemNotifications.levelUp(userId, eventData.newLevel, eventData.xpGained);
                break;

            case 'achievement_unlocked':
                await createSystemNotifications.achievementUnlocked(
                    userId, 
                    eventData.achievementName, 
                    eventData.achievementDescription
                );
                break;

            case 'daily_streak':
                await createSystemNotifications.dailyStreak(userId, eventData.streakDays);
                break;

            case 'lesson_completed':
                await createSystemNotifications.lessonCompleted(
                    userId, 
                    eventData.lessonName, 
                    eventData.xpGained
                );
                break;

            case 'quiz_completed':
                await createSystemNotifications.quizCompleted(
                    userId, 
                    eventData.quizName, 
                    eventData.score, 
                    eventData.xpGained
                );
                
                // Se foi quiz perfeito, adiciona notificação especial
                if (eventData.score === 100 && eventData.bonusXP) {
                    await createSystemNotifications.perfectQuiz(
                        userId, 
                        eventData.quizName, 
                        eventData.bonusXP
                    );
                }
                break;

            case 'package_completed':
                await createSystemNotifications.packageCompleted(
                    userId, 
                    eventData.packageName, 
                    eventData.xpGained
                );
                break;

            case 'daily_login':
                await createSystemNotifications.dailyLogin(
                    userId, 
                    eventData.xpGained, 
                    eventData.streakDays
                );
                break;

            default:
                console.warn(`Tipo de evento de notificação não reconhecido: ${eventType}`);
        }
    } catch (error) {
        console.error(`Erro ao processar notificação automática (${eventType}):`, error);
    }
};

/**
 * Endpoint para buscar notificações em tempo real (polling)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const pollNotifications = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { lastCheck } = req.query;

        // Buscar notificações criadas após o último check
        let query = `
            SELECT 
                id, type, title, message, action_url, is_read, created_at,
                CASE 
                    WHEN datetime('now', '-1 hour') < created_at THEN 'Agora'
                    WHEN datetime('now', '-1 day') < created_at THEN 'Hoje'
                    WHEN datetime('now', '-7 days') < created_at THEN 'Esta semana'
                    ELSE 'Mais antigas'
                END as time_group
            FROM notifications 
            WHERE user_id = ?
        `;
        
        const params = [userId];
        
        if (lastCheck) {
            query += ` AND created_at > ?`;
            params.push(lastCheck);
        }
        
        query += ` ORDER BY created_at DESC LIMIT 5`;
        
        const { getDatabase } = require('../models/database');
        const db = getDatabase();
        const newNotifications = await db.all(query, params);
        const unreadCount = await notificationModel.getUnreadCount(userId);

        res.json({
            success: true,
            newNotifications,
            unreadCount,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro no polling de notificações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao verificar notificações'
        });
    }
};

/**
 * Endpoint para estatísticas de notificações
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getNotificationStats = async (req, res) => {
    try {
        const userId = req.session.userId;
        
        const stats = await notificationModel.getNotificationStats(userId);
        
        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas de notificações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao carregar estatísticas'
        });
    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    cleanupOldNotifications,
    createSystemNotifications,
    processAutoNotification,
    pollNotifications,
    getNotificationStats
}; 