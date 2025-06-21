/**
 * CodePath - Dashboard Controller
 * Controlador para operações do dashboard principal
 * 
 * Este arquivo contém as funções para exibir o dashboard,
 * buscar métricas do usuário, progresso e atividades recentes.
 */

const { 
  getUserById,
  getUserMetrics,
  getUserProgress,
  getUserRecentActivity 
} = require('../models/userModel');

/**
 * Exibe o dashboard principal do usuário
 * Busca dados reais do banco de dados para exibir métricas,
 * progresso de pacotes e atividade recente
 */
async function showDashboard(req, res) {
  try {
    console.log('[DASHBOARD] Iniciando carregamento do dashboard...');
    
    if (!req.session.user) {
      console.log('[DASHBOARD] Erro: Usuário não encontrado na sessão');
      return res.redirect('/login');
    }
    
    const userId = req.session.user.id;
    console.log(`[DASHBOARD] ID do usuário: ${userId}`);
    
    console.log('[DASHBOARD] Buscando dados do usuário...');
    // Buscar dados atualizados do usuário
    const user = await getUserById(userId);
    if (!user) {
      console.log('[DASHBOARD] Erro: Usuário não encontrado no banco');
      return res.redirect('/login');
    }
    console.log(`[DASHBOARD] Usuário encontrado: ${user.email}`);
    
    console.log('[DASHBOARD] Buscando métricas do usuário...');
    // Buscar métricas do usuário
    const metrics = await getUserMetrics(userId);
    console.log('[DASHBOARD] Métricas obtidas:', metrics);
    
    console.log('[DASHBOARD] Buscando progresso dos pacotes...');
    // Buscar progresso dos pacotes em andamento
    const userProgress = await getUserProgress(userId);
    console.log(`[DASHBOARD] Progresso obtido: ${userProgress.length} pacotes`);
    
    console.log('[DASHBOARD] Buscando atividade recente...');
    // Buscar atividade recente
    const recentActivity = await getUserRecentActivity(userId);
    console.log(`[DASHBOARD] Atividades obtidas: ${recentActivity.length} atividades`);
    
    // Calcular progresso para o próximo nível
    // Cada nível requer 100 XP * nível atual
    const currentLevel = user.level || 1;
    const xpForCurrentLevel = (currentLevel - 1) * 100;
    const xpForNextLevel = currentLevel * 100;
    const xpProgress = user.xp_points - xpForCurrentLevel;
    const levelProgress = Math.min(Math.round((xpProgress / (xpForNextLevel - xpForCurrentLevel)) * 100), 100);
    
    // Preparar dados dos pacotes em progresso
    const currentPackages = userProgress.length > 0 ? {
      packages: userProgress.map(progress => ({
        id: progress.package_id,
        name: progress.package_name,
        currentLesson: progress.current_lesson || 'Aula inicial',
        progressPercentage: Math.round(progress.completion_percentage || 0),
        icon: getPackageIcon(progress.package_name),
        lastAccessed: progress.last_accessed
      }))
    } : null;
    
    // Preparar dados de atividade recente
    const activityData = recentActivity.length > 0 ? {
      activities: recentActivity.map(activity => ({
        type: activity.activity_type,
        icon: getActivityIcon(activity.activity_type),
        description: activity.description,
        timeAgo: formatTimeAgo(activity.created_at),
        points: activity.xp_earned || 0
      }))
    } : null;
    
    console.log('[DASHBOARD] Preparando dados para renderização...');
    
    // Renderizar dashboard com dados reais
    res.render('pages/dashboard', {
      layout: 'main',
      pageTitle: 'Dashboard',
      additionalCSS: 'dashboard',
      additionalJS: 'dashboard',
      bodyClass: 'dashboard-page',
      isDashboard: true,
      user: {
        ...user,
        level: user.level || 1,
        xp_points: user.xp_points || 0,
        streak_days: user.streak_days || 0
      },
      levelProgress,
      metrics: {
        lessonsWatched: metrics.lessons_watched || 0,
        lessonsThisWeek: metrics.lessons_this_week || 0,
        coursesCompleted: metrics.courses_completed || 0,
        coursesThisMonth: metrics.courses_this_month || 0,
        challengesCompleted: metrics.challenges_completed || 0,
        challengesPending: metrics.challenges_pending || 0,
        quizzesCompleted: metrics.quizzes_completed || 0,
        averageScore: Math.round(metrics.average_quiz_score || 0)
      },
      currentPackages,
      recentActivity: activityData
    });
    
    console.log('[DASHBOARD] Dashboard renderizado com sucesso');
    
  } catch (error) {
    console.error('Erro ao exibir dashboard:', error);
    console.error('Stack trace:', error.stack);
    
    // Em caso de erro, redirecionar para login ou enviar erro simples
    if (error.message && error.message.includes('render')) {
      res.status(500).send(`
        <h1>Erro interno do servidor</h1>
        <p>Ocorreu um erro ao carregar o dashboard.</p>
        <p><a href="/login">Voltar ao login</a></p>
      `);
    } else {
      try {
        res.status(500).render('pages/error', {
          layout: 'main',
          pageTitle: 'Erro',
          error: 'Erro interno do servidor'
        });
      } catch (renderError) {
        console.error('Erro ao renderizar página de erro:', renderError);
        res.status(500).send(`
          <h1>Erro interno do servidor</h1>
          <p>Ocorreu um erro ao carregar o dashboard.</p>
          <p><a href="/login">Voltar ao login</a></p>
        `);
      }
    }
  }
}

/**
 * API para buscar dados de progresso de um pacote específico
 * Usado pelo modal de progresso
 */
async function getPackageProgress(req, res) {
  try {
    const userId = req.session.user.id;
    const packageId = req.params.packageId;
    
    // Buscar progresso detalhado do pacote
    const progress = await getUserProgress(userId, packageId);
    
    if (!progress) {
      return res.status(404).json({ 
        error: 'Progresso não encontrado' 
      });
    }
    
    res.json({
      success: true,
      data: {
        packageName: progress.package_name,
        completionPercentage: Math.round(progress.completion_percentage || 0),
        lessonsCompleted: progress.lessons_completed || 0,
        totalLessons: progress.total_lessons || 0,
        quizzesCompleted: progress.quizzes_completed || 0,
        totalQuizzes: progress.total_quizzes || 0,
        timeSpent: progress.time_spent_minutes || 0,
        lastAccessed: progress.last_accessed,
        currentStreak: progress.current_streak || 0
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar progresso do pacote:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
}

/**
 * API para atualizar métricas do dashboard
 * Usado para atualizações em tempo real
 */
async function updateMetrics(req, res) {
  try {
    const userId = req.session.user.id;
    
    // Buscar métricas atualizadas
    const metrics = await getUserMetrics(userId);
    
    res.json({
      success: true,
      metrics: {
        lessonsWatched: metrics.lessons_watched || 0,
        lessonsThisWeek: metrics.lessons_this_week || 0,
        coursesCompleted: metrics.courses_completed || 0,
        coursesThisMonth: metrics.courses_this_month || 0,
        challengesCompleted: metrics.challenges_completed || 0,
        challengesPending: metrics.challenges_pending || 0,
        quizzesCompleted: metrics.quizzes_completed || 0,
        averageScore: Math.round(metrics.average_quiz_score || 0)
      }
    });
    
  } catch (error) {
    console.error('Erro ao atualizar métricas:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
}

/**
 * Função auxiliar para obter ícone do pacote
 */
function getPackageIcon(packageName) {
  const icons = {
    'C': 'fab fa-cuttlefish',
    'Python': 'fab fa-python',
    'Java': 'fab fa-java',
    'JavaScript': 'fab fa-js-square',
    'Front-end': 'fab fa-html5',
    'Back-end': 'fas fa-server',
    'C#': 'fas fa-code'
  };
  
  // Buscar por correspondência parcial no nome
  for (const [key, icon] of Object.entries(icons)) {
    if (packageName.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }
  
  return 'fas fa-book'; // Ícone padrão
}

/**
 * Função auxiliar para obter ícone da atividade
 */
function getActivityIcon(activityType) {
  const icons = {
    'lesson': 'fas fa-play-circle',
    'quiz': 'fas fa-question-circle',
    'challenge': 'fas fa-code',
    'achievement': 'fas fa-trophy',
    'course_completion': 'fas fa-certificate',
    'login': 'fas fa-sign-in-alt'
  };
  
  return icons[activityType] || 'fas fa-circle';
}

/**
 * Função auxiliar para formatar tempo relativo
 */
function formatTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Agora mesmo';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} atrás`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
  }
}

module.exports = {
  showDashboard,
  getPackageProgress,
  updateMetrics
}; 