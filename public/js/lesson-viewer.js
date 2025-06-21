/**
 * CodePath - Lesson Viewer JavaScript Avançado
 * Sistema completo de visualização de aulas com recursos interativos
 * 
 * Fase 27: Sistema de Visualização de Aulas Avançado
 * - Player de vídeo simulado funcional
 * - Sistema de notas e marcações
 * - Progresso de leitura automático
 * - Modo de foco e leitura
 * - Recursos de acessibilidade
 */

class LessonViewer {
  constructor() {
    this.currentTime = 0;
    this.duration = 900; // 15 minutos em segundos
    this.isPlaying = false;
    this.volume = 0.7;
    this.playbackSpeed = 1;
    this.notes = [];
    this.readingProgress = 0;
    this.focusMode = false;
    
    this.init();
  }

  init() {
    console.log('🚀 Lesson Viewer Avançado carregado!');
    
    // Inicializar componentes
    this.initializePlayer();
    this.initializeProgressTracking();
    this.initializeNotesSystem();
    this.initializeFocusMode();
    this.initializeAccessibility();
    this.initializeKeyboardShortcuts();
    
    // Inicializar com dados de debug
    this.showLoadingSuccess();
  }

  showLoadingSuccess() {
    // Mostrar confirmação de carregamento
    const debugElement = document.querySelector('[style*="background: #10b981"]');
    if (debugElement) {
      debugElement.innerHTML = `
        ✅ SUCESSO: Sistema de aulas carregado!
        <br>📚 Lesson Viewer Avançado ativo
        <br>⏰ ${new Date().toLocaleString('pt-BR')}
        <br>🎯 Todos os recursos funcionais
      `;
      
      // Remover após 5 segundos
      setTimeout(() => {
        debugElement.style.transition = 'all 0.5s ease';
        debugElement.style.opacity = '0';
        debugElement.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
          debugElement.remove();
        }, 500);
      }, 5000);
    }
  }

  initializePlayer() {
    const playButton = document.getElementById('playButton');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const volumeBtn = document.getElementById('volumeBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    // Player principal
    if (playButton) {
      playButton.addEventListener('click', () => {
        this.togglePlay();
        this.hideVideoOverlay();
      });
    }

    // Controles do player
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => this.togglePlay());
    }

    if (volumeBtn) {
      volumeBtn.addEventListener('click', () => this.toggleMute());
    }

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    // Inicializar simulação de progresso
    this.startProgressSimulation();
    
    // Controles de velocidade
    this.addSpeedControls();
    
    // Controles de volume
    this.initializeVolumeControls();
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
    
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playButton = document.getElementById('playButton');
    
    if (this.isPlaying) {
      // Atualizar ícones para pause
      if (playPauseBtn) {
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      }
      if (playButton) {
        playButton.innerHTML = '<i class="fas fa-pause"></i>';
      }
      
      this.showNotification('▶️ Aula iniciada', 'success');
      this.startTimer();
    } else {
      // Atualizar ícones para play
      if (playPauseBtn) {
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      }
      if (playButton) {
        playButton.innerHTML = '<i class="fas fa-play"></i>';
      }
      
      this.showNotification('⏸️ Aula pausada', 'info');
      this.stopTimer();
    }
  }

  hideVideoOverlay() {
    const overlay = document.querySelector('.video-overlay');
    if (overlay) {
      overlay.style.transition = 'all 0.5s ease';
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 500);
    }
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    
    this.timer = setInterval(() => {
      if (this.isPlaying && this.currentTime < this.duration) {
        this.currentTime += this.playbackSpeed;
        this.updateTimeDisplay();
        this.updateProgressBar();
        
        // Simular marcos de progresso
        this.checkProgressMilestones();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  updateTimeDisplay() {
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    
    if (currentTimeEl) {
      currentTimeEl.textContent = this.formatTime(this.currentTime);
    }
    
    if (durationEl) {
      durationEl.textContent = this.formatTime(this.duration);
    }
  }

  updateProgressBar() {
    const progressThumb = document.querySelector('.progress-thumb');
    if (progressThumb) {
      const percentage = (this.currentTime / this.duration) * 100;
      progressThumb.style.left = `${Math.min(percentage, 100)}%`;
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  checkProgressMilestones() {
    const percentage = (this.currentTime / this.duration) * 100;
    
    // Marcos de 25%, 50%, 75% e 100%
    if (percentage >= 25 && !this.milestones?.quarter) {
      this.milestones = { ...this.milestones, quarter: true };
      this.showNotification('🎯 25% da aula concluída!', 'success');
    } else if (percentage >= 50 && !this.milestones?.half) {
      this.milestones = { ...this.milestones, half: true };
      this.showNotification('🎉 Metade da aula concluída!', 'success');
    } else if (percentage >= 75 && !this.milestones?.threeQuarters) {
      this.milestones = { ...this.milestones, threeQuarters: true };
      this.showNotification('🚀 75% da aula concluída!', 'success');
    } else if (percentage >= 100 && !this.milestones?.complete) {
      this.milestones = { ...this.milestones, complete: true };
      this.handleLessonComplete();
    }
  }

  handleLessonComplete() {
    this.isPlaying = false;
    this.stopTimer();
    
    this.showNotification('✅ Aula concluída com sucesso!', 'success');
    
    // Mostrar modal de conclusão
    this.showCompletionModal();
  }

  showCompletionModal() {
    const modal = document.createElement('div');
    modal.className = 'completion-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="completion-icon">🎉</div>
        <h2>Parabéns!</h2>
        <p>Você concluiu esta aula com sucesso!</p>
        <div class="completion-stats">
          <div class="stat">
            <span class="stat-value">${this.formatTime(this.currentTime)}</span>
            <span class="stat-label">Tempo assistido</span>
          </div>
          <div class="stat">
            <span class="stat-value">${this.notes.length}</span>
            <span class="stat-label">Notas criadas</span>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="lessonViewer.markAsComplete()">
            <i class="fas fa-check"></i> Marcar como Concluída
          </button>
          <button class="btn btn-secondary" onclick="lessonViewer.closeModal()">
            Continuar Estudando
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animar entrada
    setTimeout(() => {
      modal.classList.add('show');
    }, 100);
  }

  markAsComplete() {
    const markCompleteBtn = document.getElementById('markCompleteBtn');
    if (markCompleteBtn) {
      markCompleteBtn.click();
    }
    this.closeModal();
  }

  closeModal() {
    const modal = document.querySelector('.completion-modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
      }, 300);
    }
  }

  initializeProgressTracking() {
    // Rastrear progresso de leitura do conteúdo
    const contentSections = document.querySelectorAll('.content-section');
    
    if (contentSections.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('section-viewed');
            this.updateReadingProgress();
          }
        });
      }, { threshold: 0.5 });

      contentSections.forEach(section => {
        observer.observe(section);
      });
    }
  }

  updateReadingProgress() {
    const totalSections = document.querySelectorAll('.content-section').length;
    const viewedSections = document.querySelectorAll('.content-section.section-viewed').length;
    
    this.readingProgress = (viewedSections / totalSections) * 100;
    
    // Atualizar indicador visual
    this.updateReadingProgressIndicator();
  }

  updateReadingProgressIndicator() {
    let indicator = document.querySelector('.reading-progress-indicator');
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'reading-progress-indicator';
      indicator.innerHTML = `
        <div class="progress-label">Progresso de Leitura</div>
        <div class="progress-bar-reading">
          <div class="progress-fill-reading"></div>
        </div>
        <div class="progress-percentage">${Math.round(this.readingProgress)}%</div>
      `;
      
      const lessonHeader = document.querySelector('.lesson-header');
      if (lessonHeader) {
        lessonHeader.appendChild(indicator);
      }
    }
    
    const progressFill = indicator.querySelector('.progress-fill-reading');
    const progressPercentage = indicator.querySelector('.progress-percentage');
    
    if (progressFill) {
      progressFill.style.width = `${this.readingProgress}%`;
    }
    
    if (progressPercentage) {
      progressPercentage.textContent = `${Math.round(this.readingProgress)}%`;
    }
  }

  initializeNotesSystem() {
    // Adicionar botão de notas
    this.addNotesButton();
    
    // Permitir seleção de texto para criar notas
    document.addEventListener('mouseup', (e) => {
      const selection = window.getSelection();
      if (selection.toString().length > 0) {
        this.showNoteOption(e.pageX, e.pageY, selection.toString());
      }
    });
  }

  addNotesButton() {
    const notesButton = document.createElement('button');
    notesButton.className = 'notes-toggle-btn';
    notesButton.innerHTML = '<i class="fas fa-sticky-note"></i> Notas';
    notesButton.onclick = () => this.toggleNotesPanel();
    
    const lessonHeader = document.querySelector('.lesson-header');
    if (lessonHeader) {
      lessonHeader.appendChild(notesButton);
    }
  }

  toggleNotesPanel() {
    let notesPanel = document.querySelector('.notes-panel');
    
    if (!notesPanel) {
      notesPanel = this.createNotesPanel();
      document.body.appendChild(notesPanel);
    }
    
    notesPanel.classList.toggle('show');
  }

  createNotesPanel() {
    const panel = document.createElement('div');
    panel.className = 'notes-panel';
    panel.innerHTML = `
      <div class="notes-header">
        <h3><i class="fas fa-sticky-note"></i> Minhas Notas</h3>
        <button class="close-notes" onclick="lessonViewer.toggleNotesPanel()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="notes-content">
        <div class="add-note">
          <textarea placeholder="Adicionar nova nota..." rows="3"></textarea>
          <button class="btn btn-primary btn-sm" onclick="lessonViewer.addNote()">
            <i class="fas fa-plus"></i> Adicionar
          </button>
        </div>
        <div class="notes-list"></div>
      </div>
    `;
    
    return panel;
  }

  addNote(text = null) {
    const textarea = document.querySelector('.add-note textarea');
    const noteText = text || textarea?.value.trim();
    
    if (!noteText) return;
    
    const note = {
      id: Date.now(),
      text: noteText,
      timestamp: new Date().toLocaleString('pt-BR'),
      currentTime: this.formatTime(this.currentTime)
    };
    
    this.notes.push(note);
    this.renderNotes();
    
    if (textarea) {
      textarea.value = '';
    }
    
    this.showNotification('📝 Nota adicionada!', 'success');
  }

  renderNotes() {
    const notesList = document.querySelector('.notes-list');
    if (!notesList) return;
    
    notesList.innerHTML = this.notes.map(note => `
      <div class="note-item" data-note-id="${note.id}">
        <div class="note-content">${note.text}</div>
        <div class="note-meta">
          <span class="note-time">${note.currentTime}</span>
          <span class="note-date">${note.timestamp}</span>
          <button class="delete-note" onclick="lessonViewer.deleteNote(${note.id})">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  deleteNote(noteId) {
    this.notes = this.notes.filter(note => note.id !== noteId);
    this.renderNotes();
    this.showNotification('🗑️ Nota removida', 'info');
  }

  initializeFocusMode() {
    const focusButton = document.createElement('button');
    focusButton.className = 'focus-mode-btn';
    focusButton.innerHTML = '<i class="fas fa-eye"></i> Modo Foco';
    focusButton.onclick = () => this.toggleFocusMode();
    
    const lessonHeader = document.querySelector('.lesson-header');
    if (lessonHeader) {
      lessonHeader.appendChild(focusButton);
    }
  }

  toggleFocusMode() {
    this.focusMode = !this.focusMode;
    document.body.classList.toggle('focus-mode', this.focusMode);
    
    const button = document.querySelector('.focus-mode-btn');
    if (button) {
      button.innerHTML = this.focusMode 
        ? '<i class="fas fa-eye-slash"></i> Sair do Foco'
        : '<i class="fas fa-eye"></i> Modo Foco';
    }
    
    this.showNotification(
      this.focusMode ? '🎯 Modo foco ativado' : '👁️ Modo foco desativado',
      'info'
    );
  }

  initializeAccessibility() {
    // Adicionar controles de acessibilidade
    const accessibilityControls = document.createElement('div');
    accessibilityControls.className = 'accessibility-controls';
    accessibilityControls.innerHTML = `
      <button class="accessibility-btn" onclick="lessonViewer.increaseFontSize()" title="Aumentar fonte">
        <i class="fas fa-plus"></i> A
      </button>
      <button class="accessibility-btn" onclick="lessonViewer.decreaseFontSize()" title="Diminuir fonte">
        <i class="fas fa-minus"></i> A
      </button>
      <button class="accessibility-btn" onclick="lessonViewer.toggleHighContrast()" title="Alto contraste">
        <i class="fas fa-adjust"></i>
      </button>
    `;
    
    const lessonHeader = document.querySelector('.lesson-header');
    if (lessonHeader) {
      lessonHeader.appendChild(accessibilityControls);
    }
  }

  increaseFontSize() {
    const currentSize = parseInt(getComputedStyle(document.body).fontSize);
    document.body.style.fontSize = `${currentSize + 2}px`;
    this.showNotification('🔍 Fonte aumentada', 'info');
  }

  decreaseFontSize() {
    const currentSize = parseInt(getComputedStyle(document.body).fontSize);
    if (currentSize > 12) {
      document.body.style.fontSize = `${currentSize - 2}px`;
      this.showNotification('🔍 Fonte diminuída', 'info');
    }
  }

  toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
    const isActive = document.body.classList.contains('high-contrast');
    this.showNotification(
      isActive ? '🎨 Alto contraste ativado' : '🎨 Alto contraste desativado',
      'info'
    );
  }

  initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ignorar se estiver digitando em um input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          this.togglePlay();
          break;
        case 'f':
          e.preventDefault();
          this.toggleFocusMode();
          break;
        case 'n':
          e.preventDefault();
          this.toggleNotesPanel();
          break;
        case 'm':
          e.preventDefault();
          this.toggleMute();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.seekBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.seekForward();
          break;
      }
    });
    
    // Mostrar dicas de atalhos
    this.showKeyboardShortcuts();
  }

  showKeyboardShortcuts() {
    const shortcuts = document.createElement('div');
    shortcuts.className = 'keyboard-shortcuts';
    shortcuts.innerHTML = `
      <div class="shortcuts-header">
        <h4><i class="fas fa-keyboard"></i> Atalhos do Teclado</h4>
      </div>
      <div class="shortcuts-list">
        <div class="shortcut"><kbd>Espaço</kbd> Play/Pause</div>
        <div class="shortcut"><kbd>F</kbd> Modo Foco</div>
        <div class="shortcut"><kbd>N</kbd> Notas</div>
        <div class="shortcut"><kbd>M</kbd> Mudo</div>
        <div class="shortcut"><kbd>←</kbd> Voltar 10s</div>
        <div class="shortcut"><kbd>→</kbd> Avançar 10s</div>
      </div>
    `;
    
    const lessonContent = document.querySelector('.lesson-content');
    if (lessonContent) {
      lessonContent.appendChild(shortcuts);
    }
  }

  seekBackward() {
    this.currentTime = Math.max(0, this.currentTime - 10);
    this.updateTimeDisplay();
    this.updateProgressBar();
    this.showNotification('⏪ -10 segundos', 'info');
  }

  seekForward() {
    this.currentTime = Math.min(this.duration, this.currentTime + 10);
    this.updateTimeDisplay();
    this.updateProgressBar();
    this.showNotification('⏩ +10 segundos', 'info');
  }

  showNotification(message, type = 'info') {
    // Criar ou reutilizar container de notificações
    let container = document.querySelector('.lesson-notifications');
    if (!container) {
      container = document.createElement('div');
      container.className = 'lesson-notifications';
      document.body.appendChild(container);
    }
    
    // Criar notificação
    const notification = document.createElement('div');
    notification.className = `lesson-notification lesson-notification-${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  // Métodos auxiliares para controles avançados
  addSpeedControls() {
    const speedControl = document.createElement('div');
    speedControl.className = 'speed-control';
    speedControl.innerHTML = `
      <button class="control-btn" onclick="lessonViewer.changeSpeed(0.5)">0.5x</button>
      <button class="control-btn active" onclick="lessonViewer.changeSpeed(1)">1x</button>
      <button class="control-btn" onclick="lessonViewer.changeSpeed(1.25)">1.25x</button>
      <button class="control-btn" onclick="lessonViewer.changeSpeed(1.5)">1.5x</button>
      <button class="control-btn" onclick="lessonViewer.changeSpeed(2)">2x</button>
    `;
    
    const playerControls = document.querySelector('.player-controls');
    if (playerControls) {
      playerControls.appendChild(speedControl);
    }
  }

  changeSpeed(speed) {
    this.playbackSpeed = speed;
    
    // Atualizar botões ativos
    document.querySelectorAll('.speed-control .control-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    this.showNotification(`⚡ Velocidade: ${speed}x`, 'info');
  }

  initializeVolumeControls() {
    const volumeSlider = document.querySelector('.volume-slider');
    if (volumeSlider) {
      volumeSlider.addEventListener('click', (e) => {
        const rect = volumeSlider.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        this.setVolume(percentage);
      });
    }
  }

  setVolume(percentage) {
    this.volume = Math.max(0, Math.min(1, percentage));
    
    const volumeThumb = document.querySelector('.volume-thumb');
    if (volumeThumb) {
      volumeThumb.style.left = `${this.volume * 100}%`;
    }
    
    // Atualizar ícone do volume
    const volumeBtn = document.getElementById('volumeBtn');
    if (volumeBtn) {
      let icon = 'fa-volume-up';
      if (this.volume === 0) icon = 'fa-volume-mute';
      else if (this.volume < 0.5) icon = 'fa-volume-down';
      
      volumeBtn.innerHTML = `<i class="fas ${icon}"></i>`;
    }
  }

  toggleMute() {
    if (this.volume > 0) {
      this.previousVolume = this.volume;
      this.setVolume(0);
    } else {
      this.setVolume(this.previousVolume || 0.7);
    }
  }

  toggleFullscreen() {
    const contentPlayer = document.querySelector('.content-player');
    if (contentPlayer) {
      if (!document.fullscreenElement) {
        contentPlayer.requestFullscreen();
        this.showNotification('📺 Modo tela cheia ativado', 'info');
      } else {
        document.exitFullscreen();
        this.showNotification('📺 Modo tela cheia desativado', 'info');
      }
    }
  }

  startProgressSimulation() {
    // Simular carregamento de conteúdo
    setTimeout(() => {
      this.showNotification('📚 Conteúdo carregado com sucesso!', 'success');
    }, 1000);
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.lessonViewer = new LessonViewer();
});

// Log de inicialização
console.log('📚 CodePath - Lesson Viewer Avançado v2.0');
console.log('🎯 Recursos: Player simulado, notas, modo foco, acessibilidade');
console.log('⌨️ Atalhos: Espaço (play/pause), F (foco), N (notas), M (mudo)'); 