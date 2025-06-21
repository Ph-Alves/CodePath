/**
 * CodePath - Authentication Controller
 * Controlador para operações de autenticação
 * 
 * Este arquivo contém as funções para processar login, registro,
 * logout e outras operações relacionadas à autenticação.
 */

const { 
  createUser, 
  validateUser, 
  createSession, 
  removeSession 
} = require('../models/userModel');
const { createSystemNotifications } = require('./notificationController');

/**
 * Exibe a página de login
 */
function showLogin(req, res) {
  try {
    // Renderizar a página de login
    res.render('pages/login', {
      title: 'Login - CodePath',
      pageTitle: 'Faça seu login',
      subtitle: 'Descubra o seu caminho na tecnologia',
      additionalCSS: 'auth',
      error: null
    });
  } catch (error) {
    console.error('Erro ao exibir página de login:', error);
    res.status(500).send('Erro interno do servidor');
  }
}

/**
 * Processa o login do usuário
 */
async function processLogin(req, res) {
  try {
    console.log('[AUTH] Iniciando processo de login...');
    const { email, password } = req.body;
    console.log(`[AUTH] Email recebido: ${email}`);
    
    // Validar campos obrigatórios
    if (!email || !password) {
      console.log('[AUTH] Erro: Campos obrigatórios não preenchidos');
      return res.render('pages/login', {
        title: 'Login - CodePath',
        pageTitle: 'Faça seu login',
        subtitle: 'Descubra o seu caminho na tecnologia',
        additionalCSS: 'auth',
        error: 'Email e senha são obrigatórios',
        email: email // Manter o email preenchido
      });
    }
    
    console.log('[AUTH] Validando credenciais...');
    // Validar credenciais
    const user = await validateUser(email, password);
    if (!user) {
      console.log('[AUTH] Erro: Credenciais inválidas');
      return res.render('pages/login', {
        title: 'Login - CodePath',
        pageTitle: 'Faça seu login',
        subtitle: 'Descubra o seu caminho na tecnologia',
        additionalCSS: 'auth',
        error: 'Email ou senha incorretos',
        email: email
      });
    }
    
    console.log(`[AUTH] Usuário validado: ${user.email}, ID: ${user.id}`);
    
    console.log('[AUTH] Criando sessão...');
    // Criar sessão
    const sessionToken = await createSession(user.id);
    console.log(`[AUTH] Sessão criada: ${sessionToken.substring(0, 10)}...`);
    
    console.log('[AUTH] Salvando dados na sessão...');
    // Salvar dados na sessão
    req.session.user = user;
    req.session.sessionToken = sessionToken;
    
    // Log de sucesso
    console.log(`[AUTH] Login realizado com sucesso: ${user.email}`);
    
    console.log('[AUTH] Redirecionando para dashboard...');
    // Redirecionar para dashboard
    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('Erro ao processar login:', error);
    console.error('Stack trace:', error.stack);
    res.render('pages/login', {
      title: 'Login - CodePath',
      pageTitle: 'Faça seu login',
      subtitle: 'Descubra o seu caminho na tecnologia',
      additionalCSS: 'auth',
      error: 'Erro interno do servidor. Tente novamente.',
      email: req.body.email
    });
  }
}

/**
 * Exibe a página de registro
 */
function showRegister(req, res) {
  try {
    res.render('pages/register', {
      title: 'Cadastro - CodePath',
      pageTitle: 'Crie sua conta',
      subtitle: 'Comece sua jornada na tecnologia',
      additionalCSS: 'auth',
      error: null,
      success: null
    });
  } catch (error) {
    console.error('Erro ao exibir página de registro:', error);
    res.status(500).send('Erro interno do servidor');
  }
}

/**
 * Processa o registro de um novo usuário
 */
async function processRegister(req, res) {
  try {
    const { name, email, password, confirmPassword, birthDate, educationLevel } = req.body;
    
    // Validar campos obrigatórios
    if (!name || !email || !password || !confirmPassword) {
      return res.render('pages/register', {
        title: 'Cadastro - CodePath',
        pageTitle: 'Crie sua conta',
        subtitle: 'Comece sua jornada na tecnologia',
        additionalCSS: 'auth',
        error: 'Todos os campos obrigatórios devem ser preenchidos',
        formData: { name, email, birthDate, educationLevel }
      });
    }
    
    // Validar confirmação de senha
    if (password !== confirmPassword) {
      return res.render('pages/register', {
        title: 'Cadastro - CodePath',
        pageTitle: 'Crie sua conta',
        subtitle: 'Comece sua jornada na tecnologia',
        additionalCSS: 'auth',
        error: 'As senhas não coincidem',
        formData: { name, email, birthDate, educationLevel }
      });
    }
    
    // Validar tamanho da senha
    if (password.length < 6) {
      return res.render('pages/register', {
        title: 'Cadastro - CodePath',
        pageTitle: 'Crie sua conta',
        subtitle: 'Comece sua jornada na tecnologia',
        additionalCSS: 'auth',
        error: 'A senha deve ter pelo menos 6 caracteres',
        formData: { name, email, birthDate, educationLevel }
      });
    }
    
    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.render('pages/register', {
        title: 'Cadastro - CodePath',
        pageTitle: 'Crie sua conta',
        subtitle: 'Comece sua jornada na tecnologia',
        additionalCSS: 'auth',
        error: 'Por favor, insira um email válido',
        formData: { name, email, birthDate, educationLevel }
      });
    }
    
    // Criar usuário
    const newUser = await createUser({
      name,
      email,
      password,
      birthDate,
      educationLevel
    });
    
    // Log de sucesso
    console.log(`[AUTH] Usuário criado com sucesso: ${newUser.email}`);
    
    // Criar notificação de boas-vindas
    try {
      await createSystemNotifications.welcome(newUser.id, newUser.name);
    } catch (notificationError) {
      console.error('Erro ao criar notificação de boas-vindas:', notificationError);
    }
    
    // Exibir mensagem de sucesso
    res.render('pages/register', {
      title: 'Cadastro - CodePath',
      pageTitle: 'Crie sua conta',
      subtitle: 'Comece sua jornada na tecnologia',
      additionalCSS: 'auth',
      success: 'Conta criada com sucesso! Você já pode fazer login.',
      error: null
    });
    
  } catch (error) {
    console.error('Erro ao processar registro:', error);
    
    // Tratar erro de email já existente
    let errorMessage = 'Erro interno do servidor. Tente novamente.';
    if (error.message === 'Email já cadastrado') {
      errorMessage = 'Este email já está em uso. Tente fazer login ou use outro email.';
    }
    
    res.render('pages/register', {
      title: 'Cadastro - CodePath',
      pageTitle: 'Crie sua conta',
      subtitle: 'Comece sua jornada na tecnologia',
      additionalCSS: 'auth',
      error: errorMessage,
      formData: { 
        name: req.body.name, 
        email: req.body.email, 
        birthDate: req.body.birthDate, 
        educationLevel: req.body.educationLevel 
      }
    });
  }
}

/**
 * Processa o logout do usuário
 */
async function processLogout(req, res) {
  try {
    // Remover sessão do banco de dados se existir
    if (req.session.sessionToken) {
      await removeSession(req.session.sessionToken);
    }
    
    // Log de logout
    console.log(`[AUTH] Logout realizado: ${req.session.user?.email || 'Usuário desconhecido'}`);
    
    // Destruir sessão
    req.session.destroy((err) => {
      if (err) {
        console.error('Erro ao destruir sessão:', err);
      }
      
      // Redirecionar para login
      res.redirect('/login');
    });
    
  } catch (error) {
    console.error('Erro ao processar logout:', error);
    
    // Mesmo com erro, destruir a sessão local
    req.session.destroy(() => {
      res.redirect('/login');
    });
  }
}



module.exports = {
  showLogin,
  processLogin,
  showRegister,
  processRegister,
  processLogout
}; 