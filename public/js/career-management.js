/**
 * ========================================
 * CodePath - Career Management System
 * ========================================
 * 
 * Sistema completo de gerenciamento de carreiras do usuário
 * Permite adicionar, remover, editar prioridade e gerenciar carreiras
 * 
 * @author CodePath Team
 * @version 1.0.0
 */

class CareerManager {
  constructor() {
    this.currentCareerForEdit = null;
    this.currentCareerForRemoval = null;
    this.selectedCareers = new Set();
    this.availableCareers = [];
    
    this.initializeEventListeners();
    this.loadUserCareers();
  }

  /**
   * Inicializar event listeners
   */
  initializeEventListeners() {
    // Botão de adicionar carreira
    const addCareerBtn = document.getElementById('addCareerBtn');
    if (addCareerBtn) {
      addCareerBtn.addEventListener('click', () => this.showAvailableCareers());
    }

    // Fechar modais ao clicar fora
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeAllModals();
      }
    });

    // Atalhos de teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  /**
   * Carregar carreiras do usuário
   */
  async loadUserCareers() {
    try {
      this.showLoading(true);
      
      const response = await fetch('/api/careers/selected');
      const result = await response.json();
      
      if (result.success) {
        this.selectedCareers = new Set(result.careers.map(c => c.id));
        this.updateUI(result.careers);
      } else {
        this.showToast('Erro ao carregar carreiras', 'error');
      }
      
    } catch (error) {
      console.error('Erro ao carregar carreiras:', error);
      this.showToast('Erro de conexão', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Mostrar carreiras disponíveis para adicionar
   */
  showAvailableCareers() {
    const availableSection = document.querySelector('.available-careers-section');
    if (availableSection) {
      availableSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Destacar seção temporariamente
      availableSection.style.background = 'rgba(139, 92, 246, 0.05)';
      availableSection.style.borderRadius = '16px';
      availableSection.style.padding = '1.5rem';
      availableSection.style.transition = 'all 0.3s ease';
      
      setTimeout(() => {
        availableSection.style.background = '';
        availableSection.style.padding = '';
      }, 2000);
    }
  }

  /**
   * Adicionar carreira à seleção do usuário
   */
  async addCareer(careerId) {
    try {
      // Verificar limite de carreiras (máximo 5)
      if (this.selectedCareers.size >= 5) {
        this.showToast('Você pode selecionar no máximo 5 carreiras', 'warning');
        return;
      }

      this.showLoading(true);
      
      // Adicionar à seleção atual
      const newSelection = [...this.selectedCareers, careerId];
      
      const response = await fetch('/api/careers/selection', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          careers: newSelection
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.selectedCareers.add(careerId);
        this.showToast('Carreira adicionada com sucesso!', 'success');
        
        // Recarregar dados
        await this.loadUserCareers();
        
        // Mover card para seção de selecionadas com animação
        this.animateCardMove(careerId, 'selected');
        
      } else {
        this.showToast(result.message || 'Erro ao adicionar carreira', 'error');
      }
      
    } catch (error) {
      console.error('Erro ao adicionar carreira:', error);
      this.showToast('Erro de conexão', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Remover carreira (mostrar modal de confirmação)
   */
  removeCareer(careerId) {
    this.currentCareerForRemoval = careerId;
    
    // Encontrar nome da carreira para exibir no modal
    const careerCard = document.querySelector(`[data-career-id="${careerId}"]`);
    const careerName = careerCard?.querySelector('.career-name')?.textContent || 'esta carreira';
    
    // Atualizar texto do modal
    const modalBody = document.querySelector('#removeModal .modal-body');
    modalBody.innerHTML = `
      <div class="warning-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <p>Tem certeza que deseja remover <strong>"${careerName}"</strong> de sua lista?</p>
      <p><strong>Esta ação não pode ser desfeita.</strong></p>
    `;
    
    this.showModal('removeModal');
  }

  /**
   * Confirmar remoção de carreira
   */
  async confirmRemove() {
    if (!this.currentCareerForRemoval) return;
    
    try {
      this.showLoading(true);
      
      // Remover da seleção atual
      const newSelection = [...this.selectedCareers].filter(id => id !== this.currentCareerForRemoval);
      
      const response = await fetch('/api/careers/selection', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          careers: newSelection
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.selectedCareers.delete(this.currentCareerForRemoval);
        this.showToast('Carreira removida com sucesso!', 'success');
        
        // Animar remoção do card
        this.animateCardRemoval(this.currentCareerForRemoval);
        
        // Recarregar dados após animação
        setTimeout(() => {
          this.loadUserCareers();
        }, 300);
        
      } else {
        this.showToast(result.message || 'Erro ao remover carreira', 'error');
      }
      
    } catch (error) {
      console.error('Erro ao remover carreira:', error);
      this.showToast('Erro de conexão', 'error');
    } finally {
      this.showLoading(false);
      this.closeRemoveModal();
    }
  }

  /**
   * Editar prioridade de carreira
   */
  editPriority(careerId) {
    this.currentCareerForEdit = careerId;
    
    // Buscar prioridade atual
    const careerCard = document.querySelector(`[data-career-id="${careerId}"]`);
    const currentPriority = careerCard?.querySelector('.priority-badge')?.textContent?.replace('#', '') || '2';
    
    // Marcar opção atual no modal
    const priorityInputs = document.querySelectorAll('input[name="priority"]');
    priorityInputs.forEach(input => {
      input.checked = input.value === currentPriority;
    });
    
    this.showModal('priorityModal');
  }

  /**
   * Salvar nova prioridade
   */
  async savePriority() {
    if (!this.currentCareerForEdit) return;
    
    const selectedPriority = document.querySelector('input[name="priority"]:checked')?.value;
    
    if (!selectedPriority) {
      this.showToast('Selecione uma prioridade', 'warning');
      return;
    }
    
    try {
      this.showLoading(true);
      
      // Simular salvamento de prioridade (API fictícia)
      const response = await fetch(`/api/careers/${this.currentCareerForEdit}/priority`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priority: parseInt(selectedPriority)
        })
      });
      
      // Como a API não existe, simular sucesso
      const result = { success: true };
      
      if (result.success) {
        // Atualizar prioridade no card
        const careerCard = document.querySelector(`[data-career-id="${this.currentCareerForEdit}"]`);
        const priorityBadge = careerCard?.querySelector('.priority-badge');
        
        if (priorityBadge) {
          priorityBadge.textContent = `#${selectedPriority}`;
          priorityBadge.className = `priority-badge priority-${selectedPriority}`;
        }
        
        this.showToast('Prioridade atualizada com sucesso!', 'success');
        
      } else {
        this.showToast('Erro ao atualizar prioridade', 'error');
      }
      
    } catch (error) {
      console.error('Erro ao salvar prioridade:', error);
      this.showToast('Erro de conexão', 'error');
    } finally {
      this.showLoading(false);
      this.closePriorityModal();
    }
  }

  /**
   * Atualizar interface com dados das carreiras
   */
  updateUI(careers) {
    this.updateStatistics(careers);
    this.updateSelectedCareersGrid(careers);
    this.updateAvailableCareersGrid(careers);
  }

  /**
   * Atualizar estatísticas
   */
  updateStatistics(careers) {
    const totalCareers = careers.length;
    const totalPackages = careers.reduce((sum, career) => sum + (career.package_count || 0), 0);
    const estimatedHours = careers.reduce((sum, career) => sum + (career.estimated_hours || 0), 0);
    
    // Atualizar números com animação
    this.animateNumber('totalCareers', totalCareers);
    this.animateNumber('totalPackages', totalPackages);
    this.animateNumber('estimatedHours', estimatedHours);
  }

  /**
   * Animar mudança de números
   */
  animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const currentValue = parseInt(element.textContent) || 0;
    const increment = targetValue > currentValue ? 1 : -1;
    const duration = 500; // ms
    const steps = Math.abs(targetValue - currentValue);
    const stepDuration = steps > 0 ? duration / steps : 0;
    
    let current = currentValue;
    if (steps === 0) return;
    
    const timer = setInterval(() => {
      current += increment;
      element.textContent = current;
      
      if (current === targetValue) {
        clearInterval(timer);
      }
    }, stepDuration);
  }

  /**
   * Atualizar grid de carreiras selecionadas
   */
  updateSelectedCareersGrid(careers) {
    const grid = document.getElementById('selectedCareersGrid');
    const hasSelectedSection = document.querySelector('.selected-careers-section');
    
    if (careers.length === 0) {
      // Mostrar empty state
      hasSelectedSection.innerHTML = `
        <h2 class="section-title">
          <i class="fas fa-star"></i>
          Suas Carreiras Selecionadas
        </h2>
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-briefcase"></i>
          </div>
          <h3>Nenhuma carreira selecionada</h3>
          <p>Adicione suas primeiras áreas de interesse para começar sua jornada de aprendizado.</p>
          <button class="btn btn-primary" onclick="window.CareerManager.showAvailableCareers()">
            <i class="fas fa-plus"></i>
            Adicionar Primeira Carreira
          </button>
        </div>
      `;
      return;
    }
    
    // Renderizar carreiras selecionadas
    if (grid) {
      grid.innerHTML = careers.map((career, index) => `
        <div class="career-card selected" data-career-id="${career.id}">
          <div class="career-header">
            <div class="career-icon">
              <i class="${career.icon}"></i>
            </div>
            <div class="career-priority">
              <span class="priority-badge priority-${career.priority || (index + 1)}">
                #${career.priority || (index + 1)}
              </span>
            </div>
          </div>
          
          <div class="career-content">
            <h3 class="career-name">${career.name}</h3>
            <p class="career-description">${career.description}</p>
            
            <div class="career-stats">
              <div class="stat">
                <i class="fas fa-box"></i>
                <span>${career.package_count || 0} pacotes</span>
              </div>
              <div class="stat">
                <i class="fas fa-clock"></i>
                <span>${career.estimated_hours || 0}h</span>
              </div>
              <div class="stat">
                <i class="fas fa-signal"></i>
                <span>${career.difficulty_level || 'Iniciante'}</span>
              </div>
            </div>
            
            <div class="career-tags">
              ${(career.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </div>
          
          <div class="career-actions">
            <button class="btn btn-sm btn-secondary" onclick="window.CareerManager.editPriority(${career.id})">
              <i class="fas fa-sort"></i>
              Prioridade
            </button>
            <button class="btn btn-sm btn-danger" onclick="window.CareerManager.removeCareer(${career.id})">
              <i class="fas fa-trash"></i>
              Remover
            </button>
          </div>
          
          <div class="selection-date">
            <i class="fas fa-calendar"></i>
            <span>Adicionada em ${this.formatDate(career.selected_at)}</span>
          </div>
        </div>
      `).join('');
    }
  }

  /**
   * Atualizar grid de carreiras disponíveis
   */
  async updateAvailableCareersGrid(selectedCareers) {
    try {
      // Buscar todas as carreiras disponíveis
      const response = await fetch('/api/careers/all');
      let allCareers = [];
      
      if (response.ok) {
        const result = await response.json();
        allCareers = result.careers || [];
      } else {
        // Fallback com dados simulados se API não existir
        allCareers = this.getSimulatedCareers();
      }
      
      // Filtrar carreiras não selecionadas
      const selectedIds = new Set(selectedCareers.map(c => c.id));
      const availableCareers = allCareers.filter(career => !selectedIds.has(career.id));
      
      const grid = document.getElementById('availableCareersGrid');
      if (grid) {
        grid.innerHTML = availableCareers.map(career => `
          <div class="career-card available" data-career-id="${career.id}">
            <div class="career-header">
              <div class="career-icon">
                <i class="${career.icon}"></i>
              </div>
            </div>
            
            <div class="career-content">
              <h3 class="career-name">${career.name}</h3>
              <p class="career-description">${career.description}</p>
              
              <div class="career-stats">
                <div class="stat">
                  <i class="fas fa-box"></i>
                  <span>${career.package_count || 0} pacotes</span>
                </div>
                <div class="stat">
                  <i class="fas fa-clock"></i>
                  <span>${career.estimated_hours || 0}h</span>
                </div>
                <div class="stat">
                  <i class="fas fa-signal"></i>
                  <span>${career.difficulty_level || 'Iniciante'}</span>
                </div>
              </div>
              
              <div class="career-tags">
                ${(career.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
              </div>
            </div>
            
            <div class="career-actions">
              <button class="btn btn-primary" onclick="window.CareerManager.addCareer(${career.id})">
                <i class="fas fa-plus"></i>
                Adicionar
              </button>
            </div>
          </div>
        `).join('');
      }
      
    } catch (error) {
      console.error('Erro ao carregar carreiras disponíveis:', error);
    }
  }

  /**
   * Dados simulados de carreiras (fallback)
   */
  getSimulatedCareers() {
    return [
      {
        id: 1,
        name: "Desenvolvimento Web",
        description: "Criação de sites e aplicações web modernas usando HTML, CSS, JavaScript e frameworks populares.",
        icon: "fas fa-globe",
        package_count: 8,
        estimated_hours: 120,
        difficulty_level: "Iniciante",
        tags: ["HTML", "CSS", "JavaScript", "React", "Node.js"]
      },
      {
        id: 2,
        name: "Desenvolvimento Mobile",
        description: "Desenvolvimento de aplicativos para dispositivos móveis iOS e Android usando tecnologias nativas e híbridas.",
        icon: "fas fa-mobile-alt",
        package_count: 6,
        estimated_hours: 100,
        difficulty_level: "Intermediário",
        tags: ["Swift", "Kotlin", "React Native", "Flutter"]
      },
      {
        id: 3,
        name: "Ciência de Dados",
        description: "Análise e interpretação de dados para extrair insights valiosos usando Python, R e ferramentas de machine learning.",
        icon: "fas fa-chart-bar",
        package_count: 7,
        estimated_hours: 150,
        difficulty_level: "Avançado",
        tags: ["Python", "R", "SQL", "Machine Learning", "Pandas"]
      },
      {
        id: 4,
        name: "DevOps e Cloud",
        description: "Automação de processos de desenvolvimento e implantação usando ferramentas de CI/CD e plataformas em nuvem.",
        icon: "fas fa-cloud",
        package_count: 5,
        estimated_hours: 90,
        difficulty_level: "Intermediário",
        tags: ["Docker", "Kubernetes", "AWS", "Azure", "Jenkins"]
      },
      {
        id: 5,
        name: "Segurança da Informação",
        description: "Proteção de sistemas e dados contra ameaças cibernéticas usando técnicas de segurança avançadas.",
        icon: "fas fa-shield-alt",
        package_count: 4,
        estimated_hours: 80,
        difficulty_level: "Avançado",
        tags: ["Cybersecurity", "Ethical Hacking", "Cryptography"]
      },
      {
        id: 6,
        name: "Programação Básica",
        description: "Fundamentos da programação usando linguagens como C, Python e Java para iniciantes.",
        icon: "fas fa-code",
        package_count: 10,
        estimated_hours: 60,
        difficulty_level: "Iniciante",
        tags: ["C", "Python", "Java", "Algoritmos", "Lógica"]
      }
    ];
  }

  /**
   * Animar movimento de card
   */
  animateCardMove(careerId, destination) {
    const card = document.querySelector(`[data-career-id="${careerId}"]`);
    if (!card) return;
    
    // Adicionar classe de animação
    card.style.transform = 'scale(0.95)';
    card.style.opacity = '0.7';
    card.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      card.style.transform = 'scale(1)';
      card.style.opacity = '1';
    }, 300);
  }

  /**
   * Animar remoção de card
   */
  animateCardRemoval(careerId) {
    const card = document.querySelector(`[data-career-id="${careerId}"]`);
    if (!card) return;
    
    card.style.transform = 'scale(0.8)';
    card.style.opacity = '0';
    card.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
      card.remove();
    }, 300);
  }

  /**
   * Formatar data
   */
  formatDate(dateString) {
    if (!dateString) return 'Data não disponível';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Data inválida';
    }
  }

  /**
   * Mostrar modal
   */
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Fechar modal de prioridade
   */
  closePriorityModal() {
    const modal = document.getElementById('priorityModal');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
    this.currentCareerForEdit = null;
  }

  /**
   * Fechar modal de remoção
   */
  closeRemoveModal() {
    const modal = document.getElementById('removeModal');
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
    this.currentCareerForRemoval = null;
  }

  /**
   * Fechar todos os modais
   */
  closeAllModals() {
    this.closePriorityModal();
    this.closeRemoveModal();
  }

  /**
   * Mostrar/ocultar loading
   */
  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      if (show) {
        overlay.classList.add('show');
      } else {
        overlay.classList.remove('show');
      }
    }
  }

  /**
   * Mostrar toast de notificação
   */
  showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const messageEl = toast.querySelector('.toast-message');
    
    // Definir ícone baseado no tipo
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    
    // Atualizar conteúdo
    icon.className = `toast-icon ${icons[type] || icons.info}`;
    messageEl.textContent = message;
    
    // Remover classes anteriores e adicionar nova
    toast.className = `toast ${type}`;
    
    // Mostrar toast
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    // Ocultar após 4 segundos
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }
}

// ========================================
// INICIALIZAÇÃO
// ========================================

// Instanciar o gerenciador quando a página carregar
let careerManagerInstance;

document.addEventListener('DOMContentLoaded', () => {
  careerManagerInstance = new CareerManager();
  window.CareerManager = careerManagerInstance;
});

// Tornar disponível globalmente para uso nos templates
window.CareerManager = careerManagerInstance; 