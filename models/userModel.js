/**
 * CodePath - User Model
 * Modelo para operações de usuário e autenticação
 * 
 * Este arquivo contém todas as funções para manipulação de dados
 * de usuários, incluindo autenticação e sessões.
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { database } = require('./database');

/**
 * Busca um usuário pelo email
 * @param {string} email - Email do usuário
 * @returns {Object|null} Dados do usuário ou null se não encontrado
 */
async function getUserByEmail(email) {
  try {
    const user = await database.get(
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
    const user = await database.get(
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
    const result = await database.run(
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
    await database.run(
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
    const session = await database.get(
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
    await database.run(
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
    await database.run(
      'DELETE FROM user_sessions WHERE expires_at < datetime("now")'
    );
  } catch (error) {
    console.error('Erro ao limpar sessões expiradas:', error);
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
  cleanExpiredSessions
}; 