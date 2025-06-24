/**
 * FASE 30: COMPONENTES MODERNOS - FUNCIONALIDADES JAVASCRIPT
 * Funcionalidades para cards, badges, botões e componentes modernos
 */

// Sistema de Ripple Effect para Botões Modernos
function createRippleEffect(button, event) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple-effect');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Sistema de Toast Moderno
class ModernToast {
    constructor() {
        this.container = this.createContainer();
        document.body.appendChild(this.container);
    }
    
    createContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container-modern';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            pointer-events: none;
        `;
        return container;
    }
    
    show(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast-modern toast-${type}`;
        toast.style.pointerEvents = 'auto';
        
        const icon = this.getIcon(type);
        toast.innerHTML = `
            <div class="toast-content">
                <i class="${icon}"></i>
                <span>${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        this.container.appendChild(toast);
        
        // Animação de entrada
        setTimeout(() => toast.classList.add('toast-show'), 100);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('toast-show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
        
        return toast;
    }
    
    getIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }
}

// Sistema de Cards Interativos
class ModernCardSystem {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupCardAnimations();
        this.setupProgressAnimations();
    }
    
    setupCardAnimations() {
        const cards = document.querySelectorAll('.card-modern, .metric-card, .package-card, .action-card');
        
        cards.forEach(card => {
            // Animação de entrada com Intersection Observer
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animation = 'fadeInUp 0.6s ease-out';
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(card);
        });
    }
    
    setupProgressAnimations() {
        const progressBars = document.querySelectorAll('.progress-bar-modern, .progress-fill');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bar = entry.target;
                    const width = bar.dataset.width || bar.style.width;
                    bar.style.width = '0%';
                    setTimeout(() => {
                        bar.style.width = width;
                    }, 200);
                    observer.unobserve(bar);
                }
            });
        }, { threshold: 0.5 });
        
        progressBars.forEach(bar => observer.observe(bar));
    }
}

// Utilitários para Componentes Modernos
const ModernComponents = {
    // Criar badge dinâmico
    createBadge(text, type = 'primary', size = '') {
        const badge = document.createElement('span');
        badge.className = `badge-modern badge-${type} ${size ? `badge-${size}` : ''}`;
        badge.textContent = text;
        return badge;
    },
    
    // Criar botão moderno
    createButton(text, type = 'primary', size = '', onclick = null) {
        const button = document.createElement('button');
        button.className = `btn-modern btn-${type} ${size ? `btn-${size}` : ''}`;
        button.innerHTML = `<span>${text}</span>`;
        
        if (onclick) {
            button.addEventListener('click', onclick);
        }
        
        return button;
    },
    
    // Criar progresso moderno
    createProgress(percentage, type = '', size = '') {
        const container = document.createElement('div');
        container.className = `progress-modern ${type ? `progress-${type}` : ''} ${size ? `progress-${size}` : ''}`;
        
        const bar = document.createElement('div');
        bar.className = 'progress-bar-modern';
        bar.style.width = `${percentage}%`;
        bar.dataset.width = `${percentage}%`;
        
        container.appendChild(bar);
        return container;
    }
};

// Inicializar sistemas quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Aplicar ripple effect a todos os botões modernos
    const modernButtons = document.querySelectorAll('.btn-modern, .btn-primary, .btn-secondary');
    
    modernButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            createRippleEffect(this, e);
        });
    });
    
    // Inicializar sistema de cards
    new ModernCardSystem();
    
    // Instância global do toast
    window.modernToast = new ModernToast();
    
    // Adicionar estilos CSS dinâmicos
    const style = document.createElement('style');
    style.textContent = `
        .ripple-effect {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .toast-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .toast-close {
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: background-color 0.2s ease;
        }
        
        .toast-close:hover {
            background-color: rgba(0, 0, 0, 0.1);
        }
    `;
    document.head.appendChild(style);
});

// Exportar para uso global
 