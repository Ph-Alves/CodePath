/**
 * Quiz Routes - Rotas do sistema de questionários
 * Define todas as rotas relacionadas a questionários, questões e validação
 */

const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { requireAuth } = require('../middleware/auth');
const { processQuizComplete, attachXPToResponse, attachXPToTemplate } = require('../middleware/xpMiddleware');

// Aplicar middleware de autenticação e XP a todas as rotas
router.use(requireAuth);
router.use(attachXPToTemplate);

// Rotas principais do questionário
router.get('/quiz/:id', quizController.showQuiz);
router.get('/quiz/:id/result', quizController.showQuizResult);

// Rotas de questões
router.get('/quiz/:quizId/question/:questionNumber', quizController.showQuestion);

// Rotas de submissão e validação (com processamento de XP)
router.post('/quiz/question/:questionId/submit', attachXPToResponse, processQuizComplete, quizController.submitAnswer);
router.post('/quiz/question/:questionId/validate', quizController.validateQuestion);

// Rotas de navegação
router.get('/quiz/:quizId/question/:questionNumber/next', quizController.goToNextQuestion);
router.get('/quiz/:quizId/question/:questionNumber/previous', quizController.goToPreviousQuestion);

module.exports = router; 