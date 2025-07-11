/**
 * CodePath - JavaScript para Páginas de Carreiras
 * Funcionalidades específicas para carreiras e perfis profissionais
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // AUTO-OCULTAR ALERTAS
    // ========================================
    
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            alert.style.transform = 'translateX(100%)';
            setTimeout(() => {
                alert.remove();
            }, 300);
        }, 5000);
    });
    
    // ========================================
    // CONFIRMAÇÃO DE SELEÇÃO DE PERFIL
    // ========================================
    
    const selectionForms = document.querySelectorAll('.selection-form');
    selectionForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const profileName = this.closest('.profile-card').querySelector('.profile-name').textContent;
            const confirmed = confirm(`Tem certeza que deseja selecionar o perfil "${profileName}"?`);
            
            if (!confirmed) {
                e.preventDefault();
            }
        });
    });
    
    // ========================================
    // ANIMAÇÕES DOS CARDS DE PACOTES
    // ========================================
    
    const packageCards = document.querySelectorAll('.package-card');
    packageCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // ========================================
    // CONFIRMAÇÃO DE INÍCIO DE PACOTE
    // ========================================
    
    const startForms = document.querySelectorAll('.action-form');
    startForms.forEach(form => {
        const button = form.querySelector('.btn-start');
        if (button) {
            form.addEventListener('submit', function(e) {
                const packageName = this.closest('.package-card').querySelector('.package-name').textContent;
                const confirmed = confirm(`Iniciar o pacote "${packageName}"?\n\nIsso irá marcar o pacote como "Em Progresso" e você poderá acessar as aulas.`);
                
                if (!confirmed) {
                    e.preventDefault();
                }
            });
        }
    });
    
    // ========================================
    // TOOLTIP PARA PROGRESSO
    // ========================================
    
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
        const percentage = bar.querySelector('.progress-fill').style.width;
        bar.title = `Progresso: ${percentage}`;
    });
    
    // ========================================
    // LAZY LOADING PARA ÍCONES
    // ========================================
    
    const techIcons = document.querySelectorAll('.tech-icon');
    techIcons.forEach(icon => {
        icon.style.opacity = '0';
        icon.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            icon.style.transition = 'all 0.3s ease';
            icon.style.opacity = '1';
            icon.style.transform = 'scale(1)';
        }, Math.random() * 500);
    });
    
    // ========================================
    // ESTATÍSTICAS ANIMADAS
    // ========================================
    
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const finalValue = parseInt(stat.textContent);
        let currentValue = 0;
        const increment = Math.ceil(finalValue / 20);
        
        const counter = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(counter);
            }
            stat.textContent = currentValue;
        }, 50);
    });
    
    // ========================================
    // BUSCA RÁPIDA (se houver campo de busca)
    // ========================================
    
    const searchInput = document.querySelector('#packageSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const packageCards = document.querySelectorAll('.package-card');
            
            packageCards.forEach(card => {
                const packageName = card.querySelector('.package-name').textContent.toLowerCase();
                const packageDescription = card.querySelector('.package-description').textContent.toLowerCase();
                
                if (packageName.includes(searchTerm) || packageDescription.includes(searchTerm)) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.3s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // ========================================
    // FILTROS DE PACOTES
    // ========================================
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            const packageCards = document.querySelectorAll('.package-card');
            
            // Remover classe ativa de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Adicionar classe ativa ao botão clicado
            this.classList.add('active');
            
            packageCards.forEach(card => {
                if (filter === 'all' || card.classList.contains(filter)) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.3s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // ========================================
    // MODO ESCURO (se implementado)
    // ========================================
    
    const darkModeToggle = document.querySelector('#darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
            // Salvar preferência no localStorage
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
        });
        
        // Carregar preferência salva
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'true') {
            document.body.classList.add('dark-mode');
        }
    }
    
    // ========================================
    // FEEDBACK VISUAL PARA AÇÕES
    // ========================================
    
    const actionButtons = document.querySelectorAll('.btn-start, .btn-continue, .btn-select');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Adicionar efeito de ripple
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // ========================================
    // NAVEGAÇÃO POR TECLADO
    // ========================================
    
    document.addEventListener('keydown', function(e) {
        // Esc para fechar modais ou alertas
        if (e.key === 'Escape') {
            const alerts = document.querySelectorAll('.alert');
            alerts.forEach(alert => alert.remove());
        }
        
        // Enter para confirmar ações focadas
        if (e.key === 'Enter' && e.target.classList.contains('btn')) {
            e.target.click();
        }
    });
    
    // ========================================
    // SCROLL SUAVE PARA ÂNCORAS
    // ========================================
    
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // ========================================
    // PERFORMANCE: INTERSECTION OBSERVER
    // ========================================
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observar cards para animação de entrada
    const cardsToObserve = document.querySelectorAll('.package-card, .profile-card, .stat-card');
    cardsToObserve.forEach(card => observer.observe(card));
    
});

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================

/**
 * Formatar porcentagem para exibição
 */
function formatPercentage(value) {
    return Math.round(value) + '%';
}

/**
 * Animar contadores
 */
function animateCounter(element, finalValue, duration = 1000) {
    let startValue = 0;
    const increment = finalValue / (duration / 16);
    
    const timer = setInterval(() => {
        startValue += increment;
        if (startValue >= finalValue) {
            startValue = finalValue;
            clearInterval(timer);
        }
        element.textContent = Math.round(startValue);
    }, 16);
}

/**
 * Mostrar notificação temporária
 */
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.innerHTML = `
        <i class="fas fa-info-circle"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

/**
 * Validar formulário antes do envio
 */
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });
    
    return isValid;
}

// ========================================
// CSS PARA ANIMAÇÕES DINÂMICAS
// ========================================

// Adicionar estilos CSS dinamicamente
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .animate-in {
        animation: slideInUp 0.6s ease forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
`;

document.head.appendChild(dynamicStyles); 