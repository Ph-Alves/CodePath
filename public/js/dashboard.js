/* ===================================
   DASHBOARD JAVASCRIPT - CODEPATH
   Fase 23: Dashboard Interativo Avançado
   =================================== */

/**
 * Classe para gerenciar funcionalidades do Dashboard
 */
class DashboardManager {
    constructor() {
        this.progressModal = null;
        this.currentPackageId = null;
        this.charts = {};
        this.currentPeriod = 'week';
        this.isLoading = false;
        this.init();
    }
    
    /**
     * Inicializa o dashboard
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupAnimations();
        this.setupFilters();
        this.setupCharts();
        this.setupPeriodFilters();
        this.loadDashboardData();
        this.loadPackages();
        
        console.log('[DASHBOARD] Sistema inicializado - Fase 23');
    }
    
    /**
     * Cacheia elementos DOM
     */
    cacheElements() {
        this.progressModal = document.getElementById('progressModal');
        this.metricCards = document.querySelectorAll('.metric-card');
        this.packageCards = document.querySelectorAll('.package-card');
        this.actionCards = document.querySelectorAll('.action-card');
        this.progressBars = document.querySelectorAll('.progress-fill');
        this.periodFilters = document.querySelectorAll('.period-filter');
        this.chartContainers = document.querySelectorAll('.chart-container');
        this.quickActions = document.querySelectorAll('.quick-action');
    }
    
    /**
     * Vincula eventos
     */
    bindEvents() {
        // Eventos dos cards de pacotes
        this.packageCards.forEach(card => {
            const continueBtn = card.querySelector('.btn-primary');
            const progressBtn = card.querySelector('.btn-secondary');
            
            if (continueBtn) {
                continueBtn.addEventListener('click', (e) => {
                    this.handleContinuePackage(e, card);
                });
            }
            
            if (progressBtn) {
                progressBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const packageId = this.getPackageIdFromCard(card);
                    this.showProgressModal(packageId);
                });
            }
        });
        
        // Eventos dos cards de métricas - NOVO FASE 23
        this.metricCards.forEach(card => {
            card.addEventListener('click', () => {
                this.handleMetricCardClick(card);
            });
            
            // Adicionar cursor pointer
            card.style.cursor = 'pointer';
        });
        
        // Eventos dos cards de ação rápida - EXPANDIDO FASE 23
        this.actionCards.forEach(card => {
            card.addEventListener('click', (e) => {
                this.handleActionCardClick(e, card);
            });
        });
        
        // Eventos dos filtros de período - NOVO FASE 23
        this.periodFilters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                this.handlePeriodFilter(e, filter);
            });
        });
        
        // Eventos das ações rápidas - NOVO FASE 23
        this.quickActions.forEach(action => {
            action.addEventListener('click', (e) => {
                this.handleQuickAction(e, action);
            });
        });
        
        // Evento para fechar modal
        if (this.progressModal) {
            const closeBtn = this.progressModal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeProgressModal();
                });
            }
            
            // Fechar modal clicando fora
            this.progressModal.addEventListener('click', (e) => {
                if (e.target === this.progressModal) {
                    this.closeProgressModal();
                }
            });
        }
    }
    
    /**
     * Configura animações
     */
    setupAnimations() {
        // Animar barras de progresso
        this.animateProgressBars();
        
        // Animar entrada dos cards
        this.animateCardsEntrance();
        
        // Configurar observer para animações em scroll
        this.setupScrollAnimations();
    }
    
    /**
     * Configura gráficos Chart.js - NOVO FASE 23
     */
    setupCharts() {
        this.initProgressChart();
        this.initActivityChart();
        this.initPerformanceChart();
    }
    
    /**
     * Inicializa gráfico de progresso - NOVO FASE 23
     */
    initProgressChart() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;
        
        this.charts.progress = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Concluído', 'Em Progresso', 'Não Iniciado'],
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: [
                        '#10B981',
                        '#F59E0B',
                        '#E5E7EB'
                    ],
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            color: '#6B7280'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Inicializa gráfico de atividade - NOVO FASE 23
     */
    initActivityChart() {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;
        
        this.charts.activity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Aulas Assistidas',
                    data: [3, 5, 2, 8, 4, 6, 3],
                    borderColor: '#8B5CF6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#8B5CF6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#F3F4F6'
                        },
                        ticks: {
                            color: '#6B7280'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6B7280'
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Inicializa gráfico de performance - NOVO FASE 23
     */
    initPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;
        
        this.charts.performance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'XP Ganho',
                    data: [1200, 1900, 800, 2100, 1600, 2400],
                    backgroundColor: 'rgba(139, 92, 246, 0.8)',
                    borderColor: '#8B5CF6',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#F3F4F6'
                        },
                        ticks: {
                            color: '#6B7280',
                            callback: function(value) {
                                return value + ' XP';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6B7280'
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Configura filtros de período - NOVO FASE 23
     */
    setupPeriodFilters() {
        const periodButtons = document.querySelectorAll('.period-btn');
        
        periodButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all buttons
                periodButtons.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                // Update current period
                this.currentPeriod = btn.dataset.period;
                
                // Update charts and data
                this.updateChartsForPeriod(this.currentPeriod);
            });
        });
    }
    
    /**
     * Atualiza gráficos para período específico - NOVO FASE 23
     */
    updateChartsForPeriod(period) {
        this.showLoadingState();
        
        // Simular delay de carregamento
        setTimeout(() => {
            const data = this.getDataForPeriod(period);
            this.updateChartData(data);
            this.updateMetricsForPeriod(period);
            this.hideLoadingState();
        }, 800);
    }
    
    /**
     * Obtém dados para período específico - NOVO FASE 23
     */
    getDataForPeriod(period) {
        const dataMap = {
            'week': {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                activity: [3, 5, 2, 8, 4, 6, 3],
                performance: [120, 190, 80, 210, 160, 240, 180]
            },
            'month': {
                labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
                activity: [15, 22, 18, 28],
                performance: [800, 1200, 950, 1400]
            },
            'year': {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                activity: [45, 52, 38, 65, 48, 72, 58, 63, 49, 55, 41, 38],
                performance: [1200, 1900, 800, 2100, 1600, 2400, 1800, 2200, 1500, 1900, 1300, 1100]
            }
        };
        
        return dataMap[period] || dataMap['week'];
    }
    
    /**
     * Atualiza dados dos gráficos - NOVO FASE 23
     */
    updateChartData(data) {
        // Atualizar gráfico de atividade
        if (this.charts.activity) {
            this.charts.activity.data.labels = data.labels;
            this.charts.activity.data.datasets[0].data = data.activity;
            this.charts.activity.update('active');
        }
        
        // Atualizar gráfico de performance
        if (this.charts.performance) {
            this.charts.performance.data.labels = data.labels;
            this.charts.performance.data.datasets[0].data = data.performance;
            this.charts.performance.update('active');
        }
    }
    
    /**
     * Atualiza métricas para período - NOVO FASE 23
     */
    updateMetricsForPeriod(period) {
        const metrics = this.getMetricsForPeriod(period);
        
        // Animar contadores
        this.animateCounters(metrics);
        
        // Atualizar texto de mudança
        this.updateMetricChanges(period);
    }
    
    /**
     * Obtém métricas para período - NOVO FASE 23
     */
    getMetricsForPeriod(period) {
        const metricsMap = {
            'week': {
                lessonsWatched: 28,
                coursesCompleted: 2,
                challengesCompleted: 5,
                quizzesCompleted: 12
            },
            'month': {
                lessonsWatched: 125,
                coursesCompleted: 8,
                challengesCompleted: 22,
                quizzesCompleted: 45
            },
            'year': {
                lessonsWatched: 1240,
                coursesCompleted: 35,
                challengesCompleted: 156,
                quizzesCompleted: 324
            }
        };
        
        return metricsMap[period] || metricsMap['week'];
    }
    
    /**
     * Manipula clique em filtro de período - NOVO FASE 23
     */
    handlePeriodFilter(event, filter) {
        event.preventDefault();
        
        // Remove active de todos os filtros
        this.periodFilters.forEach(f => f.classList.remove('active'));
        
        // Adiciona active ao filtro clicado
        filter.classList.add('active');
        
        // Atualiza período atual
        this.currentPeriod = filter.dataset.period;
        
        // Atualiza dados
        this.updateChartsForPeriod(this.currentPeriod);
    }
    
    /**
     * Manipula clique em ação rápida - EXPANDIDO FASE 23
     */
    handleQuickAction(event, action) {
        event.preventDefault();
        
        const actionType = action.dataset.action;
        
        // Adicionar efeito visual
        action.classList.add('action-clicked');
        setTimeout(() => action.classList.remove('action-clicked'), 200);
        
        switch (actionType) {
            case 'continue-lesson':
                this.continueLastLesson();
                break;
            case 'take-quiz':
                this.goToNextQuiz();
                break;
            case 'view-progress':
                this.goToProgressPage();
                break;
            case 'browse-courses':
                this.browseCourses();
                break;
            case 'view-achievements':
                this.goToAchievements();
                break;
            case 'join-community':
                this.goToCommunity();
                break;
            default:
                console.log('Ação não implementada:', actionType);
        }
    }
    
    /**
     * Continua última aula - NOVO FASE 23
     */
    continueLastLesson() {
        this.showActionFeedback('Redirecionando para a última aula...');
        
        // Simular busca da última aula
        setTimeout(() => {
            // Redirecionar para a última aula em progresso
            window.location.href = '/content/lesson/15'; // Exemplo
        }, 1000);
    }
    
    /**
     * Vai para próximo quiz - NOVO FASE 23
     */
    goToNextQuiz() {
        this.showActionFeedback('Carregando próximo quiz...');
        
        setTimeout(() => {
            window.location.href = '/quiz/3'; // Exemplo
        }, 1000);
    }
    
    /**
     * Vai para página de progresso - NOVO FASE 23
     */
    goToProgressPage() {
        this.showActionFeedback('Abrindo relatório de progresso...');
        
        setTimeout(() => {
            window.location.href = '/progress';
        }, 800);
    }
    
    /**
     * Navega cursos - NOVO FASE 23
     */
    browseCourses() {
        this.showActionFeedback('Explorando catálogo de cursos...');
        
        setTimeout(() => {
            window.location.href = '/content';
        }, 800);
    }
    
    /**
     * Vai para conquistas - NOVO FASE 23
     */
    goToAchievements() {
        this.showActionFeedback('Carregando suas conquistas...');
        
        setTimeout(() => {
            window.location.href = '/achievements';
        }, 800);
    }
    
    /**
     * Vai para comunidade - NOVO FASE 23
     */
    goToCommunity() {
        this.showActionFeedback('Conectando à comunidade...');
        
        setTimeout(() => {
            window.location.href = '/chat';
        }, 800);
    }
    
    /**
     * Mostra feedback de ação - NOVO FASE 23
     */
    showActionFeedback(message) {
        // Criar toast de feedback
        const toast = document.createElement('div');
        toast.className = 'action-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <span class="toast-message">${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animar entrada
        setTimeout(() => toast.classList.add('toast-visible'), 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            toast.classList.remove('toast-visible');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    /**
     * Anima as barras de progresso
     */
    animateProgressBars() {
        this.progressBars.forEach((bar, index) => {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 500 + (index * 200));
        });
    }
    
    /**
     * Anima entrada dos cards
     */
    animateCardsEntrance() {
        const cards = [
            ...this.metricCards,
            ...this.packageCards,
            ...this.actionCards
        ];
        
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });
    }
    
    /**
     * Configura animações em scroll
     */
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observar seções
        const sections = document.querySelectorAll('.metrics-section, .continue-section, .activity-section, .quick-actions');
        sections.forEach(section => {
            observer.observe(section);
        });
    }
    
    /**
     * Carrega dados do dashboard
     */
    async loadDashboardData() {
        try {
            // Simular carregamento de dados (será substituído por chamadas reais)
            await this.loadMetrics();
            await this.loadRecentActivity();
            await this.updateNotifications();
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
            this.showToast('Erro ao carregar dados', 'error');
        }
    }
    
    /**
     * Carrega métricas do usuário
     */
    async loadMetrics() {
        // Simular delay de carregamento
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Atualizar contadores com animação
        this.animateCounters();
    }
    
    /**
     * Anima contadores de métricas - EXPANDIDO FASE 23
     */
    animateCounters(customMetrics = null) {
        const counters = document.querySelectorAll('.metric-value');
        
        counters.forEach((counter, index) => {
            const target = customMetrics ? 
                Object.values(customMetrics)[index] : 
                parseInt(counter.textContent) || 0;
            
            let current = 0;
            const increment = target / 30;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 50);
        });
    }
    
    /**
     * Atualiza textos de mudança das métricas - NOVO FASE 23
     */
    updateMetricChanges(period) {
        const changes = document.querySelectorAll('.metric-change');
        const changeTexts = {
            'week': ['esta semana', 'este mês', 'pendentes', 'média'],
            'month': ['este mês', 'este trimestre', 'pendentes', 'média'],
            'year': ['este ano', 'total', 'pendentes', 'média geral']
        };
        
        const texts = changeTexts[period] || changeTexts['week'];
        
        changes.forEach((change, index) => {
            if (texts[index]) {
                const currentText = change.textContent;
                const newText = currentText.replace(/esta semana|este mês|este ano|total|média geral|média/g, texts[index]);
                change.textContent = newText;
            }
        });
    }
    
    /**
     * Carrega atividade recente
     */
    async loadRecentActivity() {
        // Placeholder para carregamento de atividade recente
        console.log('Loading recent activity...');
    }
    
    /**
     * Atualiza notificações
     */
    async updateNotifications() {
        // Placeholder para atualização de notificações
        console.log('Updating notifications...');
    }
    
    /**
     * Configurar sistema de filtros
     */
    setupFilters() {
        const toggleFiltersBtn = document.getElementById('toggleFilters');
        const filtersPanel = document.getElementById('filtersPanel');
        const difficultyFilter = document.getElementById('difficultyFilter');
        const durationFilter = document.getElementById('durationFilter');
        const searchFilter = document.getElementById('searchFilter');
        const clearFiltersBtn = document.getElementById('clearFilters');
        
        // Toggle filtros
        if (toggleFiltersBtn) {
            toggleFiltersBtn.addEventListener('click', () => {
                const isVisible = filtersPanel.style.display !== 'none';
                filtersPanel.style.display = isVisible ? 'none' : 'block';
                toggleFiltersBtn.classList.toggle('active', !isVisible);
            });
        }
        
        // Filtro por dificuldade
        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
        
        // Filtro por duração
        if (durationFilter) {
            durationFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
        
        // Busca em tempo real
        if (searchFilter) {
            searchFilter.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.applyFilters();
                }, 300);
            });
        }
        
        // Limpar filtros
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
    }
    
    /**
     * Aplica filtros aos pacotes
     */
    applyFilters() {
        const difficulty = document.getElementById('difficultyFilter')?.value || '';
        const duration = document.getElementById('durationFilter')?.value || '';
        const search = document.getElementById('searchFilter')?.value.toLowerCase() || '';
        
        this.filteredPackages = this.allPackages.filter(pkg => {
            // Filtro por dificuldade
            if (difficulty && pkg.difficulty !== difficulty) {
                return false;
            }
            
            // Filtro por duração
            if (duration) {
                const [min, max] = duration.split('-').map(d => parseInt(d.replace('+', '')));
                if (duration.includes('+')) {
                    if (pkg.duration < min) return false;
                } else {
                    if (pkg.duration < min || pkg.duration > max) return false;
                }
            }
            
            // Filtro por busca
            if (search) {
                const searchableText = `
                    ${pkg.name} 
                    ${pkg.description} 
                    ${pkg.tags.join(' ')}
                `.toLowerCase();
                
                if (!searchableText.includes(search)) {
                    return false;
                }
            }
            
            return true;
        });
        
        this.renderPackages();
    }
    
    /**
     * Limpa todos os filtros
     */
    clearAllFilters() {
        document.getElementById('difficultyFilter').value = '';
        document.getElementById('durationFilter').value = '';
        document.getElementById('searchFilter').value = '';
        
        this.filteredPackages = [...this.allPackages];
        this.renderPackages();
    }
    
    /**
     * Mostra estado de carregamento
     */
    showLoadingState() {
        const loading = document.getElementById('packagesLoading');
        const grid = document.getElementById('packagesGrid');
        const empty = document.getElementById('emptyPackages');
        
        if (loading) loading.style.display = 'flex';
        if (grid) grid.style.display = 'none';
        if (empty) empty.style.display = 'none';
    }
    
    /**
     * Esconde estado de carregamento
     */
    hideLoadingState() {
        const loading = document.getElementById('packagesLoading');
        const grid = document.getElementById('packagesGrid');
        
        if (loading) loading.style.display = 'none';
        if (grid) grid.style.display = 'grid';
    }
    
    /**
     * Mostra estado vazio
     */
    showEmptyState() {
        const loading = document.getElementById('packagesLoading');
        const grid = document.getElementById('packagesGrid');
        const empty = document.getElementById('emptyPackages');
        
        if (loading) loading.style.display = 'none';
        if (grid) grid.style.display = 'none';
        if (empty) empty.style.display = 'block';
    }
    
    /**
     * Esconde estado vazio
     */
    hideEmptyState() {
        const empty = document.getElementById('emptyPackages');
        if (empty) empty.style.display = 'none';
    }
    
    /**
     * Carrega todos os pacotes disponíveis
     */
    async loadPackages() {
        try {
            this.showLoadingState();
            
            // Simular carregamento de dados (substituir por API real)
            const packages = await this.fetchPackagesData();
            
            this.allPackages = packages;
            this.filteredPackages = [...packages];
            
            this.renderPackages();
            this.hideLoadingState();
            
        } catch (error) {
            console.error('Erro ao carregar pacotes:', error);
            this.showEmptyState();
        }
    }
    
    /**
     * Simula fetch de dados dos pacotes
     */
    async fetchPackagesData() {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados mockados expandidos para Fase 21
        return [
            {
                id: 1,
                name: 'Pacote C',
                description: 'Aprenda programação em C desde o básico até conceitos avançados. Domine ponteiros, estruturas de dados e algoritmos fundamentais.',
                icon: 'fas fa-code',
                currentLesson: 'C - Operações',
                progressPercentage: 45,
                difficulty: 'iniciante',
                duration: 40,
                rating: 4.8,
                tags: ['programação', 'algoritmos', 'estruturas'],
                prerequisites: [],
                lessonsCount: 5,
                studentsCount: 1250
            },
            {
                id: 2,
                name: 'Pacote Front-end',
                description: 'HTML, CSS e JavaScript para desenvolvimento web moderno. Crie interfaces responsivas e interativas.',
                icon: 'fab fa-html5',
                currentLesson: 'JavaScript Fundamentos',
                progressPercentage: 72,
                difficulty: 'iniciante',
                duration: 35,
                rating: 4.7,
                tags: ['web', 'frontend', 'javascript', 'css'],
                prerequisites: [],
                lessonsCount: 6,
                studentsCount: 2100
            },
            {
                id: 3,
                name: 'Pacote Python',
                description: 'Python para iniciantes e desenvolvimento de aplicações. Data Science, Web Development e Automação.',
                icon: 'fab fa-python',
                currentLesson: 'Python Básico',
                progressPercentage: 25,
                difficulty: 'iniciante',
                duration: 45,
                rating: 4.9,
                tags: ['python', 'datascience', 'web', 'automação'],
                prerequisites: [],
                lessonsCount: 5,
                studentsCount: 1800
            },
            {
                id: 4,
                name: 'Pacote Java',
                description: 'Programação orientada a objetos com Java. Desenvolva aplicações robustas e escaláveis.',
                icon: 'fab fa-java',
                currentLesson: 'Java OOP',
                progressPercentage: 40,
                difficulty: 'intermediário',
                duration: 50,
                rating: 4.6,
                tags: ['java', 'oop', 'enterprise', 'android'],
                prerequisites: ['Pacote C'],
                lessonsCount: 5,
                studentsCount: 950
            },
            {
                id: 5,
                name: 'Pacote Back-end',
                description: 'Desenvolvimento backend com JavaScript/Node.js. APIs REST, bancos de dados e arquitetura.',
                icon: 'fas fa-server',
                currentLesson: 'APIs REST',
                progressPercentage: 30,
                difficulty: 'intermediário',
                duration: 60,
                rating: 4.8,
                tags: ['backend', 'nodejs', 'api', 'database'],
                prerequisites: ['Pacote Front-end'],
                lessonsCount: 6,
                studentsCount: 1100
            },
            {
                id: 6,
                name: 'Pacote C#',
                description: 'Desenvolvimento com C# e .NET Framework. Desktop, Web e aplicações empresariais.',
                icon: 'fas fa-hashtag',
                currentLesson: 'C# Fundamentos',
                progressPercentage: 15,
                difficulty: 'intermediário',
                duration: 55,
                rating: 4.5,
                tags: ['csharp', 'dotnet', 'desktop', 'web'],
                prerequisites: ['Pacote Java'],
                lessonsCount: 5,
                studentsCount: 720
            },
            {
                id: 7,
                name: 'Pacote React',
                description: 'Biblioteca JavaScript para criação de interfaces de usuário modernas e reativas.',
                icon: 'fab fa-react',
                currentLesson: 'Componentes React',
                progressPercentage: 0,
                difficulty: 'avançado',
                duration: 40,
                rating: 4.9,
                tags: ['react', 'frontend', 'spa', 'hooks'],
                prerequisites: ['Pacote Front-end'],
                lessonsCount: 6,
                studentsCount: 1450
            },
            {
                id: 8,
                name: 'Pacote DevOps',
                description: 'Docker, Kubernetes, CI/CD e infraestrutura como código. Deploy e monitoramento.',
                icon: 'fas fa-cogs',
                currentLesson: 'Docker Básico',
                progressPercentage: 0,
                difficulty: 'avançado',
                duration: 70,
                rating: 4.7,
                tags: ['devops', 'docker', 'kubernetes', 'cicd'],
                prerequisites: ['Pacote Back-end'],
                lessonsCount: 7,
                studentsCount: 680
            },
            {
                id: 9,
                name: 'Pacote Mobile',
                description: 'Desenvolvimento mobile com React Native. Apps para iOS e Android.',
                icon: 'fas fa-mobile-alt',
                currentLesson: 'React Native Setup',
                progressPercentage: 0,
                difficulty: 'avançado',
                duration: 65,
                rating: 4.6,
                tags: ['mobile', 'reactnative', 'ios', 'android'],
                prerequisites: ['Pacote React'],
                lessonsCount: 6,
                studentsCount: 540
            },
            {
                id: 10,
                name: 'Pacote Data Science',
                description: 'Análise de dados, Machine Learning e visualização com Python e R.',
                icon: 'fas fa-chart-line',
                currentLesson: 'Pandas Básico',
                progressPercentage: 0,
                difficulty: 'avançado',
                duration: 80,
                rating: 4.8,
                tags: ['datascience', 'ml', 'pandas', 'visualization'],
                prerequisites: ['Pacote Python'],
                lessonsCount: 8,
                studentsCount: 890
            }
        ];
    }
    
    /**
     * Renderiza os pacotes na grid
     */
    renderPackages() {
        const grid = document.getElementById('packagesGrid');
        if (!grid) return;
        
        if (this.filteredPackages.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.hideEmptyState();
        
        grid.innerHTML = this.filteredPackages.map(pkg => this.createPackageCard(pkg)).join('');
        
        // Bind eventos dos novos cards
        this.bindPackageCardEvents();
    }
    
    /**
     * Cria HTML do card de pacote
     */
    createPackageCard(pkg) {
        const progressWidth = pkg.progressPercentage || 0;
        const isStarted = progressWidth > 0;
        const stars = this.generateStars(pkg.rating);
        const tags = pkg.tags.slice(0, 3); // Máximo 3 tags
        
        return `
            <div class="package-card" data-package-id="${pkg.id}" onclick="showPackageModal(${pkg.id})">
                <div class="package-header">
                    <div class="package-icon">
                        <i class="${pkg.icon}"></i>
                    </div>
                    <div class="package-info">
                        <h3 class="package-name">${pkg.name}</h3>
                        <p class="package-description">${pkg.description}</p>
                    </div>
                </div>
                
                <div class="package-meta">
                    <div class="meta-item">
                        <i class="fas fa-signal"></i>
                        <span class="difficulty-badge ${pkg.difficulty}">${pkg.difficulty}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${pkg.duration}h</span>
                    </div>
                    <div class="meta-item rating-display">
                        <span class="rating-stars">${stars}</span>
                        <span>${pkg.rating}</span>
                    </div>
                </div>
                
                <div class="package-tags">
                    ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                
                <div class="package-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressWidth}%"></div>
                    </div>
                    <span class="progress-text">${progressWidth}% concluído</span>
                </div>
                
                <div class="package-actions">
                    <button class="btn btn-primary" onclick="event.stopPropagation(); startPackage(${pkg.id})">
                        <i class="fas fa-${isStarted ? 'play' : 'rocket'}"></i>
                        ${isStarted ? 'Continuar' : 'Começar'}
                    </button>
                    <button class="btn btn-secondary" onclick="event.stopPropagation(); showPackageModal(${pkg.id})">
                        <i class="fas fa-info-circle"></i>
                        Detalhes
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Gera estrelas para rating
     */
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        return stars;
    }
    
    /**
     * Bind eventos dos cards de pacotes
     */
    bindPackageCardEvents() {
        const cards = document.querySelectorAll('.package-card');
        cards.forEach(card => {
            // Hover effects já são CSS, apenas bind de cliques específicos se necessário
        });
    }
    
    /**
     * Manipula clique em continuar pacote
     */
    handleContinuePackage(event, card) {
        const packageId = this.getPackageIdFromCard(card);
        const packageName = card.querySelector('.package-name').textContent;
        
        // Mostrar loading
        const btn = event.target;
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
        btn.disabled = true;
        
        // Navegar para o pacote
        setTimeout(() => {
            window.showToast(`Abrindo ${packageName}...`, 'info');
            
            // Navegação real para o pacote
            window.location.href = `/content/package/${packageId}/lessons`;
        }, 500);
    }
    
    /**
     * Mostra modal de progresso
     */
    showProgressModal(packageId) {
        if (!this.progressModal) return;
        
        this.currentPackageId = packageId;
        
        // Carregar dados do progresso
        this.loadProgressData(packageId);
        
        // Mostrar modal
        this.progressModal.style.display = 'flex';
        this.progressModal.classList.add('active');
        
        // Prevenir scroll do body
        document.body.style.overflow = 'hidden';
        
        // Focus no botão de fechar
        const closeBtn = this.progressModal.querySelector('.modal-close');
        if (closeBtn) {
            setTimeout(() => closeBtn.focus(), 100);
        }
    }
    
    /**
     * Fecha modal de progresso
     */
    closeProgressModal() {
        if (!this.progressModal) return;
        
        this.progressModal.style.display = 'none';
        this.progressModal.classList.remove('active');
        
        // Restaurar scroll do body
        document.body.style.overflow = '';
        
        this.currentPackageId = null;
    }
    
    /**
     * Carrega dados de progresso do pacote
     */
    async loadProgressData(packageId) {
        const modalBody = this.progressModal.querySelector('.modal-body');
        
        // Mostrar loading
        modalBody.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Carregando progresso...</p>
            </div>
        `;
        
        try {
            // Simular carregamento (será substituído por chamada real)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Dados mockados de progresso
            const progressData = {
                packageName: packageId === '1' ? 'Pacote C' : 'Pacote Python',
                totalLessons: 15,
                completedLessons: packageId === '1' ? 7 : 11,
                currentLesson: packageId === '1' ? 'C - Operações' : 'Python - Estruturas de Dados',
                progressPercentage: packageId === '1' ? 45 : 72,
                estimatedTime: packageId === '1' ? '8 horas restantes' : '3 horas restantes'
            };
            
            // Renderizar dados de progresso
            modalBody.innerHTML = this.renderProgressContent(progressData);
            
        } catch (error) {
            console.error('Erro ao carregar progresso:', error);
            modalBody.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao carregar progresso. Tente novamente.</p>
                </div>
            `;
        }
    }
    
    /**
     * Renderiza conteúdo do modal de progresso
     */
    renderProgressContent(data) {
        return `
            <div class="progress-details">
                <div class="progress-header">
                    <h4>${data.packageName}</h4>
                    <span class="progress-badge">${data.progressPercentage}% Concluído</span>
                </div>
                
                <div class="progress-stats">
                    <div class="progress-stat">
                        <span class="stat-label">Aulas Concluídas</span>
                        <span class="stat-value">${data.completedLessons}/${data.totalLessons}</span>
                    </div>
                    <div class="progress-stat">
                        <span class="stat-label">Aula Atual</span>
                        <span class="stat-value">${data.currentLesson}</span>
                    </div>
                    <div class="progress-stat">
                        <span class="stat-label">Tempo Estimado</span>
                        <span class="stat-value">${data.estimatedTime}</span>
                    </div>
                </div>
                
                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${data.progressPercentage}%"></div>
                    </div>
                </div>
                
                <div class="progress-actions">
                    <button class="btn btn-primary" onclick="continuePackage('${this.currentPackageId}')">
                        <i class="fas fa-play"></i>
                        Continuar Estudando
                    </button>
                    <button class="btn btn-secondary" onclick="viewPackageDetails('${this.currentPackageId}')">
                        <i class="fas fa-info-circle"></i>
                        Ver Detalhes
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Manipula clique em card de métrica - EXPANDIDO FASE 23
     */
    handleMetricCardClick(card) {
        const metricTitle = card.querySelector('.metric-title').textContent;
        const metricType = this.getMetricTypeFromTitle(metricTitle);
        
        // Adicionar efeito visual
        card.classList.add('metric-clicked');
        setTimeout(() => card.classList.remove('metric-clicked'), 300);
        
        this.showActionFeedback('Carregando detalhes...');
        
        setTimeout(() => {
            switch (metricType) {
                case 'lessons':
                    window.location.href = '/content';
                    break;
                case 'courses':
                    window.location.href = '/content?filter=completed';
                    break;
                case 'challenges':
                    window.location.href = '/content?type=challenges';
                    break;
                case 'quizzes':
                    window.location.href = '/quiz';
                    break;
                default:
                    window.location.href = '/progress';
            }
        }, 800);
    }
    
    /**
     * Obtém tipo de métrica do título - NOVO FASE 23
     */
    getMetricTypeFromTitle(title) {
        const lowerTitle = title.toLowerCase();
        
        if (lowerTitle.includes('aula')) return 'lessons';
        if (lowerTitle.includes('curso')) return 'courses';
        if (lowerTitle.includes('desafio')) return 'challenges';
        if (lowerTitle.includes('questionário')) return 'quizzes';
        
        return 'default';
    }
    
    /**
     * Manipula clique em card de ação
     */
    handleActionCardClick(event, card) {
        // Adicionar efeito de loading se necessário
        const actionTitle = card.querySelector('h3').textContent;
        
        // Para algumas ações, mostrar loading
        if (actionTitle.includes('Explorar') || actionTitle.includes('Desempenho')) {
            event.preventDefault();
            
            window.showLoading(card);
            
            setTimeout(() => {
                window.hideLoading(card);
                window.location.href = card.href;
            }, 500);
        }
    }
    
    /**
     * Obtém ID do pacote a partir do card
     */
    getPackageIdFromCard(card) {
        const continueBtn = card.querySelector('a[href*="/packages/"]');
        if (continueBtn) {
            const match = continueBtn.href.match(/\/packages\/(\d+)\//);
            return match ? match[1] : '1';
        }
        return '1';
    }
    
    /**
     * Atualiza dados do dashboard
     */
    async refreshDashboard() {
        window.showToast('Atualizando dashboard...', 'info');
        
        try {
            await this.loadDashboardData();
            window.showToast('Dashboard atualizado!', 'success');
        } catch (error) {
            console.error('Erro ao atualizar dashboard:', error);
            window.showToast('Erro ao atualizar dashboard', 'error');
        }
    }
}

// ===================================
// FUNÇÕES GLOBAIS PARA FASE 21
// ===================================

/**
 * Mostra modal de preview do pacote
 */
window.showPackageModal = async function(packageId) {
    const modal = document.getElementById('packageModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const actionBtn = document.getElementById('modalActionBtn');
    
    if (!modal || !modalBody) return;
    
    // Encontrar dados do pacote
    const pkg = window.dashboardManager?.allPackages?.find(p => p.id === packageId);
    if (!pkg) return;
    
    // Atualizar título
    modalTitle.textContent = pkg.name;
    
    // Mostrar loading
    modalBody.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>
            <p>Carregando informações do pacote...</p>
        </div>
    `;
    
    // Mostrar modal
    modal.style.display = 'flex';
    
    // Simular carregamento de dados detalhados
    setTimeout(() => {
        modalBody.innerHTML = createPackageModalContent(pkg);
        
        // Configurar botão de ação
        const isStarted = pkg.progressPercentage > 0;
        actionBtn.innerHTML = `
            <i class="fas fa-${isStarted ? 'play' : 'rocket'}"></i>
            ${isStarted ? 'Continuar Pacote' : 'Começar Pacote'}
        `;
        actionBtn.onclick = () => {
            closePackageModal();
            startPackage(packageId);
        };
    }, 800);
};

/**
 * Fecha modal de pacote
 */
window.closePackageModal = function() {
    const modal = document.getElementById('packageModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

/**
 * Inicia um pacote
 */
window.startPackage = function(packageId) {
    const pkg = window.dashboardManager?.allPackages?.find(p => p.id === packageId);
    if (!pkg) return;
    
    // Mostrar toast de feedback
    if (window.showToast) {
        const isStarted = pkg.progressPercentage > 0;
        window.showToast(
            `${isStarted ? 'Continuando' : 'Iniciando'} ${pkg.name}...`, 
            'info'
        );
    }
    
    // Simular navegação para o pacote
    setTimeout(() => {
        window.location.href = `/content/package/${packageId}/lessons`;
    }, 1000);
};

/**
 * Limpa todos os filtros (função global)
 */
window.clearAllFilters = function() {
    if (window.dashboardManager) {
        window.dashboardManager.clearAllFilters();
    }
};

// Funções globais para uso nos templates (compatibilidade)
window.showProgressModal = function(packageId) {
    if (window.dashboardManager) {
        window.dashboardManager.showProgressModal(packageId);
    }
};

window.closeProgressModal = function() {
    if (window.dashboardManager) {
        window.dashboardManager.closeProgressModal();
    }
};

window.continuePackage = function(packageId) {
    window.startPackage(packageId);
};

window.viewPackageDetails = function(packageId) {
    window.showPackageModal(packageId);
};

/**
 * Cria conteúdo do modal de pacote
 */
function createPackageModalContent(pkg) {
    const stars = generateModalStars(pkg.rating);
    const prerequisites = pkg.prerequisites.length > 0 
        ? pkg.prerequisites.join(', ') 
        : 'Nenhum pré-requisito';
    
    return `
        <div class="modal-package-info">
            <div class="modal-package-icon">
                <i class="${pkg.icon}"></i>
            </div>
            <div class="modal-package-details">
                <h3>${pkg.name}</h3>
                <p>${pkg.description}</p>
                
                <div class="package-meta">
                    <div class="meta-item">
                        <i class="fas fa-signal"></i>
                        <span class="difficulty-badge ${pkg.difficulty}">${pkg.difficulty}</span>
                    </div>
                    <div class="meta-item rating-display">
                        <span class="rating-stars">${stars}</span>
                        <span>${pkg.rating}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="modal-stats">
            <div class="modal-stat">
                <span class="modal-stat-value">${pkg.duration}h</span>
                <span class="modal-stat-label">Duração</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${pkg.lessonsCount}</span>
                <span class="modal-stat-label">Aulas</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${pkg.studentsCount}</span>
                <span class="modal-stat-label">Estudantes</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${pkg.progressPercentage}%</span>
                <span class="modal-stat-label">Progresso</span>
            </div>
        </div>
        
        <div class="package-tags">
            ${pkg.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        
        <div class="modal-lessons">
            <h4>Conteúdo do Pacote</h4>
            <div class="lessons-list">
                ${createMockLessons(pkg).map((lesson, index) => `
                    <div class="lesson-item">
                        <div class="lesson-number">${index + 1}</div>
                        <div class="lesson-info">
                            <div class="lesson-name">${lesson.name}</div>
                            <div class="lesson-description">${lesson.description}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="margin-top: 1rem; padding: 1rem; background: var(--gray-50); border-radius: 8px;">
            <strong>Pré-requisitos:</strong> ${prerequisites}
        </div>
    `;
}

/**
 * Gera estrelas para o modal
 */
function generateModalStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    return stars;
}

/**
 * Cria aulas mockadas para o modal
 */
function createMockLessons(pkg) {
    const lessonsMap = {
        1: [ // Pacote C
            { name: 'C - Introdução', description: 'Conceitos básicos da linguagem C' },
            { name: 'C - Variáveis', description: 'Declaração e uso de variáveis' },
            { name: 'C - Operações', description: 'Operadores aritméticos e lógicos' },
            { name: 'C - Estruturas de Controle', description: 'If, else, switch, loops' },
            { name: 'C - Funções', description: 'Criação e uso de funções' }
        ],
        2: [ // Pacote Front-end
            { name: 'HTML Básico', description: 'Estrutura e tags HTML' },
            { name: 'CSS Styling', description: 'Estilização com CSS' },
            { name: 'JavaScript Fundamentos', description: 'Lógica com JavaScript' },
            { name: 'Responsividade', description: 'Design responsivo' },
            { name: 'DOM Manipulation', description: 'Manipulação do DOM' },
            { name: 'Projeto Final', description: 'Desenvolvimento de um site completo' }
        ],
        3: [ // Pacote Python
            { name: 'Python Básico', description: 'Sintaxe e conceitos fundamentais' },
            { name: 'Estruturas de Dados', description: 'Listas, dicionários, tuplas' },
            { name: 'Programação Orientada a Objetos', description: 'Classes e objetos em Python' },
            { name: 'Bibliotecas Populares', description: 'NumPy, Pandas, Requests' },
            { name: 'Projeto Python', description: 'Desenvolvimento de uma aplicação' }
        ]
    };
    
    return lessonsMap[pkg.id] || [
        { name: 'Aula 1', description: 'Introdução aos conceitos' },
        { name: 'Aula 2', description: 'Fundamentos práticos' },
        { name: 'Aula 3', description: 'Aplicação avançada' },
        { name: 'Projeto Final', description: 'Projeto prático completo' }
    ];
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});

// CSS adicional para animações (injetado via JavaScript)
const additionalStyles = `
    .animate-in {
        animation: slideInUp 0.6s ease forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .loading-state,
    .error-state {
        text-align: center;
        padding: 2rem;
    }
    
    .loading-state .spinner {
        margin: 0 auto 1rem;
    }
    
    .error-state i {
        font-size: 2rem;
        color: var(--error);
        margin-bottom: 1rem;
        display: block;
    }
    
    .progress-details {
        padding: 1rem 0;
    }
    
    .progress-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }
    
    .progress-badge {
        background: var(--gradient-primary);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.75rem;
        font-weight: 600;
    }
    
    .progress-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
    }
    
    .progress-stat {
        text-align: center;
        padding: 1rem;
        background: var(--gray-50);
        border-radius: 0.5rem;
    }
    
    .progress-stat .stat-label {
        display: block;
        font-size: 0.75rem;
        color: var(--gray-600);
        margin-bottom: 0.25rem;
    }
    
    .progress-stat .stat-value {
        display: block;
        font-size: 1rem;
        font-weight: 600;
        color: var(--gray-800);
    }
    
    .progress-bar-container {
        margin-bottom: 1.5rem;
    }
    
    .progress-actions {
        display: flex;
        gap: 0.75rem;
    }
    
    .progress-actions .btn {
        flex: 1;
    }
`;

// Injetar estilos adicionais
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// =======================================
// FUNÇÕES GLOBAIS PARA USO EXTERNO
// =======================================

/**
 * Função global para continuar um pacote
 * Pode ser chamada de qualquer lugar da aplicação
 */
window.continuePackage = function(packageId) {
    if (!packageId) {
        console.error('Package ID não fornecido');
        return;
    }
    
    // Mostrar feedback visual
    if (window.showToast) {
        window.showToast('Carregando pacote...', 'info');
    }
    
    // Navegar para a lista de aulas do pacote
    window.location.href = `/content/package/${packageId}/lessons`;
};

/**
 * Função global para visualizar detalhes de um pacote
 */
window.viewPackageDetails = function(packageId) {
    if (!packageId) {
        console.error('Package ID não fornecido');
        return;
    }
    
    // Mostrar feedback visual
    if (window.showToast) {
        window.showToast('Carregando detalhes...', 'info');
    }
    
    // Navegar para a página de detalhes do pacote
    window.location.href = `/content/package/${packageId}/lessons`;
};

/**
 * Função global para fechar modais
 */
window.closePackageModal = function() {
    const modal = document.getElementById('packageModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
};

window.closeProgressModal = function() {
    const modal = document.getElementById('progressModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
};

/**
 * Função global para limpar todos os filtros
 */
window.clearAllFilters = function() {
    if (window.dashboardManager) {
        window.dashboardManager.clearAllFilters();
    }
}; 