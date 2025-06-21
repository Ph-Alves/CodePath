/**
 * JavaScript para Minha Área - CodePath
 * Fase 25 - Funcionalidades Interativas Pendentes
 */

// ===== VARIÁVEIS GLOBAIS =====
let userStats = {};
let isLoading = false;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('[MY-AREA] Iniciando página Minha Área...');
    
    initializeMyArea();
    setupEventListeners();
    loadUserData();
    setupAnimations();
});

// ===== FUNÇÕES DE INICIALIZAÇÃO =====

/**
 * Inicializa a página Minha Área
 */
function initializeMyArea() {
    console.log('[MY-AREA] Inicializando componentes...');
    
    // Verificar se elementos principais existem
    const requiredElements = [
        '.profile-card',
        '.stat-box',
        '.package-progress-item'
    ];
    
    requiredElements.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
            console.warn(`[MY-AREA] Elementos não encontrados: ${selector}`);
        }
    });
    
    // Configurar tooltips se Bootstrap estiver disponível
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

/**
 * Configura os event listeners
 */
function setupEventListeners() {
    console.log('[MY-AREA] Configurando event listeners...');
    
    // Botões de ação
    const exportBtn = document.querySelector('[onclick="exportData()"]');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    const editProfileBtn = document.querySelector('[onclick="showEditProfile()"]');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', showEditProfile);
    }
    
    // Modal de edição de perfil
    const saveProfileBtn = document.querySelector('[onclick="saveProfile()"]');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfile);
    }
    
    // Cards interativos
    setupCardInteractions();
    
    // Refresh automático a cada 5 minutos
    setInterval(loadUserData, 5 * 60 * 1000);
}

/**
 * Configura interações dos cards
 */
function setupCardInteractions() {
    // Hover effects nos cards de estatísticas
    const statBoxes = document.querySelectorAll('.stat-box');
    statBoxes.forEach(box => {
        box.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 10px 25px -5px rgba(139, 92, 246, 0.25)';
        });
        
        box.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
    
    // Click nos cards de progresso de pacotes
    const packageItems = document.querySelectorAll('.package-progress-item');
    packageItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            const packageName = this.querySelector('h6').textContent;
            navigateToPackage(packageName);
        });
    });
    
    // Click nos itens de conquistas
    const achievementItems = document.querySelectorAll('.achievement-item');
    achievementItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            showAchievementDetails(this);
        });
    });
}

/**
 * Configura animações
 */
function setupAnimations() {
    // Animação de contadores
    animateCounters();
    
    // Animação de barras de progresso
    animateProgressBars();
    
    // Intersection Observer para animações de entrada
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            observer.observe(card);
        });
    }
}

// ===== FUNÇÕES DE DADOS =====

/**
 * Carrega dados do usuário
 */
async function loadUserData() {
    if (isLoading) return;
    
    console.log('[MY-AREA] Carregando dados do usuário...');
    isLoading = true;
    
    try {
        const response = await fetch('/api/user/my-area-data');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('[MY-AREA] Dados carregados:', data);
        
        userStats = data;
        updateUserInterface(data);
        
    } catch (error) {
        console.error('[MY-AREA] Erro ao carregar dados:', error);
        showErrorMessage('Erro ao carregar dados do usuário');
    } finally {
        isLoading = false;
    }
}

/**
 * Atualiza a interface com os dados
 */
function updateUserInterface(data) {
    console.log('[MY-AREA] Atualizando interface...');
    
    // Atualizar estatísticas
    updateStatistics(data.stats);
    
    // Atualizar progresso dos pacotes
    updatePackageProgress(data.packages);
    
    // Atualizar conquistas recentes
    updateRecentAchievements(data.recent_achievements);
    
    // Atualizar atividades recentes
    updateRecentActivities(data.recent_activities);
    
    // Atualizar metas
    updateGoals(data.goals);
}

/**
 * Atualiza as estatísticas
 */
function updateStatistics(stats) {
    if (!stats) return;
    
    const statMapping = {
        'lessons_completed': stats.lessons_completed || 0,
        'quizzes_completed': stats.quizzes_completed || 0,
        'achievements_earned': stats.achievements_earned || 0,
        'study_hours': stats.study_hours || 0
    };
    
    Object.entries(statMapping).forEach(([key, value]) => {
        const element = document.querySelector(`[data-stat="${key}"]`);
        if (element) {
            animateNumber(element, parseInt(value));
        }
    });
}

/**
 * Atualiza progresso dos pacotes
 */
function updatePackageProgress(packages) {
    if (!packages || !Array.isArray(packages)) return;
    
    packages.forEach(pkg => {
        const progressBar = document.querySelector(`[data-package="${pkg.id}"] .progress-bar`);
        if (progressBar) {
            setTimeout(() => {
                progressBar.style.width = `${pkg.progress_percentage}%`;
            }, 100);
        }
    });
}

// ===== FUNÇÕES DE ANIMAÇÃO =====

/**
 * Anima contadores numéricos
 */
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number, .stat-content h4');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent) || 0;
        animateNumber(counter, target);
    });
}

/**
 * Anima um número específico
 */
function animateNumber(element, target, duration = 1500) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        element.textContent = Math.floor(current);
    }, 16);
}

/**
 * Anima barras de progresso
 */
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    progressBars.forEach((bar, index) => {
        const width = bar.style.width || bar.getAttribute('aria-valuenow') + '%';
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.transition = 'width 1s ease-out';
            bar.style.width = width;
        }, index * 200);
    });
}

// ===== FUNÇÕES DE INTERAÇÃO =====

/**
 * Exporta dados do usuário
 */
function exportData() {
    console.log('[MY-AREA] Exportando dados do usuário...');
    
    if (!userStats || Object.keys(userStats).length === 0) {
        showErrorMessage('Nenhum dado disponível para exportar');
        return;
    }
    
    try {
        const dataToExport = {
            user_info: userStats.user,
            statistics: userStats.stats,
            packages_progress: userStats.packages,
            achievements: userStats.recent_achievements,
            activities: userStats.recent_activities,
            goals: userStats.goals,
            exported_at: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `codepath-dados-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showSuccessMessage('Dados exportados com sucesso!');
        
    } catch (error) {
        console.error('[MY-AREA] Erro ao exportar dados:', error);
        showErrorMessage('Erro ao exportar dados');
    }
}

/**
 * Mostra modal de edição de perfil
 */
function showEditProfile() {
    console.log('[MY-AREA] Abrindo modal de edição de perfil...');
    
    const modal = document.getElementById('editProfileModal');
    if (modal && typeof bootstrap !== 'undefined') {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        // Preencher campos com dados atuais
        populateProfileForm();
    }
}

/**
 * Preenche formulário de perfil
 */
function populateProfileForm() {
    if (!userStats.user) return;
    
    const nameInput = document.getElementById('editName');
    const emailInput = document.getElementById('editEmail');
    const educationSelect = document.getElementById('editEducation');
    
    if (nameInput) nameInput.value = userStats.user.name || '';
    if (emailInput) emailInput.value = userStats.user.email || '';
    if (educationSelect) educationSelect.value = userStats.user.education_level || '';
}

/**
 * Salva alterações do perfil
 */
async function saveProfile() {
    console.log('[MY-AREA] Salvando alterações do perfil...');
    
    const nameInput = document.getElementById('editName');
    const educationSelect = document.getElementById('editEducation');
    
    if (!nameInput || !educationSelect) {
        showErrorMessage('Erro nos campos do formulário');
        return;
    }
    
    const profileData = {
        name: nameInput.value.trim(),
        education_level: educationSelect.value
    };
    
    if (!profileData.name) {
        showErrorMessage('Nome é obrigatório');
        return;
    }
    
    try {
        const response = await fetch('/api/user/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('[MY-AREA] Perfil atualizado:', result);
        
        // Fechar modal
        const modal = document.getElementById('editProfileModal');
        if (modal && typeof bootstrap !== 'undefined') {
            const bsModal = bootstrap.Modal.getInstance(modal);
            bsModal.hide();
        }
        
        showSuccessMessage('Perfil atualizado com sucesso!');
        
        // Recarregar dados
        setTimeout(loadUserData, 1000);
        
    } catch (error) {
        console.error('[MY-AREA] Erro ao salvar perfil:', error);
        showErrorMessage('Erro ao salvar alterações');
    }
}

/**
 * Navega para página do pacote
 */
function navigateToPackage(packageName) {
    console.log('[MY-AREA] Navegando para pacote:', packageName);
    
    // Implementar navegação baseada no nome do pacote
    window.location.href = '/careers';
}

/**
 * Mostra detalhes de uma conquista
 */
function showAchievementDetails(achievementElement) {
    const name = achievementElement.querySelector('h6').textContent;
    const description = achievementElement.querySelector('p').textContent;
    
    console.log('[MY-AREA] Mostrando detalhes da conquista:', name);
    
    // Implementar modal ou tooltip com detalhes
    showInfoMessage(`${name}: ${description}`);
}

// ===== FUNÇÕES DE FEEDBACK =====

/**
 * Mostra mensagem de sucesso
 */
function showSuccessMessage(message) {
    showToast(message, 'success');
}

/**
 * Mostra mensagem de erro
 */
function showErrorMessage(message) {
    showToast(message, 'error');
}

/**
 * Mostra mensagem informativa
 */
function showInfoMessage(message) {
    showToast(message, 'info');
}

/**
 * Mostra toast notification
 */
function showToast(message, type = 'info') {
    // Criar elemento de toast
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    
    // Estilos do toast
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '0.5rem',
        color: 'white',
        fontWeight: '600',
        zIndex: '9999',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease-out'
    });
    
    // Cores por tipo
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        info: '#3B82F6',
        warning: '#F59E0B'
    };
    
    toast.style.backgroundColor = colors[type] || colors.info;
    
    // Adicionar ao DOM
    document.body.appendChild(toast);
    
    // Animar entrada
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Formata números grandes
 */
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

/**
 * Formata datas
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Debounce para otimizar performance
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

// ===== EXPORTAR FUNÇÕES GLOBAIS =====
window.exportData = exportData;
window.showEditProfile = showEditProfile;
window.saveProfile = saveProfile;

console.log('[MY-AREA] JavaScript carregado com sucesso!'); 