/**
 * CodePath - Gerenciamento de Progresso de Aulas
 * 
 * Este arquivo contém todas as funcionalidades relacionadas ao
 * progresso das aulas, incluindo marcar como concluída e feedback visual.
 */

class LessonProgressManager {
    constructor() {
        this.init();
    }

    /**
     * Inicializar o gerenciador de progresso
     */
    init() {
        this.bindEvents();
        this.checkLessonStatus();
    }

    /**
     * Vincular eventos aos elementos
     */
    bindEvents() {
        // Botão de marcar como concluída
        const markCompleteBtn = document.getElementById('markCompleteBtn');
        if (markCompleteBtn) {
            markCompleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.markLessonComplete(markCompleteBtn.dataset.lessonId);
            });
        }

        // Eventos do player de vídeo (simulado)
        const playButton = document.getElementById('playButton');
        if (playButton) {
            playButton.addEventListener('click', () => {
                this.handleVideoPlay();
            });
        }
    }

    /**
     * Verificar status atual da aula
     */
    async checkLessonStatus() {
        try {
            const lessonId = this.getCurrentLessonId();
            if (!lessonId) return;

            const response = await fetch(`/content/api/lesson/${lessonId}/status`);
            const data = await response.json();

            if (data.success) {
                this.updateLessonUI(data.data);
            }
        } catch (error) {
            console.error('Erro ao verificar status da aula:', error);
        }
    }

    /**
     * Marcar aula como concluída
     * @param {string} lessonId - ID da aula
     */
    async markLessonComplete(lessonId) {
        try {
            const markCompleteBtn = document.getElementById('markCompleteBtn');
            
            // Desabilitar botão e mostrar loading
            markCompleteBtn.disabled = true;
            markCompleteBtn.innerHTML = `
                <i class="icon-loader" aria-hidden="true"></i>
                Processando...
            `;

            const response = await fetch(`/content/lesson/${lessonId}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.success) {
                // Sucesso - atualizar UI
                this.handleLessonCompleted(data);
            } else {
                // Erro ou já concluída
                this.handleLessonError(data);
            }

        } catch (error) {
            console.error('Erro ao marcar aula como concluída:', error);
            this.showNotification('Erro ao marcar aula como concluída', 'error');
            this.resetMarkCompleteButton();
        }
    }

    /**
     * Lidar com aula concluída com sucesso
     * @param {Object} data - Dados da resposta
     */
    handleLessonCompleted(data) {
        // Mostrar notificação de sucesso
        this.showNotification(data.message, 'success');

        // Mostrar XP ganho
        if (data.xp_gained) {
            this.showXPGained(data.xp_gained);
        }

        // Mostrar se subiu de nível
        if (data.leveled_up) {
            this.showLevelUp(data.new_level);
        }

        // Atualizar botão para concluída
        this.updateMarkCompleteButton(true);

        // Atualizar barra de progresso
        if (data.progress_stats) {
            this.updateProgressBar(data.progress_stats.progress_percentage);
        }

        // Atualizar métricas do usuário no header
        this.updateUserMetrics(data);

        // Disparar evento customizado para o sistema de navegação
        // O sistema de navegação irá lidar com a sugestão de próxima aula
        const lessonCompletedEvent = new CustomEvent('lessonCompleted', {
            detail: {
                lessonId: this.getCurrentLessonId(),
                xpGained: data.xp_gained,
                leveledUp: data.leveled_up,
                newLevel: data.new_level,
                nextLesson: data.nextLesson,
                progressStats: data.progress_stats
            }
        });
        document.dispatchEvent(lessonCompletedEvent);
    }

    /**
     * Lidar com erro ao marcar aula
     * @param {Object} data - Dados da resposta
     */
    handleLessonError(data) {
        if (data.already_completed) {
            this.showNotification('Esta aula já foi concluída anteriormente', 'info');
            this.updateMarkCompleteButton(true);
        } else {
            this.showNotification(data.message || 'Erro ao marcar aula como concluída', 'error');
            this.resetMarkCompleteButton();
        }
    }

    /**
     * Atualizar UI com base no status da aula
     * @param {Object} lessonData - Dados da aula
     */
    updateLessonUI(lessonData) {
        // Atualizar botão de marcar como concluída
        this.updateMarkCompleteButton(lessonData.is_completed);

        // Atualizar barra de progresso
        this.updateProgressBar(lessonData.progress_percentage);

        // Atualizar informações de progresso
        this.updateProgressInfo(lessonData);
    }

    /**
     * Atualizar botão de marcar como concluída
     * @param {boolean} isCompleted - Se a aula está concluída
     */
    updateMarkCompleteButton(isCompleted) {
        const markCompleteBtn = document.getElementById('markCompleteBtn');
        if (!markCompleteBtn) return;

        if (isCompleted) {
            markCompleteBtn.innerHTML = `
                <i class="icon-check" aria-hidden="true"></i>
                Aula Concluída
            `;
            markCompleteBtn.disabled = true;
            markCompleteBtn.classList.add('btn-success');
            markCompleteBtn.classList.remove('btn-primary');
        } else {
            markCompleteBtn.innerHTML = `
                <i class="icon-check" aria-hidden="true"></i>
                Marcar como Concluída
            `;
            markCompleteBtn.disabled = false;
            markCompleteBtn.classList.add('btn-primary');
            markCompleteBtn.classList.remove('btn-success');
        }
    }

    /**
     * Resetar botão de marcar como concluída
     */
    resetMarkCompleteButton() {
        const markCompleteBtn = document.getElementById('markCompleteBtn');
        if (!markCompleteBtn) return;

        markCompleteBtn.disabled = false;
        markCompleteBtn.innerHTML = `
            <i class="icon-check" aria-hidden="true"></i>
            Marcar como Concluída
        `;
    }

    /**
     * Atualizar barra de progresso
     * @param {number} percentage - Percentual de progresso
     */
    updateProgressBar(percentage) {
        const progressFill = document.querySelector('.progress-fill');
        const progressPercentage = document.querySelector('.progress-percentage');

        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }

        if (progressPercentage) {
            progressPercentage.textContent = `${percentage}%`;
        }
    }

    /**
     * Mostrar XP ganho
     * @param {number} xpAmount - Quantidade de XP
     */
    showXPGained(xpAmount) {
        const xpNotification = document.createElement('div');
        xpNotification.className = 'xp-notification';
        xpNotification.innerHTML = `
            <div class="xp-content">
                <i class="icon-star" aria-hidden="true"></i>
                <span>+${xpAmount} XP</span>
            </div>
        `;

        document.body.appendChild(xpNotification);

        // Animar entrada
        setTimeout(() => {
            xpNotification.classList.add('show');
        }, 100);

        // Remover após 3 segundos
        setTimeout(() => {
            xpNotification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(xpNotification);
            }, 300);
        }, 3000);
    }

    /**
     * Mostrar subida de nível
     * @param {number} newLevel - Novo nível
     */
    showLevelUp(newLevel) {
        const levelUpModal = document.createElement('div');
        levelUpModal.className = 'level-up-modal';
        levelUpModal.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-icon">⭐</div>
                <h2>Nível ${newLevel} Alcançado!</h2>
                <p>Parabéns! Você subiu de nível!</p>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">
                    Continuar
                </button>
            </div>
        `;

        document.body.appendChild(levelUpModal);

        // Animar entrada
        setTimeout(() => {
            levelUpModal.classList.add('show');
        }, 100);
    }

    /**
     * Mostrar notificação
     * @param {string} message - Mensagem
     * @param {string} type - Tipo (success, error, info)
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon icon-${type}" aria-hidden="true"></i>
                <span class="notification-text">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="icon-x" aria-hidden="true"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentElement) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    /**
     * Lidar com play do vídeo (simulado)
     */
    handleVideoPlay() {
        const playButton = document.getElementById('playButton');
        const videoOverlay = document.querySelector('.video-overlay');

        if (playButton && videoOverlay) {
            playButton.style.display = 'none';
            videoOverlay.innerHTML = `
                <div class="video-playing">
                    <p>🎥 Reproduzindo aula...</p>
                    <p><small>Simulação de player de vídeo</small></p>
                </div>
            `;
        }
    }

    /**
     * Atualizar métricas do usuário no header
     * @param {Object} data - Dados da resposta
     */
    updateUserMetrics(data) {
        // Atualizar XP no header se existir
        const userXP = document.querySelector('.user-xp');
        if (userXP && data.xp_result) {
            userXP.textContent = `${data.xp_result.total_xp} XP`;
        }

        // Atualizar nível no header se existir
        const userLevel = document.querySelector('.user-level');
        if (userLevel && data.xp_result) {
            userLevel.textContent = `Nível ${data.xp_result.new_level}`;
        }
    }

    /**
     * Obter ID da aula atual
     * @returns {string|null} ID da aula
     */
    getCurrentLessonId() {
        const markCompleteBtn = document.getElementById('markCompleteBtn');
        return markCompleteBtn ? markCompleteBtn.dataset.lessonId : null;
    }

    /**
     * Atualizar informações de progresso
     * @param {Object} lessonData - Dados da aula
     */
    updateProgressInfo(lessonData) {
        // Atualizar informações adicionais se necessário
        const progressInfo = document.querySelector('.progress-info');
        if (progressInfo && lessonData.lessons_watched) {
            const progressLabel = progressInfo.querySelector('.progress-label');
            if (progressLabel) {
                progressLabel.textContent = `Progresso do Pacote (${lessonData.lessons_watched} aulas assistidas)`;
            }
        }
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new LessonProgressManager();
});

// Exportar para uso global se necessário
window.LessonProgressManager = LessonProgressManager; 