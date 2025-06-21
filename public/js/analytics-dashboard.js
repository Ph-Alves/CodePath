/**
 * Analytics Dashboard - JavaScript
 * Sistema de análise avançada com gráficos interativos
 */

class AnalyticsDashboard {
    constructor() {
        this.charts = {};
        this.init();
    }

    /**
     * Inicializa o dashboard
     */
    init() {
        this.setupEventListeners();
        this.initCharts();
        this.setupModals();
        this.setupAutoRefresh();
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Botão de exportação
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.openExportModal());
        }

        // Controles de período
        const activityPeriod = document.getElementById('activity-period');
        if (activityPeriod) {
            activityPeriod.addEventListener('change', (e) => {
                this.updateActivityChart(e.target.value);
            });
        }

        // Modal de exportação
        const closeModal = document.getElementById('close-export-modal');
        const cancelExport = document.getElementById('cancel-export');
        const confirmExport = document.getElementById('confirm-export');

        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeExportModal());
        }

        if (cancelExport) {
            cancelExport.addEventListener('click', () => this.closeExportModal());
        }

        if (confirmExport) {
            confirmExport.addEventListener('click', () => this.exportData());
        }

        // Fechar modal clicando fora
        const modal = document.getElementById('export-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeExportModal();
                }
            });
        }

        // Tecla ESC para fechar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeExportModal();
            }
        });
    }

    /**
     * Inicializa os gráficos
     */
    initCharts() {
        this.initActivityChart();
        this.initProgressChart();
        this.animateMetrics();
    }

    /**
     * Inicializa gráfico de atividade
     */
    initActivityChart() {
        const ctx = document.getElementById('activity-chart');
        if (!ctx || !window.analyticsData?.recentActivity) return;

        const data = window.analyticsData.recentActivity;
        
        // Preparar dados para o gráfico
        const chartData = this.prepareActivityData(data);

        this.charts.activity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Aulas Concluídas',
                    data: chartData.values,
                    borderColor: '#8B5CF6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#8B5CF6',
                    pointBorderColor: '#FFFFFF',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#FFFFFF',
                        bodyColor: '#FFFFFF',
                        borderColor: '#8B5CF6',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            title: function(context) {
                                return `${context[0].label}`;
                            },
                            label: function(context) {
                                const value = context.parsed.y;
                                return `${value} aula${value !== 1 ? 's' : ''} concluída${value !== 1 ? 's' : ''}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748B',
                            font: {
                                size: 12
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(226, 232, 240, 0.5)'
                        },
                        ticks: {
                            color: '#64748B',
                            font: {
                                size: 12
                            },
                            stepSize: 1
                        }
                    }
                },
                elements: {
                    point: {
                        hoverBorderWidth: 3
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    /**
     * Inicializa gráfico de progresso por pacote
     */
    initProgressChart() {
        const ctx = document.getElementById('progress-chart');
        if (!ctx || !window.analyticsData?.packageProgress) return;

        const data = window.analyticsData.packageProgress;
        
        // Preparar dados para o gráfico
        const chartData = this.prepareProgressData(data);

        this.charts.progress = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartData.labels,
                datasets: [{
                    data: chartData.values,
                    backgroundColor: [
                        '#8B5CF6',
                        '#A78BFA',
                        '#C4B5FD',
                        '#DDD6FE',
                        '#EDE9FE',
                        '#F3F4F6'
                    ],
                    borderColor: '#FFFFFF',
                    borderWidth: 2,
                    hoverBorderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#64748B',
                            font: {
                                size: 12
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#FFFFFF',
                        bodyColor: '#FFFFFF',
                        borderColor: '#8B5CF6',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const percentage = context.parsed;
                                return `${context.label}: ${percentage}%`;
                            }
                        }
                    }
                },
                cutout: '60%',
                elements: {
                    arc: {
                        borderRadius: 4
                    }
                }
            }
        });
    }

    /**
     * Prepara dados de atividade para o gráfico
     */
    prepareActivityData(data) {
        if (!data || data.length === 0) {
            return {
                labels: ['Sem dados'],
                values: [0]
            };
        }

        // Ordenar por data
        const sortedData = data.sort((a, b) => new Date(a.date) - new Date(b.date));

        const labels = sortedData.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit' 
            });
        });

        const values = sortedData.map(item => item.lessons_completed || 0);

        return { labels, values };
    }

    /**
     * Prepara dados de progresso para o gráfico
     */
    prepareProgressData(data) {
        if (!data || data.length === 0) {
            return {
                labels: ['Sem dados'],
                values: [100]
            };
        }

        const labels = data.map(item => item.name);
        const values = data.map(item => parseFloat(item.completion_percentage) || 0);

        return { labels, values };
    }

    /**
     * Atualiza gráfico de atividade
     */
    async updateActivityChart(period) {
        this.showLoading();

        try {
            const response = await fetch(`/analytics/api/chart-data?type=activity&period=${period}`);
            const result = await response.json();

            if (result.success && this.charts.activity) {
                const chartData = this.prepareActivityData(result.data);
                
                this.charts.activity.data.labels = chartData.labels;
                this.charts.activity.data.datasets[0].data = chartData.values;
                this.charts.activity.update('active');
            }
        } catch (error) {
            console.error('Erro ao atualizar gráfico de atividade:', error);
            this.showError('Erro ao atualizar gráfico');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Anima métricas principais
     */
    animateMetrics() {
        const metricValues = document.querySelectorAll('.metric-value');
        
        metricValues.forEach(element => {
            const finalValue = parseFloat(element.textContent.replace(/[^\d.]/g, ''));
            if (isNaN(finalValue)) return;

            let currentValue = 0;
            const increment = finalValue / 50; // 50 frames de animação
            const duration = 1500; // 1.5 segundos
            const frameTime = duration / 50;

            const timer = setInterval(() => {
                currentValue += increment;
                
                if (currentValue >= finalValue) {
                    currentValue = finalValue;
                    clearInterval(timer);
                }

                // Formatar o valor baseado no tipo
                if (element.textContent.includes('%')) {
                    element.textContent = Math.round(currentValue) + '%';
                } else if (element.textContent.includes('XP')) {
                    element.textContent = Math.round(currentValue).toLocaleString();
                } else {
                    element.textContent = Math.round(currentValue);
                }
            }, frameTime);
        });
    }

    /**
     * Configura modais
     */
    setupModals() {
        // Modal já configurado nos event listeners
    }

    /**
     * Abre modal de exportação
     */
    openExportModal() {
        const modal = document.getElementById('export-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Fecha modal de exportação
     */
    closeExportModal() {
        const modal = document.getElementById('export-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Exporta dados de analytics
     */
    async exportData() {
        const period = document.getElementById('export-period').value;
        const format = document.getElementById('export-format').value;

        this.showLoading();

        try {
            const response = await fetch(`/analytics/api/export?period=${period}&format=${format}`);
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `analytics_${period}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                this.closeExportModal();
                this.showSuccess('Dados exportados com sucesso!');
            } else {
                throw new Error('Erro ao exportar dados');
            }
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            this.showError('Erro ao exportar dados');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Configura atualização automática
     */
    setupAutoRefresh() {
        // Atualizar métricas a cada 5 minutos
        setInterval(() => {
            this.refreshMetrics();
        }, 5 * 60 * 1000);
    }

    /**
     * Atualiza métricas
     */
    async refreshMetrics() {
        try {
            const response = await fetch('/analytics/api/user');
            const result = await response.json();

            if (result.success) {
                this.updateMetricsDisplay(result.data);
            }
        } catch (error) {
            console.error('Erro ao atualizar métricas:', error);
        }
    }

    /**
     * Atualiza exibição das métricas
     */
    updateMetricsDisplay(data) {
        // Atualizar XP
        const xpElement = document.querySelector('.metric-icon.xp + .metric-info .metric-value');
        if (xpElement && data.user) {
            xpElement.textContent = data.user.xp_points;
        }

        // Atualizar aulas concluídas
        const lessonsElement = document.querySelector('.metric-icon.lessons + .metric-info .metric-value');
        if (lessonsElement && data.user) {
            lessonsElement.textContent = data.user.lessons_completed;
        }

        // Atualizar streak
        const streakElement = document.querySelector('.metric-icon.streak + .metric-info .metric-value');
        if (streakElement && data.current_streak !== undefined) {
            streakElement.textContent = data.current_streak;
        }

        // Atualizar média de quizzes
        const performanceElement = document.querySelector('.metric-icon.performance + .metric-info .metric-value');
        if (performanceElement && data.performance_metrics) {
            performanceElement.textContent = data.performance_metrics.avg_quiz_score + '%';
        }
    }

    /**
     * Mostra loading
     */
    showLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    /**
     * Esconde loading
     */
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    /**
     * Mostra mensagem de sucesso
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Mostra mensagem de erro
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Mostra notificação
     */
    showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Adicionar estilos
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#8B5CF6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        // Adicionar ao DOM
        document.body.appendChild(notification);

        // Event listener para fechar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        // Auto remover após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Adicionar animação CSS
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 0.25rem;
                    border-radius: 4px;
                    opacity: 0.8;
                    transition: opacity 0.2s;
                }
                
                .notification-close:hover {
                    opacity: 1;
                }
            `;
            document.head.appendChild(styles);
        }
    }

    /**
     * Destrói os gráficos
     */
    destroy() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsDashboard = new AnalyticsDashboard();
});

// Limpar ao sair da página
window.addEventListener('beforeunload', () => {
    if (window.analyticsDashboard) {
        window.analyticsDashboard.destroy();
    }
}); 