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
    total_xp INTEGER DEFAULT 0,                    -- Total de XP acumulado
    current_streak INTEGER DEFAULT 0,              -- Streak atual de dias consecutivos
    longest_streak INTEGER DEFAULT 0,              -- Maior streak já alcançado
    last_login_date DATE,                          -- Data do último login para cálculo de streak
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
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ========================================
-- TABELA: notifications
-- ========================================
-- Armazena as notificações do sistema para os usuários
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,                     -- 'welcome', 'progress', 'quiz', 'streak', 'content'
    title VARCHAR(200) NOT NULL,                   -- Título da notificação
    message TEXT NOT NULL,                         -- Mensagem da notificação
    action_url VARCHAR(500),                       -- URL de ação (opcional)
    is_read BOOLEAN DEFAULT FALSE,                 -- Se foi lida
    read_at DATETIME,                              -- Quando foi lida
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ========================================
-- TABELAS DE CHAT E COMUNIDADE
-- ========================================

-- ========================================
-- TABELA: chat_rooms
-- ========================================
-- Armazena as salas de chat por tecnologia
CREATE TABLE IF NOT EXISTS chat_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,                    -- Nome da sala
    description TEXT,                              -- Descrição da sala
    technology VARCHAR(50),                        -- Tecnologia (C, Python, Java, etc.)
    type VARCHAR(20) DEFAULT 'public' CHECK(type IN ('public', 'private', 'study_group')),
    created_by INTEGER NOT NULL,                   -- Usuário que criou a sala
    max_users INTEGER DEFAULT 50,                  -- Máximo de usuários
    is_active BOOLEAN DEFAULT TRUE,                -- Se a sala está ativa
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ========================================
-- TABELA: chat_room_members
-- ========================================
-- Armazena os membros de cada sala de chat
CREATE TABLE IF NOT EXISTS chat_room_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,                      -- ID da sala
    user_id INTEGER NOT NULL,                      -- ID do usuário
    is_moderator BOOLEAN DEFAULT FALSE,            -- Se é moderador da sala
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_read_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- Última vez que leu mensagens
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(room_id, user_id)                       -- Um usuário por sala
);

-- ========================================
-- TABELA: chat_messages
-- ========================================
-- Armazena as mensagens do chat
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,                      -- ID da sala
    user_id INTEGER NOT NULL,                      -- Usuário que enviou
    message TEXT NOT NULL,                         -- Conteúdo da mensagem
    message_type VARCHAR(20) DEFAULT 'text' CHECK(message_type IN ('text', 'code', 'image', 'file')),
    is_deleted BOOLEAN DEFAULT FALSE,              -- Se foi deletada
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ========================================
-- TABELA: study_groups
-- ========================================
-- Armazena grupos de estudo organizados
CREATE TABLE IF NOT EXISTS study_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,                    -- Nome do grupo
    description TEXT,                              -- Descrição do grupo
    technology VARCHAR(50) NOT NULL,               -- Tecnologia de foco
    schedule TEXT,                                 -- Horário de encontros
    created_by INTEGER NOT NULL,                   -- Criador do grupo
    chat_room_id INTEGER NOT NULL,                 -- Sala de chat associada
    max_members INTEGER DEFAULT 10,                -- Máximo de membros
    is_active BOOLEAN DEFAULT TRUE,                -- Se está ativo
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE
);

-- ========================================
-- TABELAS DE SEGURANÇA
-- ========================================

-- ========================================
-- TABELA: login_attempts
-- ========================================
-- Armazena tentativas de login para detecção de ataques de força bruta
CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL,                   -- Email usado na tentativa
    ip_address VARCHAR(45) NOT NULL,               -- IP da tentativa (IPv4 ou IPv6)
    success BOOLEAN NOT NULL DEFAULT FALSE,        -- Se a tentativa foi bem-sucedida
    attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABELA: suspicious_activities
-- ========================================
-- Armazena atividades suspeitas detectadas pelo sistema
CREATE TABLE IF NOT EXISTS suspicious_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,                               -- ID do usuário (NULL se não identificado)
    activity_type VARCHAR(50) NOT NULL,            -- Tipo de atividade suspeita
    ip_address VARCHAR(45) NOT NULL,               -- IP da atividade
    details TEXT,                                  -- Detalhes adicionais (JSON)
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ========================================
-- TABELA: api_requests
-- ========================================
-- Armazena requisições à API para rate limiting
CREATE TABLE IF NOT EXISTS api_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address VARCHAR(45) NOT NULL,               -- IP da requisição
    endpoint VARCHAR(500) NOT NULL,                -- Endpoint acessado
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- ÍNDICES PARA OTIMIZAÇÃO
-- ========================================

-- Índices para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_package_id ON user_progress(package_id);
CREATE INDEX IF NOT EXISTS idx_lessons_package_id ON lessons(package_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson_id ON quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON quiz_options(question_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_answers_user_id ON user_quiz_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_answers_question_id ON user_quiz_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Índices para tabelas de chat
CREATE INDEX IF NOT EXISTS idx_chat_rooms_technology ON chat_rooms(technology);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_type ON chat_rooms(type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by ON chat_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_active ON chat_rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_room_id ON chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user_id ON chat_room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_study_groups_technology ON study_groups(technology);
CREATE INDEX IF NOT EXISTS idx_study_groups_created_by ON study_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_study_groups_chat_room_id ON study_groups(chat_room_id);

-- Índices para tabelas de segurança
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_success ON login_attempts(success);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_user_id ON suspicious_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_ip ON suspicious_activities(ip_address);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_type ON suspicious_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_detected_at ON suspicious_activities(detected_at);
CREATE INDEX IF NOT EXISTS idx_api_requests_ip ON api_requests(ip_address);
CREATE INDEX IF NOT EXISTS idx_api_requests_endpoint ON api_requests(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_requests_requested_at ON api_requests(requested_at);

-- ========================================
-- TABELAS PARA SISTEMA DE XP E GAMIFICAÇÃO
-- ========================================

-- Atualização da tabela users para incluir campos de XP
-- Adicionando colunas necessárias para o sistema de gamificação
-- (Usando ALTER TABLE pois a tabela já existe)

-- ========================================
-- TABELA: xp_history
-- ========================================
-- Histórico de ganho de XP dos usuários
CREATE TABLE IF NOT EXISTS xp_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    xp_gained INTEGER NOT NULL,                    -- XP ganho nesta ação
    reason TEXT NOT NULL,                          -- Motivo do ganho de XP
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ========================================
-- TABELA: level_history
-- ========================================
-- Histórico de mudanças de nível dos usuários
CREATE TABLE IF NOT EXISTS level_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    old_level INTEGER NOT NULL,                    -- Nível anterior
    new_level INTEGER NOT NULL,                    -- Novo nível
    achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ========================================
-- TABELA: achievements
-- ========================================
-- Conquistas disponíveis no sistema
CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,                    -- Nome da conquista
    description TEXT NOT NULL,                     -- Descrição da conquista
    icon VARCHAR(10) NOT NULL,                     -- Emoji/ícone da conquista
    category VARCHAR(50) NOT NULL,                 -- Categoria (beginner, progress, mastery, social, streak, special)
    requirement_type VARCHAR(50) NOT NULL,         -- Tipo de requisito (lessons_completed, quizzes_completed, etc.)
    requirement_value INTEGER NOT NULL,            -- Valor necessário para desbloquear
    xp_reward INTEGER DEFAULT 0,                   -- XP ganho ao desbloquear
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- TABELA: user_achievements
-- ========================================
-- Conquistas desbloqueadas pelos usuários
CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,               -- Referência à tabela achievements
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE(user_id, achievement_id)                -- Usuário não pode desbloquear a mesma conquista duas vezes
);

-- ========================================
-- ÍNDICES PARA SISTEMA DE XP
-- ========================================

-- Índices para otimizar consultas de XP
CREATE INDEX IF NOT EXISTS idx_xp_history_user_id ON xp_history(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_history_created_at ON xp_history(created_at);
CREATE INDEX IF NOT EXISTS idx_level_history_user_id ON level_history(user_id);

-- Índices para sistema de conquistas
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_requirement ON achievements(requirement_type, requirement_value);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON user_achievements(unlocked_at);

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
-- - Sistema de XP avançado com histórico e conquistas
--
-- Para popular o banco com dados iniciais, execute db/seed.sql 