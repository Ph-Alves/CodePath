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
    const { email, password } = req.body;
    
    // Validar campos obrigatórios
    if (!email || !password) {
      return res.render('pages/login', {
        title: 'Login - CodePath',
        pageTitle: 'Faça seu login',
        subtitle: 'Descubra o seu caminho na tecnologia',
        error: 'Email e senha são obrigatórios',
        email: email // Manter o email preenchido
      });
    }
    
    // Validar credenciais
    const user = await validateUser(email, password);
    if (!user) {
      return res.render('pages/login', {
        title: 'Login - CodePath',
        pageTitle: 'Faça seu login',
        subtitle: 'Descubra o seu caminho na tecnologia',
        error: 'Email ou senha incorretos',
        email: email
      });
    }
    
    // Criar sessão
    const sessionToken = await createSession(user.id);
    
    // Salvar dados na sessão
    req.session.user = user;
    req.session.sessionToken = sessionToken;
    
    // Log de sucesso
    console.log(`[AUTH] Login realizado com sucesso: ${user.email}`);
    
    // Redirecionar para dashboard
    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('Erro ao processar login:', error);
    res.render('pages/login', {
      title: 'Login - CodePath',
      pageTitle: 'Faça seu login',
      subtitle: 'Descubra o seu caminho na tecnologia',
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
    
    // Exibir mensagem de sucesso
    res.render('pages/register', {
      title: 'Cadastro - CodePath',
      pageTitle: 'Crie sua conta',
      subtitle: 'Comece sua jornada na tecnologia',
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