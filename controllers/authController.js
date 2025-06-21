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
const ValidationModel = require('../models/validationModel');

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
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  
  try {
    console.log('[AUTH] Iniciando processo de login...');
    const { email, password } = req.body;
    console.log(`[AUTH] Email recebido: ${email}`);
    
    // Sanitizar dados de entrada
    const sanitizedEmail = ValidationModel.sanitizeEmail(email);
    
    // Validar campos obrigatórios
    if (!sanitizedEmail || !password) {
      console.log('[AUTH] Erro: Campos obrigatórios não preenchidos');
      
      // Log tentativa de login com dados inválidos
      await ValidationModel.logLoginAttempt(sanitizedEmail || 'EMPTY', ip, false);
      
      return res.render('pages/login', {
        title: 'Login - CodePath',
        pageTitle: 'Faça seu login',
        subtitle: 'Descubra o seu caminho na tecnologia',
        additionalCSS: 'auth',
        error: 'Email e senha são obrigatórios',
        email: sanitizedEmail
      });
    }
    
    // Validar formato do email
    if (!ValidationModel.isValidEmail(sanitizedEmail)) {
      await ValidationModel.logLoginAttempt(sanitizedEmail, ip, false);
      
      return res.render('pages/login', {
        title: 'Login - CodePath',
        pageTitle: 'Faça seu login',
        subtitle: 'Descubra o seu caminho na tecnologia',
        additionalCSS: 'auth',
        error: 'Por favor, insira um email válido',
        email: sanitizedEmail
      });
    }
    
    console.log('[AUTH] Validando credenciais...');
    // Validar credenciais
    let user;
    try {
      user = await validateUser(sanitizedEmail, password);
    } catch (validationError) {
      console.error('[AUTH] Erro na validação de credenciais:', validationError);
      
      // Log tentativa de login com erro
      try {
        await ValidationModel.logLoginAttempt(sanitizedEmail, ip, false);
      } catch (logError) {
        console.error('[AUTH] Erro ao registrar tentativa de login:', logError);
      }
      
      return res.render('pages/login', {
        title: 'Login - CodePath',
        pageTitle: 'Faça seu login',
        subtitle: 'Descubra o seu caminho na tecnologia',
        additionalCSS: 'auth',
        error: 'Erro interno do sistema. Tente novamente.',
        email: sanitizedEmail
      });
    }
    
    if (!user) {
      console.log('[AUTH] Erro: Credenciais inválidas');
      
      // Log tentativa de login falhada
      try {
        await ValidationModel.logLoginAttempt(sanitizedEmail, ip, false);
        
        // Log atividade suspeita para múltiplas tentativas
        await ValidationModel.logSuspiciousActivity(
          null,
          'failed_login',
          ip,
          JSON.stringify({
            email: sanitizedEmail,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString()
          })
        );
      } catch (logError) {
        console.error('[AUTH] Erro ao registrar tentativa falhada:', logError);
      }
      
      return res.render('pages/login', {
        title: 'Login - CodePath',
        pageTitle: 'Faça seu login',
        subtitle: 'Descubra o seu caminho na tecnologia',
        additionalCSS: 'auth',
        error: 'Email ou senha incorretos',
        email: sanitizedEmail
      });
    }
    
    console.log(`[AUTH] Usuário validado: ${user.email}, ID: ${user.id}`);
    
    console.log('[AUTH] Criando sessão...');
    // Criar sessão
    let sessionToken;
    try {
      sessionToken = await createSession(user.id);
      console.log(`[AUTH] Sessão criada: ${sessionToken.substring(0, 10)}...`);
    } catch (sessionError) {
      console.error('[AUTH] Erro ao criar sessão:', sessionError);
      
      return res.render('pages/login', {
        title: 'Login - CodePath',
        pageTitle: 'Faça seu login',
        subtitle: 'Descubra o seu caminho na tecnologia',
        additionalCSS: 'auth',
        error: 'Erro interno do sistema. Tente novamente.',
        email: sanitizedEmail
      });
    }
    
    console.log('[AUTH] Salvando dados na sessão...');
    // Salvar dados na sessão
    req.session.user = user;
    req.session.sessionToken = sessionToken;
    
    // Log de sucesso
    console.log(`[AUTH] Login realizado com sucesso: ${user.email}`);
    
    // Log tentativa de login bem-sucedida
    try {
      await ValidationModel.logLoginAttempt(sanitizedEmail, ip, true);
    } catch (logError) {
      console.error('[AUTH] Erro ao registrar login bem-sucedido:', logError);
    }
    
    console.log('[AUTH] Redirecionando para dashboard...');
    // Redirecionar para dashboard
    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('Erro ao processar login:', error);
    console.error('Stack trace:', error.stack);
    
    // Log erro como atividade suspeita
    await ValidationModel.logSuspiciousActivity(
      null,
      'login_error',
      ip,
      JSON.stringify({
        error: error.message,
        email: req.body.email,
        userAgent: req.get('User-Agent')
      })
    );
    
    res.render('pages/login', {
      title: 'Login - CodePath',
      pageTitle: 'Faça seu login',
      subtitle: 'Descubra o seu caminho na tecnologia',
      additionalCSS: 'auth',
      error: 'Erro interno do servidor. Tente novamente.',
      email: ValidationModel.sanitizeEmail(req.body.email)
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
    
    // Validar força da senha
    const passwordValidation = ValidationModel.validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.render('pages/register', {
        title: 'Cadastro - CodePath',
        pageTitle: 'Crie sua conta',
        subtitle: 'Comece sua jornada na tecnologia',
        additionalCSS: 'auth',
        error: passwordValidation.errors.join('. '),
        formData: { name, email, birthDate, educationLevel }
      });
    }
    
    // Sanitizar e validar email
    const sanitizedEmail = ValidationModel.sanitizeEmail(email);
    if (!ValidationModel.isValidEmail(sanitizedEmail)) {
      return res.render('pages/register', {
        title: 'Cadastro - CodePath',
        pageTitle: 'Crie sua conta',
        subtitle: 'Comece sua jornada na tecnologia',
        additionalCSS: 'auth',
        error: 'Por favor, insira um email válido',
        formData: { name: ValidationModel.sanitizeString(name), email: sanitizedEmail, birthDate, educationLevel }
      });
    }
    
    // Validar nome
    const nameValidation = ValidationModel.validateName(name);
    if (!nameValidation.isValid) {
      return res.render('pages/register', {
        title: 'Cadastro - CodePath',
        pageTitle: 'Crie sua conta',
        subtitle: 'Comece sua jornada na tecnologia',
        additionalCSS: 'auth',
        error: nameValidation.errors.join('. '),
        formData: { name: ValidationModel.sanitizeString(name), email: sanitizedEmail, birthDate, educationLevel }
      });
    }
    
    // Criar usuário com dados sanitizados
    const newUser = await createUser({
      name: ValidationModel.sanitizeString(name),
      email: sanitizedEmail,
      password,
      birthDate,
      educationLevel: ValidationModel.sanitizeString(educationLevel)
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
    const userEmail = req.session.user?.email || 'Usuário desconhecido';
    
    // Remover sessão do banco de dados se existir
    if (req.session.sessionToken) {
      try {
        await removeSession(req.session.sessionToken);
        console.log(`[AUTH] Sessão removida do banco: ${userEmail}`);
      } catch (sessionError) {
        console.error('[AUTH] Erro ao remover sessão do banco:', sessionError);
        // Continua com o logout mesmo se não conseguir remover do banco
      }
    }
    
    // Log de logout
    console.log(`[AUTH] Logout realizado: ${userEmail}`);
    
    // Destruir sessão
    req.session.destroy((err) => {
      if (err) {
        console.error('[AUTH] Erro ao destruir sessão:', err);
      }
      
      // Limpar cookie de sessão
      res.clearCookie('connect.sid');
      
      // Redirecionar para login
      res.redirect('/login');
    });
    
  } catch (error) {
    console.error('[AUTH] Erro ao processar logout:', error);
    
    // Mesmo com erro, destruir a sessão local
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
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