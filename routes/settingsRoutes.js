/**
 * CodePath - Settings Routes
 * Fase 26 - Polish Final
 * 
 * Rotas para gerenciar configurações do usuário
 */

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/auth');

// ========================================
// ROTAS DE PÁGINAS
// ========================================

/**
 * GET /settings
 * Exibir página de configurações
 */
router.get('/', authMiddleware.requireAuth, settingsController.showSettings);

// ========================================
// ROTAS DE API
// ========================================

/**
 * GET /api/settings/user
 * Buscar configurações do usuário
 */
router.get('/api/settings/user', authMiddleware.requireAuth, settingsController.getUserSettingsAPI);

/**
 * POST /settings/profile
 * Atualizar perfil do usuário
 */
router.post('/profile', authMiddleware.requireAuth, settingsController.updateProfile);

/**
 * POST /settings/password
 * Alterar senha do usuário
 */
router.post('/password', authMiddleware.requireAuth, settingsController.changePassword);

/**
 * POST /api/settings/notifications
 * Salvar configurações de notificações
 */
router.post('/api/settings/notifications', authMiddleware.requireAuth, settingsController.saveNotifications);

/**
 * POST /api/settings/appearance
 * Salvar configurações de aparência
 */
router.post('/api/settings/appearance', authMiddleware.requireAuth, settingsController.saveAppearance);

/**
 * POST /api/settings/learning
 * Salvar preferências de aprendizado
 */
router.post('/api/settings/learning', authMiddleware.requireAuth, settingsController.saveLearningPreferences);

/**
 * GET /settings/export
 * Exportar dados do usuário
 */
router.get('/export', authMiddleware.requireAuth, settingsController.exportUserData);

/**
 * POST /api/settings/delete-account
 * Excluir conta do usuário
 */
router.post('/api/settings/delete-account', authMiddleware.requireAuth, settingsController.deleteUserAccount);

/**
 * POST /settings/save
 * Salvar configurações do usuário
 */
router.post('/save', authMiddleware.requireAuth, settingsController.saveSettings);

module.exports = router; 