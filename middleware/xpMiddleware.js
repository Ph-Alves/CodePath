const xpModel = require('../models/xpModel');
const notificationController = require('../controllers/notificationController');
const AchievementModel = require('../models/achievementModel');

/**
 * Middleware para ganho automático de XP
 * Processa diferentes tipos de atividades e atribui XP correspondente
 */

/**
 * Middleware para processar login diário
 * Deve ser chamado após autenticação bem-sucedida
 */
async function processDailyLogin(req, res, next) {
    try {
        if (req.session && req.session.userId) {
            const loginResult = await xpModel.processeDailyLogin(req.session.userId);
            
            if (loginResult && !loginResult.alreadyLoggedToday) {
                // Adiciona dados do login à sessão para exibir notificação
                req.session.dailyLoginReward = {
                    xpGained: loginResult.totalXPGained,
                    currentStreak: loginResult.currentStreak,
                    leveledUp: loginResult.leveledUp,
                    newLevel: loginResult.newLevel,
                    streakBonus: loginResult.streakBonus
                };
                
                // Disparar notificação de login diário
                await notificationController.processAutoNotification('daily_login', req.session.userId, {
                    xpGained: loginResult.totalXPGained,
                    streakDays: loginResult.currentStreak
                });
                
                // Disparar notificação de streak se for significativo (7, 14, 30 dias)
                if ([7, 14, 30, 60, 100].includes(loginResult.currentStreak)) {
                    await notificationController.processAutoNotification('daily_streak', req.session.userId, {
                        streakDays: loginResult.currentStreak
                    });
                }
                
                // Disparar notificação de level up se subiu de nível
                if (loginResult.leveledUp) {
                    await notificationController.processAutoNotification('level_up', req.session.userId, {
                        newLevel: loginResult.newLevel,
                        xpGained: loginResult.totalXPGained
                    });
                }
                
                console.log(`✨ Login diário processado para usuário ${req.session.userId}: +${loginResult.totalXPGained} XP`);
            }
        }
        next();
    } catch (error) {
        console.error('Erro no middleware de login diário:', error);
        next(); // Continua mesmo com erro para não bloquear o login
    }
}

/**
 * Middleware para processar conclusão de aula
 */
async function processLessonComplete(req, res, next) {
    try {
        if (req.session && req.session.userId && req.params.id) {
            const lessonId = req.params.id;
            const userId = req.session.userId;
            
            // Adiciona XP por aula concluída
            const xpResult = await xpModel.addXP(
                userId, 
                xpModel.XP_CONFIG.LESSON_COMPLETE, 
                `Aula concluída (ID: ${lessonId})`
            );
            
            // Verifica conquistas do sistema de XP (legado)
            const xpAchievements = await xpModel.checkXPAchievements(userId);
            
            // Verifica conquistas do novo sistema
            const newAchievements = await AchievementModel.checkAndUnlockAchievements(userId);
            
            // Busca nome da aula para notificação
            const contentModel = require('../models/contentModel');
            const lesson = await contentModel.getLessonById(lessonId);
            const lessonName = lesson ? lesson.name : `Aula #${lessonId}`;
            
            // Disparar notificação de aula concluída
            await notificationController.processAutoNotification('lesson_completed', userId, {
                lessonName: lessonName,
                xpGained: xpResult.xpGained
            });
            
            // Disparar notificação de level up se subiu de nível
            if (xpResult.leveledUp) {
                await notificationController.processAutoNotification('level_up', userId, {
                    newLevel: xpResult.newLevel,
                    xpGained: xpResult.xpGained
                });
            }
            
            // Disparar notificações de conquistas (legado)
            if (xpAchievements && xpAchievements.length > 0) {
                for (const achievement of xpAchievements) {
                    await notificationController.processAutoNotification('achievement_unlocked', userId, {
                        achievementName: achievement.name,
                        achievementDescription: achievement.description
                    });
                }
            }
            
            // Disparar notificações de novas conquistas
            if (newAchievements && newAchievements.length > 0) {
                for (const achievement of newAchievements) {
                    await notificationController.processAutoNotification('achievement_unlocked', userId, {
                        achievementName: achievement.name,
                        achievementDescription: achievement.description,
                        xpReward: achievement.xp_reward
                    });
                }
            }
            
            // Adiciona resultado à resposta
            req.xpReward = {
                type: 'lesson_complete',
                xpGained: xpResult.xpGained,
                newTotalXP: xpResult.newTotalXP,
                leveledUp: xpResult.leveledUp,
                newLevel: xpResult.newLevel,
                achievements: [...(xpAchievements || []), ...(newAchievements || [])]
            };
            
            console.log(`📚 Aula concluída por usuário ${userId}: +${xpResult.xpGained} XP`);
        }
        next();
    } catch (error) {
        console.error('Erro no middleware de conclusão de aula:', error);
        next();
    }
}

/**
 * Middleware para processar conclusão de quiz
 */
async function processQuizComplete(req, res, next) {
    try {
        if (req.session && req.session.userId && req.body) {
            const userId = req.session.userId;
            const quizId = req.params.id || req.body.quizId;
            const score = req.body.score || 0;
            
            // XP base por quiz
            let xpAmount = xpModel.XP_CONFIG.QUIZ_COMPLETE;
            let bonusXP = 0;
            
            // Bônus por quiz perfeito (100%)
            if (score === 100) {
                bonusXP = xpModel.XP_CONFIG.PERFECT_QUIZ;
                xpAmount += bonusXP;
            }
            
            const xpResult = await xpModel.addXP(
                userId, 
                xpAmount, 
                `Quiz concluído (${score}% - ID: ${quizId})`
            );
            
            // Verifica conquistas
            const achievements = await xpModel.checkXPAchievements(userId);
            
            // Busca nome do quiz para notificação
            const quizModel = require('../models/quizModel');
            const quiz = await quizModel.getQuizById(quizId);
            const quizName = quiz ? quiz.title : `Quiz #${quizId}`;
            
            // Disparar notificação de quiz concluído
            await notificationController.processAutoNotification('quiz_completed', userId, {
                quizName: quizName,
                score: score,
                xpGained: xpResult.xpGained,
                bonusXP: bonusXP
            });
            
            // Disparar notificação de level up se subiu de nível
            if (xpResult.leveledUp) {
                await notificationController.processAutoNotification('level_up', userId, {
                    newLevel: xpResult.newLevel,
                    xpGained: xpResult.xpGained
                });
            }
            
            // Disparar notificações de conquistas
            if (achievements && achievements.length > 0) {
                for (const achievement of achievements) {
                    await notificationController.processAutoNotification('achievement_unlocked', userId, {
                        achievementName: achievement.name,
                        achievementDescription: achievement.description
                    });
                }
            }
            
            req.xpReward = {
                type: 'quiz_complete',
                xpGained: xpResult.xpGained,
                newTotalXP: xpResult.newTotalXP,
                leveledUp: xpResult.leveledUp,
                newLevel: xpResult.newLevel,
                achievements: achievements,
                perfectBonus: bonusXP
            };
            
            console.log(`🧠 Quiz concluído por usuário ${userId}: +${xpResult.xpGained} XP (${score}%)`);
        }
        next();
    } catch (error) {
        console.error('Erro no middleware de conclusão de quiz:', error);
        next();
    }
}

/**
 * Middleware para processar conclusão de pacote
 */
async function processPackageComplete(req, res, next) {
    try {
        if (req.session && req.session.userId && req.params.id) {
            const packageId = req.params.id;
            const userId = req.session.userId;
            
            const xpResult = await xpModel.addXP(
                userId, 
                xpModel.XP_CONFIG.PACKAGE_COMPLETE, 
                `Pacote concluído (ID: ${packageId})`
            );
            
            // Verifica conquistas
            const achievements = await xpModel.checkXPAchievements(userId);
            
            // Busca nome do pacote para notificação
            const contentModel = require('../models/contentModel');
            const packageData = await contentModel.getPackageById(packageId);
            const packageName = packageData ? packageData.name : `Pacote #${packageId}`;
            
            // Disparar notificação de pacote concluído
            await notificationController.processAutoNotification('package_completed', userId, {
                packageName: packageName,
                xpGained: xpResult.xpGained
            });
            
            // Disparar notificação de level up se subiu de nível
            if (xpResult.leveledUp) {
                await notificationController.processAutoNotification('level_up', userId, {
                    newLevel: xpResult.newLevel,
                    xpGained: xpResult.xpGained
                });
            }
            
            // Disparar notificações de conquistas
            if (achievements && achievements.length > 0) {
                for (const achievement of achievements) {
                    await notificationController.processAutoNotification('achievement_unlocked', userId, {
                        achievementName: achievement.name,
                        achievementDescription: achievement.description
                    });
                }
            }
            
            req.xpReward = {
                type: 'package_complete',
                xpGained: xpResult.xpGained,
                newTotalXP: xpResult.newTotalXP,
                leveledUp: xpResult.leveledUp,
                newLevel: xpResult.newLevel,
                achievements: achievements
            };
            
            console.log(`🎉 Pacote concluído por usuário ${userId}: +${xpResult.xpGained} XP`);
        }
        next();
    } catch (error) {
        console.error('Erro no middleware de conclusão de pacote:', error);
        next();
    }
}

/**
 * Middleware para adicionar dados de XP à resposta JSON
 */
function attachXPToResponse(req, res, next) {
    // Sobrescreve res.json para incluir dados de XP quando disponível
    const originalJson = res.json;
    
    res.json = function(data) {
        if (req.xpReward) {
            // Se há recompensa de XP, inclui na resposta
            const responseData = {
                ...data,
                xpReward: req.xpReward
            };
            return originalJson.call(this, responseData);
        }
        return originalJson.call(this, data);
    };
    
    next();
}

/**
 * Middleware para adicionar dados de XP ao contexto do template
 */
async function attachXPToTemplate(req, res, next) {
    try {
        if (req.session && req.session.userId) {
            // Obtém dados atuais de XP do usuário
            const xpData = await xpModel.getUserXPData(req.session.userId);
            
            // Adiciona dados de XP ao locals para templates
            res.locals.userXP = xpData;
            
            // Verifica se há recompensa de login diário
            if (req.session.dailyLoginReward) {
                res.locals.dailyLoginReward = req.session.dailyLoginReward;
                delete req.session.dailyLoginReward; // Remove após usar
            }
            
            // Verifica se há recompensa de atividade
            if (req.xpReward) {
                res.locals.xpReward = req.xpReward;
            }
        }
        next();
    } catch (error) {
        console.error('Erro ao anexar dados de XP ao template:', error);
        next();
    }
}

/**
 * Middleware para verificar conquistas pendentes
 */
async function checkPendingAchievements(req, res, next) {
    try {
        if (req.session && req.session.userId) {
            const achievements = await xpModel.checkXPAchievements(req.session.userId);
            
            if (achievements.length > 0) {
                res.locals.newAchievements = achievements;
                console.log(`🏆 Novas conquistas para usuário ${req.session.userId}:`, achievements.map(a => a.title));
            }
        }
        next();
    } catch (error) {
        console.error('Erro ao verificar conquistas pendentes:', error);
        next();
    }
}

/**
 * Função utilitária para obter dados de XP do usuário
 */
async function getUserXPData(userId) {
    try {
        return await xpModel.getUserXPData(userId);
    } catch (error) {
        console.error('Erro ao obter dados de XP:', error);
        return null;
    }
}

module.exports = {
    processDailyLogin,
    processLessonComplete,
    processQuizComplete,
    processPackageComplete,
    attachXPToResponse,
    attachXPToTemplate,
    checkPendingAchievements,
    getUserXPData
}; 