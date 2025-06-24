/**
 * CodePath - Settings JavaScript
 * Fase 26 - Polish Final
 * 
 * Sistema completo de configurações com abas funcionais e formulários interativos
 */

class SettingsManager {
    constructor() {
        this.initializeSettings();
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupKeyboardShortcuts();
        this.initializeToggles();
        this.initializeRangeSliders();
        
        console.log('[SETTINGS] Sistema de configurações inicializado');
    }

    /**
     * Inicializar configurações da página
     */
    initializeSettings() {
        // Ativar primeira aba por padrão
        const firstTab = document.querySelector('.settings-tab');
        const firstTabContent = document.querySelector('.settings-tab-content');
        
        if (firstTab && firstTabContent) {
            firstTab.classList.add('active');
            firstTabContent.classList.add('active');
        }

        // Aplicar animações de entrada
        this.animatePageEntrance();
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Navegação entre abas
        const tabs = document.querySelectorAll('.settings-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e));
        });

        // Formulários
        const forms = document.querySelectorAll('.settings-form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        });

        // Botões de ação especiais
        this.setupSpecialButtons();
    }

    /**
     * Trocar aba ativa
     */
    switchTab(event) {
        const clickedTab = event.currentTarget;
        const targetTab = clickedTab.dataset.tab;

        // Remover classe active de todas as abas e conteúdos
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.settings-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Ativar aba clicada
        clickedTab.classList.add('active');
        
        // Ativar conteúdo correspondente
        const targetContent = document.getElementById(`${targetTab}-tab`);
        if (targetContent) {
            targetContent.classList.add('active');
            
            // Animar entrada do conteúdo
            targetContent.style.opacity = '0';
            targetContent.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                targetContent.style.transition = 'all 0.3s ease';
                targetContent.style.opacity = '1';
                targetContent.style.transform = 'translateY(0)';
            }, 50);
        }

        console.log(`[SETTINGS] Aba alterada para: ${targetTab}`);
    }

    /**
     * Processar submissão de formulários
     */
    async handleFormSubmit(event) {
        event.preventDefault();
        
        const form = event.currentTarget;
        const formId = form.id;
        
        // Mostrar loading
        this.showFormLoading(form, true);
        
        try {
            let endpoint = '';
            let successMessage = '';
            
            // Determinar endpoint baseado no formulário
            switch (formId) {
                case 'profile-form':
                    endpoint = '/settings/profile';
                    successMessage = 'Perfil atualizado com sucesso!';
                    break;
                case 'password-form':
                    endpoint = '/settings/password';
                    successMessage = 'Senha alterada com sucesso!';
                    break;
                case 'notifications-form':
                case 'privacy-form':
                case 'learning-form':
                case 'appearance-form':
                    endpoint = '/settings/save';
                    successMessage = 'Configurações salvas com sucesso!';
                    break;
                default:
                    throw new Error('Formulário não reconhecido');
            }
            
            // Coletar dados do formulário
            const formData = new FormData(form);
            const data = this.formDataToObject(formData);
            
            // Enviar dados
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showSuccess(successMessage);
                
                // Ações específicas após sucesso
                if (formId === 'password-form') {
                    form.reset(); // Limpar formulário de senha
                }
                
                if (formId === 'appearance-form') {
                    this.applyThemeChanges(data);
                }
                
            } else {
                this.showError(result.message || 'Erro ao salvar configurações');
            }
            
        } catch (error) {
            console.error('[SETTINGS] Erro ao submeter formulário:', error);
            this.showError('Erro de conexão. Tente novamente.');
        } finally {
            this.showFormLoading(form, false);
        }
    }

    /**
     * Converter FormData para objeto
     */
    formDataToObject(formData) {
        const obj = {};
        
        for (let [key, value] of formData.entries()) {
            // Tratar checkboxes
            if (value === 'on') {
                obj[key] = true;
            } else if (document.querySelector(`input[name="${key}"][type="checkbox"]`)) {
                obj[key] = false;
            } else {
                obj[key] = value;
            }
        }
        
        // Adicionar checkboxes não marcados
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (!formData.has(checkbox.name)) {
                obj[checkbox.name] = false;
            }
        });
        
        return obj;
    }

    /**
     * Configurar validação de formulários
     */
    setupFormValidation() {
        // Validação em tempo real para campos de senha
        const newPasswordField = document.getElementById('new_password');
        const confirmPasswordField = document.getElementById('confirm_password');
        
        if (newPasswordField && confirmPasswordField) {
            confirmPasswordField.addEventListener('input', () => {
                this.validatePasswordMatch();
            });
            
            newPasswordField.addEventListener('input', () => {
                this.validatePasswordStrength();
                this.validatePasswordMatch();
            });
        }

        // Validação de email
        const emailField = document.getElementById('email');
        if (emailField) {
            emailField.addEventListener('input', () => {
                this.validateEmail();
            });
        }
    }

    /**
     * Validar correspondência de senhas
     */
    validatePasswordMatch() {
        const newPassword = document.getElementById('new_password');
        const confirmPassword = document.getElementById('confirm_password');
        
        if (!newPassword || !confirmPassword) return;
        
        if (confirmPassword.value && newPassword.value !== confirmPassword.value) {
            this.showFieldError(confirmPassword, 'Senhas não coincidem');
        } else {
            this.clearFieldError(confirmPassword);
        }
    }

    /**
     * Validar força da senha
     */
    validatePasswordStrength() {
        const passwordField = document.getElementById('new_password');
        if (!passwordField) return;
        
        const password = passwordField.value;
        
        if (password.length < 6) {
            this.showFieldError(passwordField, 'Senha deve ter pelo menos 6 caracteres');
        } else if (password.length < 8) {
            this.showFieldWarning(passwordField, 'Senha fraca - use pelo menos 8 caracteres');
        } else {
            this.clearFieldError(passwordField);
        }
    }

    /**
     * Validar email
     */
    validateEmail() {
        const emailField = document.getElementById('email');
        if (!emailField) return;
        
        const email = emailField.value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            this.showFieldError(emailField, 'Email inválido');
        } else {
            this.clearFieldError(emailField);
        }
    }

    /**
     * Mostrar erro em campo específico
     */
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    /**
     * Mostrar aviso em campo específico
     */
    showFieldWarning(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('warning');
        
        const warningDiv = document.createElement('div');
        warningDiv.className = 'field-warning';
        warningDiv.textContent = message;
        
        field.parentNode.appendChild(warningDiv);
    }

    /**
     * Limpar erro de campo
     */
    clearFieldError(field) {
        field.classList.remove('error', 'warning');
        
        const existingError = field.parentNode.querySelector('.field-error, .field-warning');
        if (existingError) {
            existingError.remove();
        }
    }

    /**
     * Configurar botões especiais
     */
    setupSpecialButtons() {
        // Botão de exportar dados
        const exportButton = document.querySelector('[onclick="exportUserData()"]');
        if (exportButton) {
            exportButton.removeAttribute('onclick');
            exportButton.addEventListener('click', () => this.exportUserData());
        }

        // Botões de reset de formulário
        const resetButtons = document.querySelectorAll('[onclick^="resetForm"]');
        resetButtons.forEach(button => {
            const formId = button.getAttribute('onclick').match(/resetForm\('(.+)'\)/)?.[1];
            if (formId) {
                button.removeAttribute('onclick');
                button.addEventListener('click', () => this.resetForm(formId));
            }
        });
    }

    /**
     * Exportar dados do usuário
     */
    async exportUserData() {
        try {
            this.showInfo('Preparando exportação de dados...');
            
            const response = await fetch('/settings/export', {
                method: 'GET'
            });
            
            if (response.ok) {
                // Criar download do arquivo
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `codepath-dados-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                this.showSuccess('Dados exportados com sucesso!');
            } else {
                throw new Error('Erro na exportação');
            }
            
        } catch (error) {
            console.error('[SETTINGS] Erro ao exportar dados:', error);
            this.showError('Erro ao exportar dados. Tente novamente.');
        }
    }

    /**
     * Resetar formulário
     */
    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            
            // Limpar erros de validação
            const errorElements = form.querySelectorAll('.field-error, .field-warning');
            errorElements.forEach(el => el.remove());
            
            const fields = form.querySelectorAll('.error, .warning');
            fields.forEach(field => field.classList.remove('error', 'warning'));
            
            this.showInfo('Formulário resetado');
        }
    }

    /**
     * Inicializar toggles (switches)
     */
    initializeToggles() {
        const toggles = document.querySelectorAll('.toggle-label input[type="checkbox"]');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const label = e.target.closest('.toggle-label');
                if (label) {
                    label.classList.toggle('checked', e.target.checked);
                }
            });
            
            // Aplicar estado inicial
            const label = toggle.closest('.toggle-label');
            if (label) {
                label.classList.toggle('checked', toggle.checked);
            }
        });
    }

    /**
     * Inicializar sliders de range
     */
    initializeRangeSliders() {
        const rangeSliders = document.querySelectorAll('input[type="range"]');
        rangeSliders.forEach(slider => {
            const valueDisplay = document.getElementById(slider.id.replace('_', '-') + '-value');
            
            if (valueDisplay) {
                // Atualizar valor exibido
                slider.addEventListener('input', () => {
                    valueDisplay.textContent = slider.value;
                });
                
                // Definir valor inicial
                valueDisplay.textContent = slider.value;
            }
        });
    }

    /**
     * Aplicar mudanças de tema
     */
    applyThemeChanges(data) {
        if (data.theme_mode) {
            document.documentElement.setAttribute('data-theme', data.theme_mode);
        }
        
        if (data.font_size) {
            document.documentElement.setAttribute('data-font-size', data.font_size);
        }
        
        if (data.animations === false) {
            document.documentElement.classList.add('no-animations');
        } else {
            document.documentElement.classList.remove('no-animations');
        }
    }

    /**
     * Mostrar loading no formulário
     */
    showFormLoading(form, loading) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (!submitButton) return;
        
        if (loading) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        } else {
            submitButton.disabled = false;
            // Restaurar texto original
            const originalText = submitButton.dataset.originalText || 'Salvar';
            submitButton.innerHTML = `<i class="fas fa-save"></i> ${originalText}`;
        }
    }

    /**
     * Animar entrada da página
     */
    animatePageEntrance() {
        const sections = document.querySelectorAll('.settings-section');
        sections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                section.style.transition = 'all 0.5s ease';
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    /**
     * Mostrar mensagem de sucesso
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Mostrar mensagem de erro
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Mostrar mensagem de informação
     */
    showInfo(message) {
        this.showNotification(message, 'info');
    }

    /**
     * Mostrar notificação
     */
    showNotification(message, type = 'info') {
        // Remover notificações existentes
        const existingNotifications = document.querySelectorAll('.settings-notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = `settings-notification ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                     type === 'error' ? 'exclamation-circle' : 
                     'info-circle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
            <button class="close-notification" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Adicionar ao topo da página
        const container = document.querySelector('.settings-container');
        if (container) {
            container.insertBefore(notification, container.firstChild);
            
            // Auto-remover após 5 segundos
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.opacity = '0';
                    setTimeout(() => notification.remove(), 300);
                }
            }, 5000);
        }
    }

    /**
     * Configurar atalhos de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + S para salvar
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                const activeForm = document.querySelector('.settings-tab-content.active form');
                if (activeForm) {
                    activeForm.dispatchEvent(new Event('submit'));
                }
            }

            // Escape para limpar validação
            if (e.key === 'Escape') {
                const focusedInput = document.activeElement;
                if (focusedInput && focusedInput.matches('input, textarea')) {
                    this.clearFieldError(focusedInput);
                }
            }
        });
    }
}

// Funções globais para compatibilidade
window.resetForm = function(formId) {
    const settingsManager = window.settingsManager;
    if (settingsManager) {
        settingsManager.resetForm(formId);
    }
};

window.exportUserData = function() {
    const settingsManager = window.settingsManager;
    if (settingsManager) {
        settingsManager.exportUserData();
    }
};

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
}); 