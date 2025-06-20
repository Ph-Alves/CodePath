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
        });
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
        
        this.navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            
            if (linkPath === currentPath || 
                (currentPath === '/' && linkPath === '/dashboard')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    /**
     * Manipula hover nos links de navegação
     */
    handleNavLinkHover(link, isHover) {
        if (isHover && !link.classList.contains('active')) {
            link.style.transform = 'translateX(4px)';
        } else if (!isHover && !link.classList.contains('active')) {
            link.style.transform = '';
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
}

// Inicializa a aplicação quando o script carrega
const app = new CodePathApp();

// Expõe a instância globalmente para uso em outros scripts
window.CodePathApp = app;

// Utilitários globais
window.showToast = (message, type, duration) => app.showToast(message, type, duration);
window.showLoading = (element) => app.showLoading(element);
window.hideLoading = (element) => app.hideLoading(element); 