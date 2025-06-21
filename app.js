/**
 * CodePath - Plataforma Educacional de Tecnologia
 * Arquivo principal do servidor Express
 * 
 * Este arquivo configura o servidor Express com todas as configurações
 * necessárias para o funcionamento da aplicação CodePath.
 */

// Importação das dependências principais
const express = require('express');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

// Importação da configuração do banco de dados
const { initializeDatabase, database } = require('./models/database');
const { setDatabaseInstance } = require('./models/databaseConnection');

// Importação dos middlewares de autenticação
const { validateSessionMiddleware, addUserToViews } = require('./middleware/auth');

// Importação dos middlewares de segurança
const { 
  securityHeaders, 
  sanitizeInput, 
  checkBlockedIP,
  rateLimiter 
} = require('./middleware/security');

// Importação do sistema de cache
const { 
  cacheMiddleware, 
  invalidateCacheMiddleware, 
  setupCacheCleanup 
} = require('./middleware/cache');

// Importação do sistema de compressão
const compression = require('compression');

// Importação das rotas
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const careerRoutes = require('./routes/careerRoutes');
const contentRoutes = require('./routes/contentRoutes');
const quizRoutes = require('./routes/quizRoutes');
const progressRoutes = require('./routes/progressRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const xpRoutes = require('./routes/xpRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const securityRoutes = require('./routes/securityRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');

// Inicialização da aplicação Express
const app = express();

// Configuração da porta do servidor
const PORT = process.env.PORT || 4000;

// ========================================
// CONFIGURAÇÃO DO TEMPLATE ENGINE
// ========================================

// Configuração do Mustache como template engine
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// ========================================
// MIDDLEWARES GLOBAIS
// ========================================

// Compressão gzip/deflate (deve ser um dos primeiros)
app.use(compression({
  filter: (req, res) => {
    // Não comprimir se houver header específico
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Usar compressão padrão do compression
    return compression.filter(req, res);
  },
  level: 6, // Nível de compressão balanceado
  threshold: 1024 // Só comprimir arquivos > 1KB
}));

// Middleware de headers de segurança (deve ser o primeiro)
app.use(securityHeaders);

// Middleware de verificação de IP bloqueado
app.use(checkBlockedIP);

// Rate limiting global
app.use(rateLimiter({
  limit: 1000,
  windowMinutes: 15,
  message: 'Muitas requisições do seu IP. Tente novamente em alguns minutos.'
}));

// Middleware para parsing de dados de formulários
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware de sanitização de dados
app.use(sanitizeInput);

// Configuração de arquivos estáticos com cache otimizado
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d', // Cache por 1 dia
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Cache mais longo para assets que não mudam frequentemente
    if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 dia
    } else if (filePath.endsWith('.png') || filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.gif')) {
      res.setHeader('Cache-Control', 'public, max-age=604800'); // 1 semana
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hora para outros arquivos
    }
  }
}));

// Rota de teste muito simples (antes de tudo)
app.get('/debug-test', (req, res) => {
  res.send('DEBUG: Servidor funcionando!');
});

// Configuração de sessões
app.use(session({
  secret: process.env.SESSION_SECRET || 'codepath-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Mude para true em produção com HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    httpOnly: true, // Previne acesso via JavaScript
    sameSite: 'strict' // Proteção CSRF adicional
  }
}));

// Rota de teste (antes da autenticação)
app.get('/test-lesson', (req, res) => {
  res.send(`
    <html>
      <head><title>Teste</title></head>
      <body>
        <h1>🧪 Teste de Servidor</h1>
        <p>Se você está vendo esta mensagem, o servidor está funcionando!</p>
        <p>Hora atual: ${new Date().toLocaleString('pt-BR')}</p>
      </body>
    </html>
  `);
});

// Rota de teste para aula (com autenticação simples)
app.get('/test-lesson-auth', (req, res) => {
  // Simular dados da aula
  const lessonContent = {
    content: `
      <div style="padding: 2rem; background: white; border-radius: 12px; margin: 2rem 0;">
        <h1>🎯 Teste da Aula de C - Introdução</h1>
        <p>Este é um teste para verificar se o conteúdo da aula está sendo renderizado corretamente.</p>
        
        <div style="background: #f0f9ff; border: 2px solid #0ea5e9; padding: 1.5rem; border-radius: 8px; margin: 1rem 0;">
          <h3>✅ Checklist de Funcionamento</h3>
          <ul>
            <li>✅ Servidor está funcionando</li>
            <li>✅ Rota está acessível</li>
            <li>✅ Conteúdo está sendo exibido</li>
            <li>✅ CSS está sendo aplicado</li>
          </ul>
        </div>
        
        <h2>Exemplo de Código C</h2>
        <div style="background: #1e1e1e; color: #f8f8f2; padding: 1rem; border-radius: 8px; font-family: monospace;">
#include &lt;stdio.h&gt;

int main() {
    printf("Olá, mundo!\\n");
    return 0;
}
        </div>
        
        <p><strong>Status:</strong> Teste funcionando! 🎉</p>
      </div>
    `
  };
  
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Teste - Aula de C</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          margin: 0; 
          padding: 2rem; 
        }
        .container { 
          max-width: 1000px; 
          margin: 0 auto; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${lessonContent.content}
      </div>
    </body>
    </html>
  `);
});

// Middlewares de autenticação
app.use(validateSessionMiddleware);
app.use(addUserToViews);

// ========================================
// CONFIGURAÇÃO DAS ROTAS
// ========================================

// Rota principal - redireciona baseado na autenticação (deve vir ANTES das outras)
app.get('/', async (req, res) => {
  // Se usuário está logado, redirecionar para dashboard
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  
  // Se não está logado, redirecionar para login
  res.redirect('/login');
});

// Usar as rotas de autenticação
app.use('/', authRoutes);

// Usar as rotas do dashboard
app.use('/dashboard', dashboardRoutes);

// Usar as rotas de carreiras
app.use('/', careerRoutes);

// Usar as rotas de conteúdos
app.use('/content', contentRoutes);

// Usar as rotas de questionários
app.use('/', quizRoutes);

// Usar as rotas de progresso com cache
app.use('/', cacheMiddleware('progress', (req) => `progress_${req.session?.user?.id}_${req.path}`, 120), progressRoutes);

// Usar as rotas de notificações
app.use('/notifications', notificationRoutes);

// Usar as rotas de XP e gamificação com invalidação de cache
app.use('/xp', invalidateCacheMiddleware('user', (req) => `user_${req.session?.user?.id}`), xpRoutes);

// Usar as rotas de conquistas com cache
app.use('/achievements', cacheMiddleware('user', (req) => `achievements_${req.session?.user?.id}`, 300), achievementRoutes);

// Usar as rotas de segurança
app.use('/security', securityRoutes);

// Usar as rotas de chat e comunidade
app.use('/chat', chatRoutes);

// Usar as rotas do usuário (Minha Área)
app.use('/', userRoutes);

// Usar as rotas de analytics com cache
const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/analytics', cacheMiddleware('static', (req) => `analytics_${req.path}`, 600), analyticsRoutes);

// ========================================
// ROTAS DE TESTE
// ========================================

// Rota temporária para testar o servidor e banco
app.get('/test', async (req, res) => {
  try {
    // Testar conexão com o banco
    const packages = await database.all('SELECT COUNT(*) as total FROM packages');
    const users = await database.all('SELECT COUNT(*) as total FROM users');
    const totalPackages = packages[0]?.total || 0;
    const totalUsers = users[0]?.total || 0;
    
    res.send(`
      <html>
        <head>
          <title>CodePath - Servidor Funcionando</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 50px;
              background: linear-gradient(135deg, #8B5CF6, #A855F7);
              color: white;
              min-height: 100vh;
              margin: 0;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: rgba(255, 255, 255, 0.1);
              padding: 40px;
              border-radius: 20px;
              backdrop-filter: blur(10px);
            }
            h1 { font-size: 3em; margin-bottom: 20px; }
            p { font-size: 1.2em; margin-bottom: 15px; }
            .status { color: #4ade80; font-weight: bold; }
            .db-info { 
              background: rgba(255, 255, 255, 0.1); 
              padding: 20px; 
              border-radius: 10px; 
              margin: 20px 0; 
            }
            .link { color: #60a5fa; text-decoration: none; }
            .link:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 CodePath</h1>
            <p class="status">✅ Servidor Express funcionando!</p>
            <p><strong>Fase 2:</strong> Banco de Dados Configurado</p>
            
            <div class="db-info">
              <h3>📊 Status do Banco de Dados</h3>
              <p>✅ Conexão SQLite: <strong>Ativa</strong></p>
              <p>📦 Pacotes cadastrados: <strong>${totalPackages}</strong></p>
              <p>👤 Usuários cadastrados: <strong>${totalUsers}</strong></p>
            </div>
            
            <p>Porta: ${PORT}</p>
            <p>Ambiente: ${process.env.NODE_ENV || 'development'}</p>
            <p><em>Descubra o seu caminho na tecnologia</em></p>
            
            <div style="margin-top: 30px;">
              <a href="/test-db" class="link">🔍 Testar Dados do Banco</a>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Erro ao consultar banco:', error);
    res.status(500).send(`
      <html>
        <head><title>Erro - CodePath</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px; background: #8B5CF6; color: white;">
          <h1>❌ Erro no Banco de Dados</h1>
          <p>Não foi possível conectar ao banco SQLite</p>
          <p>Erro: ${error.message}</p>
        </body>
      </html>
    `);
  }
});

// Rota para testar dados do banco
app.get('/test-db', async (req, res) => {
  try {
    // Buscar dados de exemplo do banco
    const packages = await database.all('SELECT * FROM packages LIMIT 6');
    const careerProfiles = await database.all('SELECT * FROM career_profiles LIMIT 6');
    const user = await database.database.get('SELECT * FROM users WHERE id = 1');
    
    res.send(`
      <html>
        <head>
          <title>Teste do Banco - CodePath</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              background: linear-gradient(135deg, #8B5CF6, #A855F7);
              color: white;
              min-height: 100vh;
              margin: 0;
            }
            .container { max-width: 1000px; margin: 0 auto; }
            .section { 
              background: rgba(255, 255, 255, 0.1); 
              padding: 20px; 
              border-radius: 10px; 
              margin: 20px 0; 
            }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }
            .card { 
              background: rgba(255, 255, 255, 0.1); 
              padding: 15px; 
              border-radius: 8px; 
              border-left: 4px solid #60a5fa;
            }
            .back-link { color: #60a5fa; text-decoration: none; font-size: 18px; }
            .back-link:hover { text-decoration: underline; }
            h1, h2 { margin-top: 0; }
            .user-info { background: rgba(76, 175, 80, 0.2); }
          </style>
        </head>
        <body>
          <div class="container">
            <a href="/" class="back-link">← Voltar</a>
            
            <h1>🧪 Teste do Banco de Dados</h1>
            
            ${user ? `
            <div class="section user-info">
              <h2>👤 Usuário de Teste</h2>
              <p><strong>Nome:</strong> ${user.name}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Nível:</strong> ${user.level}</p>
              <p><strong>XP:</strong> ${user.xp_points}</p>
              <p><strong>Streak:</strong> ${user.streak_days} dias</p>
            </div>
            ` : '<p>❌ Nenhum usuário encontrado</p>'}
            
            <div class="section">
              <h2>📦 Pacotes de Tecnologia</h2>
              <div class="grid">
                ${packages.map(pkg => `
                  <div class="card">
                    <h3>${pkg.name}</h3>
                    <p><strong>Ícone:</strong> ${pkg.icon}</p>
                    <p><strong>Aula Atual:</strong> ${pkg.current_lesson}</p>
                    <p><strong>Progresso:</strong> ${pkg.progress_percentage}%</p>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="section">
              <h2>👥 Perfis Profissionais</h2>
              <div class="grid">
                ${careerProfiles.map(profile => `
                  <div class="card">
                    <h3>${profile.name}</h3>
                    <p><strong>Ícone:</strong> ${profile.icon}</p>
                    <p>${profile.description}</p>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="section">
              <h2>✅ Status da Fase 2</h2>
              <p>✅ Conexão SQLite funcionando</p>
              <p>✅ Tabelas criadas com sucesso</p>
              <p>✅ Dados iniciais inseridos</p>
              <p>✅ Queries funcionando corretamente</p>
              <p><strong>Próxima:</strong> Fase 3 - Sistema de Autenticação</p>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px; background: #8B5CF6; color: white;">
          <h1>❌ Erro ao Buscar Dados</h1>
          <p>Erro: ${error.message}</p>
          <a href="/" style="color: #60a5fa;">← Voltar</a>
        </body>
      </html>
    `);
  }
});

// ========================================
// ROTA DE TESTE PARA DEBUG
// ========================================

// ========================================
// TRATAMENTO DE ERROS
// ========================================

// Middleware para rotas não encontradas (404)
app.use((req, res) => {
  res.status(404).send(`
    <html>
      <head>
        <title>Página não encontrada - CodePath</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px;
            background: linear-gradient(135deg, #8B5CF6, #A855F7);
            color: white;
          }
        </style>
      </head>
      <body>
        <h1>404 - Página não encontrada</h1>
        <p>A página que você procura não existe.</p>
        <a href="/" style="color: white;">Voltar ao início</a>
      </body>
    </html>
  `);
});

// Middleware para tratamento de erros gerais
app.use((err, req, res, next) => {
  console.error('=== ERRO CAPTURADO PELO MIDDLEWARE ===');
  console.error('Tipo do erro:', typeof err);
  console.error('Erro completo:', err);
  console.error('Stack trace:', err?.stack);
  console.error('Mensagem:', err?.message);
  console.error('URL:', req.url);
  console.error('Método:', req.method);
  console.error('Headers:', req.headers);
  console.error('=== FIM DO ERRO ===');
  
  // Verificar se a resposta já foi enviada
  if (res.headersSent) {
    console.log('⚠️ Resposta já foi enviada, não enviando erro 500');
    return next(err);
  }
  
  res.status(500).send(`
    <html>
      <head>
        <title>Erro interno - CodePath</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px;
            background: linear-gradient(135deg, #8B5CF6, #A855F7);
            color: white;
          }
        </style>
      </head>
      <body>
        <h1>500 - Erro interno do servidor</h1>
        <p>Algo deu errado. Tente novamente mais tarde.</p>
        <a href="/" style="color: white;">Voltar ao início</a>
      </body>
    </html>
  `);
});

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================

/**
 * Função para inicializar o servidor
 */
async function startServer() {
  try {
    // Inicializar conexão com banco de dados
    console.log('🔄 Inicializando banco de dados...');
    await database.initialize();
    
    // Configurar a instância global do banco
    setDatabaseInstance(database);
    console.log('🎉 Banco de dados pronto para uso!');
    
    // Inicializar sistema de limpeza de cache
    setupCacheCleanup();
    console.log('🗄️ Sistema de cache inicializado');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('🚀 ========================================');
      console.log('   CodePath - Servidor Iniciado');
      console.log('🚀 ========================================');
      console.log(`   📍 URL: http://localhost:${PORT}`);
      console.log(`   🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   📅 Iniciado em: ${new Date().toLocaleString('pt-BR')}`);
      console.log('🚀 ========================================');
      console.log('   ✅ Fase 21: Sistema de Pacotes Interativo');
      console.log('   🎯 10 Pacotes + Filtros + Modal de Preview');
      console.log('   📋 Próxima: Fase 22 - Quizzes Funcionais');
      console.log('🚀 ========================================');
    });
    
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Inicializar o servidor
startServer();

// Exportar a aplicação para testes
module.exports = app; 