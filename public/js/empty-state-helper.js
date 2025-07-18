/**
 * Empty State Helper - CodePath
 * Gerencia ilustrações e funcionalidades dos estados vazios
 */

class EmptyStateManager {
    constructor() {
        this.illustrations = {
            book: this.getBookSVG(),
            rocket: this.getRocketSVG(),
            trophy: this.getTrophySVG(),
            search: this.getSearchSVG(),
            chat: this.getChatSVG(),
            default: this.getDefaultSVG()
        };
        
        this.init();
    }
    
    init() {
        // Inicializar AOS se disponível
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 600,
                easing: 'ease-out-cubic',
                once: true
            });
        }
        
        // Aplicar ilustrações aos estados vazios existentes
        this.applyIllustrations();
        
        // Adicionar event listeners para botões de ripple
        this.initRippleEffect();
        
        // Adicionar funções globais para botões dos empty states
        this.addGlobalFunctions();
    }
    
    addGlobalFunctions() {
        // Função para limpar filtros (usada no empty state de pacotes)
        window.clearAllFilters = () => {
            // Limpar filtros de busca
            const searchInput = document.querySelector('.package-search');
            if (searchInput) {
                searchInput.value = '';
            }
            
            // Resetar filtros de dificuldade
            const difficultyFilters = document.querySelectorAll('input[name="difficulty"]');
            difficultyFilters.forEach(filter => {
                filter.checked = false;
            });
            
            // Resetar filtros de duração
            const durationFilters = document.querySelectorAll('input[name="duration"]');
            durationFilters.forEach(filter => {
                filter.checked = false;
            });
            
            // Recarregar pacotes
            if (typeof loadPackages === 'function') {
                loadPackages();
            } else {
                // Fallback: recarregar página
                window.location.reload();
            }
        };
        
        // Função para mostrar chat público (usada no empty state de salas)
        window.showPublicChat = () => {
            const publicChatSection = document.querySelector('.chat-main');
            if (publicChatSection) {
                publicChatSection.scrollIntoView({ behavior: 'smooth' });
            }
        };
        
        // Função para focar no input do chat (usada no empty state do chat público)
        window.focusChatInput = () => {
            const chatInput = document.querySelector('.chat-input, .message-input');
            if (chatInput) {
                chatInput.focus();
                chatInput.scrollIntoView({ behavior: 'smooth' });
            }
        };
    }
    
    applyIllustrations() {
        const emptyStates = document.querySelectorAll('.empty-state');
        
        emptyStates.forEach(state => {
            const illustrationType = state.dataset.illustration;
            if (illustrationType && this.illustrations[illustrationType]) {
                const illustrationContainer = state.querySelector('.empty-illustration');
                if (illustrationContainer) {
                    illustrationContainer.innerHTML = this.illustrations[illustrationType];
                }
            }
        });
    }
    
    initRippleEffect() {
        const buttons = document.querySelectorAll('.empty-action-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const ripple = button.querySelector('.btn-ripple');
                if (ripple) {
                    // Reset ripple
                    ripple.style.opacity = '0';
                    ripple.style.transform = 'scale(0)';
                    
                    // Trigger ripple effect
                    setTimeout(() => {
                        ripple.style.opacity = '1';
                        ripple.style.transform = 'scale(2)';
                        
                        // Remove ripple after animation
                        setTimeout(() => {
                            ripple.style.opacity = '0';
                            ripple.style.transform = 'scale(0)';
                        }, 500);
                    }, 10);
                }
            });
        });
    }
    
    // Criar estado vazio dinamicamente
    createEmptyState(options = {}) {
        const {
            container,
            illustration = 'default',
            title = 'Nenhum item encontrado',
            message = 'Não há itens para exibir no momento.',
            actionText = null,
            actionUrl = null,
            actionCallback = null,
            size = 'medium',
            type = 'default'
        } = options;
        
        if (!container) {
            console.error('Container é obrigatório para criar empty state');
            return;
        }
        
        const emptyStateHTML = `
            <div class="empty-state empty-${size} empty-${type}" data-aos="fade-up">
                <div class="empty-content">
                    <div class="empty-illustration">
                        ${this.illustrations[illustration] || this.illustrations.default}
                    </div>
                    
                    <div class="empty-text">
                        <h3 class="empty-title">${title}</h3>
                        <p class="empty-message">${message}</p>
                    </div>
                    
                    ${actionText ? `
                        <div class="empty-actions">
                            ${actionUrl ? 
                                `<a href="${actionUrl}" class="btn btn-primary empty-action-btn">
                                    <span class="btn-text">${actionText}</span>
                                    <div class="btn-ripple"></div>
                                </a>` :
                                `<button ${actionCallback ? `onclick="${actionCallback}"` : ''} class="btn btn-primary empty-action-btn">
                                    <span class="btn-text">${actionText}</span>
                                    <div class="btn-ripple"></div>
                                </button>`
                            }
                        </div>
                    ` : ''}
                    
                    <div class="empty-decorations">
                        <div class="decoration decoration-1"></div>
                        <div class="decoration decoration-2"></div>
                        <div class="decoration decoration-3"></div>
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = emptyStateHTML;
        
        // Reinicializar AOS e ripple effects
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
        this.initRippleEffect();
    }
    
    // SVG Illustrations
    getBookSVG() {
        return `
            <svg class="empty-svg" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:var(--primary-color);stop-opacity:0.8" />
                        <stop offset="100%" style="stop-color:var(--secondary-color);stop-opacity:0.6" />
                    </linearGradient>
                </defs>
                <rect x="40" y="30" width="120" height="100" rx="8" fill="url(#bookGradient)" />
                <rect x="50" y="40" width="100" height="4" rx="2" fill="white" opacity="0.7" />
                <rect x="50" y="50" width="80" height="4" rx="2" fill="white" opacity="0.5" />
                <rect x="50" y="60" width="90" height="4" rx="2" fill="white" opacity="0.5" />
                <circle cx="100" cy="20" r="8" fill="var(--accent-color)" opacity="0.8" />
                <circle cx="160" cy="140" r="6" fill="var(--accent-color)" opacity="0.6" />
            </svg>
        `;
    }
    
    getRocketSVG() {
        return `
            <svg class="empty-svg" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="rocketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:var(--primary-color);stop-opacity:0.8" />
                        <stop offset="100%" style="stop-color:var(--secondary-color);stop-opacity:0.6" />
                    </linearGradient>
                </defs>
                <ellipse cx="100" cy="140" rx="40" ry="8" fill="var(--primary-color)" opacity="0.2" />
                <path d="M100 20 L120 120 L100 110 L80 120 Z" fill="url(#rocketGradient)" />
                <circle cx="100" cy="40" r="12" fill="white" opacity="0.9" />
                <circle cx="100" cy="40" r="6" fill="var(--accent-color)" />
                <path d="M85 130 Q100 140 115 130" stroke="var(--accent-color)" stroke-width="3" fill="none" opacity="0.7" />
                <circle cx="70" cy="60" r="4" fill="var(--accent-color)" opacity="0.6" />
                <circle cx="130" cy="80" r="3" fill="var(--accent-color)" opacity="0.4" />
            </svg>
        `;
    }
    
    getTrophySVG() {
        return `
            <svg class="empty-svg" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="trophyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:var(--accent-color);stop-opacity:0.8" />
                        <stop offset="100%" style="stop-color:var(--primary-color);stop-opacity:0.6" />
                    </linearGradient>
                </defs>
                <ellipse cx="100" cy="140" rx="30" ry="6" fill="var(--primary-color)" opacity="0.2" />
                <rect x="85" y="120" width="30" height="20" rx="4" fill="url(#trophyGradient)" />
                <path d="M70 50 Q70 30 100 30 Q130 30 130 50 L130 100 Q130 120 100 120 Q70 120 70 100 Z" fill="url(#trophyGradient)" />
                <circle cx="100" cy="70" r="15" fill="white" opacity="0.3" />
                <path d="M60 60 Q50 50 50 70 Q50 90 60 80" fill="var(--secondary-color)" opacity="0.6" />
                <path d="M140 60 Q150 50 150 70 Q150 90 140 80" fill="var(--secondary-color)" opacity="0.6" />
                <circle cx="40" cy="40" r="3" fill="var(--accent-color)" opacity="0.7" />
                <circle cx="160" cy="100" r="4" fill="var(--accent-color)" opacity="0.5" />
            </svg>
        `;
    }
    
    getSearchSVG() {
        return `
            <svg class="empty-svg" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:var(--primary-color);stop-opacity:0.8" />
                        <stop offset="100%" style="stop-color:var(--secondary-color);stop-opacity:0.6" />
                    </linearGradient>
                </defs>
                <circle cx="80" cy="70" r="35" stroke="url(#searchGradient)" stroke-width="6" fill="none" />
                <circle cx="80" cy="70" r="20" fill="white" opacity="0.2" />
                <path d="M110 100 L140 130" stroke="url(#searchGradient)" stroke-width="6" stroke-linecap="round" />
                <circle cx="50" cy="30" r="4" fill="var(--accent-color)" opacity="0.6" />
                <circle cx="150" cy="50" r="3" fill="var(--accent-color)" opacity="0.4" />
                <circle cx="160" cy="120" r="5" fill="var(--accent-color)" opacity="0.5" />
            </svg>
        `;
    }
    
    getChatSVG() {
        return `
            <svg class="empty-svg" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="chatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:var(--primary-color);stop-opacity:0.8" />
                        <stop offset="100%" style="stop-color:var(--secondary-color);stop-opacity:0.6" />
                    </linearGradient>
                </defs>
                <ellipse cx="100" cy="140" rx="50" ry="8" fill="var(--primary-color)" opacity="0.1" />
                <rect x="40" y="40" width="80" height="60" rx="12" fill="url(#chatGradient)" />
                <path d="M80 100 L90 110 L100 100" fill="url(#chatGradient)" />
                <rect x="130" y="60" width="60" height="50" rx="10" fill="var(--secondary-color)" opacity="0.7" />
                <path d="M160 110 L150 120 L140 110" fill="var(--secondary-color)" opacity="0.7" />
                <circle cx="60" cy="60" r="3" fill="white" opacity="0.8" />
                <circle cx="75" cy="60" r="3" fill="white" opacity="0.8" />
                <circle cx="90" cy="60" r="3" fill="white" opacity="0.8" />
                <circle cx="30" cy="30" r="4" fill="var(--accent-color)" opacity="0.6" />
                <circle cx="170" cy="40" r="3" fill="var(--accent-color)" opacity="0.4" />
            </svg>
        `;
    }
    
    getDefaultSVG() {
        return `
            <svg class="empty-svg" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="defaultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:var(--primary-color);stop-opacity:0.8" />
                        <stop offset="100%" style="stop-color:var(--secondary-color);stop-opacity:0.6" />
                    </linearGradient>
                </defs>
                <circle cx="100" cy="80" r="40" fill="url(#defaultGradient)" />
                <circle cx="100" cy="80" r="20" fill="white" opacity="0.3" />
                <circle cx="60" cy="40" r="6" fill="var(--accent-color)" opacity="0.6" />
                <circle cx="140" cy="120" r="4" fill="var(--accent-color)" opacity="0.4" />
                <circle cx="160" cy="60" r="3" fill="var(--accent-color)" opacity="0.5" />
            </svg>
        `;
    }
    
    // Utility methods
    showEmptyState(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (container) {
            this.createEmptyState({ container, ...options });
        }
    }
    
    hideEmptyState(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
    
    // Mensagens pré-definidas para diferentes contextos
    getContextualMessages(context) {
        const messages = {
            packages: {
                title: 'Nenhum pacote encontrado',
                message: 'Não encontramos pacotes que correspondam aos seus filtros. Tente ajustar os critérios de busca.',
                illustration: 'search',
                actionText: 'Limpar Filtros'
            },
            progress: {
                title: 'Nenhuma tecnologia iniciada',
                message: 'Comece sua jornada de aprendizado escolhendo uma tecnologia que desperte seu interesse!',
                illustration: 'rocket',
                actionText: 'Explorar Tecnologias',
                actionUrl: '/careers'
            },
            achievements: {
                title: 'Nenhuma conquista desbloqueada',
                message: 'Continue estudando e realizando atividades para desbloquear suas primeiras conquistas!',
                illustration: 'trophy',
                actionText: 'Ver Todas as Conquistas'
            },
            chat: {
                title: 'Nenhuma mensagem ainda',
                message: 'Seja o primeiro a iniciar uma conversa nesta sala! Compartilhe conhecimento e conecte-se com outros estudantes.',
                illustration: 'chat',
                actionText: 'Enviar Primeira Mensagem'
            },
            lessons: {
                title: 'Nenhuma aula disponível',
                message: 'Este pacote ainda não possui aulas disponíveis. Volte em breve para conferir o conteúdo!',
                illustration: 'book',
                actionText: 'Explorar Outros Pacotes',
                actionUrl: '/careers'
            },
            activity: {
                title: 'Nenhuma atividade recente',
                message: 'Comece a estudar para ver seu progresso e atividades aparecerem aqui!',
                illustration: 'default',
                actionText: 'Continuar Estudando'
            }
        };
        
        return messages[context] || messages.default;
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.EmptyStateManager = new EmptyStateManager();
});

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmptyStateManager;
} 