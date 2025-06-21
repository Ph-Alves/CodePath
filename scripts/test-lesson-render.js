/**
 * Script de Teste - Renderização de Aula
 * 
 * Este script testa a renderização da aula para identificar
 * problemas na tela branca.
 */

const express = require('express');
const mustacheExpress = require('mustache-express');
const path = require('path');

// Criar app de teste
const testApp = express();

// Configurar Mustache
testApp.engine('mustache', mustacheExpress());
testApp.set('view engine', 'mustache');
testApp.set('views', path.join(__dirname, '..', 'views'));

// Servir arquivos estáticos
testApp.use(express.static(path.join(__dirname, '..', 'public')));

// Dados de teste para a aula
const testLessonData = {
  title: 'Teste - Introdução ao C',
  additionalCSS: ['content', 'lesson-viewer'],
  additionalJS: 'lesson-viewer',
  user: {
    id: 1,
    name: 'Usuário Teste',
    email: 'teste@codepath.com'
  },
  lesson: {
    id: 1,
    name: 'Introdução ao C',
    description: 'Primeira aula do curso de C',
    package_id: 1,
    package_name: 'Programação em C',
    package_icon: 'C',
    order_sequence: 1
  },
  lessonContent: {
    content: `
      <div class="lesson-content-wrapper">
        <h2>🎯 Teste de Renderização - Aula de C</h2>
        
        <div style="background: #e0f7fa; border: 2px solid #00acc1; padding: 2rem; border-radius: 12px; margin: 2rem 0;">
          <h3 style="color: #00acc1; margin-bottom: 1rem;">✅ Teste de Conteúdo Interativo</h3>
          <p style="color: #006064; font-size: 1.1rem; line-height: 1.6;">
            Se você está vendo esta mensagem, significa que o conteúdo interativo está funcionando corretamente!
          </p>
          
          <div style="background: #1e1e1e; color: #f8f8f2; padding: 1.5rem; border-radius: 8px; font-family: monospace; margin: 1rem 0;">
#include &lt;stdio.h&gt;

int main() {
    printf("Teste funcionando!\\n");
    return 0;
}
          </div>
          
          <p style="color: #00695c; font-weight: 600; margin-top: 1rem;">
            🚀 Status: Renderização bem-sucedida!
          </p>
        </div>
      </div>
    `
  },
  userProgress: null,
  nextLesson: {
    id: 2,
    name: 'Variáveis em C'
  },
  previousLesson: null,
  quizzes: [],
  progressStats: {
    progressPercentage: 25,
    totalLessons: 5,
    watchedLessons: 1,
    package: {
      name: 'Programação em C',
      description: 'Curso completo de C'
    }
  },
  flash: null,
  debugInfo: {
    lessonId: 1,
    hasContent: true,
    timestamp: new Date().toISOString()
  }
};

// Rota de teste
testApp.get('/test-lesson', (req, res) => {
  console.log('🧪 Iniciando teste de renderização da aula...');
  console.log('📊 Dados de teste:', {
    hasLesson: !!testLessonData.lesson,
    hasContent: !!testLessonData.lessonContent,
    hasProgressStats: !!testLessonData.progressStats
  });
  
  try {
    res.render('pages/lesson-view', testLessonData);
    console.log('✅ Renderização bem-sucedida!');
  } catch (error) {
    console.error('❌ Erro na renderização:', error);
    res.status(500).send(`
      <h1>Erro na Renderização</h1>
      <p><strong>Erro:</strong> ${error.message}</p>
      <p><strong>Stack:</strong></p>
      <pre>${error.stack}</pre>
    `);
  }
});

// Rota de teste simplificada
testApp.get('/test-simple', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Teste Simples</title>
      <link rel="stylesheet" href="/css/lesson-viewer.css">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          margin: 0; 
          padding: 2rem; 
        }
        .test-container { 
          max-width: 1000px; 
          margin: 0 auto; 
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
      </style>
    </head>
    <body>
      <div class="test-container">
        <h1>🧪 Teste de CSS e Renderização</h1>
        <p>Se você está vendo esta página com estilos, significa que:</p>
        <ul>
          <li>✅ O servidor está funcionando</li>
          <li>✅ Os arquivos CSS estão sendo servidos</li>
          <li>✅ A renderização HTML está funcionando</li>
        </ul>
        
        <div style="background: #e0f2fe; border-left: 4px solid #0ea5e9; padding: 2rem; margin: 2rem 0;">
          <h2>🎯 Exemplo de Aula de C</h2>
          <div style="background: #1e1e1e; color: #f8f8f2; padding: 1rem; border-radius: 8px; font-family: monospace;">
#include &lt;stdio.h&gt;

int main() {
    printf("Hello, World!\\n");
    return 0;
}
          </div>
        </div>
        
        <p><a href="/test-lesson">🔗 Testar Template Mustache Completo</a></p>
      </div>
    </body>
    </html>
  `);
});

// Iniciar servidor de teste
const PORT = 3001;
testApp.listen(PORT, () => {
  console.log(`🧪 Servidor de teste rodando em http://localhost:${PORT}`);
  console.log('📝 Rotas disponíveis:');
  console.log('   - http://localhost:3001/test-simple (Teste HTML simples)');
  console.log('   - http://localhost:3001/test-lesson (Teste template Mustache)');
  console.log('\n🔍 Para testar:');
  console.log('   1. Acesse as URLs acima no navegador');
  console.log('   2. Verifique se o conteúdo está sendo exibido');
  console.log('   3. Compare com a aula real em http://localhost:3000/content/lesson/1');
}); 