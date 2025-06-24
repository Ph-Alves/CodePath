const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { body } = require('express-validator');
const { requireAuth } = require('../middleware/auth');

// Middleware para verificar se o usuário é admin
const adminMiddleware = (req, res, next) => {
    if (!req.session.user || (!req.session.user.isAdmin && !req.session.user.is_admin)) {
        return res.status(403).json({
            success: false,
            message: 'Acesso negado. Apenas administradores podem acessar esta área.'
        });
    }
    next();
};

// Validações para pacotes
const packageValidation = [
    body('name')
        .notEmpty()
        .withMessage('Nome é obrigatório')
        .isLength({ min: 3, max: 100 })
        .withMessage('Nome deve ter entre 3 e 100 caracteres'),
    
    body('description')
        .notEmpty()
        .withMessage('Descrição é obrigatória')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
    
    body('difficulty')
        .isIn(['Iniciante', 'Intermediário', 'Avançado'])
        .withMessage('Dificuldade deve ser Iniciante, Intermediário ou Avançado'),
    
    body('duration_hours')
        .isInt({ min: 1, max: 1000 })
        .withMessage('Duração deve ser um número entre 1 e 1000 horas'),
    
    body('rating')
        .optional()
        .isFloat({ min: 0, max: 5 })
        .withMessage('Rating deve ser um número entre 0 e 5'),
    
    body('tags')
        .optional()
        .isString()
        .withMessage('Tags devem ser uma string'),
    
    body('prerequisites')
        .optional()
        .isString()
        .withMessage('Pré-requisitos devem ser uma string'),
    
    body('image_url')
        .optional()
        .isURL()
        .withMessage('URL da imagem deve ser válida'),
    
    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('Status ativo deve ser verdadeiro ou falso')
];

// Validações para aulas
const lessonValidation = [
    body('name')
        .notEmpty()
        .withMessage('Nome da aula é obrigatório')
        .isLength({ min: 3, max: 200 })
        .withMessage('Nome deve ter entre 3 e 200 caracteres'),
    
    body('description')
        .notEmpty()
        .withMessage('Descrição é obrigatória')
        .isLength({ min: 10, max: 2000 })
        .withMessage('Descrição deve ter entre 10 e 2000 caracteres'),
    
    body('package_id')
        .isInt({ min: 1 })
        .withMessage('Pacote é obrigatório'),
    
    body('lesson_number')
        .isInt({ min: 1 })
        .withMessage('Número da aula deve ser maior que 0'),
    
    body('order_sequence')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Ordem da sequência deve ser maior que 0'),
    
    body('video_url')
        .optional()
        .isURL()
        .withMessage('URL do vídeo deve ser válida'),
    
    body('content')
        .optional()
        .isString()
        .withMessage('Conteúdo deve ser uma string'),
    
    body('duration_minutes')
        .optional()
        .isInt({ min: 1, max: 600 })
        .withMessage('Duração deve ser entre 1 e 600 minutos')
];

// Validações para quizzes
const quizValidation = [
    body('title')
        .notEmpty()
        .withMessage('Título do quiz é obrigatório')
        .isLength({ min: 3, max: 150 })
        .withMessage('Título deve ter entre 3 e 150 caracteres'),
    
    body('description')
        .notEmpty()
        .withMessage('Descrição é obrigatória')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
    
    body('lesson_id')
        .isInt({ min: 1 })
        .withMessage('Aula é obrigatória'),
    
    body('difficulty_level')
        .optional()
        .isIn(['Fácil', 'Médio', 'Difícil'])
        .withMessage('Nível de dificuldade deve ser Fácil, Médio ou Difícil'),
    
    body('time_limit_minutes')
        .optional()
        .isInt({ min: 1, max: 180 })
        .withMessage('Tempo limite deve ser entre 1 e 180 minutos')
];

// Validações para questões
const questionValidation = [
    body('quiz_id')
        .isInt({ min: 1 })
        .withMessage('Quiz é obrigatório'),
    
    body('type')
        .isIn(['multiple_choice', 'code', 'text'])
        .withMessage('Tipo deve ser multiple_choice, code ou text'),
    
    body('question_text')
        .notEmpty()
        .withMessage('Texto da questão é obrigatório')
        .isLength({ min: 10, max: 2000 })
        .withMessage('Texto deve ter entre 10 e 2000 caracteres'),
    
    body('code_snippet')
        .optional()
        .isString()
        .withMessage('Código deve ser uma string'),
    
    body('correct_answer')
        .optional()
        .isString()
        .withMessage('Resposta correta deve ser uma string'),
    
    body('explanation')
        .optional()
        .isString()
        .withMessage('Explicação deve ser uma string'),
    
    body('points')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Pontos devem ser entre 1 e 100'),
    
    body('options')
        .optional()
        .isArray()
        .withMessage('Opções devem ser um array'),
    
    body('options.*.text')
        .if(body('type').equals('multiple_choice'))
        .notEmpty()
        .withMessage('Texto da opção é obrigatório'),
    
    body('options.*.is_correct')
        .if(body('type').equals('multiple_choice'))
        .isBoolean()
        .withMessage('Indicador de resposta correta deve ser boolean')
];

// ========================================
// ROTAS DA INTERFACE ADMINISTRATIVA
// ========================================

// Pacotes
router.get('/packages', requireAuth, adminMiddleware, AdminController.showPackagesAdmin);

// Aulas
router.get('/lessons', requireAuth, adminMiddleware, AdminController.showLessonsAdmin);

// Quizzes
router.get('/quizzes', requireAuth, adminMiddleware, AdminController.showQuizzesAdmin);

// Questões
router.get('/quizzes/:quizId/questions', requireAuth, adminMiddleware, AdminController.showQuestionsAdmin);

// ========================================
// APIs PARA PACOTES
// ========================================

router.get('/api/packages', requireAuth, adminMiddleware, AdminController.getPackagesAPI);
router.get('/api/packages/:id', requireAuth, adminMiddleware, AdminController.getPackageByIdAPI);
router.post('/api/packages', requireAuth, adminMiddleware, packageValidation, AdminController.createPackageAPI);
router.put('/api/packages/:id', requireAuth, adminMiddleware, packageValidation, AdminController.updatePackageAPI);
router.delete('/api/packages/:id', requireAuth, adminMiddleware, AdminController.deletePackageAPI);
router.patch('/api/packages/:id/reactivate', requireAuth, adminMiddleware, AdminController.reactivatePackageAPI);
router.get('/api/packages/stats', requireAuth, adminMiddleware, AdminController.getPackageStatsAPI);

// ========================================
// APIs PARA AULAS
// ========================================

router.get('/api/lessons', requireAuth, adminMiddleware, AdminController.getLessonsAPI);
router.get('/api/lessons/package/:packageId', requireAuth, adminMiddleware, AdminController.getLessonsByPackageAPI);
router.get('/api/lessons/:id', requireAuth, adminMiddleware, AdminController.getLessonByIdAPI);
router.post('/api/lessons', requireAuth, adminMiddleware, lessonValidation, AdminController.createLessonAPI);
router.put('/api/lessons/:id', requireAuth, adminMiddleware, lessonValidation, AdminController.updateLessonAPI);
router.delete('/api/lessons/:id', requireAuth, adminMiddleware, AdminController.deleteLessonAPI);
router.put('/api/lessons/package/:packageId/reorder', requireAuth, adminMiddleware, AdminController.reorderLessonsAPI);
router.get('/api/lessons/stats', requireAuth, adminMiddleware, AdminController.getLessonStatsAPI);

// ========================================
// APIs PARA QUIZZES
// ========================================

router.get('/api/quizzes', requireAuth, adminMiddleware, AdminController.getQuizzesAPI);
router.get('/api/quizzes/lesson/:lessonId', requireAuth, adminMiddleware, AdminController.getQuizzesByLessonAPI);
router.get('/api/quizzes/:id', requireAuth, adminMiddleware, AdminController.getQuizByIdAPI);
router.post('/api/quizzes', requireAuth, adminMiddleware, quizValidation, AdminController.createQuizAPI);
router.put('/api/quizzes/:id', requireAuth, adminMiddleware, quizValidation, AdminController.updateQuizAPI);
router.delete('/api/quizzes/:id', requireAuth, adminMiddleware, AdminController.deleteQuizAPI);
router.get('/api/quizzes/stats', requireAuth, adminMiddleware, AdminController.getQuizStatsAPI);

// ========================================
// APIs PARA QUESTÕES
// ========================================

router.get('/api/quizzes/:quizId/questions', requireAuth, adminMiddleware, AdminController.getQuestionsAPI);
router.get('/api/questions/:id', requireAuth, adminMiddleware, AdminController.getQuestionByIdAPI);
router.post('/api/questions', requireAuth, adminMiddleware, questionValidation, AdminController.createQuestionAPI);
router.put('/api/questions/:id', requireAuth, adminMiddleware, questionValidation, AdminController.updateQuestionAPI);
router.delete('/api/questions/:id', requireAuth, adminMiddleware, AdminController.deleteQuestionAPI);
router.put('/api/quizzes/:quizId/questions/reorder', requireAuth, adminMiddleware, AdminController.reorderQuestionsAPI);
router.get('/api/quizzes/:quizId/questions/stats', requireAuth, adminMiddleware, AdminController.getQuestionsStatsAPI);

module.exports = router; 