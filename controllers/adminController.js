const PackageModel = require('../models/packageModel');
const LessonModel = require('../models/lessonModel');
const quizModel = require('../models/quizModel');
const { validationResult } = require('express-validator');

class AdminController {
    /**
     * Página de administração de pacotes
     */
    static async showPackagesAdmin(req, res) {
        try {
            const packages = await PackageModel.getAllPackagesAdmin();
            const stats = await PackageModel.getPackageStats();

            res.render('pages/admin-packages', {
                title: 'Administração de Pacotes - CodePath',
                pageTitle: 'Administração de Pacotes',
                user: req.session.user,
                packages: packages,
                stats: stats,
                additionalCSS: 'admin',
                additionalJS: 'admin-packages',
                bodyClass: 'admin-page',
                layout: 'main'
            });
        } catch (error) {
            console.error('Erro ao carregar página de admin:', error);
            res.status(500).render('pages/error', {
                title: 'Erro - CodePath',
                message: 'Erro interno do servidor',
                layout: 'main'
            });
        }
    }

    /**
     * API: Listar todos os pacotes para admin
     */
    static async getPackagesAPI(req, res) {
        try {
            const packages = await PackageModel.getAllPackagesAdmin();
            res.json({
                success: true,
                packages
            });
        } catch (error) {
            console.error('Erro ao buscar pacotes:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar pacotes'
            });
        }
    }

    /**
     * API: Buscar pacote por ID
     */
    static async getPackageByIdAPI(req, res) {
        try {
            const { id } = req.params;
            const packageData = await PackageModel.getPackageById(id);

            if (!packageData) {
                return res.status(404).json({
                    success: false,
                    message: 'Pacote não encontrado'
                });
            }

            res.json({
                success: true,
                package: packageData
            });
        } catch (error) {
            console.error('Erro ao buscar pacote:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar pacote'
            });
        }
    }

    /**
     * API: Criar novo pacote
     */
    static async createPackageAPI(req, res) {
        try {
            // Validar dados de entrada
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: errors.array()
                });
            }

            const packageData = req.body;
            
            // Validação adicional
            const validationErrors = PackageModel.validatePackageData(packageData);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: validationErrors
                });
            }

            const packageId = await PackageModel.createPackage(packageData);

            res.status(201).json({
                success: true,
                message: 'Pacote criado com sucesso',
                packageId
            });
        } catch (error) {
            console.error('Erro ao criar pacote:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao criar pacote'
            });
        }
    }

    /**
     * API: Atualizar pacote existente
     */
    static async updatePackageAPI(req, res) {
        try {
            const { id } = req.params;
            const packageData = req.body;

            // Validar dados de entrada
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: errors.array()
                });
            }

            // Validação adicional
            const validationErrors = PackageModel.validatePackageData(packageData);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: validationErrors
                });
            }

            const updated = await PackageModel.updatePackage(id, packageData);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Pacote não encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Pacote atualizado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao atualizar pacote:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao atualizar pacote'
            });
        }
    }

    /**
     * API: Excluir pacote
     */
    static async deletePackageAPI(req, res) {
        try {
            const { id } = req.params;
            const result = await PackageModel.deletePackage(id);

            if (!result.deleted) {
                return res.status(404).json({
                    success: false,
                    message: result.message || 'Pacote não encontrado'
                });
            }

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Erro ao excluir pacote:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao excluir pacote'
            });
        }
    }

    /**
     * API: Reativar pacote
     */
    static async reactivatePackageAPI(req, res) {
        try {
            const { id } = req.params;
            const reactivated = await PackageModel.reactivatePackage(id);

            if (!reactivated) {
                return res.status(404).json({
                    success: false,
                    message: 'Pacote não encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Pacote reativado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao reativar pacote:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao reativar pacote'
            });
        }
    }

    /**
     * API: Estatísticas de pacotes
     */
    static async getPackageStatsAPI(req, res) {
        try {
            const stats = await PackageModel.getPackageStats();
            res.json({
                success: true,
                stats
            });
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar estatísticas'
            });
        }
    }

    // ========================================
    // MÉTODOS DE ADMINISTRAÇÃO DE AULAS
    // ========================================

    /**
     * Página principal de administração de aulas
     */
    static async showLessonsAdmin(req, res) {
        try {
            const lessons = await LessonModel.getAllLessonsAdmin();
            const stats = await LessonModel.getLessonStats();
            const packages = await PackageModel.getAllPackagesAdmin();

            res.render('pages/admin-lessons', {
                title: 'Administração de Aulas - CodePath',
                user: req.session.user,
                lessons,
                stats,
                packages,
                additionalCSS: 'admin',
                additionalJS: 'admin-lessons',
                layout: 'main'
            });
        } catch (error) {
            console.error('Erro ao carregar página de admin de aulas:', error);
            res.status(500).render('pages/error', {
                title: 'Erro - CodePath',
                message: 'Erro interno do servidor',
                layout: 'main'
            });
        }
    }

    /**
     * API: Listar todas as aulas para admin
     */
    static async getLessonsAPI(req, res) {
        try {
            const lessons = await LessonModel.getAllLessonsAdmin();
            res.json({
                success: true,
                lessons
            });
        } catch (error) {
            console.error('Erro ao buscar aulas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar aulas'
            });
        }
    }

    /**
     * API: Listar aulas por pacote
     */
    static async getLessonsByPackageAPI(req, res) {
        try {
            const { packageId } = req.params;
            const lessons = await LessonModel.getLessonsByPackage(packageId);
            res.json({
                success: true,
                lessons
            });
        } catch (error) {
            console.error('Erro ao buscar aulas do pacote:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar aulas do pacote'
            });
        }
    }

    /**
     * API: Buscar aula por ID
     */
    static async getLessonByIdAPI(req, res) {
        try {
            const { id } = req.params;
            const lesson = await LessonModel.getLessonById(id);

            if (!lesson) {
                return res.status(404).json({
                    success: false,
                    message: 'Aula não encontrada'
                });
            }

            res.json({
                success: true,
                lesson
            });
        } catch (error) {
            console.error('Erro ao buscar aula:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar aula'
            });
        }
    }

    /**
     * API: Criar nova aula
     */
    static async createLessonAPI(req, res) {
        try {
            // Validar dados de entrada
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: errors.array()
                });
            }

            const lessonData = req.body;
            
            // Validação adicional
            const validationErrors = LessonModel.validateLessonData(lessonData);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: validationErrors
                });
            }

            // Buscar próxima ordem se não fornecida
            if (!lessonData.order_sequence) {
                lessonData.order_sequence = await LessonModel.getNextOrderSequence(lessonData.package_id);
            }

            const lessonId = await LessonModel.createLesson(lessonData);

            res.status(201).json({
                success: true,
                message: 'Aula criada com sucesso',
                lessonId
            });
        } catch (error) {
            console.error('Erro ao criar aula:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao criar aula'
            });
        }
    }

    /**
     * API: Atualizar aula existente
     */
    static async updateLessonAPI(req, res) {
        try {
            const { id } = req.params;
            const lessonData = req.body;

            // Validar dados de entrada
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: errors.array()
                });
            }

            // Validação adicional
            const validationErrors = LessonModel.validateLessonData(lessonData);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: validationErrors
                });
            }

            const updated = await LessonModel.updateLesson(id, lessonData);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Aula não encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Aula atualizada com sucesso'
            });
        } catch (error) {
            console.error('Erro ao atualizar aula:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao atualizar aula'
            });
        }
    }

    /**
     * API: Excluir aula
     */
    static async deleteLessonAPI(req, res) {
        try {
            const { id } = req.params;
            const result = await LessonModel.deleteLesson(id);

            res.json({
                success: true,
                message: 'Aula excluída com sucesso'
            });
        } catch (error) {
            console.error('Erro ao excluir aula:', error);
            
            // Verificar se é erro de validação (aula com progresso/quizzes)
            if (error.message.includes('progresso') || error.message.includes('quizzes')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Erro ao excluir aula'
            });
        }
    }

    /**
     * API: Reordenar aulas de um pacote
     */
    static async reorderLessonsAPI(req, res) {
        try {
            const { packageId } = req.params;
            const { lessonOrders } = req.body;

            if (!Array.isArray(lessonOrders)) {
                return res.status(400).json({
                    success: false,
                    message: 'Lista de ordenação inválida'
                });
            }

            const reordered = await LessonModel.reorderLessons(packageId, lessonOrders);

            res.json({
                success: true,
                message: 'Aulas reordenadas com sucesso'
            });
        } catch (error) {
            console.error('Erro ao reordenar aulas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao reordenar aulas'
            });
        }
    }

    /**
     * API: Estatísticas de aulas
     */
    static async getLessonStatsAPI(req, res) {
        try {
            const stats = await LessonModel.getLessonStats();
            res.json({
                success: true,
                stats
            });
        } catch (error) {
            console.error('Erro ao buscar estatísticas de aulas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar estatísticas'
            });
        }
    }

    // ========================================
    // MÉTODOS DE ADMINISTRAÇÃO DE QUIZZES
    // ========================================

    /**
     * Página principal de administração de quizzes
     */
    static async showQuizzesAdmin(req, res) {
        try {
            const quizzes = await quizModel.getAllQuizzesAdmin();
            const stats = await quizModel.getQuizStats();
            const lessons = await LessonModel.getAllLessonsAdmin();

            res.render('pages/admin-quizzes', {
                title: 'Administração de Quizzes - CodePath',
                user: req.session.user,
                quizzes,
                stats,
                lessons,
                additionalCSS: 'admin',
                additionalJS: 'admin-quizzes',
                layout: 'main'
            });
        } catch (error) {
            console.error('Erro ao carregar página de admin de quizzes:', error);
            res.status(500).render('pages/error', {
                title: 'Erro - CodePath',
                message: 'Erro interno do servidor',
                layout: 'main'
            });
        }
    }

    /**
     * API: Listar todos os quizzes para admin
     */
    static async getQuizzesAPI(req, res) {
        try {
            const quizzes = await quizModel.getAllQuizzesAdmin();
            res.json({
                success: true,
                quizzes
            });
        } catch (error) {
            console.error('Erro ao buscar quizzes:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar quizzes'
            });
        }
    }

    /**
     * API: Listar quizzes por aula
     */
    static async getQuizzesByLessonAPI(req, res) {
        try {
            const { lessonId } = req.params;
            const quizzes = await quizModel.getQuizzesByLesson(lessonId);
            res.json({
                success: true,
                quizzes
            });
        } catch (error) {
            console.error('Erro ao buscar quizzes da aula:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar quizzes da aula'
            });
        }
    }

    /**
     * API: Buscar quiz por ID
     */
    static async getQuizByIdAPI(req, res) {
        try {
            const { id } = req.params;
            const quiz = await quizModel.getQuizById(id);

            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz não encontrado'
                });
            }

            res.json({
                success: true,
                quiz
            });
        } catch (error) {
            console.error('Erro ao buscar quiz:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar quiz'
            });
        }
    }

    /**
     * API: Criar novo quiz
     */
    static async createQuizAPI(req, res) {
        try {
            // Validar dados de entrada
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: errors.array()
                });
            }

            const quizData = req.body;
            
            // Validação adicional
            const validationErrors = quizModel.validateQuizData(quizData);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: validationErrors
                });
            }

            const quizId = await quizModel.createQuiz(quizData);

            res.status(201).json({
                success: true,
                message: 'Quiz criado com sucesso',
                quizId
            });
        } catch (error) {
            console.error('Erro ao criar quiz:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao criar quiz'
            });
        }
    }

    /**
     * API: Atualizar quiz existente
     */
    static async updateQuizAPI(req, res) {
        try {
            const { id } = req.params;
            const quizData = req.body;

            // Validar dados de entrada
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: errors.array()
                });
            }

            // Validação adicional
            const validationErrors = quizModel.validateQuizData(quizData);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: validationErrors
                });
            }

            const updated = await quizModel.updateQuiz(id, quizData);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz não encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Quiz atualizado com sucesso'
            });
        } catch (error) {
            console.error('Erro ao atualizar quiz:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao atualizar quiz'
            });
        }
    }

    /**
     * API: Excluir quiz
     */
    static async deleteQuizAPI(req, res) {
        try {
            const { id } = req.params;
            const result = await quizModel.deleteQuiz(id);

            res.json({
                success: true,
                message: 'Quiz excluído com sucesso'
            });
        } catch (error) {
            console.error('Erro ao excluir quiz:', error);
            
            // Verificar se é erro de validação (quiz com respostas)
            if (error.message.includes('respostas')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Erro ao excluir quiz'
            });
        }
    }

    /**
     * API: Estatísticas de quizzes
     */
    static async getQuizStatsAPI(req, res) {
        try {
            const stats = await quizModel.getQuizStats();
            res.json({
                success: true,
                stats
            });
        } catch (error) {
            console.error('Erro ao buscar estatísticas de quizzes:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar estatísticas'
            });
        }
    }

    // ========================================
    // MÉTODOS DE ADMINISTRAÇÃO DE QUESTÕES
    // ========================================

    /**
     * Página de administração de questões de um quiz
     */
    static async showQuestionsAdmin(req, res) {
        try {
            const { quizId } = req.params;
            const questions = await quizModel.getQuizQuestionsAdmin(quizId);
            const stats = await quizModel.getQuestionsStats(quizId);
            
            // Buscar informações do quiz
            const quiz = await quizModel.getQuizById(quizId);
            if (!quiz) {
                return res.status(404).render('pages/error', {
                    title: 'Quiz não encontrado - CodePath',
                    message: 'Quiz não encontrado',
                    layout: 'main'
                });
            }

            res.render('pages/admin-questions', {
                title: `Questões: ${quiz.title} - CodePath`,
                user: req.session.user,
                quiz,
                questions,
                stats,
                additionalCSS: 'admin',
                additionalJS: 'admin-quizzes',
                layout: 'main'
            });
        } catch (error) {
            console.error('Erro ao carregar página de questões:', error);
            res.status(500).render('pages/error', {
                title: 'Erro - CodePath',
                message: 'Erro interno do servidor',
                layout: 'main'
            });
        }
    }

    /**
     * API: Listar questões de um quiz
     */
    static async getQuestionsAPI(req, res) {
        try {
            const { quizId } = req.params;
            const questions = await quizModel.getQuizQuestionsAdmin(quizId);
            const stats = await quizModel.getQuestionsStats(quizId);
            
            res.json({
                success: true,
                questions,
                stats
            });
        } catch (error) {
            console.error('Erro ao buscar questões:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar questões'
            });
        }
    }

    /**
     * API: Buscar questão por ID com opções
     */
    static async getQuestionByIdAPI(req, res) {
        try {
            const { id } = req.params;
            const question = await quizModel.getQuestionWithOptions(id);

            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'Questão não encontrada'
                });
            }

            res.json({
                success: true,
                question
            });
        } catch (error) {
            console.error('Erro ao buscar questão:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar questão'
            });
        }
    }

    /**
     * API: Criar nova questão
     */
    static async createQuestionAPI(req, res) {
        try {
            // Validar dados de entrada
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: errors.array()
                });
            }

            const questionData = req.body;
            
            // Validação adicional
            const validationErrors = quizModel.validateQuestionData(questionData);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: validationErrors
                });
            }

            const questionId = await quizModel.createQuestion(questionData);

            res.status(201).json({
                success: true,
                message: 'Questão criada com sucesso',
                questionId
            });
        } catch (error) {
            console.error('Erro ao criar questão:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao criar questão'
            });
        }
    }

    /**
     * API: Atualizar questão existente
     */
    static async updateQuestionAPI(req, res) {
        try {
            const { id } = req.params;
            const questionData = req.body;

            // Validar dados de entrada
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: errors.array()
                });
            }

            // Validação adicional
            const validationErrors = quizModel.validateQuestionData(questionData);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: validationErrors
                });
            }

            const updated = await quizModel.updateQuestion(id, questionData);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Questão não encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Questão atualizada com sucesso'
            });
        } catch (error) {
            console.error('Erro ao atualizar questão:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao atualizar questão'
            });
        }
    }

    /**
     * API: Excluir questão
     */
    static async deleteQuestionAPI(req, res) {
        try {
            const { id } = req.params;
            const result = await quizModel.deleteQuestion(id);

            res.json({
                success: true,
                message: 'Questão excluída com sucesso'
            });
        } catch (error) {
            console.error('Erro ao excluir questão:', error);
            
            // Verificar se é erro de validação (questão com respostas)
            if (error.message.includes('respostas')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Erro ao excluir questão'
            });
        }
    }

    /**
     * API: Reordenar questões
     */
    static async reorderQuestionsAPI(req, res) {
        try {
            const { quizId } = req.params;
            const { questionIds } = req.body;

            if (!Array.isArray(questionIds) || questionIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Lista de IDs de questões é obrigatória'
                });
            }

            await quizModel.reorderQuestions(quizId, questionIds);

            res.json({
                success: true,
                message: 'Questões reordenadas com sucesso'
            });
        } catch (error) {
            console.error('Erro ao reordenar questões:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao reordenar questões'
            });
        }
    }

    /**
     * API: Estatísticas de questões de um quiz
     */
    static async getQuestionsStatsAPI(req, res) {
        try {
            const { quizId } = req.params;
            const stats = await quizModel.getQuestionsStats(quizId);
            res.json({
                success: true,
                stats
            });
        } catch (error) {
            console.error('Erro ao buscar estatísticas de questões:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar estatísticas'
            });
        }
    }
}

module.exports = AdminController; 