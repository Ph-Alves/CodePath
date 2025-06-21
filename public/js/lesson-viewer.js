/**
 * CodePath - Lesson Viewer JavaScript
 * 
 * Script para tornar as aulas interativas com funcionalidades como:
 * - Cópia de código
 * - Teste básico de exercícios
 * - Feedback visual
 * 
 * Fase 26: Implementação de aula funcional de C
 */

// ========================================
// INICIALIZAÇÃO
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Lesson Viewer carregado!');
    
    // Inicializar funcionalidades
    initCodeCopy();
    initCodeTester();
    initProgressTracking();
});

// ========================================
// FUNCIONALIDADE DE CÓPIA DE CÓDIGO
// ========================================

/**
 * Inicializa os botões de cópia de código
 */
function initCodeCopy() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            copyCode(this);
        });
    });
}

/**
 * Copia código para a área de transferência
 */
function copyCode(button) {
    const codeBlock = button.closest('.code-block');
    const codeContent = codeBlock.querySelector('code');
    
    if (!codeContent) {
        showToast('Erro ao encontrar código para copiar', 'error');
        return;
    }
    
    const textToCopy = codeContent.textContent;
    
    // Usar a API moderna de clipboard se disponível
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showCopyFeedback(button);
        }).catch(err => {
            console.error('Erro ao copiar:', err);
            fallbackCopy(textToCopy, button);
        });
    } else {
        fallbackCopy(textToCopy, button);
    }
}

/**
 * Fallback para cópia de código em navegadores mais antigos
 */
function fallbackCopy(text, button) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyFeedback(button);
    } catch (err) {
        console.error('Erro ao copiar:', err);
        showToast('Erro ao copiar código', 'error');
    } finally {
        document.body.removeChild(textArea);
    }
}

/**
 * Mostra feedback visual de cópia
 */
function showCopyFeedback(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '✓ Copiado!';
    button.style.background = '#10B981';
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '';
    }, 2000);
}

// ========================================
// TESTADOR DE CÓDIGO SIMPLES
// ========================================

/**
 * Inicializa os botões de teste de código
 */
function initCodeTester() {
    const testButtons = document.querySelectorAll('.test-code');
    
    testButtons.forEach(button => {
        button.addEventListener('click', function() {
            testCode();
        });
    });
}

/**
 * Testa o código escrito pelo usuário
 */
function testCode() {
    const codeEditor = document.querySelector('.code-editor');
    if (!codeEditor) {
        showToast('Editor de código não encontrado', 'error');
        return;
    }
    
    const userCode = codeEditor.value.trim();
    const testResult = document.querySelector('.test-result');
    
    if (!userCode) {
        showTestResult('Por favor, escreva algum código antes de testar.', 'warning', testResult);
        return;
    }
    
    // Mostrar loading
    showTestResult('🧪 Testando seu código...', 'info', testResult);
    
    // Simular teste (em produção seria enviado para o servidor)
    setTimeout(() => {
        const result = runBasicCTests(userCode);
        showTestResult(result.message, result.type, testResult);
    }, 1500);
}

/**
 * Executa testes básicos no código C
 */
function runBasicCTests(code) {
    const tests = [
        {
            name: 'Inclui stdio.h',
            test: () => code.includes('#include') && code.includes('stdio.h'),
            message: 'Biblioteca stdio.h incluída ✓'
        },
        {
            name: 'Tem função main',
            test: () => code.includes('int main') || code.includes('main('),
            message: 'Função main encontrada ✓'
        },
        {
            name: 'Usa printf',
            test: () => code.includes('printf'),
            message: 'Função printf utilizada ✓'
        },
        {
            name: 'Tem return 0',
            test: () => code.includes('return 0'),
            message: 'Return 0 presente ✓'
        },
        {
            name: 'Mensagem personalizada',
            test: () => {
                const printfMatch = code.match(/printf\s*\(\s*"([^"]+)"/);
                return printfMatch && printfMatch[1].length > 5;
            },
            message: 'Mensagem personalizada detectada ✓'
        }
    ];
    
    const passedTests = tests.filter(test => test.test());
    const score = Math.round((passedTests.length / tests.length) * 100);
    
    let resultMessage = `<div class="test-score">Pontuação: ${score}%</div>`;
    resultMessage += '<div class="test-details">';
    
    passedTests.forEach(test => {
        resultMessage += `<div class="test-pass">✓ ${test.message}</div>`;
    });
    
    const failedTests = tests.filter(test => !test.test());
    failedTests.forEach(test => {
        resultMessage += `<div class="test-fail">✗ ${test.message.replace('✓', '')}</div>`;
    });
    
    resultMessage += '</div>';
    
    if (score >= 80) {
        resultMessage += '<div class="test-success">🎉 Excelente! Seu código está funcionando perfeitamente!</div>';
        return { message: resultMessage, type: 'success' };
    } else if (score >= 60) {
        resultMessage += '<div class="test-warning">⚠️ Bom trabalho! Algumas melhorias podem ser feitas.</div>';
        return { message: resultMessage, type: 'warning' };
    } else {
        resultMessage += '<div class="test-error">❌ Seu código precisa de alguns ajustes. Revise os pontos marcados.</div>';
        return { message: resultMessage, type: 'error' };
    }
}

/**
 * Mostra resultado do teste
 */
function showTestResult(message, type, container) {
    if (!container) return;
    
    container.style.display = 'block';
    container.className = `test-result test-${type}`;
    container.innerHTML = message;
    
    // Scroll suave para o resultado
    container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ========================================
// RASTREAMENTO DE PROGRESSO
// ========================================

/**
 * Inicializa o rastreamento de progresso da aula
 */
function initProgressTracking() {
    // Rastrear tempo na página
    const startTime = Date.now();
    
    // Rastrear scroll (engajamento)
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        maxScroll = Math.max(maxScroll, scrollPercent);
    });
    
    // Salvar progresso ao sair da página
    window.addEventListener('beforeunload', () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000); // em segundos
        
        // Salvar no localStorage (em produção seria enviado para o servidor)
        const progressData = {
            lessonId: getLessonId(),
            timeSpent: timeSpent,
            maxScroll: maxScroll,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('lessonProgress', JSON.stringify(progressData));
        console.log('📊 Progresso salvo:', progressData);
    });
}

/**
 * Obtém o ID da aula atual
 * @returns {string} ID da aula
 */
function getLessonId() {
    // Tentar obter do botão de marcar como concluída
    const markCompleteBtn = document.getElementById('markCompleteBtn');
    if (markCompleteBtn && markCompleteBtn.dataset.lessonId) {
        return markCompleteBtn.dataset.lessonId;
    }
    
    // Fallback: extrair da URL
    const pathParts = window.location.pathname.split('/');
    const lessonIndex = pathParts.indexOf('lesson');
    if (lessonIndex !== -1 && pathParts[lessonIndex + 1]) {
        return pathParts[lessonIndex + 1];
    }
    
    return 'unknown';
}

// ========================================
// SISTEMA DE NOTIFICAÇÕES SIMPLES
// ========================================

/**
 * Exibe uma notificação toast
 * @param {string} message - Mensagem da notificação
 * @param {string} type - Tipo: success, error, warning, info
 */
function showToast(message, type = 'info') {
    // Remover toasts existentes
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        </div>
    `;
    
    // Adicionar estilos inline para garantir visibilidade
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getToastColor(type)};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: Inter, sans-serif;
        font-size: 14px;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    // Remover após 3 segundos
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Retorna ícone para o tipo de toast
 */
function getToastIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

/**
 * Retorna cor para o tipo de toast
 */
function getToastColor(type) {
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6'
    };
    return colors[type] || colors.info;
}

// ========================================
// UTILITÁRIOS
// ========================================

/**
 * Debounce function para otimizar performance
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} Função com debounce
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========================================
// LOGS DE DESENVOLVIMENTO
// ========================================

if (typeof console !== 'undefined') {
    console.log('📚 CodePath - Lesson Viewer');
    console.log('🎯 Aula interativa carregada com sucesso!');
    console.log('🔧 Funcionalidades disponíveis:');
    console.log('   - Cópia de código');
    console.log('   - Teste básico de exercícios');
    console.log('   - Rastreamento de progresso');
    console.log('   - Notificações visuais');
} 