/**
 * CodePath - User Model
 * Modelo para operações de usuário e autenticação
 * 
 * Este arquivo contém todas as funções para manipulação de dados
 * de usuários, incluindo autenticação e sessões.
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { getDatabase } = require('./databaseConnection');

/**
 * Busca um usuário pelo email
 * @param {string} email - Email do usuário
 * @returns {Object|null} Dados do usuário ou null se não encontrado
 */
async function getUserByEmail(email) {
  try {
    const db = getDatabase();
    const user = await db.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return user || null;
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error);
    throw error;
  }
}

/**
 * Busca um usuário pelo ID
 * @param {number} id - ID do usuário
 * @returns {Object|null} Dados do usuário ou null se não encontrado
 */
async function getUserById(id) {
  try {
    const db = getDatabase();
    const user = await db.get(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return user || null;
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    throw error;
  }
}

/**
 * Cria um novo usuário no banco de dados
 * @param {Object} userData - Dados do usuário
 * @param {string} userData.name - Nome do usuário
 * @param {string} userData.email - Email do usuário
 * @param {string} userData.password - Senha em texto plano
 * @param {string} userData.birthDate - Data de nascimento
 * @param {string} userData.educationLevel - Nível educacional
 * @returns {Object} Dados do usuário criado
 */
async function createUser(userData) {
  try {
    const { name, email, password, birthDate, educationLevel } = userData;
    
    // Verificar se o email já existe
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }
    
    // Criptografar a senha
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Inserir o usuário no banco
    const db = getDatabase();
    const result = await db.run(
      `INSERT INTO users (name, email, password_hash, birth_date, education_level) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, passwordHash, birthDate, educationLevel]
    );
    
    // Buscar e retornar o usuário criado
    const newUser = await getUserById(result.id);
    return newUser;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

/**
 * Verifica as credenciais do usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha em texto plano
 * @returns {Object|null} Dados do usuário se as credenciais estiverem corretas
 */
async function validateUser(email, password) {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return null;
    }
    
    // Verificar a senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return null;
    }
    
    // Remover o hash da senha antes de retornar
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Erro ao validar usuário:', error);
    throw error;
  }
}

/**
 * Cria uma nova sessão para o usuário
 * @param {number} userId - ID do usuário
 * @returns {string} Token da sessão
 */
async function createSession(userId) {
  try {
    // Gerar token único
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    // Definir expiração para 24 horas
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Inserir a sessão no banco
    const db = getDatabase();
    await db.run(
      'INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)',
      [userId, sessionToken, expiresAt.toISOString()]
    );
    
    return sessionToken;
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    throw error;
  }
}

/**
 * Valida uma sessão e retorna os dados do usuário
 * @param {string} sessionToken - Token da sessão
 * @returns {Object|null} Dados do usuário se a sessão for válida
 */
async function validateSession(sessionToken) {
  try {
    const db = getDatabase();
    const session = await db.get(
      `SELECT s.*, u.* FROM user_sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.session_token = ? AND s.expires_at > datetime('now')`,
      [sessionToken]
    );
    
    if (!session) {
      return null;
    }
    
    // Remover dados sensíveis antes de retornar
    const { password_hash, session_token, expires_at, ...userData } = session;
    return userData;
  } catch (error) {
    console.error('Erro ao validar sessão:', error);
    throw error;
  }
}

/**
 * Remove uma sessão (logout)
 * @param {string} sessionToken - Token da sessão
 */
async function removeSession(sessionToken) {
  try {
    const db = getDatabase();
    await db.run(
      'DELETE FROM user_sessions WHERE session_token = ?',
      [sessionToken]
    );
  } catch (error) {
    console.error('Erro ao remover sessão:', error);
    throw error;
  }
}

/**
 * Remove sessões expiradas (limpeza automática)
 */
async function cleanExpiredSessions() {
  try {
    const db = getDatabase();
    await db.run(
      'DELETE FROM user_sessions WHERE expires_at < datetime("now")'
    );
  } catch (error) {
    console.error('Erro ao limpar sessões expiradas:', error);
    throw error;
  }
}

/**
 * Busca métricas do usuário para o dashboard
 * @param {number} userId - ID do usuário
 * @returns {Object} Métricas do usuário
 */
async function getUserMetrics(userId) {
  try {
    const db = getDatabase();
    // Buscar métricas agregadas do progresso do usuário
    const metrics = await db.get(
      `SELECT 
        SUM(up.lessons_watched) as lessons_watched,
        SUM(CASE WHEN up.completed_at > date('now', '-7 days') THEN up.lessons_watched ELSE 0 END) as lessons_this_week,
        SUM(up.courses_completed) as courses_completed,
        SUM(CASE WHEN up.completed_at > date('now', '-30 days') THEN up.courses_completed ELSE 0 END) as courses_this_month,
        SUM(up.challenges_delivered) as challenges_completed,
        COUNT(CASE WHEN up.status = 'in_progress' THEN 1 END) as challenges_pending,
        SUM(up.quizzes_completed) as quizzes_completed,
        ROUND(AVG(CASE WHEN up.quizzes_completed > 0 THEN (up.quizzes_completed * 85.0) END), 0) as average_quiz_score
       FROM user_progress up
       WHERE up.user_id = ?`,
      [userId]
    );
    
    return {
      lessons_watched: metrics?.lessons_watched || 0,
      lessons_this_week: metrics?.lessons_this_week || 0,
      courses_completed: metrics?.courses_completed || 0,
      courses_this_month: metrics?.courses_this_month || 0,
      challenges_completed: metrics?.challenges_completed || 0,
      challenges_pending: metrics?.challenges_pending || 0,
      quizzes_completed: metrics?.quizzes_completed || 0,
      average_quiz_score: metrics?.average_quiz_score || 0
    };
  } catch (error) {
    console.error('Erro ao buscar métricas do usuário:', error);
    throw error;
  }
}

/**
 * Busca progresso dos pacotes do usuário
 * @param {number} userId - ID do usuário
 * @param {number} packageId - ID do pacote (opcional, para buscar um específico)
 * @returns {Array|Object} Progresso dos pacotes ou de um pacote específico
 */
async function getUserProgress(userId, packageId = null) {
  try {
    let query = `
      SELECT 
        p.id as package_id,
        p.name as package_name,
        p.description as package_description,
        up.lessons_watched as lessons_completed,
        (SELECT COUNT(*) FROM lessons l WHERE l.package_id = p.id) as total_lessons,
        up.quizzes_completed,
        (SELECT COUNT(*) FROM quizzes q JOIN lessons l ON q.lesson_id = l.id WHERE l.package_id = p.id) as total_quizzes,
        up.progress_percentage as completion_percentage,
        COALESCE(up.progress_percentage * 10, 0) as time_spent_minutes,
        up.completed_at as last_accessed,
        0 as current_streak,
        p.current_lesson
      FROM packages p
      LEFT JOIN user_progress up ON p.id = up.package_id AND up.user_id = ?
      WHERE up.user_id IS NOT NULL AND up.status != 'not_started'`;
    
    let params = [userId];
    
    if (packageId) {
      query += ' AND p.id = ?';
      params.push(packageId);
    }
    
    query += ' ORDER BY up.completed_at DESC NULLS LAST';
    
    const db = getDatabase();
    if (packageId) {
      const result = await db.get(query, params);
      return result || null;
    } else {
      const results = await db.all(query, params);
      return results || [];
    }
  } catch (error) {
    console.error('Erro ao buscar progresso do usuário:', error);
    throw error;
  }
}

/**
 * Busca atividade recente do usuário
 * @param {number} userId - ID do usuário
 * @param {number} limit - Limite de registros (padrão: 10)
 * @returns {Array} Atividades recentes do usuário
 */
async function getUserRecentActivity(userId, limit = 10) {
  try {
    const db = getDatabase();
    // Buscar progresso do usuário para gerar atividades baseadas no progresso
    const userProgress = await db.all(
      `SELECT 
        p.name as package_name,
        up.status,
        up.lessons_watched,
        up.quizzes_completed,
        up.completed_at,
        up.created_at
       FROM user_progress up
       JOIN packages p ON up.package_id = p.id
       WHERE up.user_id = ? AND up.status != 'not_started'
       ORDER BY COALESCE(up.completed_at, up.created_at) DESC
       LIMIT ?`,
      [userId, limit]
    );
    
    // Gerar atividades baseadas no progresso
    const activities = [];
    
    userProgress.forEach(progress => {
      if (progress.lessons_watched > 0) {
        activities.push({
          activity_type: 'lesson',
          description: `Assistiu ${progress.lessons_watched} aulas de ${progress.package_name}`,
          xp_earned: progress.lessons_watched * 50,
          created_at: progress.completed_at || progress.created_at
        });
      }
      
      if (progress.quizzes_completed > 0) {
        activities.push({
          activity_type: 'quiz',
          description: `Completou ${progress.quizzes_completed} questionários de ${progress.package_name}`,
          xp_earned: progress.quizzes_completed * 75,
          created_at: progress.completed_at || progress.created_at
        });
      }
      
      if (progress.status === 'completed') {
        activities.push({
          activity_type: 'achievement',
          description: `Concluiu o pacote ${progress.package_name}`,
          xp_earned: 200,
          created_at: progress.completed_at
        });
      }
    });
    
    // Ordenar por data e limitar
    return activities
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
      
  } catch (error) {
    console.error('Erro ao buscar atividade recente do usuário:', error);
    throw error;
  }
}



module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  validateUser,
  createSession,
  validateSession,
  removeSession,
  cleanExpiredSessions,
  getUserMetrics,
  getUserProgress,
  getUserRecentActivity
}; 