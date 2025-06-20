-- ========================================
-- CodePath - Esquema do Banco de Dados SQLite
-- ========================================
-- 
-- Este arquivo contém a estrutura completa do banco de dados
-- para a plataforma educacional CodePath.
--
-- Versão: 1.0.0
-- Última atualização: Dezembro 2024

-- ========================================
-- TABELA: users
-- ========================================
-- Armazena informações dos usuários da plataforma
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,                    -- Para exibir "Bem-vindo de volta, [Nome]!"
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    birth_date DATE,
    education_level VARCHAR(50),
    current_package_id INTEGER,                    -- Pacote atual do usuário
    selected_career_profile_id INTEGER,            -- Perfil profissional selecionado
    level INTEGER DEFAULT 1,                       -- Para barra de nível no topo
    xp_points INTEGER DEFAULT 0,                   -- Para sistema de XP
    streak_days INTEGER DEFAULT 0,                 -- Para "2 dias" de streak
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (current_package_id) REFERENCES packages(id),
    FOREIGN KEY (selected_career_profile_id) REFERENCES career_profiles(id)
);

-- ========================================
-- TABELA: packages
-- ========================================
-- Armazena os pacotes de tecnologia (C, Python, Java, etc.)
CREATE TABLE IF NOT EXISTS packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,                    -- "Pacote C", "Pacote Front-end", etc.
    description TEXT,
    icon VARCHAR(50),                              -- "C", "HTML/CSS", "Python", etc.
    current_lesson VARCHAR(200),                   -- "C - Operações", "Aula 51", etc.
    progress_percentage INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABELA: career_profiles
-- ========================================
-- Armazena os perfis profissionais disponíveis
CREATE TABLE IF NOT EXISTS career_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,                    -- "Desenvolvedor de Software", "Gestor de Projeto", etc.
    description TEXT,
    icon VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABELA: lessons
-- ========================================
-- Armazena as aulas de cada pacote
CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    package_id INTEGER NOT NULL,
    name VARCHAR(150) NOT NULL,                    -- "C - Operações", "HTML Básico", etc.
    description TEXT,
    lesson_number INTEGER,
    order_sequence INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id)
);

-- ========================================
-- TABELA: quizzes
-- ========================================
-- Armazena os questionários de código
CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,                   -- Título do questionário
    description TEXT,                              -- Descrição do questionário
    total_questions INTEGER DEFAULT 0,            -- Total de questões
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- ========================================
-- TABELA: quiz_questions
-- ========================================
-- Armazena as questões individuais dos questionários
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    question_order INTEGER NOT NULL,               -- Ordem da questão (1, 2, 3...)
    question_type VARCHAR(20) NOT NULL CHECK(question_type IN ('code', 'multiple_choice', 'text')),
    question_text TEXT NOT NULL,                   -- Texto da questão
    correct_answer TEXT,                           -- Resposta correta (para código e texto)
    explanation TEXT,                              -- Explicação da resposta
    points INTEGER DEFAULT 10,                     -- Pontos da questão
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id),
    UNIQUE(quiz_id, question_order)
);

-- ========================================
-- TABELA: quiz_options
-- ========================================
-- Armazena as opções para questões de múltipla escolha
CREATE TABLE IF NOT EXISTS quiz_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    option_order INTEGER NOT NULL,                 -- Ordem da opção (A, B, C, D)
    option_text TEXT NOT NULL,                     -- Texto da opção
    is_correct BOOLEAN DEFAULT FALSE,              -- Se é a opção correta
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id),
    UNIQUE(question_id, option_order)
);

-- ========================================
-- TABELA: user_quiz_answers
-- ========================================
-- Armazena as respostas dos usuários às questões
CREATE TABLE IF NOT EXISTS user_quiz_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer TEXT NOT NULL,                          -- Resposta do usuário
    is_correct BOOLEAN DEFAULT NULL,               -- Se a resposta está correta (NULL para questões não validadas)
    score INTEGER DEFAULT 0,                       -- Pontuação obtida
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (question_id) REFERENCES quiz_questions(id),
    UNIQUE(user_id, question_id)                   -- Um usuário pode responder cada questão apenas uma vez
);

-- ========================================
-- TABELA: user_progress
-- ========================================
-- Armazena o progresso e métricas dos usuários
CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    package_id INTEGER,
    quiz_id INTEGER,
    status VARCHAR(20) CHECK(status IN ('not_started', 'in_progress', 'completed')),
    progress_percentage INTEGER DEFAULT 0,
    lessons_watched INTEGER DEFAULT 0,             -- Para métricas "Aulas assistidas"
    courses_completed INTEGER DEFAULT 0,           -- Para métricas "Cursos concluídos"
    challenges_delivered INTEGER DEFAULT 0,        -- Para métricas "Desafios entregues"
    quizzes_completed INTEGER DEFAULT 0,           -- Para métricas "Questionários realizados"
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (package_id) REFERENCES packages(id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

-- ========================================
-- TABELA: user_sessions
-- ========================================
-- Armazena as sessões de usuários para autenticação
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ========================================
-- ÍNDICES PARA OTIMIZAÇÃO
-- ========================================

-- Índices para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_package_id ON user_progress(package_id);
CREATE INDEX IF NOT EXISTS idx_lessons_package_id ON lessons(package_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON quiz_options(question_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_answers_user_id ON user_quiz_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_answers_question_id ON user_quiz_answers(question_id);

-- ========================================
-- COMENTÁRIOS FINAIS
-- ========================================
-- 
-- Este esquema suporta:
-- - Sistema de autenticação com sessões
-- - Pacotes de tecnologia (C, Python, Java, etc.)
-- - Perfis profissionais (Desenvolvedor, Gestor, etc.)
-- - Sistema de progresso e métricas
-- - Questionários de código
-- - Gamificação (XP, streak, níveis)
--
-- Para popular o banco com dados iniciais, execute db/seed.sql 