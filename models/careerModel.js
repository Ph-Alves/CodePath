/**
 * CodePath - Modelo de Carreiras
 * 
 * Este modelo gerencia todas as operações relacionadas a:
 * - Pacotes de tecnologia (C, Python, Java, etc.)
 * - Perfis profissionais (Desenvolvedor, Gestor, etc.)
 * - Progresso dos usuários nos pacotes
 */

const { getDatabase } = require('./databaseConnection');

// ========================================
// OPERAÇÕES COM PACOTES DE TECNOLOGIA
// ========================================

/**
 * Buscar todos os pacotes de tecnologia disponíveis
 * @returns {Array} Lista de pacotes com informações básicas
 */
async function getAllPackages() {
  try {
    const db = getDatabase();
    const packages = await db.all(`
      SELECT 
        id,
        name,
        description,
        icon,
        current_lesson,
        progress_percentage
      FROM packages 
      ORDER BY id ASC
    `);
    
    return packages;
  } catch (error) {
    console.error('Erro ao buscar pacotes:', error);
    throw error;
  }
}

/**
 * Buscar um pacote específico por ID
 * @param {number} packageId - ID do pacote
 * @returns {Object} Dados completos do pacote
 */
async function getPackageById(packageId) {
  try {

    const db = getDatabase();    const packageData = await db.get(`
      SELECT 
        id,
        name,
        description,
        icon,
        current_lesson,
        progress_percentage,
        created_at
      FROM packages 
      WHERE id = ?
    `, [packageId]);
    
    if (!packageData) {
      return null;
    }
    
    // Buscar aulas do pacote
    const lessons = await db.all(`
      SELECT 
        id,
        name,
        description,
        lesson_number,
        order_sequence
      FROM lessons 
      WHERE package_id = ?
      ORDER BY order_sequence ASC
    `, [packageId]);
    
    return {
      ...packageData,
      lessons
    };
  } catch (error) {
    console.error('Erro ao buscar pacote por ID:', error);
    throw error;
  }
}

/**
 * Buscar pacotes com progresso do usuário
 * @param {number} userId - ID do usuário
 * @returns {Array} Lista de pacotes com progresso do usuário
 */
async function getPackagesWithUserProgress(userId) {
  try {

    const db = getDatabase();    const packages = await db.all(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.icon,
        p.current_lesson,
        p.progress_percentage as default_progress,
        COALESCE(up.progress_percentage, 0) as user_progress,
        COALESCE(up.status, 'not_started') as user_status,
        COALESCE(up.lessons_watched, 0) as lessons_watched,
        up.completed_at
      FROM packages p
      LEFT JOIN user_progress up ON p.id = up.package_id AND up.user_id = ?
      ORDER BY p.id ASC
    `, [userId]);
    
    return packages;
  } catch (error) {
    console.error('Erro ao buscar pacotes com progresso:', error);
    throw error;
  }
}

// ========================================
// OPERAÇÕES COM PERFIS PROFISSIONAIS
// ========================================

/**
 * Buscar todos os perfis profissionais disponíveis
 * @returns {Array} Lista de perfis profissionais
 */
async function getAllCareerProfiles() {
  try {

    const db = getDatabase();    const profiles = await db.all(`
      SELECT 
        id,
        name,
        description,
        icon
      FROM career_profiles 
      ORDER BY id ASC
    `);
    
    return profiles;
  } catch (error) {
    console.error('Erro ao buscar perfis profissionais:', error);
    throw error;
  }
}

/**
 * Buscar perfil profissional por ID
 * @param {number} profileId - ID do perfil
 * @returns {Object} Dados do perfil profissional
 */
async function getCareerProfileById(profileId) {
  try {

    const db = getDatabase();    const profile = await db.get(`
      SELECT 
        id,
        name,
        description,
        icon,
        created_at
      FROM career_profiles 
      WHERE id = ?
    `, [profileId]);
    
    return profile;
  } catch (error) {
    console.error('Erro ao buscar perfil por ID:', error);
    throw error;
  }
}

// ========================================
// OPERAÇÕES DE PROGRESSO
// ========================================

/**
 * Iniciar progresso em um pacote para o usuário
 * @param {number} userId - ID do usuário
 * @param {number} packageId - ID do pacote
 * @returns {Object} Resultado da operação
 */
async function startPackageProgress(userId, packageId) {
  try {

    const db = getDatabase();    // Verificar se já existe progresso
    const existingProgress = await db.get(`
      SELECT id FROM user_progress 
      WHERE user_id = ? AND package_id = ?
    `, [userId, packageId]);
    
    if (existingProgress) {
      return { success: false, message: 'Progresso já existe para este pacote' };
    }
    
    // Inserir novo progresso
    const result = await db.run(`
      INSERT INTO user_progress (
        user_id, 
        package_id, 
        status, 
        progress_percentage,
        lessons_watched,
        courses_completed,
        challenges_delivered,
        quizzes_completed
      ) VALUES (?, ?, 'in_progress', 0, 0, 0, 0, 0)
    `, [userId, packageId]);
    
    // Atualizar pacote atual do usuário
    await db.run(`
      UPDATE users 
      SET current_package_id = ?
      WHERE id = ?
    `, [packageId, userId]);
    
    return { 
      success: true, 
      message: 'Progresso iniciado com sucesso',
      progressId: result.lastID
    };
  } catch (error) {
    console.error('Erro ao iniciar progresso:', error);
    throw error;
  }
}

/**
 * Continuar progresso em um pacote
 * @param {number} userId - ID do usuário
 * @param {number} packageId - ID do pacote
 * @returns {Object} Resultado da operação
 */
async function continuePackageProgress(userId, packageId) {
  try {

    const db = getDatabase();    // Atualizar pacote atual do usuário
    await db.run(`
      UPDATE users 
      SET current_package_id = ?
      WHERE id = ?
    `, [packageId, userId]);
    
    return { 
      success: true, 
      message: 'Continuando progresso no pacote'
    };
  } catch (error) {
    console.error('Erro ao continuar progresso:', error);
    throw error;
  }
}

/**
 * Selecionar perfil profissional para o usuário
 * @param {number} userId - ID do usuário
 * @param {number} profileId - ID do perfil profissional
 * @returns {Object} Resultado da operação
 */
async function selectCareerProfile(userId, profileId) {
  try {

    const db = getDatabase();    // Verificar se o perfil existe
    const profile = await getCareerProfileById(profileId);
    if (!profile) {
      return { success: false, message: 'Perfil profissional não encontrado' };
    }
    
    // Atualizar perfil do usuário
    await db.run(`
      UPDATE users 
      SET selected_career_profile_id = ?
      WHERE id = ?
    `, [profileId, userId]);
    
    return { 
      success: true, 
      message: 'Perfil profissional selecionado com sucesso',
      profile: profile
    };
  } catch (error) {
    console.error('Erro ao selecionar perfil:', error);
    throw error;
  }
}

// ========================================
// EXPORTAÇÕES
// ========================================

module.exports = {
  // Pacotes
  getAllPackages,
  getPackageById,
  getPackagesWithUserProgress,
  
  // Perfis profissionais
  getAllCareerProfiles,
  getCareerProfileById,
  
  // Progresso
  startPackageProgress,
  continuePackageProgress,
  selectCareerProfile
}; 