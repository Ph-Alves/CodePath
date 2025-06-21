/**
 * CodePath - Modelo de Conteúdos
 * 
 * Este arquivo contém todas as funções relacionadas ao gerenciamento
 * de conteúdos, aulas e progresso de aprendizado dos usuários.
 */

const { database } = require('./database');

/**
 * Busca todas as aulas de um pacote específico
 * @param {number} packageId - ID do pacote
 * @returns {Promise<Array>} Lista de aulas do pacote
 */
async function getLessonsByPackage(packageId) {
  try {
    const lessons = await database.all(`
      SELECT 
        l.*,
        p.name as package_name,
        p.icon as package_icon
      FROM lessons l
      JOIN packages p ON l.package_id = p.id
      WHERE l.package_id = ?
      ORDER BY l.order_sequence ASC
    `, [packageId]);

    return lessons;
  } catch (error) {
    console.error('Erro ao buscar aulas do pacote:', error);
    throw error;
  }
}

/**
 * Busca uma aula específica por ID
 * @param {number} lessonId - ID da aula
 * @returns {Promise<Object>} Dados da aula
 */
async function getLessonById(lessonId) {
  try {
    const lesson = await database.get(`
      SELECT 
        l.*,
        p.name as package_name,
        p.icon as package_icon,
        p.description as package_description
      FROM lessons l
      JOIN packages p ON l.package_id = p.id
      WHERE l.id = ?
    `, [lessonId]);

    return lesson;
  } catch (error) {
    console.error('Erro ao buscar aula:', error);
    throw error;
  }
}

/**
 * Busca o progresso do usuário em uma aula específica
 * @param {number} userId - ID do usuário
 * @param {number} lessonId - ID da aula
 * @returns {Promise<Object>} Progresso da aula
 */
async function getUserLessonProgress(userId, lessonId) {
  try {
    // Buscar progresso específico da aula (através do quiz relacionado)
    const progress = await database.get(`
      SELECT 
        up.*,
        q.id as quiz_id,
        q.question_text
      FROM user_progress up
      LEFT JOIN quizzes q ON up.quiz_id = q.id
      LEFT JOIN lessons l ON q.lesson_id = l.id
      WHERE up.user_id = ? AND l.id = ?
    `, [userId, lessonId]);

    return progress;
  } catch (error) {
    console.error('Erro ao buscar progresso da aula:', error);
    throw error;
  }
}

/**
 * Marca uma aula como assistida
 * @param {number} userId - ID do usuário
 * @param {number} lessonId - ID da aula
 * @param {number} packageId - ID do pacote
 * @returns {Promise<boolean>} Sucesso da operação
 */
async function markLessonAsWatched(userId, lessonId, packageId) {
  try {
    // Verificar se já existe progresso para este pacote
    let progress = await database.get(`
      SELECT * FROM user_progress 
      WHERE user_id = ? AND package_id = ?
    `, [userId, packageId]);

    if (progress) {
      // Atualizar progresso existente
      await database.run(`
        UPDATE user_progress 
        SET 
          lessons_watched = lessons_watched + 1,
          progress_percentage = CASE 
            WHEN progress_percentage < 100 THEN 
              MIN(100, progress_percentage + 10)
            ELSE progress_percentage 
          END,
          status = CASE 
            WHEN progress_percentage >= 100 THEN 'completed'
            ELSE 'in_progress'
          END
        WHERE user_id = ? AND package_id = ?
      `, [userId, packageId]);
    } else {
      // Criar novo registro de progresso
      await database.run(`
        INSERT INTO user_progress 
        (user_id, package_id, status, progress_percentage, lessons_watched, courses_completed, challenges_delivered, quizzes_completed)
        VALUES (?, ?, 'in_progress', 10, 1, 0, 0, 0)
      `, [userId, packageId]);
    }

    // Atualizar XP do usuário
    await database.run(`
      UPDATE users 
      SET xp_points = xp_points + 50
      WHERE id = ?
    `, [userId]);

    return true;
  } catch (error) {
    console.error('Erro ao marcar aula como assistida:', error);
    throw error;
  }
}

/**
 * Busca a próxima aula de um pacote
 * @param {number} packageId - ID do pacote
 * @param {number} currentLessonId - ID da aula atual
 * @returns {Promise<Object>} Próxima aula
 */
async function getNextLesson(packageId, currentLessonId) {
  try {
    const currentLesson = await database.get(`
      SELECT order_sequence FROM lessons WHERE id = ?
    `, [currentLessonId]);

    if (!currentLesson) return null;

    const nextLesson = await database.get(`
      SELECT * FROM lessons 
      WHERE package_id = ? AND order_sequence > ?
      ORDER BY order_sequence ASC
      LIMIT 1
    `, [packageId, currentLesson.order_sequence]);

    return nextLesson;
  } catch (error) {
    console.error('Erro ao buscar próxima aula:', error);
    throw error;
  }
}

/**
 * Busca a aula anterior de um pacote
 * @param {number} packageId - ID do pacote
 * @param {number} currentLessonId - ID da aula atual
 * @returns {Promise<Object>} Aula anterior
 */
async function getPreviousLesson(packageId, currentLessonId) {
  try {
    const currentLesson = await database.get(`
      SELECT order_sequence FROM lessons WHERE id = ?
    `, [currentLessonId]);

    if (!currentLesson) return null;

    const previousLesson = await database.get(`
      SELECT * FROM lessons 
      WHERE package_id = ? AND order_sequence < ?
      ORDER BY order_sequence DESC
      LIMIT 1
    `, [packageId, currentLesson.order_sequence]);

    return previousLesson;
  } catch (error) {
    console.error('Erro ao buscar aula anterior:', error);
    throw error;
  }
}

/**
 * Busca estatísticas de progresso do usuário em um pacote
 * @param {number} userId - ID do usuário
 * @param {number} packageId - ID do pacote
 * @returns {Promise<Object>} Estatísticas do progresso
 */
async function getPackageProgressStats(userId, packageId) {
  try {
    // Buscar total de aulas do pacote
    const totalLessons = await database.get(`
      SELECT COUNT(*) as total FROM lessons WHERE package_id = ?
    `, [packageId]);

    // Buscar progresso do usuário
    const progress = await database.get(`
      SELECT * FROM user_progress 
      WHERE user_id = ? AND package_id = ?
    `, [userId, packageId]);

    // Buscar informações do pacote
    const packageInfo = await database.get(`
      SELECT * FROM packages WHERE id = ?
    `, [packageId]);

    return {
      package: packageInfo,
      totalLessons: totalLessons.total,
      watchedLessons: progress ? progress.lessons_watched : 0,
      progressPercentage: progress ? progress.progress_percentage : 0,
      status: progress ? progress.status : 'not_started',
      completedCourses: progress ? progress.courses_completed : 0,
      completedQuizzes: progress ? progress.quizzes_completed : 0,
      deliveredChallenges: progress ? progress.challenges_delivered : 0
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas de progresso:', error);
    throw error;
  }
}

/**
 * Busca quizzes relacionados a uma aula
 * @param {number} lessonId - ID da aula
 * @returns {Promise<Array>} Lista de quizzes da aula
 */
async function getQuizzesByLesson(lessonId) {
  try {
    const quizzes = await database.all(`
      SELECT * FROM quizzes 
      WHERE lesson_id = ?
      ORDER BY question_number ASC
    `, [lessonId]);

    return quizzes;
  } catch (error) {
    console.error('Erro ao buscar quizzes da aula:', error);
    throw error;
  }
}

/**
 * Verificar pré-requisitos de uma aula
 * @param {number} userId - ID do usuário
 * @param {number} lessonId - ID da aula
 * @returns {Promise<Object>} Status de acesso e pré-requisitos
 */
async function checkLessonPrerequisites(userId, lessonId) {
  try {
    const lesson = await database.get(`
      SELECT l.*, p.name as package_name 
      FROM lessons l
      JOIN packages p ON l.package_id = p.id
      WHERE l.id = ?
    `, [lessonId]);

    if (!lesson) {
      return { can_access: false, message: 'Aula não encontrada' };
    }

    // Para aulas sequenciais, verificar se a anterior foi concluída
    if (lesson.order_sequence > 1) {
      const previousLesson = await database.get(`
        SELECT l.id, l.name 
        FROM lessons l
        WHERE l.package_id = ? AND l.order_sequence = ?
      `, [lesson.package_id, lesson.order_sequence - 1]);

      if (previousLesson) {
        // Verificar se a aula anterior foi concluída
        const isCompleted = await database.get(`
          SELECT COUNT(*) as completed
          FROM lesson_completions lc
          WHERE lc.user_id = ? AND lc.lesson_id = ?
        `, [userId, previousLesson.id]);

        if (!isCompleted || isCompleted.completed === 0) {
          return {
            can_access: false,
            message: 'Você precisa concluir a aula anterior primeiro',
            missing_prerequisites: [
              {
                id: previousLesson.id,
                name: previousLesson.name,
                type: 'lesson'
              }
            ]
          };
        }
      }
    }

    // Para primeira aula de um pacote, verificar se tem acesso ao pacote
    if (lesson.order_sequence === 1) {
      // Verificar se o usuário tem acesso ao pacote (pode ser expandido futuramente)
      // Por enquanto, todos têm acesso
    }

    return {
      can_access: true,
      message: 'Acesso liberado',
      missing_prerequisites: []
    };

  } catch (error) {
    console.error('Erro ao verificar pré-requisitos:', error);
    return { 
      can_access: false, 
      message: 'Erro ao verificar pré-requisitos',
      missing_prerequisites: []
    };
  }
}

/**
 * Buscar todas as aulas de um pacote com status de conclusão
 * @param {number} userId - ID do usuário
 * @param {number} packageId - ID do pacote
 * @returns {Promise<Array>} Lista de aulas com status
 */
async function getLessonsWithCompletionStatus(userId, packageId) {
  try {
    const lessons = await database.all(`
      SELECT 
        l.*,
        p.name as package_name,
        p.icon as package_icon,
        CASE 
          WHEN lc.lesson_id IS NOT NULL THEN 1 
          ELSE 0 
        END as is_completed,
        lc.completed_at
      FROM lessons l
      JOIN packages p ON l.package_id = p.id
      LEFT JOIN lesson_completions lc ON l.id = lc.lesson_id AND lc.user_id = ?
      WHERE l.package_id = ?
      ORDER BY l.order_sequence ASC
    `, [userId, packageId]);

    return lessons;
  } catch (error) {
    console.error('Erro ao buscar aulas com status:', error);
    throw error;
  }
}

/**
 * Obter estatísticas de navegação para uma aula
 * @param {number} userId - ID do usuário
 * @param {number} lessonId - ID da aula
 * @returns {Promise<Object>} Dados de navegação
 */
async function getLessonNavigationData(userId, lessonId) {
  try {
    const lesson = await getLessonById(lessonId);
    if (!lesson) return null;

    const [nextLesson, previousLesson, packageStats, prerequisites] = await Promise.all([
      getNextLesson(lesson.package_id, lessonId),
      getPreviousLesson(lesson.package_id, lessonId),
      getPackageProgressStats(userId, lesson.package_id),
      checkLessonPrerequisites(userId, lessonId)
    ]);

    return {
      current_lesson: lesson,
      next_lesson: nextLesson,
      previous_lesson: previousLesson,
      package_stats: packageStats,
      prerequisites: prerequisites,
      can_navigate_next: nextLesson !== null,
      can_navigate_previous: previousLesson !== null
    };

  } catch (error) {
    console.error('Erro ao buscar dados de navegação:', error);
    throw error;
  }
}

module.exports = {
  getLessonsByPackage,
  getLessonById,
  getUserLessonProgress,
  markLessonAsWatched,
  getNextLesson,
  getPreviousLesson,
  getPackageProgressStats,
  getQuizzesByLesson,
  checkLessonPrerequisites,
  getLessonsWithCompletionStatus,
  getLessonNavigationData
}; 