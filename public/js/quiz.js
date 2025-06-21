/**
 * CodePath - Sistema de Quizzes Interativo
 * Fase 22: Interatividade Completa dos Quizzes
 */

class QuizManager {
    constructor() {
        this.currentQuestionIndex = 0;
        this.questions = [];
        this.answers = {};
        this.score = 0;
        this.totalQuestions = 0;
        this.quizId = null;
        this.timeStarted = null;
        this.isSubmitting = false;
        
        this.init();
    }
    
    init() {
        console.log('[QUIZ] Inicializando sistema...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        try {
            this.loadQuizData();
            this.setupEventListeners();
            
            if (this.questions.length > 0) {
                this.startQuiz();
            }
            
            console.log('[QUIZ] Sistema inicializado');
        } catch (error) {
            console.error('[QUIZ] Erro na inicialização:', error);
        }
    }
    
    loadQuizData() {
        const quizElement = document.querySelector('[data-quiz]');
        if (quizElement) {
            const quizData = JSON.parse(quizElement.dataset.quiz);
            this.questions = quizData.questions || [];
            this.quizId = quizData.id;
            this.totalQuestions = this.questions.length;
        }
    }
    
    setupEventListeners() {
        // Navegação por botões
        const prevBtn = document.querySelector('.btn-previous-question');
        const nextBtn = document.querySelector('.btn-next-question');
        const submitBtn = document.querySelector('.btn-submit-quiz');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.previousQuestion());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextQuestion());
        if (submitBtn) submitBtn.addEventListener('click', () => this.submitQuiz());
        
        // Navegação por teclado
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Respostas
        document.addEventListener('change', (e) => {
            if (e.target.matches('.quiz-option input')) {
                this.handleAnswer(e.target);
            }
        });
    }
    
    startQuiz() {
        console.log('[QUIZ] Iniciando quiz...');
        this.timeStarted = Date.now();
        this.showQuestion(0);
        this.updateProgress();
    }
    
    showQuestion(index) {
        if (index < 0 || index >= this.totalQuestions) return;
        
        this.currentQuestionIndex = index;
        const question = this.questions[index];
        
        this.renderQuestion(question, index);
        this.updateProgress();
        this.updateNavigation();
    }
    
    renderQuestion(question, index) {
        const container = document.querySelector('.quiz-question-container');
        if (!container) return;
        
        const questionHTML = `
            <div class="quiz-question-wrapper">
                <div class="question-header">
                    <h3>Questão ${index + 1}</h3>
                    <span class="question-points">+${question.points || 10} pts</span>
                </div>
                
                <div class="question-content">
                    <p class="question-text">${question.text}</p>
                    <div class="question-options">
                        ${this.renderOptions(question, index)}
                    </div>
                </div>
                
                <div class="question-feedback" id="feedback-${index}"></div>
            </div>
        `;
        
        container.innerHTML = questionHTML;
    }
    
    renderOptions(question, questionIndex) {
        return question.options.map((option, optionIndex) => `
            <div class="quiz-option">
                <input 
                    type="radio" 
                    name="question_${questionIndex}" 
                    value="${option.id}" 
                    id="option_${questionIndex}_${optionIndex}"
                    data-question-index="${questionIndex}"
                />
                <label for="option_${questionIndex}_${optionIndex}" class="option-label">
                    <span class="option-letter">${String.fromCharCode(65 + optionIndex)}</span>
                    <span class="option-text">${option.text}</span>
                </label>
            </div>
        `).join('');
    }
    
    handleAnswer(input) {
        const questionIndex = parseInt(input.dataset.questionIndex);
        const question = this.questions[questionIndex];
        
        this.answers[questionIndex] = {
            value: input.value,
            timestamp: Date.now()
        };
        
        const isCorrect = this.checkAnswer(question, input.value);
        this.answers[questionIndex].isCorrect = isCorrect;
        
        if (isCorrect) {
            this.score += question.points || 10;
            this.updateScore();
        }
        
        this.showFeedback(questionIndex, isCorrect, question);
        
        setTimeout(() => {
            if (questionIndex < this.totalQuestions - 1) {
                this.nextQuestion();
            }
        }, 1500);
    }
    
    checkAnswer(question, userAnswer) {
        const correctOption = question.options.find(opt => opt.isCorrect);
        return correctOption && correctOption.id === userAnswer;
    }
    
    showFeedback(questionIndex, isCorrect, question) {
        const feedbackContainer = document.getElementById(`feedback-${questionIndex}`);
        if (!feedbackContainer) return;
        
        const icon = isCorrect ? '✅' : '❌';
        const text = isCorrect ? 'Correto!' : 'Incorreto';
        const className = isCorrect ? 'feedback-correct' : 'feedback-incorrect';
        
        feedbackContainer.innerHTML = `
            <div class="answer-feedback ${className}">
                <span class="feedback-icon">${icon}</span>
                <span class="feedback-text">${text}</span>
            </div>
        `;
        
        feedbackContainer.classList.add('feedback-visible');
    }
    
    nextQuestion() {
        if (this.currentQuestionIndex < this.totalQuestions - 1) {
            this.showQuestion(this.currentQuestionIndex + 1);
        }
    }
    
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.showQuestion(this.currentQuestionIndex - 1);
        }
    }
    
    handleKeyboard(event) {
        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.previousQuestion();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextQuestion();
                break;
        }
    }
    
    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100;
        
        const progressBar = document.querySelector('.quiz-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        const progressText = document.querySelector('.quiz-progress-text');
        if (progressText) {
            progressText.textContent = `${this.currentQuestionIndex + 1} de ${this.totalQuestions}`;
        }
    }
    
    updateNavigation() {
        const prevBtn = document.querySelector('.btn-previous-question');
        const nextBtn = document.querySelector('.btn-next-question');
        const submitBtn = document.querySelector('.btn-submit-quiz');
        
        if (prevBtn) prevBtn.disabled = this.currentQuestionIndex === 0;
        if (nextBtn) nextBtn.disabled = this.currentQuestionIndex === this.totalQuestions - 1;
        
        if (submitBtn) {
            submitBtn.style.display = 
                this.currentQuestionIndex === this.totalQuestions - 1 ? 'block' : 'none';
        }
    }
    
    updateScore() {
        const scoreElements = document.querySelectorAll('.quiz-score');
        scoreElements.forEach(element => {
            element.textContent = `${this.score} pts`;
            element.classList.add('score-updated');
            setTimeout(() => element.classList.remove('score-updated'), 1000);
        });
    }
    
    async submitQuiz() {
        if (this.isSubmitting) return;
        
        console.log('[QUIZ] Submetendo quiz...');
        this.isSubmitting = true;
        
        try {
            const totalTime = Date.now() - this.timeStarted;
            const correctAnswers = Object.values(this.answers).filter(a => a.isCorrect).length;
            const accuracy = (correctAnswers / this.totalQuestions) * 100;
            
            const submitData = {
                quizId: this.quizId,
                answers: this.answers,
                score: this.score,
                totalTime: totalTime,
                correctAnswers: correctAnswers,
                accuracy: accuracy
            };
            
            this.showSubmissionLoading();
            
            const response = await fetch(`/quiz/${this.quizId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData)
            });
            
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            
            const result = await response.json();
            this.showQuizResult(result);
            
        } catch (error) {
            console.error('[QUIZ] Erro ao submeter:', error);
            this.showSubmissionError(error);
        } finally {
            this.isSubmitting = false;
        }
    }
    
    showSubmissionLoading() {
        const container = document.querySelector('.quiz-question-container');
        if (container) {
            container.innerHTML = `
                <div class="quiz-submission-loading">
                    <div class="loading-spinner"></div>
                    <h3>Processando suas respostas...</h3>
                </div>
            `;
        }
    }
    
    showSubmissionError(error) {
        const container = document.querySelector('.quiz-question-container');
        if (container) {
            container.innerHTML = `
                <div class="quiz-submission-error">
                    <h3>Erro ao processar quiz</h3>
                    <p>Tente novamente.</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Tentar Novamente
                    </button>
                </div>
            `;
        }
    }
    
    showQuizResult(result) {
        if (result.redirectUrl) {
            window.location.href = result.redirectUrl;
        } else {
            this.showResultModal(result);
        }
    }
    
    showResultModal(result) {
        const modalHTML = `
            <div class="quiz-result-modal" id="quizResultModal">
                <div class="modal-content">
                    <h2>Quiz Concluído!</h2>
                    <div class="result-score">${result.score} pontos</div>
                    <div class="result-stats">
                        <div>Acertos: ${result.correctAnswers}/${this.totalQuestions}</div>
                        <div>Precisão: ${result.accuracy.toFixed(1)}%</div>
                    </div>
                    <button class="btn btn-primary" onclick="this.closest('.quiz-result-modal').remove()">
                        Continuar
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// Inicialização
let quizManager;
document.addEventListener('DOMContentLoaded', () => {
    quizManager = new QuizManager();
});

window.QuizManager = QuizManager;
