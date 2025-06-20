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

module.exports = {
  getLessonsByPackage,
  getLessonById,
  getUserLessonProgress,
  markLessonAsWatched,
  getNextLesson,
  getPreviousLesson,
  getPackageProgressStats,
  getQuizzesByLesson
}; 