/**
 * CodePath - Debug Script para Lesson View
 * Script para diagnosticar problemas na tela branca da visualização de aulas
 */

const express = require('express');
const mustacheExpress = require('mustache-express');
const path = require('path');

console.log('🔍 INICIANDO DIAGNÓSTICO DA TELA BRANCA...\n');

// Teste 1: Verificar se o template existe
console.log('📋 TESTE 1: Verificando arquivos de template...');
const fs = require('fs');

const templatePath = path.join(__dirname, '../views/pages/lesson-view.mustache');
const layoutPath = path.join(__dirname, '../views/layouts/main.mustache');

try {
  const templateExists = fs.existsSync(templatePath);
  const layoutExists = fs.existsSync(layoutPath);
  
  console.log(`✅ Template lesson-view.mustache: ${templateExists ? 'EXISTE' : 'NÃO EXISTE'}`);
  console.log(`✅ Layout main.mustache: ${layoutExists ? 'EXISTE' : 'NÃO EXISTE'}`);
  
  if (templateExists) {
    const templateSize = fs.statSync(templatePath).size;
    console.log(`📏 Tamanho do template: ${templateSize} bytes`);
  }
} catch (error) {
  console.error('❌ Erro ao verificar templates:', error.message);
}

// Teste 2: Verificar conexão com banco
console.log('\n📋 TESTE 2: Verificando conexão com banco...');
try {
  const { database } = require('../models/database');
  console.log('✅ Modelo de database importado com sucesso');
  
  // Testar query simples
  if (database && database.prepare) {
    const stmt = database.prepare('SELECT COUNT(*) as count FROM lessons');
    const result = stmt.get();
    console.log(`✅ Banco conectado - ${result.count} aulas encontradas`);
  } else {
    console.log('⚠️ Database não inicializado ou sem método prepare');
  }
} catch (error) {
  console.error('❌ Erro ao conectar com banco:', error.message);
}

// Teste 3: Criar servidor de teste simples
console.log('\n📋 TESTE 3: Criando servidor de teste...');

const app = express();

// Configurar Mustache
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, '../views'));

// Configurar arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Rota de teste ultra-simples
app.get('/test-simple', (req, res) => {
  console.log('🧪 Teste simples acessado');
  res.send(`
    <html>
      <head><title>Teste Simples</title></head>
      <body style="font-family: Arial; padding: 2rem; background: #f0f9ff;">
        <h1 style="color: #0ea5e9;">🧪 Teste de Servidor Simples</h1>
        <p>✅ Se você está vendo esta mensagem, o servidor básico está funcionando!</p>
        <p>⏰ Timestamp: ${new Date().toLocaleString('pt-BR')}</p>
        <hr>
        <h2>Próximos Testes:</h2>
        <ul>
          <li><a href="/test-template">Teste de Template Mustache</a></li>
          <li><a href="/test-lesson-mock">Teste de Aula Mock</a></li>
          <li><a href="/test-auth-mock">Teste com Autenticação Mock</a></li>
        </ul>
      </body>
    </html>
  `);
});

// Rota de teste de template
app.get('/test-template', (req, res) => {
  console.log('🧪 Teste de template acessado');
  try {
    res.render('pages/lesson-view', {
      layout: false, // Sem layout para isolar problemas
      lesson: {
        id: 999,
        name: 'Teste de Aula Debug',
        description: 'Esta é uma aula de teste para debug',
        package_name: 'Pacote Debug',
        package_id: 999
      },
      debugInfo: {
        lessonId: 999,
        hasContent: false,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Erro no template:', error);
    res.status(500).send(`
      <h1>Erro no Template</h1>
      <p>Erro: ${error.message}</p>
      <pre>${error.stack}</pre>
    `);
  }
});

// Rota de teste com dados mock completos
app.get('/test-lesson-mock', (req, res) => {
  console.log('🧪 Teste de aula mock acessado');
  
  const mockData = {
    title: 'Teste - Aula de C',
    additionalCSS: ['content', 'lesson-viewer'],
    additionalJS: 'lesson-viewer',
    user: {
      id: 1,
      name: 'Usuário Teste',
      email: 'teste@codepath.com',
      level: 5,
      xp_points: 1250
    },
    lesson: {
      id: 1,
      name: 'Introdução ao C',
      description: 'Primeira aula de programação em C',
      package_name: 'Fundamentos de C',
      package_id: 1,
      lesson_number: 1,
      package_icon: '🔧'
    },
    progressStats: {
      progressPercentage: 25,
      completedLessons: 2,
      totalLessons: 8
    },
    debugInfo: {
      lessonId: 1,
      hasContent: true,
      timestamp: new Date().toISOString()
    }
  };
  
  try {
    res.render('pages/lesson-view', mockData);
  } catch (error) {
    console.error('❌ Erro no teste mock:', error);
    res.status(500).send(`
      <h1>Erro no Teste Mock</h1>
      <p>Erro: ${error.message}</p>
      <pre>${error.stack}</pre>
    `);
  }
});

// Rota de teste com autenticação simulada
app.get('/test-auth-mock', (req, res) => {
  console.log('🧪 Teste com auth mock acessado');
  
  // Simular sessão
  req.session = {
    user: {
      id: 1,
      name: 'Carlos Teste',
      email: 'carlos@codepath.com',
      level: 3,
      xp_points: 750
    }
  };
  
  // Simular middleware de auth
  res.locals.user = req.session.user;
  res.locals.isAuthenticated = true;
  
  const mockData = {
    layout: 'main',
    title: 'Teste Auth - Aula de C',
    additionalCSS: ['content', 'lesson-viewer'],
    additionalJS: 'lesson-viewer',
    user: req.session.user,
    lesson: {
      id: 1,
      name: 'Introdução ao C - Com Auth',
      description: 'Primeira aula de programação em C com autenticação',
      package_name: 'Fundamentos de C',
      package_id: 1,
      lesson_number: 1,
      package_icon: '🔧'
    },
    progressStats: {
      progressPercentage: 25,
      completedLessons: 2,
      totalLessons: 8
    },
    debugInfo: {
      lessonId: 1,
      hasContent: true,
      timestamp: new Date().toISOString(),
      authTest: true
    }
  };
  
  try {
    res.render('pages/lesson-view', mockData);
  } catch (error) {
    console.error('❌ Erro no teste auth mock:', error);
    res.status(500).send(`
      <h1>Erro no Teste Auth Mock</h1>
      <p>Erro: ${error.message}</p>
      <pre>${error.stack}</pre>
    `);
  }
});

// Iniciar servidor de teste
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 SERVIDOR DE DEBUG INICIADO!`);
  console.log(`📍 Acesse: http://localhost:${PORT}/test-simple`);
  console.log(`\n🔗 URLs de Teste:`);
  console.log(`   • http://localhost:${PORT}/test-simple`);
  console.log(`   • http://localhost:${PORT}/test-template`);
  console.log(`   • http://localhost:${PORT}/test-lesson-mock`);
  console.log(`   • http://localhost:${PORT}/test-auth-mock`);
  console.log(`\n⚠️  Para parar o servidor: Ctrl+C`);
  console.log(`📋 Verifique cada URL para identificar onde está o problema da tela branca.`);
}); 