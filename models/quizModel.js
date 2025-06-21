/**
 * Quiz Model - Gerenciamento de questionários e questões
 * Responsável por todas as operações relacionadas a questionários,
 * questões, opções e respostas dos usuários
 */

const db = require('./database');

const quizModel = {
    /**
     * Buscar questionário por ID com informações básicas
     */
    getQuizById: (quizId) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT q.*, 
                       COUNT(qq.id) as total_questions,
                       l.name as lesson_title,
                       p.name as package_name
                FROM quizzes q
                LEFT JOIN quiz_questions qq ON q.id = qq.quiz_id
                LEFT JOIN lessons l ON q.lesson_id = l.id
                LEFT JOIN packages p ON l.package_id = p.id
                WHERE q.id = ?
                GROUP BY q.id
            `;
            
            db.get(query, [quizId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    },

    /**
     * Buscar todas as questões de um questionário
     */
    getQuizQuestions: (quizId) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT qq.*, 
                       GROUP_CONCAT(
                           json_object(
                               'id', qo.id,
                               'option_text', qo.option_text,
                               'is_correct', qo.is_correct
                           )
                       ) as options
                FROM quiz_questions qq
                LEFT JOIN quiz_options qo ON qq.id = qo.question_id
                WHERE qq.quiz_id = ?
                GROUP BY qq.id
                ORDER BY qq.question_order
            `;
            
            db.all(query, [quizId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // Parse options JSON
                    const questions = rows.map(row => ({
                        ...row,
                        options: row.options ? row.options.split(',').map(opt => JSON.parse(opt)) : []
                    }));
                    resolve(questions);
                }
            });
        });
    },

    /**
     * Buscar questão específica por ID
     */
    getQuestionById: (questionId) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT qq.*, q.title as quiz_title
                FROM quiz_questions qq
                JOIN quizzes q ON qq.quiz_id = q.id
                WHERE qq.id = ?
            `;
            
            db.get(query, [questionId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    },

    /**
     * Buscar opções de uma questão de múltipla escolha
     */
    getQuestionOptions: (questionId) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM quiz_options 
                WHERE question_id = ? 
                ORDER BY option_order
            `;
            
            db.all(query, [questionId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    },

    /**
     * Submeter resposta do usuário
     */
    submitAnswer: (userId, questionId, answer, isCorrect = null) => {
        return new Promise((resolve, reject) => {
            // Primeiro, verificar se já existe resposta
            const checkQuery = `
                SELECT id FROM user_quiz_answers 
                WHERE user_id = ? AND question_id = ?
            `;
            
            db.get(checkQuery, [userId, questionId], (err, existing) => {
                if (err) {
                    reject(err);
                    return;
                }

                const score = isCorrect ? 10 : 0; // 10 pontos por resposta correta
                const now = new Date().toISOString();

                if (existing) {
                    // Atualizar resposta existente
                    const updateQuery = `
                        UPDATE user_quiz_answers 
                        SET answer = ?, is_correct = ?, score = ?, updated_at = ?
                        WHERE user_id = ? AND question_id = ?
                    `;
                    
                    db.run(updateQuery, [answer, isCorrect, score, now, userId, questionId], function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ id: existing.id, score });
                        }
                    });
                } else {
                    // Inserir nova resposta
                    const insertQuery = `
                        INSERT INTO user_quiz_answers (user_id, question_id, answer, is_correct, score, created_at)
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;
                    
                    db.run(insertQuery, [userId, questionId, answer, isCorrect, score, now], function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ id: this.lastID, score });
                        }
                    });
                }
            });
        });
    },

    /**
     * Validar resposta de código
     */
    validateCodeAnswer: (questionId, userCode) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT correct_answer, explanation 
                FROM quiz_questions 
                WHERE id = ? AND question_type = 'code'
            `;
            
            db.get(query, [questionId], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    reject(new Error('Questão não encontrada'));
                } else {
                    // Validação simples por comparação de string (pode ser melhorada)
                    const isCorrect = userCode.trim().toLowerCase() === row.correct_answer.trim().toLowerCase();
                    resolve({
                        isCorrect,
                        explanation: row.explanation,
                        correctAnswer: isCorrect ? null : row.correct_answer
                    });
                }
            });
        });
    },

    /**
     * Validar resposta de múltipla escolha
     */
    validateMultipleChoiceAnswer: (questionId, selectedOptionId) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT qo.is_correct, qo.option_text, qq.explanation
                FROM quiz_options qo
                JOIN quiz_questions qq ON qo.question_id = qq.id
                WHERE qo.id = ? AND qq.id = ?
            `;
            
            db.get(query, [selectedOptionId, questionId], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    reject(new Error('Opção não encontrada'));
                } else {
                    resolve({
                        isCorrect: row.is_correct === 1,
                        explanation: row.explanation,
                        selectedOption: row.option_text
                    });
                }
            });
        });
    },

    /**
     * Calcular progresso do usuário no questionário
     */
    getUserQuizProgress: (userId, quizId) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    COUNT(DISTINCT qq.id) as total_questions,
                    COUNT(DISTINCT uqa.question_id) as answered_questions,
                    COALESCE(SUM(uqa.score), 0) as total_score,
                    COALESCE(AVG(CASE WHEN uqa.is_correct = 1 THEN 1.0 ELSE 0.0 END), 0) as accuracy
                FROM quiz_questions qq
                LEFT JOIN user_quiz_answers uqa ON qq.id = uqa.question_id AND uqa.user_id = ?
                WHERE qq.quiz_id = ?
            `;
            
            db.get(query, [userId, quizId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    const progress = {
                        totalQuestions: row.total_questions || 0,
                        answeredQuestions: row.answered_questions || 0,
                        totalScore: row.total_score || 0,
                        accuracy: Math.round((row.accuracy || 0) * 100),
                        isCompleted: row.answered_questions === row.total_questions,
                        progressPercentage: row.total_questions > 0 ? 
                            Math.round((row.answered_questions / row.total_questions) * 100) : 0
                    };
                    resolve(progress);
                }
            });
        });
    },

    /**
     * Finalizar questionário e atualizar XP do usuário
     */
    completeQuiz: (userId, quizId) => {
        return new Promise((resolve, reject) => {
            // Primeiro, verificar se o questionário foi realmente completado
            this.getUserQuizProgress(userId, quizId)
                .then(progress => {
                    if (!progress.isCompleted) {
                        reject(new Error('Questionário não foi completado'));
                        return;
                    }

                    // Atualizar XP do usuário (+100 XP por questionário completo)
                    const updateXpQuery = `
                        UPDATE users 
                        SET xp_points = xp_points + 100
                        WHERE id = ?
                    `;
                    
                    db.run(updateXpQuery, [userId], function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                ...progress,
                                xpEarned: 100,
                                message: 'Questionário completado com sucesso!'
                            });
                        }
                    });
                })
                .catch(reject);
        });
    },

    /**
     * Buscar próxima questão
     */
    getNextQuestion: (quizId, currentQuestionOrder) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM quiz_questions 
                WHERE quiz_id = ? AND question_order > ?
                ORDER BY question_order ASC
                LIMIT 1
            `;
            
            db.get(query, [quizId, currentQuestionOrder], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    },

    /**
     * Buscar questão anterior
     */
    getPreviousQuestion: (quizId, currentQuestionOrder) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM quiz_questions 
                WHERE quiz_id = ? AND question_order < ?
                ORDER BY question_order DESC
                LIMIT 1
            `;
            
            db.get(query, [quizId, currentQuestionOrder], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }
};

module.exports = quizModel; 