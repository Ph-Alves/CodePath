/**
 * CodePath - Rotas de Conteúdos
 * 
 * Este arquivo define todas as rotas relacionadas ao sistema
 * de conteúdos, aulas e navegação entre materiais.
 */

const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { requireAuth } = require('../middleware/auth');

// ========================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ========================================
// Todas as rotas de conteúdo requerem autenticação
router.use(requireAuth);

// ========================================
// ROTAS DE VISUALIZAÇÃO DE CONTEÚDO
// ========================================

/**
 * GET /content/package/:packageId/lessons
 * Exibe lista de aulas de um pacote específico
 */
router.get('/package/:packageId/lessons', contentController.showPackageLessons);

/**
 * GET /content/lesson/:lessonId
 * Exibe uma aula específica com player de conteúdo
 */
router.get('/lesson/:lessonId', contentController.showLesson);

// ========================================
// ROTAS DE NAVEGAÇÃO ENTRE AULAS
// ========================================

/**
 * GET /content/lesson/:lessonId/next
 * Navega para a próxima aula
 */
router.get('/lesson/:lessonId/next', contentController.goToNextLesson);

/**
 * GET /content/lesson/:lessonId/previous
 * Navega para a aula anterior
 */
router.get('/lesson/:lessonId/previous', contentController.goToPreviousLesson);

// ========================================
// ROTAS DE AÇÕES DO USUÁRIO
// ========================================

/**
 * POST /content/lesson/:lessonId/complete
 * Marca uma aula como concluída
 */
router.post('/lesson/:lessonId/complete', contentController.markLessonComplete);

// ========================================
// APIs PARA DADOS DE CONTEÚDO
// ========================================

/**
 * GET /content/api/package/:packageId/progress
 * API para obter progresso de um pacote
 */
router.get('/api/package/:packageId/progress', contentController.getPackageProgress);

/**
 * GET /content/api/package/:packageId/lessons
 * API para obter aulas de um pacote
 */
router.get('/api/package/:packageId/lessons', contentController.getPackageLessonsAPI);

module.exports = router; 