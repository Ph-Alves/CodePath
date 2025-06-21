/**
 * JavaScript do Sistema de Conquistas - Fase 24
 * Sistema completamente funcional com filtros, busca e animações
 */

class AchievementManager {
    constructor() {
        this.modal = null;
        this.loadingOverlay = null;
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.checkInterval = null;
        this.achievements = [];
        this.filteredAchievements = [];
        
        this.init();
    }
    
    /**
     * Inicializa o sistema de conquistas
     */
    init() {
        console.log('[ACHIEVEMENTS] Inicializando sistema de conquistas avançado...');
        
        // Elementos do DOM
        this.modal = document.getElementById('achievementModal');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        // Carrega dados iniciais
        this.loadInitialData();
        
        // Event listeners
        this.setupEventListeners();
        
        // Carrega progresso das conquistas
        this.loadAchievementProgress();
        
        // Atualiza streak no login
        this.updateStreak();
        
        // Verifica conquistas automaticamente
        this.startAutoCheck();
        
        // Adiciona sistema de busca
        this.setupSearchSystem();
        
        console.log('[ACHIEVEMENTS] Sistema inicializado com sucesso!');
    }
    
    /**
     * Carrega dados iniciais das conquistas
     */
    async loadInitialData() {
        try {
            const response = await fetch('/achievements/api/user');
            const data = await response.json();
            
            if (data.success) {
                this.achievements = data.data.achievements;
                this.filteredAchievements = [...this.achievements];
                console.log('[ACHIEVEMENTS] Dados carregados:', this.achievements.length, 'conquistas');
            }
        } catch (error) {
            console.error('[ACHIEVEMENTS] Erro ao carregar dados iniciais:', error);
        }
    }
    
    /**
     * Configura sistema de busca
     */
    setupSearchSystem() {
        // Cria campo de busca se não existir
        const header = document.querySelector('.achievements-header');
        if (header && !document.querySelector('.search-container')) {
            const searchContainer = document.createElement('div');
            searchContainer.className = 'search-container';
            searchContainer.innerHTML = `
                <div class="search-box">
                    <input type="text" id="achievementSearch" placeholder="Buscar conquistas..." class="search-input">
                    <span class="search-icon">🔍</span>
                </div>
                <div class="search-filters">
                    <button class="filter-status active" data-status="all">Todas</button>
                    <button class="filter-status" data-status="unlocked">Desbloqueadas</button>
                    <button class="filter-status" data-status="locked">Pendentes</button>
                </div>
            `;
            
            // Insere após os filtros de categoria
            const categoryFilters = document.querySelector('.category-filters');
            if (categoryFilters) {
                categoryFilters.parentNode.insertBefore(searchContainer, categoryFilters.nextSibling);
            }
            
            // Event listeners para busca
            const searchInput = document.getElementById('achievementSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.currentSearch = e.target.value.toLowerCase();
                    this.applyFilters();
                });
            }
            
            // Event listeners para filtros de status
            const statusFilters = document.querySelectorAll('.filter-status');
            statusFilters.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    statusFilters.forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.applyFilters();
                });
            });
        }
    }
    
    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Filtros de categoria
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterAchievements(e.target.dataset.category);
            });
        });
        
        // Cards de conquista (clique para ver progresso)
        const achievementCards = document.querySelectorAll('.achievement-card');
        achievementCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const achievementId = card.dataset.achievementId;
                this.showAchievementDetails(achievementId);
            });
            
            // Efeito hover melhorado
            card.addEventListener('mouseenter', () => {
                this.addHoverEffect(card);
            });
            
            card.addEventListener('mouseleave', () => {
                this.removeHoverEffect(card);
            });
        });
        
        // Modal - fechar
        if (this.modal) {
            const closeBtn = this.modal.querySelector('.modal-close');
            const continueBtn = this.modal.querySelector('.modal-continue');
            
            closeBtn?.addEventListener('click', () => this.hideModal());
            continueBtn?.addEventListener('click', () => this.hideModal());
            
            // Fechar clicando fora
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.hideModal();
                }
            });
        }
        
        // Tecla ESC para fechar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal?.classList.contains('show')) {
                this.hideModal();
            }
        });
        
        // Atalhos de teclado para filtros
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1': this.filterAchievements('beginner'); e.preventDefault(); break;
                    case '2': this.filterAchievements('progress'); e.preventDefault(); break;
                    case '3': this.filterAchievements('mastery'); e.preventDefault(); break;
                    case '4': this.filterAchievements('streak'); e.preventDefault(); break;
                    case '5': this.filterAchievements('social'); e.preventDefault(); break;
                    case '6': this.filterAchievements('special'); e.preventDefault(); break;
                    case '0': this.filterAchievements('all'); e.preventDefault(); break;
                }
            }
        });
    }
    
    /**
     * Aplica filtros combinados (categoria + busca + status)
     */
    applyFilters() {
        const activeStatusFilter = document.querySelector('.filter-status.active')?.dataset.status || 'all';
        
        // Filtra por categoria
        let filtered = this.currentFilter === 'all' 
            ? [...this.achievements] 
            : this.achievements.filter(a => a.category === this.currentFilter);
        
        // Filtra por status
        if (activeStatusFilter !== 'all') {
            filtered = filtered.filter(a => {
                return activeStatusFilter === 'unlocked' ? a.is_unlocked : !a.is_unlocked;
            });
        }
        
        // Filtra por busca
        if (this.currentSearch) {
            filtered = filtered.filter(a => 
                a.name.toLowerCase().includes(this.currentSearch) ||
                a.description.toLowerCase().includes(this.currentSearch) ||
                a.category.toLowerCase().includes(this.currentSearch)
            );
        }
        
        this.filteredAchievements = filtered;
        this.updateAchievementDisplay();
    }
    
    /**
     * Atualiza exibição das conquistas filtradas
     */
    updateAchievementDisplay() {
        const sections = document.querySelectorAll('.category-section');
        
        sections.forEach(section => {
            const category = section.dataset.category;
            const categoryAchievements = this.filteredAchievements.filter(a => a.category === category);
            
            if (categoryAchievements.length > 0 && (this.currentFilter === 'all' || this.currentFilter === category)) {
                section.style.display = 'block';
                section.classList.remove('hidden');
                
                // Atualiza cards dentro da seção
                const achievementsRow = section.querySelector('.achievements-row');
                if (achievementsRow) {
                    const cards = achievementsRow.querySelectorAll('.achievement-card');
                    cards.forEach(card => {
                        const cardId = parseInt(card.dataset.achievementId);
                        const shouldShow = categoryAchievements.some(a => a.id === cardId);
                        
                        if (shouldShow) {
                            card.style.display = 'block';
                            card.classList.remove('filtered-out');
                        } else {
                            card.style.display = 'none';
                            card.classList.add('filtered-out');
                        }
                    });
                }
            } else {
                section.style.display = 'none';
                section.classList.add('hidden');
            }
        });
        
        // Mostra mensagem se não houver resultados
        this.showEmptyState();
        
        // Animação de entrada
        this.animateFilteredResults();
    }
    
    /**
     * Mostra estado vazio quando não há resultados
     */
    showEmptyState() {
        const visibleCards = document.querySelectorAll('.achievement-card:not(.filtered-out):not([style*="display: none"])');
        
        let emptyState = document.querySelector('.empty-achievements-state');
        
        if (visibleCards.length === 0) {
            if (!emptyState) {
                emptyState = document.createElement('div');
                emptyState.className = 'empty-achievements-state';
                emptyState.innerHTML = `
                    <div class="empty-state-content">
                        <div class="empty-state-icon">🔍</div>
                        <h3>Nenhuma conquista encontrada</h3>
                        <p>Tente ajustar os filtros ou termo de busca</p>
                        <button class="btn-secondary" onclick="achievementManager.clearFilters()">
                            Limpar Filtros
                        </button>
                    </div>
                `;
                
                const grid = document.querySelector('.achievements-grid');
                if (grid) {
                    grid.appendChild(emptyState);
                }
            }
            emptyState.style.display = 'block';
        } else {
            if (emptyState) {
                emptyState.style.display = 'none';
            }
        }
    }
    
    /**
     * Limpa todos os filtros
     */
    clearFilters() {
        // Limpa busca
        const searchInput = document.getElementById('achievementSearch');
        if (searchInput) {
            searchInput.value = '';
            this.currentSearch = '';
        }
        
        // Reseta filtro de categoria
        this.filterAchievements('all');
        
        // Reseta filtro de status
        const statusFilters = document.querySelectorAll('.filter-status');
        statusFilters.forEach(btn => btn.classList.remove('active'));
        document.querySelector('.filter-status[data-status="all"]')?.classList.add('active');
        
        this.applyFilters();
    }
    
    /**
     * Anima resultados filtrados
     */
    animateFilteredResults() {
        const visibleSections = document.querySelectorAll('.category-section:not(.hidden)');
        
        visibleSections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                section.style.transition = 'all 0.4s ease';
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    /**
     * Filtra conquistas por categoria
     */
    filterAchievements(category) {
        console.log('[ACHIEVEMENTS] Filtrando por categoria:', category);
        
        this.currentFilter = category;
        
        // Atualiza botões ativos
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`)?.classList.add('active');
        
        this.applyFilters();
    }
    
    /**
     * Adiciona efeito hover melhorado
     */
    addHoverEffect(card) {
        if (!card.classList.contains('unlocked')) {
            card.style.transform = 'translateY(-8px) scale(1.02)';
            card.style.boxShadow = '0 12px 40px rgba(139, 69, 255, 0.3)';
        } else {
            card.style.transform = 'translateY(-5px) scale(1.01)';
            card.style.boxShadow = '0 8px 30px rgba(34, 197, 94, 0.3)';
        }
    }
    
    /**
     * Remove efeito hover
     */
    removeHoverEffect(card) {
        card.style.transform = '';
        card.style.boxShadow = '';
    }
    
    /**
     * Carrega o progresso das conquistas não desbloqueadas
     */
    async loadAchievementProgress() {
        console.log('[ACHIEVEMENTS] Carregando progresso das conquistas...');
        
        const lockedCards = document.querySelectorAll('.achievement-card:not(.unlocked)');
        
        for (const card of lockedCards) {
            const achievementId = card.dataset.achievementId;
            
            try {
                const response = await fetch(`/achievements/api/progress/${achievementId}`);
                const data = await response.json();
                
                if (data.success) {
                    this.updateProgressBar(card, data.data);
                }
            } catch (error) {
                console.error('[ACHIEVEMENTS] Erro ao carregar progresso:', error);
            }
        }
    }
    
    /**
     * Atualiza a barra de progresso de uma conquista
     */
    updateProgressBar(card, progressData) {
        const progressBar = card.querySelector('.progress-fill-small');
        const progressText = card.querySelector('.progress-text-small');
        
        if (progressBar && progressText) {
            const percentage = progressData.progressPercentage;
            
            // Animação da barra de progresso
            setTimeout(() => {
                progressBar.style.width = `${percentage}%`;
                progressBar.style.transition = 'width 1.5s ease-out';
            }, 100);
            
            progressText.textContent = `${percentage}% (${progressData.currentValue}/${progressData.targetValue})`;
            
            // Adiciona classe para progresso alto
            if (percentage >= 80) {
                progressBar.classList.add('high-progress');
                card.classList.add('near-completion');
            }
        }
    }
    
    /**
     * Mostra detalhes de uma conquista
     */
    async showAchievementDetails(achievementId) {
        console.log('[ACHIEVEMENTS] Mostrando detalhes da conquista:', achievementId);
        
        try {
            const response = await fetch(`/achievements/api/progress/${achievementId}`);
            const data = await response.json();
            
            if (data.success) {
                const achievement = data.data;
                
                if (achievement.achievement.is_unlocked) {
                    this.showUnlockedAchievementDetails(achievement);
                } else {
                    this.showProgressDetails(achievement);
                }
            }
        } catch (error) {
            console.error('[ACHIEVEMENTS] Erro ao buscar detalhes:', error);
        }
    }
    
    /**
     * Mostra detalhes de conquista desbloqueada
     */
    showUnlockedAchievementDetails(achievement) {
        const modal = this.modal;
        if (!modal) return;
        
        modal.querySelector('.modal-title').textContent = '🎉 Conquista Desbloqueada!';
        modal.querySelector('.modal-achievement-icon').textContent = achievement.achievement.icon;
        modal.querySelector('.modal-achievement-name').textContent = achievement.achievement.name;
        modal.querySelector('.modal-achievement-description').textContent = achievement.achievement.description;
        modal.querySelector('.xp-amount').textContent = `+${achievement.achievement.xp_reward} XP`;
        
        // Adiciona informações extras
        const modalBody = modal.querySelector('.modal-body');
        let extraInfo = modalBody.querySelector('.extra-info');
        if (!extraInfo) {
            extraInfo = document.createElement('div');
            extraInfo.className = 'extra-info';
            modalBody.appendChild(extraInfo);
        }
        
        extraInfo.innerHTML = `
            <div class="achievement-category">
                <span class="category-badge ${achievement.achievement.category}">
                    ${this.getCategoryName(achievement.achievement.category)}
                </span>
            </div>
            <div class="unlock-date">
                Desbloqueada em ${achievement.achievement.unlocked_at || 'Data não disponível'}
            </div>
        `;
        
        this.showModal();
    }
    
    /**
     * Mostra progresso de conquista pendente
     */
    showProgressDetails(achievement) {
        const modal = this.modal;
        if (!modal) return;
        
        modal.querySelector('.modal-title').textContent = '📊 Progresso da Conquista';
        modal.querySelector('.modal-achievement-icon').textContent = achievement.achievement.icon;
        modal.querySelector('.modal-achievement-name').textContent = achievement.achievement.name;
        modal.querySelector('.modal-achievement-description').textContent = achievement.achievement.description;
        modal.querySelector('.xp-amount').textContent = `+${achievement.achievement.xp_reward} XP`;
        
        // Adiciona barra de progresso no modal
        const modalBody = modal.querySelector('.modal-body');
        let progressInfo = modalBody.querySelector('.progress-info');
        if (!progressInfo) {
            progressInfo = document.createElement('div');
            progressInfo.className = 'progress-info';
            modalBody.appendChild(progressInfo);
        }
        
        progressInfo.innerHTML = `
            <div class="modal-progress-section">
                <div class="progress-header">
                    <span>Progresso: ${achievement.currentValue}/${achievement.targetValue}</span>
                    <span class="progress-percentage">${achievement.progressPercentage}%</span>
                </div>
                <div class="progress-bar-modal">
                    <div class="progress-fill-modal" style="width: ${achievement.progressPercentage}%"></div>
                </div>
                <div class="progress-tips">
                    ${this.getProgressTips(achievement.achievement)}
                </div>
            </div>
        `;
        
        this.showModal();
    }
    
    /**
     * Obtém nome da categoria
     */
    getCategoryName(category) {
        const categories = {
            'beginner': 'Iniciante',
            'progress': 'Progresso',
            'mastery': 'Maestria',
            'streak': 'Consistência',
            'social': 'Social',
            'special': 'Especiais'
        };
        return categories[category] || category;
    }
    
    /**
     * Obtém dicas de progresso
     */
    getProgressTips(achievement) {
        const tips = {
            'lessons_completed': '💡 Dica: Continue assistindo às aulas para desbloquear esta conquista!',
            'quizzes_completed': '🧠 Dica: Faça mais questionários para testar seus conhecimentos!',
            'packages_completed': '📦 Dica: Complete todos os módulos de um pacote para conquistar!',
            'streak_days': '🔥 Dica: Estude todos os dias para manter seu streak!',
            'total_xp': '⚡ Dica: Ganhe XP completando aulas e questionários!',
            'perfect_quizzes': '🎯 Dica: Acerte 100% dos questionários para esta conquista!',
            'study_hours': '⏰ Dica: Continue estudando para acumular horas de estudo!'
        };
        return tips[achievement.requirement_type] || '💪 Continue se dedicando aos estudos!';
    }
    
    /**
     * Atualiza streak do usuário
     */
    async updateStreak() {
        try {
            const response = await fetch('/achievements/api/streak', { method: 'POST' });
            const data = await response.json();
            
            if (data.success) {
                this.updateStreakDisplay(data.data);
                
                // Verifica se há novas conquistas
                if (data.data.newAchievements && data.data.newAchievements.length > 0) {
                    data.data.newAchievements.forEach(achievement => {
                        setTimeout(() => this.showAchievementUnlocked(achievement), 1000);
                    });
                }
            }
        } catch (error) {
            console.error('[ACHIEVEMENTS] Erro ao atualizar streak:', error);
        }
    }
    
    /**
     * Atualiza exibição do streak
     */
    updateStreakDisplay(streakData) {
        const streakElements = document.querySelectorAll('.stat-number');
        streakElements.forEach(element => {
            const parent = element.closest('.streak-card');
            if (parent) {
                element.innerHTML = `<span class="streak-icon">🔥</span>${streakData.streak}`;
                
                // Animação de streak
                if (streakData.isNewDay) {
                    element.classList.add('streak-updated');
                    setTimeout(() => element.classList.remove('streak-updated'), 2000);
                }
            }
        });
    }
    
    /**
     * Inicia verificação automática de conquistas
     */
    startAutoCheck() {
        // Verifica a cada 30 segundos
        this.checkInterval = setInterval(() => {
            this.checkForNewAchievements();
        }, 30000);
        
        // Verifica imediatamente
        setTimeout(() => this.checkForNewAchievements(), 2000);
    }
    
    /**
     * Verifica novas conquistas
     */
    async checkForNewAchievements() {
        try {
            const response = await fetch('/achievements/api/check', { method: 'POST' });
            const data = await response.json();
            
            if (data.success && data.data.newAchievements.length > 0) {
                console.log('[ACHIEVEMENTS] Novas conquistas encontradas:', data.data.newAchievements.length);
                
                // Mostra cada conquista com delay
                data.data.newAchievements.forEach((achievement, index) => {
                    setTimeout(() => {
                        this.showAchievementUnlocked(achievement);
                    }, index * 3000);
                });
            }
        } catch (error) {
            console.error('[ACHIEVEMENTS] Erro ao verificar conquistas:', error);
        }
    }
    
    /**
     * Mostra conquista desbloqueada
     */
    showAchievementUnlocked(achievement) {
        // Atualiza o card na página
        this.updateAchievementCard(achievement);
        
        // Mostra modal de conquista
        this.showAchievementModal(achievement);
        
        // Efeitos especiais
        this.playAchievementSound();
        this.showConfetti();
        
        // Atualiza estatísticas
        this.updateStats();
    }
    
    /**
     * Mostra modal de conquista desbloqueada
     */
    showAchievementModal(achievement) {
        const modal = this.modal;
        if (!modal) return;
        
        modal.querySelector('.modal-title').textContent = '🎉 Conquista Desbloqueada!';
        modal.querySelector('.modal-achievement-icon').textContent = achievement.icon;
        modal.querySelector('.modal-achievement-name').textContent = achievement.name;
        modal.querySelector('.modal-achievement-description').textContent = achievement.description;
        modal.querySelector('.xp-amount').textContent = `+${achievement.xp_reward} XP`;
        
        this.showModal();
        
        // Auto-fecha após 5 segundos
        setTimeout(() => {
            if (modal.classList.contains('show')) {
                this.hideModal();
            }
        }, 5000);
    }
    
    /**
     * Mostra modal
     */
    showModal() {
        if (this.modal) {
            this.modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }
    
    /**
     * Esconde modal
     */
    hideModal() {
        if (this.modal) {
            this.modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
    
    /**
     * Atualiza card de conquista
     */
    updateAchievementCard(achievement) {
        const card = document.querySelector(`[data-achievement-id="${achievement.id}"]`);
        if (card) {
            card.classList.add('unlocked');
            card.classList.add('newly-unlocked');
            
            // Atualiza badge
            const badge = card.querySelector('.achievement-badge');
            if (badge) {
                badge.innerHTML = '<span class="badge-unlocked">✓</span>';
            }
            
            // Remove barra de progresso
            const progressSection = card.querySelector('.achievement-progress');
            if (progressSection) {
                progressSection.remove();
            }
            
            // Adiciona data de desbloqueio
            const content = card.querySelector('.achievement-content');
            if (content && !content.querySelector('.achievement-unlocked-date')) {
                const dateElement = document.createElement('div');
                dateElement.className = 'achievement-unlocked-date';
                dateElement.textContent = `Desbloqueada agora mesmo!`;
                content.appendChild(dateElement);
            }
            
            // Animação de desbloqueio
            setTimeout(() => {
                card.classList.remove('newly-unlocked');
            }, 3000);
        }
    }
    
    /**
     * Toca som de conquista
     */
    playAchievementSound() {
        // Cria elemento de áudio temporário
        const audio = document.createElement('audio');
        audio.volume = 0.3;
        
        // Som simulado com Web Audio API (fallback)
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('[ACHIEVEMENTS] Som não disponível:', error);
        }
    }
    
    /**
     * Mostra efeito confetti
     */
    showConfetti() {
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'confetti-container';
        document.body.appendChild(confettiContainer);
        
        // Cria partículas de confetti
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = this.getRandomColor();
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            
            confettiContainer.appendChild(confetti);
        }
        
        // Remove após animação
        setTimeout(() => {
            confettiContainer.remove();
        }, 5000);
    }
    
    /**
     * Obtém cor aleatória para confetti
     */
    getRandomColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * Atualiza estatísticas na página
     */
    async updateStats() {
        try {
            const response = await fetch('/achievements/api/stats');
            const data = await response.json();
            
            if (data.success) {
                const stats = data.data.achievementStats;
                
                // Atualiza números na página
                const unlockedElement = document.querySelector('.stat-number');
                const percentageElement = document.querySelector('.stat-card .stat-number');
                
                if (unlockedElement) {
                    unlockedElement.textContent = stats.unlocked_achievements;
                }
                
                // Atualiza barra de progresso geral
                const progressFill = document.querySelector('.progress-fill');
                if (progressFill) {
                    progressFill.style.width = `${stats.completion_percentage}%`;
                }
            }
        } catch (error) {
            console.error('[ACHIEVEMENTS] Erro ao atualizar estatísticas:', error);
        }
    }
    
    /**
     * Mostra loading
     */
    showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'flex';
        }
    }
    
    /**
     * Esconde loading
     */
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.style.display = 'none';
        }
    }
    
    /**
     * Limpa recursos
     */
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}

// Inicializa o sistema quando a página carrega
let achievementManager;

document.addEventListener('DOMContentLoaded', () => {
    achievementManager = new AchievementManager();
});

// Limpa recursos quando a página é fechada
window.addEventListener('beforeunload', () => {
    if (achievementManager) {
        achievementManager.destroy();
    }
}); 