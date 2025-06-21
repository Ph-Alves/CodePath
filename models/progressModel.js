/**
 * Progress Model - Gerenciamento avançado de progresso e métricas
 * Responsável por todas as operações relacionadas ao acompanhamento
 * detalhado de progresso, estatísticas e análises de desempenho
 */

const { database } = require('./database');

const progressModel = {
    
    /**
     * Buscar estatísticas gerais de progresso do usuário
     * @param {number} userId - ID do usuário
     * @returns {Object} Estatísticas gerais de progresso
     */
    getUserOverallStats: (userId) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    u.id,
                    u.name,
                    u.email,
                    u.level,
                    u.total_xp as xp_points,
                    u.created_at as registration_date,
                    COUNT(DISTINCT up.package_id) as total_packages_started,
                    COUNT(DISTINCT CASE WHEN up.status = 'completed' THEN up.package_id END) as packages_completed,
                    COUNT(DISTINCT CASE WHEN up.status = 'in_progress' THEN up.package_id END) as packages_in_progress,
                    COALESCE(SUM(up.lessons_watched), 0) as total_lessons_watched,
                    COALESCE(SUM(up.quizzes_completed), 0) as total_quizzes_completed,
                    COALESCE(SUM(up.challenges_delivered), 0) as total_challenges_completed,
                    COALESCE(AVG(up.progress_percentage), 0) as average_progress,
                    MAX(COALESCE(up.completed_at, up.created_at)) as last_activity,
                    -- Calcular streak atual (dias consecutivos de atividade)
                    CASE 
                        WHEN DATE(MAX(COALESCE(up.completed_at, up.created_at))) = DATE('now') THEN 
                            (SELECT COUNT(*) FROM user_progress up2 
                             WHERE up2.user_id = u.id 
                             AND DATE(COALESCE(up2.completed_at, up2.created_at)) >= DATE('now', '-30 days'))
                        ELSE 0 
                    END as current_streak
                FROM users u
                LEFT JOIN user_progress up ON u.id = up.user_id
                WHERE u.id = ?
                GROUP BY u.id
            `;
            
            database.get(query, [userId])
                .then(resolve)
                .catch(reject);
        });
    },

    /**
     * Buscar progresso detalhado por pacote
     * @param {number} userId - ID do usuário
     * @returns {Array} Lista de pacotes com progresso detalhado
     */
    getUserPackageProgress: (userId) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    p.id as package_id,
                    p.name as package_name,
                    p.description as package_description,
                    p.icon as package_icon,
                    up.status,
                    up.progress_percentage,
                    up.lessons_watched,
                    up.quizzes_completed,
                    up.challenges_delivered,
                    up.completed_at,
                    -- Contar total de conteúdos por pacote
                    (SELECT COUNT(*) FROM lessons l WHERE l.package_id = p.id) as total_lessons,
                    (SELECT COUNT(DISTINCT q.id) FROM quizzes q 
                     JOIN lessons l ON q.lesson_id = l.id 
                     WHERE l.package_id = p.id) as total_quizzes,
                    -- Calcular tempo estimado restante (em horas)
                    CASE 
                        WHEN up.progress_percentage >= 100 THEN 0
                        ELSE ROUND((100 - COALESCE(up.progress_percentage, 0)) * 0.5, 1)
                    END as estimated_hours_remaining,
                    -- Calcular pontos ganhos neste pacote
                    (up.lessons_watched * 50 + up.quizzes_completed * 100 + up.challenges_delivered * 75) as points_earned
                FROM packages p
                LEFT JOIN user_progress up ON p.id = up.package_id AND up.user_id = ?
                ORDER BY 
                    CASE up.status 
                        WHEN 'in_progress' THEN 1
                        WHEN 'completed' THEN 2
                        ELSE 3
                    END,
                    up.completed_at DESC NULLS LAST
            `;
            
            database.all(query, [userId])
                .then(rows => resolve(rows || []))
                .catch(reject);
        });
    },

    /**
     * Buscar atividade recente detalhada
     * @param {number} userId - ID do usuário
     * @param {number} limit - Limite de registros (padrão: 10)
     * @returns {Array} Lista de atividades recentes
     */
    getUserRecentActivity: (userId, limit = 10) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    'lesson' as activity_type,
                    p.name as activity_title,
                    p.name as package_name,
                    p.icon as package_icon,
                    50 as points_earned,
                    'Aula concluída' as activity_description,
                    up.created_at as activity_date
                FROM user_progress up
                JOIN packages p ON up.package_id = p.id
                WHERE up.user_id = ? AND up.lessons_watched > 0
                
                UNION ALL
                
                SELECT 
                    'quiz' as activity_type,
                    'Questionário' as activity_title,
                    p.name as package_name,
                    p.icon as package_icon,
                    100 as points_earned,
                    'Questionário concluído' as activity_description,
                    up.created_at as activity_date
                FROM user_progress up
                JOIN packages p ON up.package_id = p.id
                WHERE up.user_id = ? AND up.quizzes_completed > 0
                
                ORDER BY activity_date DESC
                LIMIT ?
            `;
            
            database.all(query, [userId, userId, limit])
                .then(rows => resolve(rows || []))
                .catch(reject);
        });
    },

    /**
     * Buscar estatísticas de desempenho por período
     * @param {number} userId - ID do usuário
     * @param {string} period - Período ('week', 'month', 'year')
     * @returns {Object} Estatísticas de desempenho
     */
    getUserPerformanceStats: (userId, period = 'month') => {
        return new Promise((resolve, reject) => {
            let dateFilter = '';
            switch (period) {
                case 'week':
                    dateFilter = "DATE(COALESCE(up.completed_at, up.created_at)) >= DATE('now', '-7 days')";
                    break;
                case 'month':
                    dateFilter = "DATE(COALESCE(up.completed_at, up.created_at)) >= DATE('now', '-30 days')";
                    break;
                case 'year':
                    dateFilter = "DATE(COALESCE(up.completed_at, up.created_at)) >= DATE('now', '-365 days')";
                    break;
                default:
                    dateFilter = "1=1";
            }
            
            const query = `
                SELECT 
                    COUNT(DISTINCT up.package_id) as packages_worked_on,
                    COALESCE(SUM(up.lessons_watched), 0) as lessons_completed,
                    COALESCE(SUM(up.quizzes_completed), 0) as quizzes_completed,
                    COALESCE(SUM(up.challenges_delivered), 0) as challenges_completed,
                    COALESCE(SUM(
                        up.lessons_watched * 50 + 
                        up.quizzes_completed * 100 + 
                        up.challenges_delivered * 75
                    ), 0) as total_points_earned,
                    COALESCE(AVG(up.progress_percentage), 0) as average_progress,
                    COUNT(DISTINCT DATE(COALESCE(up.completed_at, up.created_at))) as active_days,
                    -- Calcular velocidade de aprendizado (pontos por dia ativo)
                    CASE 
                        WHEN COUNT(DISTINCT DATE(COALESCE(up.completed_at, up.created_at))) > 0 THEN
                            ROUND(COALESCE(SUM(
                                up.lessons_watched * 50 + 
                                up.quizzes_completed * 100 + 
                                up.challenges_delivered * 75
                            ), 0) / COUNT(DISTINCT DATE(COALESCE(up.completed_at, up.created_at))), 2)
                        ELSE 0
                    END as learning_velocity
                FROM user_progress up
                WHERE up.user_id = ? AND ${dateFilter}
            `;
            
            database.get(query, [userId])
                .then(row => resolve(row || {}))
                .catch(reject);
        });
    },

    /**
     * Buscar dados para gráfico de progresso ao longo do tempo
     * @param {number} userId - ID do usuário
     * @param {number} days - Número de dias para o gráfico (padrão: 30)
     * @returns {Array} Dados para gráfico temporal
     */
    getProgressChartData: (userId, days = 30) => {
        return new Promise((resolve, reject) => {
            const query = `
                WITH RECURSIVE date_series AS (
                    SELECT DATE('now', '-${days} days') as date
                    UNION ALL
                    SELECT DATE(date, '+1 day')
                    FROM date_series
                    WHERE date < DATE('now')
                ),
                daily_progress AS (
                    SELECT 
                        DATE(COALESCE(up.completed_at, up.created_at)) as activity_date,
                        SUM(up.lessons_watched * 50 + up.quizzes_completed * 100 + up.challenges_delivered * 75) as daily_points
                    FROM user_progress up
                    WHERE up.user_id = ? 
                    AND DATE(COALESCE(up.completed_at, up.created_at)) >= DATE('now', '-${days} days')
                    GROUP BY DATE(COALESCE(up.completed_at, up.created_at))
                )
                SELECT 
                    ds.date,
                    COALESCE(dp.daily_points, 0) as points,
                    -- Calcular pontos acumulados
                    SUM(COALESCE(dp.daily_points, 0)) OVER (
                        ORDER BY ds.date 
                        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                    ) as cumulative_points
                FROM date_series ds
                LEFT JOIN daily_progress dp ON ds.date = dp.activity_date
                ORDER BY ds.date
            `;
            
            database.all(query, [userId])
                .then(rows => resolve(rows || []))
                .catch(reject);
        });
    },

    /**
     * Comparar progresso do usuário com médias gerais
     * @param {number} userId - ID do usuário
     * @returns {Object} Comparação com médias
     */
    getUserComparison: (userId) => {
        return new Promise((resolve, reject) => {
            const query = `
                WITH user_stats AS (
                    SELECT 
                        COUNT(DISTINCT up.package_id) as user_packages,
                        COALESCE(AVG(up.progress_percentage), 0) as user_avg_progress,
                        COALESCE(SUM(up.lessons_watched), 0) as user_lessons,
                        COALESCE(SUM(up.quizzes_completed), 0) as user_quizzes,
                        u.xp_points as user_xp
                    FROM users u
                    LEFT JOIN user_progress up ON u.id = up.user_id
                    WHERE u.id = ?
                    GROUP BY u.id
                ),
                platform_stats AS (
                    SELECT 
                        AVG(package_count) as avg_packages,
                        AVG(avg_progress) as avg_progress,
                        AVG(total_lessons) as avg_lessons,
                        AVG(total_quizzes) as avg_quizzes,
                        AVG(xp_points) as avg_xp
                    FROM (
                        SELECT 
                            u.id,
                            COUNT(DISTINCT up.package_id) as package_count,
                            COALESCE(AVG(up.progress_percentage), 0) as avg_progress,
                            COALESCE(SUM(up.lessons_watched), 0) as total_lessons,
                            COALESCE(SUM(up.quizzes_completed), 0) as total_quizzes,
                            u.xp_points
                        FROM users u
                        LEFT JOIN user_progress up ON u.id = up.user_id
                        GROUP BY u.id
                    )
                )
                SELECT 
                    us.*,
                    ps.*,
                    -- Calcular percentis de comparação
                    CASE 
                        WHEN ps.avg_packages > 0 THEN ROUND((us.user_packages / ps.avg_packages) * 100, 1)
                        ELSE 100
                    END as packages_percentile,
                    CASE 
                        WHEN ps.avg_progress > 0 THEN ROUND((us.user_avg_progress / ps.avg_progress) * 100, 1)
                        ELSE 100
                    END as progress_percentile,
                    CASE 
                        WHEN ps.avg_xp > 0 THEN ROUND((us.user_xp / ps.avg_xp) * 100, 1)
                        ELSE 100
                    END as xp_percentile
                FROM user_stats us, platform_stats ps
            `;
            
            database.get(query, [userId])
                .then(row => resolve(row || {}))
                .catch(reject);
        });
    },

    /**
     * Buscar objetivos e metas do usuário
     * @param {number} userId - ID do usuário
     * @returns {Array} Lista de objetivos/metas
     */
    getUserGoals: (userId) => {
        return new Promise((resolve, reject) => {
            // Por enquanto, retornar metas padrão baseadas no progresso atual
            const query = `
                SELECT 
                    COUNT(DISTINCT up.package_id) as current_packages,
                    COALESCE(SUM(up.lessons_watched), 0) as current_lessons,
                    COALESCE(SUM(up.quizzes_completed), 0) as current_quizzes,
                    u.xp_points as current_xp,
                    u.level as current_level
                FROM users u
                LEFT JOIN user_progress up ON u.id = up.user_id
                WHERE u.id = ?
                GROUP BY u.id
            `;
            
            database.get(query, [userId])
                .then(row => {
                    // Gerar metas baseadas no progresso atual
                    const goals = [];
                    
                    if (row) {
                        // Meta de XP
                        const nextLevelXP = row.current_level * 100;
                        if (row.current_xp < nextLevelXP) {
                            goals.push({
                                id: 'xp_goal',
                                title: `Alcançar Nível ${row.current_level + 1}`,
                                description: `Ganhe ${nextLevelXP - row.current_xp} XP para subir de nível`,
                                current: row.current_xp,
                                target: nextLevelXP,
                                progress: Math.round((row.current_xp / nextLevelXP) * 100),
                                type: 'xp',
                                icon: 'fas fa-star'
                            });
                        }
                        
                        // Meta de aulas
                        const nextLessonGoal = Math.ceil((row.current_lessons + 1) / 10) * 10;
                        goals.push({
                            id: 'lesson_goal',
                            title: `${nextLessonGoal} Aulas Assistidas`,
                            description: `Complete mais ${nextLessonGoal - row.current_lessons} aulas`,
                            current: row.current_lessons,
                            target: nextLessonGoal,
                            progress: Math.round((row.current_lessons / nextLessonGoal) * 100),
                            type: 'lessons',
                            icon: 'fas fa-play-circle'
                        });
                        
                        // Meta de questionários
                        const nextQuizGoal = Math.ceil((row.current_quizzes + 1) / 5) * 5;
                        goals.push({
                            id: 'quiz_goal',
                            title: `${nextQuizGoal} Questionários Completos`,
                            description: `Complete mais ${nextQuizGoal - row.current_quizzes} questionários`,
                            current: row.current_quizzes,
                            target: nextQuizGoal,
                            progress: Math.round((row.current_quizzes / nextQuizGoal) * 100),
                            type: 'quizzes',
                            icon: 'fas fa-question-circle'
                        });
                    }
                    
                    resolve(goals);
                })
                .catch(reject);
        });
    },

    /**
     * Marcar aula como concluída e atualizar progresso
     * @param {number} userId - ID do usuário
     * @param {number} lessonId - ID da aula
     * @returns {Object} Resultado da operação
     */
    markLessonComplete: (userId, lessonId) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Buscar informações da aula
                const lessonQuery = `
                    SELECT l.id, l.name, l.package_id, p.name as package_name, l.lesson_number
                    FROM lessons l
                    JOIN packages p ON l.package_id = p.id
                    WHERE l.id = ?
                `;
                const lesson = await database.get(lessonQuery, [lessonId]);
                
                if (!lesson) {
                    return reject(new Error('Aula não encontrada'));
                }

                // Verificar se aula já foi concluída
                const isAlreadyCompleted = await progressModel.isLessonCompleted(userId, lessonId);
                if (isAlreadyCompleted) {
                    return resolve({
                        success: false,
                        message: 'Aula já foi concluída anteriormente',
                        already_completed: true
                    });
                }

                // Verificar se já existe progresso para este pacote
                const existingProgressQuery = `
                    SELECT * FROM user_progress 
                    WHERE user_id = ? AND package_id = ?
                `;
                let progress = await database.get(existingProgressQuery, [userId, lesson.package_id]);

                if (progress) {
                    // Atualizar progresso existente
                    const updateQuery = `
                        UPDATE user_progress 
                        SET 
                            lessons_watched = lessons_watched + 1,
                            status = 'in_progress',
                            updated_at = datetime('now')
                        WHERE user_id = ? AND package_id = ?
                    `;
                    await database.run(updateQuery, [userId, lesson.package_id]);
                } else {
                    // Criar novo registro de progresso
                    const insertQuery = `
                        INSERT INTO user_progress (
                            user_id, package_id, lessons_watched, 
                            quizzes_completed, challenges_delivered, 
                            status, created_at, updated_at
                        ) VALUES (?, ?, 1, 0, 0, 'in_progress', datetime('now'), datetime('now'))
                    `;
                    await database.run(insertQuery, [userId, lesson.package_id]);
                }

                // Recalcular percentual de progresso
                const progressStats = await progressModel.recalculatePackageProgress(userId, lesson.package_id);

                // Atualizar XP do usuário (+50 XP por aula)
                const xpResult = await progressModel.addUserXP(userId, 50, 'lesson_completed');

                // Criar notificação de progresso
                await progressModel.createProgressNotification(userId, {
                    type: 'lesson_completed',
                    title: 'Aula Concluída!',
                    message: `Você concluiu a aula "${lesson.name}" e ganhou 50 XP!`,
                    xp_gained: 50,
                    lesson_name: lesson.name,
                    package_name: lesson.package_name
                });

                resolve({
                    success: true,
                    message: `Aula "${lesson.name}" marcada como concluída!`,
                    xp_gained: 50,
                    lesson: lesson,
                    progress_stats: progressStats,
                    xp_result: xpResult
                });

            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Recalcular progresso de um pacote específico
     * @param {number} userId - ID do usuário
     * @param {number} packageId - ID do pacote
     * @returns {Object} Progresso atualizado
     */
    recalculatePackageProgress: (userId, packageId) => {
        return new Promise(async (resolve, reject) => {
            try {
                // Contar total de conteúdos do pacote
                const totalQuery = `
                    SELECT 
                        COUNT(DISTINCT l.id) as total_lessons,
                        COUNT(DISTINCT q.id) as total_quizzes
                    FROM lessons l
                    LEFT JOIN quizzes q ON l.id = q.lesson_id
                    WHERE l.package_id = ?
                `;
                const totals = await database.get(totalQuery, [packageId]);

                // Buscar progresso atual
                const progressQuery = `
                    SELECT lessons_watched, quizzes_completed, challenges_delivered
                    FROM user_progress
                    WHERE user_id = ? AND package_id = ?
                `;
                const progress = await database.get(progressQuery, [userId, packageId]);

                if (progress && totals) {
                    // Calcular percentual de progresso
                    const totalItems = totals.total_lessons + totals.total_quizzes;
                    const completedItems = progress.lessons_watched + progress.quizzes_completed;
                    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

                    // Determinar status
                    let status = 'in_progress';
                    if (progressPercentage >= 100) {
                        status = 'completed';
                    } else if (completedItems === 0) {
                        status = 'not_started';
                    }

                    // Atualizar progresso
                    const updateQuery = `
                        UPDATE user_progress 
                        SET 
                            progress_percentage = ?,
                            status = ?,
                            completed_at = CASE WHEN ? = 'completed' AND completed_at IS NULL THEN datetime('now') ELSE completed_at END,
                            updated_at = datetime('now')
                        WHERE user_id = ? AND package_id = ?
                    `;
                    await database.run(updateQuery, [progressPercentage, status, status, userId, packageId]);

                    // Se o pacote foi concluído, dar XP bônus
                    if (status === 'completed' && progress.status !== 'completed') {
                        await progressModel.addUserXP(userId, 500, 'package_completed');
                        
                        // Criar notificação de conclusão de pacote
                        const packageQuery = `SELECT name FROM packages WHERE id = ?`;
                        const packageInfo = await database.get(packageQuery, [packageId]);
                        
                        await progressModel.createProgressNotification(userId, {
                            type: 'package_completed',
                            title: 'Pacote Concluído! 🎉',
                            message: `Parabéns! Você concluiu o pacote "${packageInfo.name}" e ganhou 500 XP bônus!`,
                            xp_gained: 500,
                            package_name: packageInfo.name
                        });
                    }

                    resolve({
                        progress_percentage: progressPercentage,
                        status: status,
                        completed_items: completedItems,
                        total_items: totalItems
                    });
                } else {
                    reject(new Error('Progresso não encontrado'));
                }

            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Adicionar XP ao usuário
     * @param {number} userId - ID do usuário
     * @param {number} xpAmount - Quantidade de XP a adicionar
     * @param {string} reason - Motivo do ganho de XP
     * @returns {Object} Informações sobre o XP ganho
     */
    addUserXP: (userId, xpAmount, reason = 'general') => {
        return new Promise(async (resolve, reject) => {
            try {
                // Buscar XP atual do usuário
                const userQuery = `SELECT xp_points, level FROM users WHERE id = ?`;
                const user = await database.get(userQuery, [userId]);

                if (!user) {
                    return reject(new Error('Usuário não encontrado'));
                }

                const newXP = user.xp_points + xpAmount;
                const newLevel = Math.floor(newXP / 1000) + 1; // Cada 1000 XP = 1 nível
                const leveledUp = newLevel > user.level;

                // Atualizar XP e nível do usuário
                const updateQuery = `
                    UPDATE users 
                    SET xp_points = ?, level = ?, updated_at = datetime('now')
                    WHERE id = ?
                `;
                await database.run(updateQuery, [newXP, newLevel, userId]);

                // Se subiu de nível, criar notificação
                if (leveledUp) {
                    await progressModel.createProgressNotification(userId, {
                        type: 'level_up',
                        title: `Nível ${newLevel} Alcançado! ⭐`,
                        message: `Parabéns! Você subiu para o nível ${newLevel}!`,
                        new_level: newLevel,
                        old_level: user.level
                    });
                }

                resolve({
                    xp_gained: xpAmount,
                    total_xp: newXP,
                    old_level: user.level,
                    new_level: newLevel,
                    leveled_up: leveledUp,
                    reason: reason
                });

            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Verificar se aula já foi concluída pelo usuário
     * @param {number} userId - ID do usuário
     * @param {number} lessonId - ID da aula
     * @returns {boolean} True se já foi concluída
     */
    isLessonCompleted: (userId, lessonId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const query = `
                    SELECT up.lessons_watched, l.lesson_number
                    FROM lessons l
                    LEFT JOIN user_progress up ON l.package_id = up.package_id AND up.user_id = ?
                    WHERE l.id = ?
                `;
                const result = await database.get(query, [userId, lessonId]);
                
                // Considera concluída se o número de aulas assistidas é >= número da aula atual
                const isCompleted = result && result.lessons_watched >= result.lesson_number;
                resolve(isCompleted || false);

            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Criar notificação de progresso
     * @param {number} userId - ID do usuário
     * @param {Object} notificationData - Dados da notificação
     * @returns {Object} Notificação criada
     */
    createProgressNotification: (userId, notificationData) => {
        return new Promise(async (resolve, reject) => {
            try {
                const insertQuery = `
                    INSERT INTO notifications (
                        user_id, type, title, message, data, 
                        is_read, created_at
                    ) VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
                `;
                
                const dataJson = JSON.stringify(notificationData);
                const result = await database.run(insertQuery, [
                    userId, 
                    notificationData.type, 
                    notificationData.title, 
                    notificationData.message, 
                    dataJson
                ]);

                resolve({
                    id: result.lastID,
                    ...notificationData,
                    created_at: new Date().toISOString()
                });

            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Buscar status de progresso de uma aula específica
     * @param {number} userId - ID do usuário
     * @param {number} lessonId - ID da aula
     * @returns {Object} Status da aula
     */
    getLessonStatus: (userId, lessonId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const query = `
                    SELECT 
                        l.id,
                        l.name,
                        l.lesson_number,
                        l.package_id,
                        p.name as package_name,
                        up.lessons_watched,
                        up.progress_percentage,
                        up.status as package_status,
                        CASE 
                            WHEN up.lessons_watched >= l.lesson_number THEN 1
                            ELSE 0
                        END as is_completed
                    FROM lessons l
                    JOIN packages p ON l.package_id = p.id
                    LEFT JOIN user_progress up ON l.package_id = up.package_id AND up.user_id = ?
                    WHERE l.id = ?
                `;
                
                const result = await database.get(query, [userId, lessonId]);
                resolve(result || null);

            } catch (error) {
                reject(error);
            }
        });
    }
};

module.exports = progressModel; 