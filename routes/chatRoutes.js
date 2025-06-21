/**
 * Rotas de Chat - CodePath
 * Define todas as rotas relacionadas ao sistema de chat e comunidade
 */

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// ===== PÁGINAS PRINCIPAIS =====

/**
 * GET /chat
 * Página principal do chat com salas e grupos
 */
router.get('/', chatController.showChatPage);

/**
 * GET /chat/room/:roomId
 * Página de sala de chat específica
 */
router.get('/room/:roomId', chatController.showChatRoom);

/**
 * GET /chat/study-groups
 * Página de grupos de estudo
 */
router.get('/study-groups', chatController.showStudyGroups);

// ===== APIs DE SALAS DE CHAT =====

/**
 * GET /chat/api/rooms
 * API para buscar salas de chat
 * Query params: technology (opcional)
 */
router.get('/api/rooms', chatController.getChatRooms);

/**
 * POST /chat/api/rooms
 * API para criar nova sala de chat
 * Body: { name, description, technology, type, maxUsers }
 */
router.post('/api/rooms', chatController.createChatRoom);

/**
 * POST /chat/api/rooms/:roomId/join
 * API para entrar em uma sala de chat
 */
router.post('/api/rooms/:roomId/join', chatController.joinChatRoom);

/**
 * POST /chat/api/rooms/:roomId/leave
 * API para sair de uma sala de chat
 */
router.post('/api/rooms/:roomId/leave', chatController.leaveChatRoom);

// ===== APIs DE MENSAGENS =====

/**
 * GET /chat/api/rooms/:roomId/messages
 * API para buscar mensagens de uma sala
 * Query params: limit, offset
 */
router.get('/api/rooms/:roomId/messages', chatController.getRoomMessages);

/**
 * POST /chat/api/rooms/:roomId/messages
 * API para enviar mensagem em uma sala
 * Body: { message, messageType }
 */
router.post('/api/rooms/:roomId/messages', chatController.sendMessage);

/**
 * GET /chat/api/rooms/:roomId/members
 * API para buscar membros de uma sala
 */
router.get('/api/rooms/:roomId/members', chatController.getRoomMembers);

// ===== APIs DE GRUPOS DE ESTUDO =====

/**
 * GET /chat/api/study-groups
 * API para buscar grupos de estudo
 * Query params: technology (opcional)
 */
router.get('/api/study-groups', chatController.getStudyGroups);

/**
 * POST /chat/api/study-groups
 * API para criar novo grupo de estudo
 * Body: { name, description, technology, schedule, maxMembers }
 */
router.post('/api/study-groups', chatController.createStudyGroup);

module.exports = router; 