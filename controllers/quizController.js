/**
 * Quiz Controller - Controlador do sistema de questionários
 * Gerencia a lógica de apresentação de questionários, questões e validação de respostas
 */

const quizModel = require('../models/quizModel');

const quizController = {
    /**
     * Exibir visão geral do questionário
     */
    showQuiz: async (req, res) => {
        try {
            const quizId = req.params.id;
            const userId = req.session.user.id;

            // Buscar dados do questionário
            const quiz = await quizModel.getQuizById(quizId);
            if (!quiz) {
                return res.status(404).render('pages/error', {
                    title: 'Questionário não encontrado',
                    message: 'O questionário solicitado não foi encontrado.'
                });
            }

            // Buscar progresso do usuário
            const progress = await quizModel.getUserQuizProgress(userId, quizId);

            // Buscar questões para exibir na grade
            const questions = await quizModel.getQuizQuestions(quizId);

            res.render('pages/quiz', {
                title: `${quiz.title} - CodePath`,
                additionalCSS: 'quiz',
                user: req.session.user,
                quiz: {
                    ...quiz,
                    progress,
                    questions: questions.map((q, index) => ({
                        ...q,
                        number: index + 1,
                        typeIcon: q.question_type === 'code' ? '💻' : 
                                 q.question_type === 'multiple_choice' ? '📋' : '📝'
                    }))
                }
            });
        } catch (error) {
            console.error('Erro ao exibir questionário:', error);
            res.status(500).render('pages/error', {
                title: 'Erro interno',
                message: 'Ocorreu um erro ao carregar o questionário.'
            });
        }
    },

    /**
     * Exibir questão específica
     */
    showQuestion: async (req, res) => {
        try {
            const { quizId, questionNumber } = req.params;
            const userId = req.session.user.id;

            // Buscar questões do questionário
            const questions = await quizModel.getQuizQuestions(quizId);
            const questionIndex = parseInt(questionNumber) - 1;

            if (questionIndex < 0 || questionIndex >= questions.length) {
                return res.status(404).render('pages/error', {
                    title: 'Questão não encontrada',
                    message: 'A questão solicitada não foi encontrada.'
                });
            }

            const question = questions[questionIndex];

            // Buscar opções se for múltipla escolha
            let options = [];
            if (question.question_type === 'multiple_choice') {
                options = await quizModel.getQuestionOptions(question.id);
            }

            // Buscar dados do quiz
            const quiz = await quizModel.getQuizById(quizId);
            const progress = await quizModel.getUserQuizProgress(userId, quizId);

            // Navegação
            const hasNext = questionIndex < questions.length - 1;
            const hasPrevious = questionIndex > 0;

            res.render('pages/quiz-question', {
                title: `${quiz.title} - Questão ${questionNumber}`,
                additionalCSS: 'quiz',
                user: req.session.user,
                quiz: {
                    ...quiz,
                    progress
                },
                question: {
                    ...question,
                    number: parseInt(questionNumber),
                    options,
                    hasNext,
                    hasPrevious,
                    nextNumber: hasNext ? parseInt(questionNumber) + 1 : null,
                    previousNumber: hasPrevious ? parseInt(questionNumber) - 1 : null
                },
                navigation: {
                    currentQuestion: parseInt(questionNumber),
                    totalQuestions: questions.length,
                    progressPercentage: Math.round((parseInt(questionNumber) / questions.length) * 100)
                }
            });
        } catch (error) {
            console.error('Erro ao exibir questão:', error);
            res.status(500).render('pages/error', {
                title: 'Erro interno',
                message: 'Ocorreu um erro ao carregar a questão.'
            });
        }
    },

    /**
     * Submeter resposta genérica
     */
    submitAnswer: async (req, res) => {
        try {
            const questionId = req.params.questionId;
            const userId = req.session.user.id;
            const { answer, answerType } = req.body;

            let result;
            if (answerType === 'multiple_choice') {
                result = await quizModel.validateMultipleChoiceAnswer(questionId, answer);
            } else {
                // Para questões de texto, apenas salvar (sem validação automática)
                result = { isCorrect: null, explanation: null };
            }

            // Salvar resposta
            await quizModel.submitAnswer(userId, questionId, answer, result.isCorrect);

            res.json({
                success: true,
                isCorrect: result.isCorrect,
                explanation: result.explanation,
                score: result.isCorrect ? 10 : 0
            });
        } catch (error) {
            console.error('Erro ao submeter resposta:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao processar resposta'
            });
        }
    },

    /**
     * Validar questão de código
     */
    validateQuestion: async (req, res) => {
        try {
            const questionId = req.params.questionId;
            const userId = req.session.user.id;
            const { code } = req.body;

            // Validar código
            const result = await quizModel.validateCodeAnswer(questionId, code);

            // Salvar resposta
            const saveResult = await quizModel.submitAnswer(userId, questionId, code, result.isCorrect);

            // Se correto, dar XP adicional (+10 XP por resposta correta)
            if (result.isCorrect) {
                const updateXpQuery = `UPDATE users SET total_xp = total_xp + 10 WHERE id = ?`;
                // Executar query de XP (simplificado)
            }

            res.json({
                success: true,
                isCorrect: result.isCorrect,
                explanation: result.explanation,
                correctAnswer: result.correctAnswer,
                score: saveResult.score,
                xpEarned: result.isCorrect ? 10 : 0
            });
        } catch (error) {
            console.error('Erro ao validar código:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao validar código'
            });
        }
    },

    /**
     * Navegar para próxima questão
     */
    goToNextQuestion: async (req, res) => {
        try {
            const { quizId, questionNumber } = req.params;
            const nextNumber = parseInt(questionNumber) + 1;

            // Verificar se existe próxima questão
            const questions = await quizModel.getQuizQuestions(quizId);
            if (nextNumber > questions.length) {
                return res.redirect(`/quiz/${quizId}/result`);
            }

            res.redirect(`/quiz/${quizId}/question/${nextNumber}`);
        } catch (error) {
            console.error('Erro ao navegar:', error);
            res.status(500).render('pages/error', {
                title: 'Erro de navegação',
                message: 'Erro ao navegar para próxima questão'
            });
        }
    },

    /**
     * Navegar para questão anterior
     */
    goToPreviousQuestion: async (req, res) => {
        try {
            const { quizId, questionNumber } = req.params;
            const previousNumber = parseInt(questionNumber) - 1;

            if (previousNumber < 1) {
                return res.redirect(`/quiz/${quizId}`);
            }

            res.redirect(`/quiz/${quizId}/question/${previousNumber}`);
        } catch (error) {
            console.error('Erro ao navegar:', error);
            res.status(500).render('pages/error', {
                title: 'Erro de navegação',
                message: 'Erro ao navegar para questão anterior'
            });
        }
    },

    /**
     * Exibir resultado do questionário
     */
    showQuizResult: async (req, res) => {
        try {
            const quizId = req.params.id;
            const userId = req.session.user.id;

            const quiz = await quizModel.getQuizById(quizId);
            const progress = await quizModel.getUserQuizProgress(userId, quizId);

            // Se completou o questionário, finalizar e dar XP
            if (progress.isCompleted) {
                try {
                    await quizModel.completeQuiz(userId, quizId);
                } catch (error) {
                    // Quiz já foi completado antes, ignorar erro
                }
            }

            res.render('pages/quiz-result', {
                title: `${quiz.title} - Resultado`,
                additionalCSS: 'quiz',
                user: req.session.user,
                quiz,
                result: {
                    ...progress,
                    grade: progress.accuracy >= 70 ? 'Aprovado' : 'Reprovado',
                    gradeClass: progress.accuracy >= 70 ? 'success' : 'danger',
                    message: progress.accuracy >= 70 ? 
                        'Parabéns! Você foi aprovado no questionário.' :
                        'Continue estudando e tente novamente.'
                }
            });
        } catch (error) {
            console.error('Erro ao exibir resultado:', error);
            res.status(500).render('pages/error', {
                title: 'Erro interno',
                message: 'Erro ao carregar resultado do questionário'
            });
        }
    }
};

module.exports = quizController; 