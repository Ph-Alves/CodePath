/**
 * CodePath - Controlador de Conteúdos
 * 
 * Este arquivo contém todas as funções de controle relacionadas
 * à visualização e gerenciamento de conteúdos e aulas.
 */

const contentModel = require('../models/contentModel');

/**
 * Exibe a lista de aulas de um pacote específico
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function showPackageLessons(req, res) {
  try {
    const packageId = parseInt(req.params.packageId);
    const userId = req.session.user.id;

    // Buscar aulas do pacote
    const lessons = await contentModel.getLessonsByPackage(packageId);
    
    // Buscar estatísticas de progresso
    const progressStats = await contentModel.getPackageProgressStats(userId, packageId);

    // Se não há aulas, redirecionar para carreiras
    if (!lessons || lessons.length === 0) {
      req.session.flash = {
        type: 'error',
        message: 'Pacote não encontrado ou sem aulas disponíveis.'
      };
      return res.redirect('/careers');
    }

    // Renderizar página de aulas do pacote
    res.render('pages/package-lessons', {
      title: `${progressStats.package.name} - Aulas`,
      user: req.session.user,
      package: progressStats.package,
      lessons: lessons,
      progressStats: progressStats,
      flash: req.session.flash || null
    });

    // Limpar flash message
    delete req.session.flash;

  } catch (error) {
    console.error('Erro ao exibir aulas do pacote:', error);
    req.session.flash = {
      type: 'error',
      message: 'Erro interno do servidor. Tente novamente.'
    };
    res.redirect('/careers');
  }
}

/**
 * Exibe uma aula específica
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function showLesson(req, res) {
  try {
    const lessonId = parseInt(req.params.lessonId);
    const userId = req.session.user.id;

    // Buscar dados da aula
    const lesson = await contentModel.getLessonById(lessonId);
    
    if (!lesson) {
      req.session.flash = {
        type: 'error',
        message: 'Aula não encontrada.'
      };
      return res.redirect('/careers');
    }

    // Buscar progresso do usuário na aula
    const userProgress = await contentModel.getUserLessonProgress(userId, lessonId);
    
    // Buscar aulas anteriores e próximas
    const nextLesson = await contentModel.getNextLesson(lesson.package_id, lessonId);
    const previousLesson = await contentModel.getPreviousLesson(lesson.package_id, lessonId);
    
    // Buscar quizzes da aula
    const quizzes = await contentModel.getQuizzesByLesson(lessonId);
    
    // Buscar estatísticas do pacote
    const progressStats = await contentModel.getPackageProgressStats(userId, lesson.package_id);

    // Renderizar página da aula
    res.render('pages/lesson-view', {
      title: `${lesson.name} - ${lesson.package_name}`,
      user: req.session.user,
      lesson: lesson,
      userProgress: userProgress,
      nextLesson: nextLesson,
      previousLesson: previousLesson,
      quizzes: quizzes,
      progressStats: progressStats,
      flash: req.session.flash || null
    });

    // Limpar flash message
    delete req.session.flash;

  } catch (error) {
    console.error('Erro ao exibir aula:', error);
    req.session.flash = {
      type: 'error',
      message: 'Erro interno do servidor. Tente novamente.'
    };
    res.redirect('/careers');
  }
}

/**
 * Marca uma aula como assistida
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function markLessonComplete(req, res) {
  try {
    const lessonId = parseInt(req.params.lessonId);
    const userId = req.session.user.id;

    // Buscar dados da aula para obter o package_id
    const lesson = await contentModel.getLessonById(lessonId);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Aula não encontrada.'
      });
    }

    // Marcar aula como assistida
    const success = await contentModel.markLessonAsWatched(userId, lessonId, lesson.package_id);

    if (success) {
      // Buscar próxima aula para sugerir
      const nextLesson = await contentModel.getNextLesson(lesson.package_id, lessonId);
      
      res.json({
        success: true,
        message: 'Aula marcada como concluída! +50 XP',
        nextLesson: nextLesson ? {
          id: nextLesson.id,
          name: nextLesson.name,
          url: `/content/lesson/${nextLesson.id}`
        } : null
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Erro ao marcar aula como concluída.'
      });
    }

  } catch (error) {
    console.error('Erro ao marcar aula como concluída:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor.'
    });
  }
}

/**
 * API para obter progresso de um pacote
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getPackageProgress(req, res) {
  try {
    const packageId = parseInt(req.params.packageId);
    const userId = req.session.user.id;

    const progressStats = await contentModel.getPackageProgressStats(userId, packageId);

    res.json({
      success: true,
      data: progressStats
    });

  } catch (error) {
    console.error('Erro ao buscar progresso do pacote:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar progresso.'
    });
  }
}

/**
 * API para obter aulas de um pacote
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getPackageLessonsAPI(req, res) {
  try {
    const packageId = parseInt(req.params.packageId);
    const userId = req.session.user.id;

    const lessons = await contentModel.getLessonsByPackage(packageId);
    const progressStats = await contentModel.getPackageProgressStats(userId, packageId);

    res.json({
      success: true,
      data: {
        lessons: lessons,
        progressStats: progressStats
      }
    });

  } catch (error) {
    console.error('Erro ao buscar aulas do pacote:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar aulas.'
    });
  }
}

/**
 * Navegar para a próxima aula
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function goToNextLesson(req, res) {
  try {
    const currentLessonId = parseInt(req.params.lessonId);
    
    // Buscar aula atual para obter o package_id
    const currentLesson = await contentModel.getLessonById(currentLessonId);
    
    if (!currentLesson) {
      req.session.flash = {
        type: 'error',
        message: 'Aula atual não encontrada.'
      };
      return res.redirect('/careers');
    }

    // Buscar próxima aula
    const nextLesson = await contentModel.getNextLesson(currentLesson.package_id, currentLessonId);
    
    if (nextLesson) {
      res.redirect(`/content/lesson/${nextLesson.id}`);
    } else {
      // Se não há próxima aula, redirecionar para lista de aulas do pacote
      req.session.flash = {
        type: 'success',
        message: 'Parabéns! Você concluiu todas as aulas deste pacote.'
      };
      res.redirect(`/content/package/${currentLesson.package_id}/lessons`);
    }

  } catch (error) {
    console.error('Erro ao navegar para próxima aula:', error);
    req.session.flash = {
      type: 'error',
      message: 'Erro ao navegar para próxima aula.'
    };
    res.redirect('/careers');
  }
}

/**
 * Navegar para a aula anterior
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function goToPreviousLesson(req, res) {
  try {
    const currentLessonId = parseInt(req.params.lessonId);
    
    // Buscar aula atual para obter o package_id
    const currentLesson = await contentModel.getLessonById(currentLessonId);
    
    if (!currentLesson) {
      req.session.flash = {
        type: 'error',
        message: 'Aula atual não encontrada.'
      };
      return res.redirect('/careers');
    }

    // Buscar aula anterior
    const previousLesson = await contentModel.getPreviousLesson(currentLesson.package_id, currentLessonId);
    
    if (previousLesson) {
      res.redirect(`/content/lesson/${previousLesson.id}`);
    } else {
      // Se não há aula anterior, redirecionar para lista de aulas do pacote
      req.session.flash = {
        type: 'info',
        message: 'Esta é a primeira aula do pacote.'
      };
      res.redirect(`/content/package/${currentLesson.package_id}/lessons`);
    }

  } catch (error) {
    console.error('Erro ao navegar para aula anterior:', error);
    req.session.flash = {
      type: 'error',
      message: 'Erro ao navegar para aula anterior.'
    };
    res.redirect('/careers');
  }
}

module.exports = {
  showPackageLessons,
  showLesson,
  markLessonComplete,
  getPackageProgress,
  getPackageLessonsAPI,
  goToNextLesson,
  goToPreviousLesson
}; 