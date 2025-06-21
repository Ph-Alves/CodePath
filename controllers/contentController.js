/**
 * CodePath - Controlador de Conteúdos
 * 
 * Este arquivo contém todas as funções de controle relacionadas
 * à visualização e gerenciamento de conteúdos e aulas.
 */

const contentModel = require('../models/contentModel');
const progressModel = require('../models/progressModel');

/**
 * Conteúdo das aulas - Dados estáticos para demonstração
 * Em produção, isso viria do banco de dados
 */
const LESSON_CONTENT = {
  // Aula 1: C - Introdução
  1: {
    videoUrl: null, // Não há vídeo real, apenas conteúdo textual
    content: `
      <div class="lesson-content-wrapper">
        <h2>Bem-vindo ao Mundo da Programação em C!</h2>
        
        <div class="intro-section">
          <p>A linguagem C é uma das linguagens de programação mais importantes e influentes da história da computação. Criada por Dennis Ritchie entre 1969 e 1973, ela serve como base para muitas outras linguagens modernas.</p>
          
          <div class="highlight-box">
            <h3>🎯 O que você vai aprender nesta aula:</h3>
            <ul>
              <li>O que é a linguagem C e sua importância</li>
              <li>Como escrever seu primeiro programa</li>
              <li>Estrutura básica de um programa C</li>
              <li>Como compilar e executar código C</li>
            </ul>
          </div>
        </div>

        <div class="code-section">
          <h3>Seu Primeiro Programa em C</h3>
          <p>Vamos começar com o clássico "Hello, World!" - um programa simples que exibe uma mensagem na tela:</p>
          
          <div class="code-block">
            <div class="code-header">
              <span class="language">C</span>
              <button class="copy-btn" onclick="copyCode(this)">📋 Copiar</button>
            </div>
            <pre><code class="language-c">
#include &lt;stdio.h&gt;

int main() {
    // Esta linha imprime "Hello, World!" na tela
    printf("Hello, World!\\n");
    
    // Retorna 0 para indicar que o programa terminou com sucesso
    return 0;
}
            </code></pre>
          </div>
          
          <div class="explanation">
            <h4>📝 Explicação linha por linha:</h4>
            <ul>
              <li><strong>#include &lt;stdio.h&gt;</strong> - Inclui a biblioteca padrão de entrada/saída</li>
              <li><strong>int main()</strong> - Função principal onde o programa começa a executar</li>
              <li><strong>printf()</strong> - Função que imprime texto na tela</li>
              <li><strong>\\n</strong> - Caractere de nova linha (quebra de linha)</li>
              <li><strong>return 0;</strong> - Indica que o programa terminou sem erros</li>
            </ul>
          </div>
        </div>

        <div class="practice-section">
          <h3>🚀 Exercício Prático</h3>
          <p>Agora é sua vez! Tente modificar o programa para exibir seu nome:</p>
          
          <div class="exercise-box">
            <h4>Desafio:</h4>
            <p>Modifique o programa para que ele exiba: "Olá, [SEU NOME]! Bem-vindo ao C!"</p>
            
            <div class="code-block">
              <div class="code-header">
                <span class="language">Sua solução</span>
              </div>
              <textarea class="code-editor" placeholder="Digite seu código aqui...">
#include &lt;stdio.h&gt;

int main() {
    // Escreva seu código aqui
    
    return 0;
}
              </textarea>
            </div>
            
            <button class="btn-primary test-code">🧪 Testar Código</button>
            <div class="test-result" style="display: none;"></div>
          </div>
        </div>

        <div class="concepts-section">
          <h3>💡 Conceitos Importantes</h3>
          
          <div class="concept-grid">
            <div class="concept-card">
              <h4>🔧 Compilação</h4>
              <p>C é uma linguagem compilada. Isso significa que você precisa transformar seu código em um arquivo executável antes de rodá-lo.</p>
            </div>
            
            <div class="concept-card">
              <h4>📚 Bibliotecas</h4>
              <p>As bibliotecas como stdio.h contêm funções prontas que você pode usar, como printf() e scanf().</p>
            </div>
            
            <div class="concept-card">
              <h4>🏗️ Estrutura</h4>
              <p>Todo programa C precisa ter uma função main() - é por ela que a execução sempre começa.</p>
            </div>
          </div>
        </div>

        <div class="next-steps">
          <h3>🎯 Próximos Passos</h3>
          <p>Na próxima aula, vamos aprender sobre <strong>variáveis</strong> - como armazenar e manipular dados em C!</p>
          
          <div class="progress-indicators">
            <div class="completed">✅ Conceitos básicos</div>
            <div class="completed">✅ Primeiro programa</div>
            <div class="next">📍 Próximo: Variáveis</div>
          </div>
        </div>
      </div>
    `,
    exercises: [
      {
        id: 1,
        title: "Hello World Personalizado",
        description: "Modifique o programa para exibir uma mensagem personalizada",
        template: `#include <stdio.h>\n\nint main() {\n    // Seu código aqui\n    \n    return 0;\n}`,
        solution: `#include <stdio.h>\n\nint main() {\n    printf("Olá, João! Bem-vindo ao C!\\n");\n    return 0;\n}`,
        hint: "Use printf() para exibir a mensagem. Não esqueça do \\n no final!"
      }
    ]
  }
};

/**
 * Exibe a lista de aulas de um pacote específico
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function showPackageLessons(req, res) {
  try {
    const packageId = parseInt(req.params.packageId);
    const userId = req.session.user.id;

    // Buscar aulas do pacote
    const lessons = await contentModel.getLessonsByPackage(packageId);
    
    // Buscar estatísticas de progresso
    const progressStats = await contentModel.getPackageProgressStats(userId, packageId);

    // Se não há aulas, redirecionar para carreiras
    if (!lessons || lessons.length === 0) {
      req.session.flash = {
        type: 'error',
        message: 'Pacote não encontrado ou sem aulas disponíveis.'
      };
      return res.redirect('/careers');
    }

    // Buscar status de conclusão das aulas
    const lessonsWithStatus = await contentModel.getLessonsWithCompletionStatus(userId, packageId);
    
    // Mapear status de conclusão para as aulas
    const lessonsWithCompletion = lessons.map(lesson => {
      const statusInfo = lessonsWithStatus.find(status => status.id === lesson.id);
      return {
        ...lesson,
        isCompleted: statusInfo ? statusInfo.is_completed : false,
        completedAt: statusInfo ? statusInfo.completed_at : null
      };
    });

    // Renderizar página de aulas do pacote
    res.render('pages/package-lessons', {
      title: `${progressStats.package.name} - Aulas`,
      additionalCSS: 'package-lessons',
      user: req.session.user,
      package: progressStats.package,
      lessons: lessonsWithCompletion,
      progressStats: progressStats,
      flash: req.session.flash || null
    });

    // Limpar flash message
    delete req.session.flash;

  } catch (error) {
    console.error('Erro ao exibir aulas do pacote:', error);
    req.session.flash = {
      type: 'error',
      message: 'Erro interno do servidor. Tente novamente.'
    };
    res.redirect('/careers');
  }
}

/**
 * Exibe uma aula específica
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function showLesson(req, res) {
  try {
    const lessonId = parseInt(req.params.lessonId);
    const userId = req.session.user.id;

    console.log(`[LESSON DEBUG] Iniciando carregamento da aula ${lessonId} para usuário ${userId}`);

    // Buscar dados da aula
    const lesson = await contentModel.getLessonById(lessonId);
    
    if (!lesson) {
      console.log(`[LESSON DEBUG] Aula ${lessonId} não encontrada`);
      req.session.flash = {
        type: 'error',
        message: 'Aula não encontrada.'
      };
      return res.redirect('/careers');
    }

    console.log(`[LESSON DEBUG] Aula encontrada: ${lesson.name}`);

    // Buscar progresso do usuário na aula
    const userProgress = await contentModel.getUserLessonProgress(userId, lessonId);
    
    // Buscar aulas anteriores e próximas
    const nextLesson = await contentModel.getNextLesson(lesson.package_id, lessonId);
    const previousLesson = await contentModel.getPreviousLesson(lesson.package_id, lessonId);
    
    // Buscar quizzes da aula
    const quizzes = await contentModel.getQuizzesByLesson(lessonId);
    
    // Buscar estatísticas do pacote
    const progressStats = await contentModel.getPackageProgressStats(userId, lesson.package_id);

    // Adicionar conteúdo da aula se disponível
    const lessonContent = LESSON_CONTENT[lessonId] || null;
    
    // Debug: log do conteúdo da aula
    console.log(`[LESSON DEBUG] Lesson ID: ${lessonId}`);
    console.log(`[LESSON DEBUG] Lesson Content exists: ${!!lessonContent}`);
    if (lessonContent) {
      console.log(`[LESSON DEBUG] Content keys: ${Object.keys(lessonContent)}`);
      console.log(`[LESSON DEBUG] Content preview: ${lessonContent.content ? lessonContent.content.substring(0, 100) : 'No content'}`);
    }

    // Preparar dados para o template
    const templateData = {
      title: `${lesson.name} - ${lesson.package_name}`,
      additionalCSS: ['content', 'lesson-viewer'],
      additionalJS: 'lesson-viewer',
      user: req.session.user,
      lesson: lesson,
      lessonContent: lessonContent,
      userProgress: userProgress,
      nextLesson: nextLesson,
      previousLesson: previousLesson,
      quizzes: quizzes,
      progressStats: progressStats,
      flash: req.session.flash || null,
      // Adicionar dados de debug
      debugInfo: {
        lessonId: lessonId,
        hasContent: !!lessonContent,
        timestamp: new Date().toISOString()
      }
    };

    console.log(`[LESSON DEBUG] Template data prepared:`, {
      title: templateData.title,
      hasLesson: !!templateData.lesson,
      hasContent: !!templateData.lessonContent,
      hasProgressStats: !!templateData.progressStats
    });

    // Renderizar página da aula
    res.render('pages/lesson-view', templateData);

    // Limpar flash message
    delete req.session.flash;

  } catch (error) {
    console.error('Erro ao exibir aula:', error);
    console.error('Stack trace:', error.stack);
    req.session.flash = {
      type: 'error',
      message: 'Erro interno do servidor. Tente novamente.'
    };
    res.redirect('/careers');
  }
}

/**
 * Marca uma aula como assistida (usando o novo sistema de progresso)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function markLessonComplete(req, res) {
  try {
    const lessonId = parseInt(req.params.lessonId);
    const userId = req.session.user.id;

    // Usar o novo sistema de progresso para marcar aula como concluída
    const result = await progressModel.markLessonComplete(userId, lessonId);

    if (result.success) {
      // Buscar próxima aula para sugerir
      const nextLesson = await contentModel.getNextLesson(result.lesson.package_id, lessonId);
      
      res.json({
        success: true,
        message: result.message,
        xp_gained: result.xp_gained,
        lesson: result.lesson,
        progress_stats: result.progress_stats,
        nextLesson: nextLesson ? {
          id: nextLesson.id,
          name: nextLesson.name,
          url: `/content/lesson/${nextLesson.id}`
        } : null,
        leveled_up: result.xp_result?.leveled_up || false,
        new_level: result.xp_result?.new_level || null
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        already_completed: result.already_completed || false
      });
    }

  } catch (error) {
    console.error('Erro ao marcar aula como concluída:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor.'
    });
  }
}

/**
 * API para obter progresso de um pacote
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getPackageProgress(req, res) {
  try {
    const packageId = parseInt(req.params.packageId);
    const userId = req.session.user.id;

    const progressStats = await contentModel.getPackageProgressStats(userId, packageId);

    res.json({
      success: true,
      data: progressStats
    });

  } catch (error) {
    console.error('Erro ao buscar progresso do pacote:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar progresso.'
    });
  }
}

/**
 * API para obter aulas de um pacote
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getPackageLessonsAPI(req, res) {
  try {
    const packageId = parseInt(req.params.packageId);
    const userId = req.session.user.id;

    const lessons = await contentModel.getLessonsByPackage(packageId);
    const progressStats = await contentModel.getPackageProgressStats(userId, packageId);

    res.json({
      success: true,
      data: {
        lessons: lessons,
        progressStats: progressStats
      }
    });

  } catch (error) {
    console.error('Erro ao buscar aulas do pacote:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar aulas.'
    });
  }
}

/**
 * Navegar para a próxima aula
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function goToNextLesson(req, res) {
  try {
    const currentLessonId = parseInt(req.params.lessonId);
    
    // Buscar aula atual para obter o package_id
    const currentLesson = await contentModel.getLessonById(currentLessonId);
    
    if (!currentLesson) {
      req.session.flash = {
        type: 'error',
        message: 'Aula atual não encontrada.'
      };
      return res.redirect('/careers');
    }

    // Buscar próxima aula
    const nextLesson = await contentModel.getNextLesson(currentLesson.package_id, currentLessonId);
    
    if (nextLesson) {
      res.redirect(`/content/lesson/${nextLesson.id}`);
    } else {
      // Se não há próxima aula, redirecionar para lista de aulas do pacote
      req.session.flash = {
        type: 'success',
        message: 'Parabéns! Você concluiu todas as aulas deste pacote.'
      };
      res.redirect(`/content/package/${currentLesson.package_id}/lessons`);
    }

  } catch (error) {
    console.error('Erro ao navegar para próxima aula:', error);
    req.session.flash = {
      type: 'error',
      message: 'Erro ao navegar para próxima aula.'
    };
    res.redirect('/careers');
  }
}

/**
 * Navegar para a aula anterior
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function goToPreviousLesson(req, res) {
  try {
    const currentLessonId = parseInt(req.params.lessonId);
    
    // Buscar aula atual para obter o package_id
    const currentLesson = await contentModel.getLessonById(currentLessonId);
    
    if (!currentLesson) {
      req.session.flash = {
        type: 'error',
        message: 'Aula atual não encontrada.'
      };
      return res.redirect('/careers');
    }

    // Buscar aula anterior
    const previousLesson = await contentModel.getPreviousLesson(currentLesson.package_id, currentLessonId);
    
    if (previousLesson) {
      res.redirect(`/content/lesson/${previousLesson.id}`);
    } else {
      // Se não há aula anterior, redirecionar para lista de aulas do pacote
      req.session.flash = {
        type: 'info',
        message: 'Esta é a primeira aula do pacote.'
      };
      res.redirect(`/content/package/${currentLesson.package_id}/lessons`);
    }

  } catch (error) {
    console.error('Erro ao navegar para aula anterior:', error);
    req.session.flash = {
      type: 'error',
      message: 'Erro ao navegar para aula anterior.'
    };
    res.redirect('/careers');
  }
}

/**
 * API para verificar status de uma aula específica
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getLessonStatus(req, res) {
  try {
    const lessonId = parseInt(req.params.lessonId);
    const userId = req.session.user.id;

    // Buscar status da aula usando o novo modelo de progresso
    const lessonStatus = await progressModel.getLessonStatus(userId, lessonId);

    if (!lessonStatus) {
      return res.status(404).json({
        success: false,
        message: 'Aula não encontrada.'
      });
    }

    res.json({
      success: true,
      data: {
        lesson_id: lessonStatus.id,
        lesson_name: lessonStatus.name,
        lesson_number: lessonStatus.lesson_number,
        package_id: lessonStatus.package_id,
        package_name: lessonStatus.package_name,
        is_completed: lessonStatus.is_completed === 1,
        lessons_watched: lessonStatus.lessons_watched || 0,
        progress_percentage: lessonStatus.progress_percentage || 0,
        package_status: lessonStatus.package_status || 'not_started'
      }
    });

  } catch (error) {
    console.error('Erro ao verificar status da aula:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar status da aula.'
    });
  }
}

/**
 * API para verificar pré-requisitos de uma aula
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function checkLessonPrerequisites(req, res) {
  try {
    const lessonId = parseInt(req.params.lessonId);
    const userId = req.session.user.id;

    const prerequisites = await contentModel.checkLessonPrerequisites(userId, lessonId);

    res.json({
      success: true,
      data: prerequisites
    });

  } catch (error) {
    console.error('Erro ao verificar pré-requisitos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar pré-requisitos da aula.'
    });
  }
}

/**
 * API para obter dados completos de navegação de uma aula
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getLessonNavigationData(req, res) {
  try {
    const lessonId = parseInt(req.params.lessonId);
    const userId = req.session.user.id;

    const navigationData = await contentModel.getLessonNavigationData(userId, lessonId);

    if (!navigationData) {
      return res.status(404).json({
        success: false,
        message: 'Aula não encontrada.'
      });
    }

    res.json({
      success: true,
      data: navigationData
    });

  } catch (error) {
    console.error('Erro ao buscar dados de navegação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar dados de navegação.'
    });
  }
}

/**
 * API para obter aulas com status de conclusão
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getPackageLessonsWithStatus(req, res) {
  try {
    const packageId = parseInt(req.params.packageId);
    const userId = req.session.user.id;

    const lessons = await contentModel.getLessonsWithCompletionStatus(userId, packageId);
    const progressStats = await contentModel.getPackageProgressStats(userId, packageId);

    res.json({
      success: true,
      data: {
        lessons: lessons,
        progressStats: progressStats
      }
    });

  } catch (error) {
    console.error('Erro ao buscar aulas com status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar aulas.'
    });
  }
}

module.exports = {
  showPackageLessons,
  showLesson,
  markLessonComplete,
  getPackageProgress,
  getPackageLessonsAPI,
  goToNextLesson,
  goToPreviousLesson,
  getLessonStatus,
  checkLessonPrerequisites,
  getLessonNavigationData,
  getPackageLessonsWithStatus
}; 