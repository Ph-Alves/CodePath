/**
 * Model de Notificações - CodePath
 * Gerencia operações de banco de dados para notificações
 * 
 * Funcionalidades:
 * - CRUD completo de notificações
 * - Controle de leitura/não leitura
 * - Limpeza automática de notificações antigas
 */

const { getDatabase } = require('./databaseConnection');

/**
 * Criar nova notificação
 * @param {Object} notificationData - Dados da notificação
 * @returns {Object} Notificação criada
 */
const createNotification = async (notificationData) => {
    const { userId, type, title, message, actionUrl } = notificationData;
    const db = await getDatabase();
    
    const query = `
        INSERT INTO notifications (user_id, type, title, message, action_url, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
    `;
    
    try {
        const result = await db.run(query, [userId, type, title, message, actionUrl]);
        
        // Retornar a notificação criada
        const createdNotification = await db.get(`
            SELECT * FROM notifications WHERE id = ?
        `, [result.lastID]);
        
        return createdNotification;
    } catch (error) {
        console.error('Erro ao criar notificação:', error);
        throw error;
    }
};

/**
 * Buscar notificações do usuário
 * @param {number} userId - ID do usuário
 * @param {number} limit - Limite de resultados
 * @param {number} offset - Offset para paginação
 * @returns {Array} Lista de notificações
 */
const getUserNotifications = async (userId, limit = 10, offset = 0) => {
    const db = await getDatabase();
    
    const query = `
        SELECT 
            id,
            type,
            title,
            message,
            action_url,
            is_read,
            created_at,
            CASE 
                WHEN datetime('now', '-1 hour') < created_at THEN 'Agora'
                WHEN datetime('now', '-1 day') < created_at THEN 'Hoje'
                WHEN datetime('now', '-7 days') < created_at THEN 'Esta semana'
                ELSE 'Mais antigas'
            END as time_group
        FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    `;
    
    try {
        return await db.all(query, [userId, limit, offset]);
    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        throw error;
    }
};

/**
 * Contar notificações não lidas
 * @param {number} userId - ID do usuário
 * @returns {number} Quantidade de notificações não lidas
 */
const getUnreadCount = async (userId) => {
    const db = await getDatabase();
    
    const query = `
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE user_id = ? AND is_read = 0
    `;
    
    try {
        const result = await db.get(query, [userId]);
        return result ? result.count : 0;
    } catch (error) {
        console.error('Erro ao contar notificações não lidas:', error);
        throw error;
    }
};

/**
 * Marcar notificação como lida
 * @param {number} notificationId - ID da notificação
 * @param {number} userId - ID do usuário (para segurança)
 * @returns {boolean} Sucesso da operação
 */
const markAsRead = async (notificationId, userId) => {
    const db = await getDatabase();
    
    const query = `
        UPDATE notifications 
        SET is_read = 1, read_at = datetime('now')
        WHERE id = ? AND user_id = ?
    `;
    
    try {
        const result = await db.run(query, [notificationId, userId]);
        return result.changes > 0;
    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        throw error;
    }
};

/**
 * Marcar todas as notificações como lidas
 * @param {number} userId - ID do usuário
 * @returns {number} Quantidade de notificações marcadas
 */
const markAllAsRead = async (userId) => {
    const db = await getDatabase();
    
    const query = `
        UPDATE notifications 
        SET is_read = 1, read_at = datetime('now')
        WHERE user_id = ? AND is_read = 0
    `;
    
    try {
        const result = await db.run(query, [userId]);
        return result.changes;
    } catch (error) {
        console.error('Erro ao marcar todas como lidas:', error);
        throw error;
    }
};

/**
 * Excluir notificação
 * @param {number} notificationId - ID da notificação
 * @param {number} userId - ID do usuário (para segurança)
 * @returns {boolean} Sucesso da operação
 */
const deleteNotification = async (notificationId, userId) => {
    const db = await getDatabase();
    
    const query = `
        DELETE FROM notifications 
        WHERE id = ? AND user_id = ?
    `;
    
    try {
        const result = await db.run(query, [notificationId, userId]);
        return result.changes > 0;
    } catch (error) {
        console.error('Erro ao excluir notificação:', error);
        throw error;
    }
};

/**
 * Limpar notificações antigas (mais de 30 dias)
 * @param {number} userId - ID do usuário
 * @returns {number} Quantidade de notificações removidas
 */
const cleanupOldNotifications = async (userId) => {
    const db = await getDatabase();
    
    const query = `
        DELETE FROM notifications 
        WHERE user_id = ? 
        AND created_at < datetime('now', '-30 days')
        AND is_read = 1
    `;
    
    try {
        const result = await db.run(query, [userId]);
        return result.changes;
    } catch (error) {
        console.error('Erro ao limpar notificações antigas:', error);
        throw error;
    }
};

/**
 * Buscar notificações por tipo
 * @param {number} userId - ID do usuário
 * @param {string} type - Tipo da notificação
 * @param {number} limit - Limite de resultados
 * @returns {Array} Lista de notificações do tipo especificado
 */
const getNotificationsByType = async (userId, type, limit = 5) => {
    const db = await getDatabase();
    
    const query = `
        SELECT * FROM notifications 
        WHERE user_id = ? AND type = ?
        ORDER BY created_at DESC
        LIMIT ?
    `;
    
    try {
        return await db.all(query, [userId, type, limit]);
    } catch (error) {
        console.error('Erro ao buscar notificações por tipo:', error);
        throw error;
    }
};

/**
 * Buscar estatísticas de notificações do usuário
 * @param {number} userId - ID do usuário
 * @returns {Object} Estatísticas das notificações
 */
const getNotificationStats = async (userId) => {
    const db = await getDatabase();
    
    const query = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread,
            SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read,
            COUNT(CASE WHEN type = 'welcome' THEN 1 END) as welcome,
            COUNT(CASE WHEN type = 'progress' THEN 1 END) as progress,
            COUNT(CASE WHEN type = 'quiz' THEN 1 END) as quiz,
            COUNT(CASE WHEN type = 'streak' THEN 1 END) as streak,
            COUNT(CASE WHEN type = 'content' THEN 1 END) as content
        FROM notifications 
        WHERE user_id = ?
    `;
    
    try {
        const result = await db.get(query, [userId]);
        return result || {
            total: 0,
            unread: 0,
            read: 0,
            welcome: 0,
            progress: 0,
            quiz: 0,
            streak: 0,
            content: 0
        };
    } catch (error) {
        console.error('Erro ao buscar estatísticas de notificações:', error);
        throw error;
    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    cleanupOldNotifications,
    getNotificationsByType,
    getNotificationStats
}; 