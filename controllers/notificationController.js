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
            message: `Olá ${userName}! Estamos felizes em tê-lo conosco. Explore nossas trilhas e descubra seu caminho na tecnologia!`,
            actionUrl: '/careers'
        });
    },

    /**
     * Notificação de progresso em curso
     */
    progressUpdate: async (userId, packageName, progress) => {
        await notificationModel.createNotification({
            userId,
            type: 'progress',
            title: '📈 Progresso Atualizado',
            message: `Parabéns! Você completou ${progress}% do pacote ${packageName}. Continue assim!`,
            actionUrl: '/progress'
        });
    },

    /**
     * Notificação de questionário concluído
     */
    quizCompleted: async (userId, quizName, score) => {
        const emoji = score >= 80 ? '🏆' : score >= 60 ? '👏' : '💪';
        await notificationModel.createNotification({
            userId,
            type: 'quiz',
            title: `${emoji} Questionário Concluído`,
            message: `Você obteve ${score}% no questionário "${quizName}". ${score >= 80 ? 'Excelente trabalho!' : score >= 60 ? 'Bom trabalho!' : 'Continue praticando!'}`,
            actionUrl: '/quiz'
        });
    },

    /**
     * Notificação de streak mantido
     */
    streakMaintained: async (userId, streakDays) => {
        await notificationModel.createNotification({
            userId,
            type: 'streak',
            title: '🔥 Streak Mantido!',
            message: `Incrível! Você manteve sua sequência de estudos por ${streakDays} dias consecutivos!`,
            actionUrl: '/dashboard'
        });
    },

    /**
     * Notificação de novo conteúdo disponível
     */
    newContent: async (userId, contentTitle, packageName) => {
        await notificationModel.createNotification({
            userId,
            type: 'content',
            title: '📚 Novo Conteúdo Disponível',
            message: `O conteúdo "${contentTitle}" foi adicionado ao pacote ${packageName}. Confira agora!`,
            actionUrl: '/careers'
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
    createSystemNotifications
}; 