/**
 * Rotas de Notificações - CodePath
 * Define rotas para gerenciamento de notificações
 * 
 * Rotas implementadas:
 * - GET /notifications - Listar notificações
 * - POST /notifications - Criar notificação
 * - PUT /notifications/:id/read - Marcar como lida
 * - PUT /notifications/read-all - Marcar todas como lidas
 * - DELETE /notifications/:id - Excluir notificação
 * - DELETE /notifications/cleanup - Limpar antigas
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware.requireAuth);

/**
 * GET /notifications
 * Listar notificações do usuário com paginação
 */
router.get('/', notificationController.getUserNotifications);

/**
 * POST /notifications
 * Criar nova notificação (para administradores)
 */
router.post('/', notificationController.createNotification);

/**
 * PUT /notifications/:id/read
 * Marcar notificação específica como lida
 */
router.put('/:notificationId/read', notificationController.markAsRead);

/**
 * PUT /notifications/read-all
 * Marcar todas as notificações como lidas
 */
router.put('/read-all', notificationController.markAllAsRead);

/**
 * DELETE /notifications/:id
 * Excluir notificação específica
 */
router.delete('/:notificationId', notificationController.deleteNotification);

/**
 * DELETE /notifications/cleanup
 * Limpar notificações antigas (mais de 30 dias)
 */
router.delete('/cleanup', notificationController.cleanupOldNotifications);

module.exports = router; 