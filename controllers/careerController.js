/**
 * CodePath - Controlador de Carreiras
 * 
 * Este controlador gerencia todas as funcionalidades relacionadas a:
 * - Exibição de pacotes de tecnologia
 * - Seleção de perfis profissionais
 * - Gerenciamento de progresso nos pacotes
 */

const careerModel = require('../models/careerModel');

// ========================================
// PÁGINAS PRINCIPAIS
// ========================================

/**
 * Exibir página de pacotes de tecnologia
 * GET /careers
 */
async function showCareersPage(req, res) {
  try {
    // Verificar se o usuário está logado
    if (!req.session.user) {
      return res.redirect('/login');
    }
    
    const userId = req.session.user.id;
    
    // Buscar pacotes com progresso do usuário
    const packages = await careerModel.getPackagesWithUserProgress(userId);
    
    // Adicionar informações visuais para cada pacote
    const packagesWithVisuals = packages.map(pkg => ({
      ...pkg,
      progressColor: getProgressColor(pkg.user_progress),
      statusText: getStatusText(pkg.user_status),
      canContinue: pkg.user_status === 'in_progress',
      canStart: pkg.user_status === 'not_started'
    }));
    
    res.render('pages/careers', {
      title: 'Pacotes de Tecnologia - CodePath',
      additionalCSS: 'careers',
      additionalJS: 'careers',
      user: req.session.user,
      packages: packagesWithVisuals,
      totalPackages: packages.length,
      inProgressCount: packages.filter(p => p.user_status === 'in_progress').length,
      completedCount: packages.filter(p => p.user_status === 'completed').length
    });
    
  } catch (error) {
    console.error('Erro ao exibir página de carreiras:', error);
    res.status(500).render('pages/error', {
      title: 'Erro - CodePath',
      message: 'Erro interno do servidor',
      user: req.session.user
    });
  }
}

/**
 * Exibir página de perfis profissionais
 * GET /career-profiles
 */
async function showCareerProfilesPage(req, res) {
  try {
    // Verificar se o usuário está logado
    if (!req.session.user) {
      return res.redirect('/login');
    }
    
    // Buscar todos os perfis profissionais
    const profiles = await careerModel.getAllCareerProfiles();
    
    // Verificar qual perfil o usuário já selecionou
    const currentProfileId = req.session.user.selected_career_profile_id;
    
    // Marcar perfil atual como selecionado
    const profilesWithSelection = profiles.map(profile => ({
      ...profile,
      isSelected: profile.id === currentProfileId,
      iconClass: getProfileIconClass(profile.icon)
    }));
    
    res.render('pages/career-profiles', {
      title: 'Perfis Profissionais - CodePath',
      additionalCSS: 'careers',
      additionalJS: 'careers',
      user: req.session.user,
      profiles: profilesWithSelection,
      hasSelectedProfile: !!currentProfileId
    });
    
  } catch (error) {
    console.error('Erro ao exibir perfis profissionais:', error);
    res.status(500).render('pages/error', {
      title: 'Erro - CodePath',
      message: 'Erro interno do servidor',
      user: req.session.user
    });
  }
}

/**
 * Exibir detalhes de um pacote específico
 * GET /careers/package/:id
 */
async function showPackageDetails(req, res) {
  try {
    // Verificar se o usuário está logado
    if (!req.session.user) {
      return res.redirect('/login');
    }
    
    const packageId = parseInt(req.params.id);
    const userId = req.session.user.id;
    
    // Buscar dados completos do pacote
    const packageData = await careerModel.getPackageById(packageId);
    
    if (!packageData) {
      return res.status(404).render('pages/error', {
        title: 'Pacote não encontrado - CodePath',
        message: 'O pacote solicitado não foi encontrado',
        user: req.session.user
      });
    }
    
    // Buscar progresso do usuário neste pacote
    const userPackages = await careerModel.getPackagesWithUserProgress(userId);
    const userProgress = userPackages.find(p => p.id === packageId);
    
    res.render('pages/package-details', {
      title: `${packageData.name} - CodePath`,
      user: req.session.user,
      package: packageData,
      userProgress: userProgress || { user_progress: 0, user_status: 'not_started' },
      progressColor: getProgressColor(userProgress?.user_progress || 0),
      statusText: getStatusText(userProgress?.user_status || 'not_started'),
      canStart: !userProgress || userProgress.user_status === 'not_started',
      canContinue: userProgress && userProgress.user_status === 'in_progress'
    });
    
  } catch (error) {
    console.error('Erro ao exibir detalhes do pacote:', error);
    res.status(500).render('pages/error', {
      title: 'Erro - CodePath',
      message: 'Erro interno do servidor',
      user: req.session.user
    });
  }
}

// ========================================
// AÇÕES DE PROGRESSO
// ========================================

/**
 * Iniciar progresso em um pacote
 * POST /careers/package/:id/start
 */
async function startPackage(req, res) {
  try {
    // Verificar se o usuário está logado
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }
    
    const packageId = parseInt(req.params.id);
    const userId = req.session.user.id;
    
    // Iniciar progresso no pacote
    const result = await careerModel.startPackageProgress(userId, packageId);
    
    if (result.success) {
      // Atualizar informações da sessão
      req.session.user.current_package_id = packageId;
      
      // Redirecionar para a página de carreiras com sucesso
      req.session.successMessage = result.message;
      res.redirect('/careers');
    } else {
      // Redirecionar com erro
      req.session.errorMessage = result.message;
      res.redirect('/careers');
    }
    
  } catch (error) {
    console.error('Erro ao iniciar pacote:', error);
    req.session.errorMessage = 'Erro interno do servidor';
    res.redirect('/careers');
  }
}

/**
 * Continuar progresso em um pacote
 * POST /careers/package/:id/continue
 */
async function continuePackage(req, res) {
  try {
    // Verificar se o usuário está logado
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }
    
    const packageId = parseInt(req.params.id);
    const userId = req.session.user.id;
    
    // Continuar progresso no pacote
    const result = await careerModel.continuePackageProgress(userId, packageId);
    
    if (result.success) {
      // Atualizar informações da sessão
      req.session.user.current_package_id = packageId;
      
      // Redirecionar para o dashboard ou área de estudos
      res.redirect('/dashboard');
    } else {
      // Redirecionar com erro
      req.session.errorMessage = result.message;
      res.redirect('/careers');
    }
    
  } catch (error) {
    console.error('Erro ao continuar pacote:', error);
    req.session.errorMessage = 'Erro interno do servidor';
    res.redirect('/careers');
  }
}

/**
 * Selecionar perfil profissional
 * POST /career-profiles/select
 */
async function selectCareerProfile(req, res) {
  try {
    // Verificar se o usuário está logado
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }
    
    const profileId = parseInt(req.body.profileId);
    const userId = req.session.user.id;
    
    // Validar dados de entrada
    if (!profileId || isNaN(profileId)) {
      req.session.errorMessage = 'Perfil profissional inválido';
      return res.redirect('/career-profiles');
    }
    
    // Selecionar perfil profissional
    const result = await careerModel.selectCareerProfile(userId, profileId);
    
    if (result.success) {
      // Atualizar informações da sessão
      req.session.user.selected_career_profile_id = profileId;
      
      // Redirecionar com sucesso
      req.session.successMessage = `Perfil "${result.profile.name}" selecionado com sucesso!`;
      res.redirect('/careers');
    } else {
      // Redirecionar com erro
      req.session.errorMessage = result.message;
      res.redirect('/career-profiles');
    }
    
  } catch (error) {
    console.error('Erro ao selecionar perfil:', error);
    req.session.errorMessage = 'Erro interno do servidor';
    res.redirect('/career-profiles');
  }
}

// ========================================
// APIs PARA DADOS DINÂMICOS
// ========================================

/**
 * API para buscar dados de um pacote
 * GET /api/careers/package/:id
 */
async function getPackageData(req, res) {
  try {
    const packageId = parseInt(req.params.id);
    const userId = req.session.user?.id;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
    }
    
    // Buscar dados do pacote
    const packageData = await careerModel.getPackageById(packageId);
    
    if (!packageData) {
      return res.status(404).json({ success: false, message: 'Pacote não encontrado' });
    }
    
    // Buscar progresso do usuário
    const userPackages = await careerModel.getPackagesWithUserProgress(userId);
    const userProgress = userPackages.find(p => p.id === packageId);
    
    res.json({
      success: true,
      package: packageData,
      userProgress: userProgress || { user_progress: 0, user_status: 'not_started' }
    });
    
  } catch (error) {
    console.error('Erro na API de pacote:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Obter cor da barra de progresso baseada na porcentagem
 * @param {number} progress - Porcentagem de progresso (0-100)
 * @returns {string} Classe CSS da cor
 */
function getProgressColor(progress) {
  if (progress === 0) return 'bg-gray-300';
  if (progress < 30) return 'bg-red-500';
  if (progress < 60) return 'bg-yellow-500';
  if (progress < 90) return 'bg-blue-500';
  return 'bg-green-500';
}

/**
 * Obter texto do status baseado no status do usuário
 * @param {string} status - Status do progresso
 * @returns {string} Texto do status
 */
function getStatusText(status) {
  switch (status) {
    case 'not_started': return 'Não iniciado';
    case 'in_progress': return 'Em progresso';
    case 'completed': return 'Concluído';
    default: return 'Desconhecido';
  }
}

/**
 * Obter classe CSS do ícone do perfil profissional
 * @param {string} icon - Nome do ícone
 * @returns {string} Classe CSS do ícone
 */
function getProfileIconClass(icon) {
  const iconMap = {
    'developer': 'fas fa-code',
    'manager': 'fas fa-users',
    'support': 'fas fa-headset',
    'database': 'fas fa-database',
    'security': 'fas fa-shield-alt',
    'question': 'fas fa-question-circle'
  };
  
  return iconMap[icon] || 'fas fa-briefcase';
}

// ========================================
// EXPORTAÇÕES
// ========================================

module.exports = {
  // Páginas
  showCareersPage,
  showCareerProfilesPage,
  showPackageDetails,
  
  // Ações
  startPackage,
  continuePackage,
  selectCareerProfile,
  
  // APIs
  getPackageData
}; 