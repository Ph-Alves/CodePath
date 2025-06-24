/* ===================================
   MAIN JAVASCRIPT - CODEPATH
   Controle de navegação, sidebar e interações
   =================================== */

/**
 * Classe principal para gerenciar a aplicação CodePath
 */
class CodePathApp {
    constructor() {
        this.sidebar = null;
        this.sidebarOverlay = null;
        this.sidebarToggleBtn = null;
        this.sidebarCloseBtn = null;
        this.notificationBtn = null;
        this.notificationDropdown = null;
        this.userMenuBtn = null;
        this.userMenuDropdown = null;
        
        this.init();
    }
    
    /**
     * Inicializa a aplicação
     */
    init() {
        // Aguarda o DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    /**
     * Configura todos os componentes da aplicação
     */
    setup() {
        this.cacheElements();
        this.bindEvents();
        this.setupSidebar();
        this.setupDropdowns();
        this.setupKeyboardNavigation();
        this.setupAccessibility();
        
        console.log('CodePath App initialized successfully');
    }
    
    /**
     * Cacheia elementos DOM para melhor performance
     */
    cacheElements() {
        // Sidebar elements
        this.sidebar = document.getElementById('sidebar');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.sidebarToggleBtn = document.getElementById('sidebarToggle');
        this.sidebarCloseBtn = document.getElementById('sidebarClose');
        
        // Dropdown elements
        this.notificationBtn = document.getElementById('notificationBtn');
        this.notificationDropdown = document.getElementById('notificationDropdown');
        this.userMenuBtn = document.getElementById('userMenuBtn');
        this.userMenuDropdown = document.getElementById('userMenuDropdown');
        
        // Navigation elements
        this.navLinks = document.querySelectorAll('.nav-link');
    }
    
    /**
     * Vincula eventos aos elementos
     */
    bindEvents() {
        // Sidebar events
        if (this.sidebarToggleBtn) {
            this.sidebarToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleSidebar();
            });
        }
        
        if (this.sidebarCloseBtn) {
            this.sidebarCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeSidebar();
            });
        }
        
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => {
                this.closeSidebar();
            });
        }
        
        // Dropdown events
        if (this.notificationBtn) {
            this.notificationBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleNotificationDropdown();
            });
        }
        
        if (this.userMenuBtn) {
            this.userMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleUserMenuDropdown();
            });
        }
        
        // Global click event to close dropdowns
        document.addEventListener('click', (e) => {
            this.handleGlobalClick(e);
        });
        
        // Window resize event
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Escape key to close modals/dropdowns
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
    }
    
    /**
     * Configura funcionalidade da sidebar
     */
    setupSidebar() {
        if (!this.sidebar) return;
        
        // Marca o link ativo baseado na URL atual
        this.setActiveNavLink();
        
        // Configura hover effects para links
        this.navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                this.handleNavLinkHover(link, true);
            });
            
            link.addEventListener('mouseleave', () => {
                this.handleNavLinkHover(link, false);
            });
            
            // Adiciona ripple effect no clique
            link.addEventListener('click', (e) => {
                this.createRippleEffect(e, link);
            });
        });
        
        // Inicializa badges dinâmicos
        this.initializeDynamicBadges();
        
        // Atualiza badges periodicamente
        this.startBadgeUpdates();
    }
    
    /**
     * Configura dropdowns e suas funcionalidades
     */
    setupDropdowns() {
        // Setup notification dropdown
        if (this.notificationDropdown) {
            this.setupNotificationDropdown();
        }
        
        // Setup user menu dropdown
        if (this.userMenuDropdown) {
            this.setupUserMenuDropdown();
        }
    }
    
    /**
     * Configura dropdown de notificações
     */
    setupNotificationDropdown() {
        // Mark all as read functionality
        const markAllReadBtn = this.notificationDropdown.querySelector('.mark-all-read');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.markAllNotificationsRead();
            });
        }
        
        // Individual notification clicks
        const notificationItems = this.notificationDropdown.querySelectorAll('.notification-item');
        notificationItems.forEach(item => {
            item.addEventListener('click', () => {
                this.handleNotificationClick(item);
            });
        });
    }
    
    /**
     * Configura dropdown do menu do usuário
     */
    setupUserMenuDropdown() {
        // Setup user menu links
        const menuLinks = this.userMenuDropdown.querySelectorAll('.user-menu-link:not(.logout-link)');
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeUserMenuDropdown();
            });
        });
    }
    
    /**
     * Configura navegação por teclado
     */
    setupKeyboardNavigation() {
        // Tab navigation for sidebar
        this.navLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                this.handleNavKeydown(e, index);
            });
        });
    }
    
    /**
     * Configura melhorias de acessibilidade
     */
    setupAccessibility() {
        // Adiciona aria-labels dinâmicos
        if (this.notificationBtn) {
            const badge = this.notificationBtn.querySelector('.notification-badge');
            const count = badge ? badge.textContent : '0';
            this.notificationBtn.setAttribute('aria-label', 
                `Notificações${count !== '0' ? ` (${count} não lidas)` : ''}`);
        }
        
        // Configura aria-expanded para dropdowns
        if (this.notificationBtn) {
            this.notificationBtn.setAttribute('aria-expanded', 'false');
        }
        
        if (this.userMenuBtn) {
            this.userMenuBtn.setAttribute('aria-expanded', 'false');
        }
    }
    
    /**
     * Toggle da sidebar (mobile)
     */
    toggleSidebar() {
        if (!this.sidebar) return;
        
        const isOpen = this.sidebar.classList.contains('active');
        
        if (isOpen) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }
    
    /**
     * Abre a sidebar
     */
    openSidebar() {
        if (!this.sidebar) return;
        
        this.sidebar.classList.add('active');
        if (this.sidebarOverlay) {
            this.sidebarOverlay.classList.add('active');
        }
        
        // Previne scroll do body
        document.body.style.overflow = 'hidden';
        
        // Focus no primeiro link
        const firstLink = this.sidebar.querySelector('.nav-link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
    }
    
    /**
     * Fecha a sidebar
     */
    closeSidebar() {
        if (!this.sidebar) return;
        
        this.sidebar.classList.remove('active');
        if (this.sidebarOverlay) {
            this.sidebarOverlay.classList.remove('active');
        }
        
        // Restaura scroll do body
        document.body.style.overflow = '';
        
        // Retorna focus para o botão toggle
        if (this.sidebarToggleBtn) {
            this.sidebarToggleBtn.focus();
        }
    }
    
    /**
     * Toggle do dropdown de notificações
     */
    toggleNotificationDropdown() {
        if (!this.notificationDropdown) return;
        
        const isOpen = this.notificationDropdown.classList.contains('active');
        
        // Fecha outros dropdowns primeiro
        this.closeUserMenuDropdown();
        
        if (isOpen) {
            this.closeNotificationDropdown();
        } else {
            this.openNotificationDropdown();
        }
    }
    
    /**
     * Abre dropdown de notificações
     */
    openNotificationDropdown() {
        if (!this.notificationDropdown) return;
        
        this.notificationDropdown.classList.add('active');
        if (this.notificationBtn) {
            this.notificationBtn.setAttribute('aria-expanded', 'true');
        }
        
        // Focus no primeiro item
        const firstItem = this.notificationDropdown.querySelector('.notification-item, .mark-all-read');
        if (firstItem) {
            setTimeout(() => firstItem.focus(), 100);
        }
    }
    
    /**
     * Fecha dropdown de notificações
     */
    closeNotificationDropdown() {
        if (!this.notificationDropdown) return;
        
        this.notificationDropdown.classList.remove('active');
        if (this.notificationBtn) {
            this.notificationBtn.setAttribute('aria-expanded', 'false');
        }
    }
    
    /**
     * Toggle do dropdown do menu do usuário
     */
    toggleUserMenuDropdown() {
        if (!this.userMenuDropdown) return;
        
        const isOpen = this.userMenuDropdown.classList.contains('active');
        
        // Fecha outros dropdowns primeiro
        this.closeNotificationDropdown();
        
        if (isOpen) {
            this.closeUserMenuDropdown();
        } else {
            this.openUserMenuDropdown();
        }
    }
    
    /**
     * Abre dropdown do menu do usuário
     */
    openUserMenuDropdown() {
        if (!this.userMenuDropdown) return;
        
        this.userMenuDropdown.classList.add('active');
        if (this.userMenuBtn) {
            this.userMenuBtn.setAttribute('aria-expanded', 'true');
        }
        
        // Focus no primeiro link
        const firstLink = this.userMenuDropdown.querySelector('.user-menu-link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
    }
    
    /**
     * Fecha dropdown do menu do usuário
     */
    closeUserMenuDropdown() {
        if (!this.userMenuDropdown) return;
        
        this.userMenuDropdown.classList.remove('active');
        if (this.userMenuBtn) {
            this.userMenuBtn.setAttribute('aria-expanded', 'false');
        }
    }
    
    /**
     * Marca o link de navegação ativo baseado na URL
     */
    setActiveNavLink() {
        const currentPath = window.location.pathname;
        
        // Remove classe active de todos os links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Encontra e marca o link ativo
        const activeLink = Array.from(this.navLinks).find(link => {
            const linkPath = new URL(link.href).pathname;
            return currentPath === linkPath || 
                   (linkPath !== '/' && currentPath.startsWith(linkPath));
        });
        
        if (activeLink) {
            activeLink.classList.add('active');
            
            // Adiciona indicador visual especial para link ativo
            this.addActiveIndicator(activeLink);
        }
    }
    
    /**
     * Adiciona indicador visual para link ativo
     */
    addActiveIndicator(link) {
        // Remove indicadores existentes
        document.querySelectorAll('.nav-active-indicator').forEach(indicator => {
            indicator.remove();
        });
        
        // Cria novo indicador
        const indicator = document.createElement('div');
        indicator.className = 'nav-active-indicator';
        indicator.style.cssText = `
            position: absolute;
            left: -4px;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 60%;
            background: white;
            border-radius: 0 2px 2px 0;
            animation: slideIn 0.3s ease-out;
        `;
        
        link.style.position = 'relative';
        link.appendChild(indicator);
    }
    
    /**
     * Manipula hover nos links de navegação
     */
    handleNavLinkHover(link, isHover) {
        const icon = link.querySelector('.nav-icon');
        const badge = link.querySelector('.nav-badge');
        
        if (isHover) {
            // Adiciona classe de hover
            link.classList.add('nav-link-hover');
            
            // Anima ícone
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
            }
            
            // Anima badge
            if (badge && !badge.classList.contains('pulse')) {
                badge.style.transform = 'scale(1.1)';
            }
            
            // Adiciona tooltip se não existir
            this.showTooltip(link);
            
        } else {
            // Remove classe de hover
            link.classList.remove('nav-link-hover');
            
            // Restaura ícone
            if (icon) {
                icon.style.transform = '';
            }
            
            // Restaura badge
            if (badge && !badge.classList.contains('pulse')) {
                badge.style.transform = '';
            }
            
            // Remove tooltip
            this.hideTooltip();
        }
    }
    
    /**
     * Mostra tooltip com informações do link
     */
    showTooltip(link) {
        const title = link.getAttribute('title');
        if (!title) return;
        
        let tooltip = document.getElementById('nav-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'nav-tooltip';
            tooltip.style.cssText = `
                position: fixed;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                z-index: 10000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
            `;
            document.body.appendChild(tooltip);
        }
        
        tooltip.textContent = title;
        
        const rect = link.getBoundingClientRect();
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.top = `${rect.top + rect.height / 2 - tooltip.offsetHeight / 2}px`;
        tooltip.style.opacity = '1';
    }
    
    /**
     * Esconde tooltip
     */
    hideTooltip() {
        const tooltip = document.getElementById('nav-tooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 200);
        }
    }
    
    /**
     * Manipula clique global para fechar dropdowns
     */
    handleGlobalClick(e) {
        // Fecha dropdowns se clicou fora deles
        if (this.notificationDropdown && 
            !this.notificationBtn.contains(e.target) && 
            !this.notificationDropdown.contains(e.target)) {
            this.closeNotificationDropdown();
        }
        
        if (this.userMenuDropdown && 
            !this.userMenuBtn.contains(e.target) && 
            !this.userMenuDropdown.contains(e.target)) {
            this.closeUserMenuDropdown();
        }
    }
    
    /**
     * Manipula redimensionamento da janela
     */
    handleResize() {
        // Fecha sidebar em desktop
        if (window.innerWidth > 767) {
            this.closeSidebar();
        }
        
        // Fecha dropdowns em mudanças de orientação
        this.closeNotificationDropdown();
        this.closeUserMenuDropdown();
    }
    
    /**
     * Manipula tecla Escape
     */
    handleEscapeKey() {
        this.closeSidebar();
        this.closeNotificationDropdown();
        this.closeUserMenuDropdown();
    }
    
    /**
     * Manipula navegação por teclado na sidebar
     */
    handleNavKeydown(e, currentIndex) {
        let targetIndex = currentIndex;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                targetIndex = (currentIndex + 1) % this.navLinks.length;
                break;
            case 'ArrowUp':
                e.preventDefault();
                targetIndex = currentIndex === 0 ? this.navLinks.length - 1 : currentIndex - 1;
                break;
            case 'Home':
                e.preventDefault();
                targetIndex = 0;
                break;
            case 'End':
                e.preventDefault();
                targetIndex = this.navLinks.length - 1;
                break;
            default:
                return;
        }
        
        this.navLinks[targetIndex].focus();
    }
    
    /**
     * Marca todas as notificações como lidas
     */
    markAllNotificationsRead() {
        const unreadItems = this.notificationDropdown.querySelectorAll('.notification-item.unread');
        
        unreadItems.forEach(item => {
            item.classList.remove('unread');
        });
        
        // Atualiza badge
        const badge = this.notificationBtn.querySelector('.notification-badge');
        if (badge) {
            badge.style.display = 'none';
        }
        
        // Atualiza aria-label
        this.notificationBtn.setAttribute('aria-label', 'Notificações');
        
        // Aqui você pode adicionar uma chamada AJAX para marcar no servidor
        console.log('Todas as notificações foram marcadas como lidas');
    }
    
    /**
     * Manipula clique em notificação individual
     */
    handleNotificationClick(item) {
        if (item.classList.contains('unread')) {
            item.classList.remove('unread');
            
            // Atualiza contador
            const badge = this.notificationBtn.querySelector('.notification-badge');
            if (badge) {
                let count = parseInt(badge.textContent) - 1;
                if (count <= 0) {
                    badge.style.display = 'none';
                } else {
                    badge.textContent = count;
                }
            }
        }
        
        // Aqui você pode adicionar navegação ou ação específica
        console.log('Notificação clicada:', item);
    }
    
    /**
     * Utilitário para mostrar loading state
     */
    showLoading(element) {
        if (!element) return;
        
        element.classList.add('loading');
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        element.appendChild(spinner);
    }
    
    /**
     * Utilitário para esconder loading state
     */
    hideLoading(element) {
        if (!element) return;
        
        element.classList.remove('loading');
        const spinner = element.querySelector('.spinner');
        if (spinner) {
            spinner.remove();
        }
    }
    
    /**
     * Utilitário para mostrar toast/notificação
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Estilo inline para o toast
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease-in-out',
            backgroundColor: type === 'success' ? '#10B981' : 
                           type === 'error' ? '#EF4444' : 
                           type === 'warning' ? '#F59E0B' : '#3B82F6'
        });
        
        document.body.appendChild(toast);
        
        // Anima entrada
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove após duração
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }
    
    /**
     * Inicializa badges dinâmicos do menu lateral
     */
    initializeDynamicBadges() {
        // Simula dados dinâmicos para badges
        this.badgeData = {
            pendingTasks: 0,
            recentProgress: 0,
            newAchievements: 0,
            unreadMessages: 0,
            securityAlerts: 0
        };
        
        // Carrega dados iniciais dos badges
        this.loadBadgeData();
    }
    
    /**
     * Carrega dados dos badges do servidor
     */
    async loadBadgeData() {
        try {
            // Simula chamada para API de badges
            // Em uma implementação real, isso seria uma chamada fetch
            const mockData = await this.simulateBadgeAPI();
            
            this.badgeData = {
                ...this.badgeData,
                ...mockData
            };
            
            this.updateAllBadges();
        } catch (error) {
            console.warn('Erro ao carregar dados dos badges:', error);
        }
    }
    
    /**
     * Simula API de badges (substituir por fetch real no futuro)
     */
    async simulateBadgeAPI() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Dados simulados baseados em atividade do usuário
                const currentHour = new Date().getHours();
                const isActiveTime = currentHour >= 9 && currentHour <= 22;
                
                resolve({
                    pendingTasks: Math.random() < 0.3 ? Math.floor(Math.random() * 5) + 1 : 0,
                    recentProgress: isActiveTime && Math.random() < 0.4 ? Math.floor(Math.random() * 50) + 10 : 0,
                    newAchievements: Math.random() < 0.1 ? Math.floor(Math.random() * 3) + 1 : 0,
                    unreadMessages: Math.random() < 0.2 ? Math.floor(Math.random() * 8) + 1 : 0,
                    securityAlerts: Math.random() < 0.05 ? Math.floor(Math.random() * 2) + 1 : 0
                });
            }, 500);
        });
    }
    
    /**
     * Atualiza todos os badges do menu lateral
     */
    updateAllBadges() {
        // Dashboard - Tarefas pendentes
        this.updateBadge('dashboard', 'pendingTasks', this.badgeData.pendingTasks, 'pulse');
        
        // Progresso - Progresso recente
        this.updateBadge('progress', 'recentProgress', this.badgeData.recentProgress, 'success');
        
        // Conquistas - Novas conquistas
        this.updateBadge('achievements', 'newAchievements', this.badgeData.newAchievements, 'achievement-badge');
        
        // Chat - Mensagens não lidas
        this.updateBadge('chat', 'unreadMessages', this.badgeData.unreadMessages, 'message-badge pulse');
        
        // Segurança - Alertas de segurança
        this.updateBadge('security', 'securityAlerts', this.badgeData.securityAlerts, 'alert-badge pulse');
    }
    
    /**
     * Atualiza um badge específico
     */
    updateBadge(section, dataKey, value, badgeClasses = '') {
        const navLink = document.querySelector(`a[href*="/${section}"]`);
        if (!navLink) return;
        
        let badge = navLink.querySelector('.nav-badge');
        
        if (value > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = `nav-badge ${badgeClasses}`;
                navLink.appendChild(badge);
            } else {
                badge.className = `nav-badge ${badgeClasses}`;
            }
            
            // Formata o valor do badge
            let displayValue = value;
            if (dataKey === 'recentProgress') {
                displayValue = `+${value}`;
            } else if (value > 99) {
                displayValue = '99+';
            }
            
            badge.textContent = displayValue;
            badge.style.display = 'inline-block';
            
            // Adiciona animação de entrada
            badge.style.animation = 'none';
            setTimeout(() => {
                badge.style.animation = badgeClasses.includes('pulse') ? 'pulse 2s infinite' : '';
            }, 100);
            
        } else if (badge) {
            // Remove badge se valor for 0
            badge.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (badge.parentNode) {
                    badge.parentNode.removeChild(badge);
                }
            }, 300);
        }
    }
    
    /**
     * Inicia atualizações periódicas dos badges
     */
    startBadgeUpdates() {
        // Atualiza badges a cada 30 segundos
        this.badgeUpdateInterval = setInterval(() => {
            this.loadBadgeData();
        }, 30000);
        
        // Para atualizações quando a aba perde foco
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (this.badgeUpdateInterval) {
                    clearInterval(this.badgeUpdateInterval);
                }
            } else {
                this.startBadgeUpdates();
                this.loadBadgeData(); // Atualiza imediatamente ao voltar
            }
        });
    }
    
    /**
     * Cria efeito ripple no clique dos links
     */
    createRippleEffect(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
}

// Inicializa a aplicação quando o script carrega
const app = new CodePathApp();

// Expõe a instância globalmente para uso em outros scripts
window.CodePathApp = app;

// Utilitários globais
window.showToast = (message, type, duration) => app.showToast(message, type, duration);
window.showLoading = (element) => app.showLoading(element);
window.hideLoading = (element) => app.hideLoading(element);

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

// Aplicar ripple effect a todos os botões modernos
document.addEventListener('DOMContentLoaded', function() {
    const modernButtons = document.querySelectorAll('.btn-modern, .btn-primary, .btn-secondary');
    
    modernButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            createRippleEffect(this, e);
        });
    });
});

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

// Instância global do toast
window.modernToast = new ModernToast();

// Sistema de Modal Moderno
class ModernModal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.content = this.modal?.querySelector('.modal-content-modern');
        this.init();
    }
    
    init() {
        if (!this.modal) return;
        
        // Fechar ao clicar no overlay
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });
        
        // Botão de fechar
        const closeBtn = this.modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
    }
    
    open() {
        this.modal.classList.add('modal-show');
        document.body.style.overflow = 'hidden';
    }
    
    close() {
        this.modal.classList.remove('modal-show');
        document.body.style.overflow = '';
    }
    
    isOpen() {
        return this.modal.classList.contains('modal-show');
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
        this.setupBadgeAnimations();
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
            
            // Efeito de tilt sutil no hover
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
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
    
    setupBadgeAnimations() {
        const badges = document.querySelectorAll('.badge-modern, .difficulty-badge');
        
        badges.forEach(badge => {
            badge.addEventListener('mouseenter', () => {
                badge.style.transform = 'scale(1.05) translateY(-2px)';
            });
            
            badge.addEventListener('mouseleave', () => {
                badge.style.transform = '';
            });
        });
    }
}

// Sistema de Loading States
class ModernLoadingSystem {
    static showLoading(element, text = 'Carregando...') {
        const loading = document.createElement('div');
        loading.className = 'loading-modern';
        loading.innerHTML = `
            <div class="spinner-modern"></div>
            <span>${text}</span>
        `;
        
        element.style.position = 'relative';
        element.appendChild(loading);
        element.classList.add('loading-state');
        
        return loading;
    }
    
    static hideLoading(element) {
        const loading = element.querySelector('.loading-modern');
        if (loading) {
            loading.remove();
        }
        element.classList.remove('loading-state');
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
    
    // Criar card moderno
    createCard(content, variant = '', interactive = false) {
        const card = document.createElement('div');
        card.className = `card-modern ${variant} ${interactive ? 'card-interactive' : ''}`;
        
        if (typeof content === 'string') {
            card.innerHTML = content;
        } else {
            card.appendChild(content);
        }
        
        return card;
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
    // Inicializar sistema de cards
    new ModernCardSystem();
    
    // Configurar tooltips modernos
    const elementsWithTooltips = document.querySelectorAll('[data-tooltip]');
    elementsWithTooltips.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip-modern';
            tooltip.textContent = this.dataset.tooltip;
            tooltip.style.cssText = `
                position: absolute;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 1000;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
            
            setTimeout(() => tooltip.style.opacity = '1', 10);
            
            this.tooltipElement = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this.tooltipElement) {
                this.tooltipElement.remove();
                this.tooltipElement = null;
            }
        });
    });
    
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
        
        .loading-state {
            pointer-events: none;
            opacity: 0.7;
        }
        
        .loading-modern {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.9);
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .tooltip-modern {
            animation: tooltipFadeIn 0.2s ease;
        }
        
        @keyframes tooltipFadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
});

// Exportar para uso global
window.ModernComponents = ModernComponents;
window.ModernLoadingSystem = ModernLoadingSystem;
window.ModernModal = ModernModal;

// Utilitário para fade in/out
function fadeIn(element, duration = 600) {
  element.classList.remove('fade-out');
  element.classList.add('fade-in');
  element.style.animationDuration = duration + 'ms';
}
function fadeOut(element, duration = 400) {
  element.classList.remove('fade-in');
  element.classList.add('fade-out');
  element.style.animationDuration = duration + 'ms';
}

// Utilitário para slide up/down
function slideUp(element, duration = 700) {
  element.classList.remove('slide-down');
  element.classList.add('slide-up');
  element.style.animationDuration = duration + 'ms';
}
function slideDown(element, duration = 700) {
  element.classList.remove('slide-up');
  element.classList.add('slide-down');
  element.style.animationDuration = duration + 'ms';
}

// Ripple effect em botões
function addRippleEffect(button) {
  button.classList.add('ripple');
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = (e.clientX - button.getBoundingClientRect().left) + 'px';
    ripple.style.top = (e.clientY - button.getBoundingClientRect().top) + 'px';
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}

// Inicializar ripple em todos os botões .btn-primary e .btn-outline
document.querySelectorAll('.btn-primary, .btn-outline').forEach(addRippleEffect); 