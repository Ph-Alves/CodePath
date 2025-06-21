/**
 * JavaScript do Sistema de Conquistas
 * Gerencia interações e atualizações em tempo real
 */

class AchievementManager {
    constructor() {
        this.modal = null;
        this.loadingOverlay = null;
        this.currentFilter = 'all';
        this.checkInterval = null;
        
        this.init();
    }
    
    /**
     * Inicializa o sistema de conquistas
     */
    init() {
        console.log('[ACHIEVEMENTS] Inicializando sistema de conquistas...');
        
        // Elementos do DOM
        this.modal = document.getElementById('achievementModal');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        // Event listeners
        this.setupEventListeners();
        
        // Carrega progresso das conquistas
        this.loadAchievementProgress();
        
        // Atualiza streak no login
        this.updateStreak();
        
        // Verifica conquistas automaticamente
        this.startAutoCheck();
        
        console.log('[ACHIEVEMENTS] Sistema inicializado com sucesso!');
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
                this.showAchievementProgress(achievementId);
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
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Mostra/esconde seções
        const sections = document.querySelectorAll('.category-section');
        sections.forEach(section => {
            const sectionCategory = section.dataset.category;
            
            if (category === 'all' || sectionCategory === category) {
                section.classList.remove('hidden');
                section.style.display = 'block';
            } else {
                section.classList.add('hidden');
                section.style.display = 'none';
            }
        });
        
        // Animação suave
        setTimeout(() => {
            const visibleSections = document.querySelectorAll('.category-section:not(.hidden)');
            visibleSections.forEach((section, index) => {
                section.style.animation = `fadeInUp 0.4s ease ${index * 0.1}s both`;
            });
        }, 50);
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
            
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${percentage}% (${progressData.currentValue}/${progressData.targetValue})`;
            
            // Animação da barra
            progressBar.style.transition = 'width 1s ease';
        }
    }
    
    /**
     * Mostra progresso detalhado de uma conquista
     */
    async showAchievementProgress(achievementId) {
        console.log('[ACHIEVEMENTS] Mostrando progresso da conquista:', achievementId);
        
        try {
            const response = await fetch(`/achievements/api/progress/${achievementId}`);
            const data = await response.json();
            
            if (data.success) {
                const achievement = data.data;
                
                // Cria toast de progresso
                this.showProgressToast(achievement);
            }
        } catch (error) {
            console.error('[ACHIEVEMENTS] Erro ao buscar progresso:', error);
        }
    }
    
    /**
     * Mostra toast com progresso da conquista
     */
    showProgressToast(achievement) {
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">${achievement.achievement.icon}</div>
                <div class="toast-info">
                    <div class="toast-title">${achievement.achievement.name}</div>
                    <div class="toast-progress">
                        <div class="toast-progress-bar">
                            <div class="toast-progress-fill" style="width: ${achievement.progressPercentage}%"></div>
                        </div>
                        <span class="toast-progress-text">
                            ${achievement.currentValue}/${achievement.targetValue} (${achievement.progressPercentage}%)
                        </span>
                    </div>
                </div>
                <button class="toast-close">&times;</button>
            </div>
        `;
        
        // Adiciona CSS inline para o toast
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 15px;
            padding: 1rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            border: 2px solid #6366f1;
            z-index: 1001;
            min-width: 300px;
            animation: slideInRight 0.4s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Remove após 5 segundos
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.4s ease';
            setTimeout(() => toast.remove(), 400);
        }, 5000);
        
        // Botão fechar
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.style.animation = 'slideOutRight 0.4s ease';
            setTimeout(() => toast.remove(), 400);
        });
    }
    
    /**
     * Atualiza o streak do usuário
     */
    async updateStreak() {
        console.log('[ACHIEVEMENTS] Atualizando streak do usuário...');
        
        try {
            const response = await fetch('/achievements/api/streak/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('[ACHIEVEMENTS] Streak atualizado:', data.data);
                
                // Atualiza display do streak
                this.updateStreakDisplay(data.data);
                
                // Verifica se há novas conquistas
                if (data.data.newAchievements && data.data.newAchievements.length > 0) {
                    data.data.newAchievements.forEach(achievement => {
                        this.showAchievementModal(achievement);
                    });
                }
            }
        } catch (error) {
            console.error('[ACHIEVEMENTS] Erro ao atualizar streak:', error);
        }
    }
    
    /**
     * Atualiza o display do streak na interface
     */
    updateStreakDisplay(streakData) {
        const streakNumber = document.querySelector('.streak-card .stat-number');
        if (streakNumber) {
            const streakIcon = streakNumber.querySelector('.streak-icon');
            const currentStreak = streakData.streak;
            
            // Atualiza número
            streakNumber.innerHTML = `<span class="streak-icon">🔥</span> ${currentStreak}`;
            
            // Animação se for um novo dia
            if (streakData.isNewDay) {
                streakNumber.style.animation = 'pulse 0.6s ease';
                setTimeout(() => {
                    streakNumber.style.animation = '';
                }, 600);
            }
        }
    }
    
    /**
     * Verifica automaticamente por novas conquistas
     */
    startAutoCheck() {
        console.log('[ACHIEVEMENTS] Iniciando verificação automática de conquistas...');
        
        // Verifica a cada 30 segundos
        this.checkInterval = setInterval(() => {
            this.checkForNewAchievements();
        }, 30000);
        
        // Verifica imediatamente
        setTimeout(() => {
            this.checkForNewAchievements();
        }, 2000);
    }
    
    /**
     * Verifica por novas conquistas
     */
    async checkForNewAchievements() {
        try {
            const response = await fetch('/achievements/api/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success && data.data.newAchievements.length > 0) {
                console.log('[ACHIEVEMENTS] Novas conquistas encontradas:', data.data.newAchievements.length);
                
                // Mostra cada conquista
                data.data.newAchievements.forEach((achievement, index) => {
                    setTimeout(() => {
                        this.showAchievementModal(achievement);
                        this.updateAchievementCard(achievement);
                    }, index * 1000); // Delay entre modais
                });
            }
        } catch (error) {
            console.error('[ACHIEVEMENTS] Erro ao verificar conquistas:', error);
        }
    }
    
    /**
     * Mostra modal de conquista desbloqueada
     */
    showAchievementModal(achievement) {
        if (!this.modal) return;
        
        console.log('[ACHIEVEMENTS] Mostrando modal para conquista:', achievement.name);
        
        // Preenche dados do modal
        this.modal.querySelector('.modal-achievement-icon').textContent = achievement.icon;
        this.modal.querySelector('.modal-achievement-name').textContent = achievement.name;
        this.modal.querySelector('.modal-achievement-description').textContent = achievement.description;
        this.modal.querySelector('.xp-amount').textContent = `+${achievement.xp_reward} XP`;
        
        // Mostra modal
        this.modal.classList.add('show');
        
        // Efeito sonoro (se disponível)
        this.playAchievementSound();
        
        // Confetti effect
        this.showConfetti();
    }
    
    /**
     * Esconde modal
     */
    hideModal() {
        if (this.modal) {
            this.modal.classList.remove('show');
        }
    }
    
    /**
     * Atualiza card de conquista após desbloqueio
     */
    updateAchievementCard(achievement) {
        const card = document.querySelector(`[data-achievement-id="${achievement.id}"]`);
        if (card) {
            card.classList.add('unlocked');
            
            // Atualiza badge
            const badge = card.querySelector('.achievement-badge span');
            if (badge) {
                badge.textContent = '✓';
                badge.className = 'badge-unlocked';
            }
            
            // Remove barra de progresso
            const progressSection = card.querySelector('.achievement-progress');
            if (progressSection) {
                progressSection.remove();
            }
            
            // Adiciona data de desbloqueio
            const content = card.querySelector('.achievement-content');
            const dateDiv = document.createElement('div');
            dateDiv.className = 'achievement-unlocked-date';
            dateDiv.textContent = `Desbloqueada em ${new Date().toLocaleDateString('pt-BR')}`;
            
            const reward = content.querySelector('.achievement-reward');
            content.insertBefore(dateDiv, reward);
            
            // Animação de celebração
            card.style.animation = 'celebrate 0.8s ease';
        }
    }
    
    /**
     * Reproduz som de conquista
     */
    playAchievementSound() {
        try {
            // Cria um som simples usando Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            oscillator.connect(gain);
            gain.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
            
            gain.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('[ACHIEVEMENTS] Som não disponível:', error);
        }
    }
    
    /**
     * Mostra efeito de confetti
     */
    showConfetti() {
        // Cria elementos de confetti
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${this.getRandomColor()};
                top: -10px;
                left: ${Math.random() * 100}%;
                z-index: 1002;
                border-radius: 50%;
                animation: confettiFall ${2 + Math.random() * 3}s ease-out forwards;
            `;
            
            document.body.appendChild(confetti);
            
            // Remove após animação
            setTimeout(() => confetti.remove(), 5000);
        }
    }
    
    /**
     * Retorna cor aleatória para confetti
     */
    getRandomColor() {
        const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#10b981', '#f59e0b', '#ef4444'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * Mostra loading overlay
     */
    showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.add('show');
        }
    }
    
    /**
     * Esconde loading overlay
     */
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('show');
        }
    }
    
    /**
     * Limpa intervalos ao sair da página
     */
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}

// CSS adicional para animações
const additionalCSS = `
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

@keyframes confettiFall {
    0% {
        transform: translateY(-10px) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: translateY(100vh) rotate(720deg);
        opacity: 0;
    }
}

.achievement-toast .toast-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.achievement-toast .toast-icon {
    font-size: 2rem;
}

.achievement-toast .toast-info {
    flex: 1;
}

.achievement-toast .toast-title {
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.achievement-toast .toast-progress-bar {
    height: 4px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.25rem;
}

.achievement-toast .toast-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #6366f1, #8b5cf6);
    transition: width 0.5s ease;
}

.achievement-toast .toast-progress-text {
    font-size: 0.8rem;
    color: #6b7280;
}

.achievement-toast .toast-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0.25rem;
}
`;

// Adiciona CSS adicional
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);

// Inicializa quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.achievementManager = new AchievementManager();
});

// Limpa recursos ao sair da página
window.addEventListener('beforeunload', () => {
    if (window.achievementManager) {
        window.achievementManager.destroy();
    }
}); 