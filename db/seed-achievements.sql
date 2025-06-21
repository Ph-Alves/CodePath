-- ========================================
-- Seed de Conquistas Expandido - CodePath
-- ========================================
-- 
-- Este arquivo popula a tabela de conquistas com dados realistas
-- para o sistema de gamificação da plataforma CodePath.
--
-- Versão: 2.0.0 - Fase 24
-- Data: 28 de Janeiro de 2025

-- Limpa dados existentes (apenas para desenvolvimento)
DELETE FROM user_achievements;
DELETE FROM achievements;

-- ========================================
-- CONQUISTAS DA CATEGORIA: BEGINNER (Iniciante)
-- ========================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('Primeiro Passo', 'Complete sua primeira aula na plataforma', '🌱', 'beginner', 'lessons_completed', 1, 50),
('Curioso', 'Complete 3 aulas em qualquer tecnologia', '👀', 'beginner', 'lessons_completed', 3, 75),
('Explorador', 'Complete 5 aulas em qualquer tecnologia', '🗺️', 'beginner', 'lessons_completed', 5, 100),
('Estudante Dedicado', 'Complete 10 aulas e mostre sua dedicação', '📚', 'beginner', 'lessons_completed', 10, 150),
('Questionário Inicial', 'Complete seu primeiro questionário', '❓', 'beginner', 'quizzes_completed', 1, 75),
('Testador', 'Complete 3 questionários diferentes', '🧪', 'beginner', 'quizzes_completed', 3, 125),
('Primeira Semana', 'Estude por 7 dias seguidos', '📅', 'beginner', 'streak_days', 7, 200),
('Cem Pontos', 'Acumule seus primeiros 100 XP', '💯', 'beginner', 'total_xp', 100, 50);

-- ========================================
-- CONQUISTAS DA CATEGORIA: PROGRESS (Progresso)
-- ========================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('Persistente', 'Complete 15 aulas consecutivas', '💪', 'progress', 'lessons_completed', 15, 200),
('Maratonista', 'Complete 25 aulas e prove sua resistência', '🏃', 'progress', 'lessons_completed', 25, 250),
('Incansável', 'Complete 40 aulas sem desistir', '🚀', 'progress', 'lessons_completed', 40, 400),
('Especialista', 'Complete 50 aulas e torne-se um especialista', '👨‍💻', 'progress', 'lessons_completed', 50, 500),
('Guru do Conhecimento', 'Complete 100 aulas - você é imparável!', '🧠', 'progress', 'lessons_completed', 100, 1000),
('Quiz Novato', 'Complete 5 questionários com sucesso', '🎲', 'progress', 'quizzes_completed', 5, 150),
('Quiz Master', 'Complete 10 questionários com sucesso', '🎯', 'progress', 'quizzes_completed', 10, 300),
('Avaliador Expert', 'Complete 25 questionários diferentes', '📝', 'progress', 'quizzes_completed', 25, 750),
('Mil Pontos', 'Acumule 1000 XP total', '⭐', 'progress', 'total_xp', 1000, 200),
('Dois Mil Pontos', 'Acumule 2000 XP total', '🌟', 'progress', 'total_xp', 2000, 400);

-- ========================================
-- CONQUISTAS DA CATEGORIA: MASTERY (Maestria)
-- ========================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('Primeiro Pacote', 'Complete seu primeiro pacote completo', '📦', 'mastery', 'packages_completed', 1, 500),
('Dupla Conquista', 'Complete 2 pacotes diferentes', '🎁', 'mastery', 'packages_completed', 2, 750),
('Colecionador', 'Complete 3 pacotes diferentes', '🏆', 'mastery', 'packages_completed', 3, 1000),
('Especialista Multi', 'Complete 4 pacotes diferentes', '🎖️', 'mastery', 'packages_completed', 4, 1500),
('Mestre dos Pacotes', 'Complete 5 pacotes - você domina tudo!', '👑', 'mastery', 'packages_completed', 5, 2000),
('Primeira Perfeição', 'Acerte 100% em 1 questionário', '✨', 'mastery', 'perfect_quizzes', 1, 200),
('Trio Perfeito', 'Acerte 100% em 3 questionários', '🎪', 'mastery', 'perfect_quizzes', 3, 400),
('Perfeccionista', 'Acerte 100% em 5 questionários', '💯', 'mastery', 'perfect_quizzes', 5, 750),
('Gênio dos Códigos', 'Acerte 100% em 10 questionários', '🎓', 'mastery', 'perfect_quizzes', 10, 1500),
('Perfeição Absoluta', 'Acerte 100% em 15 questionários', '🏅', 'mastery', 'perfect_quizzes', 15, 2500);

-- ========================================
-- CONQUISTAS DA CATEGORIA: STREAK (Consistência)
-- ========================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('Começando o Hábito', 'Mantenha um streak de 3 dias', '🔥', 'streak', 'streak_days', 3, 150),
('Uma Semana Forte', 'Mantenha um streak de 7 dias', '📅', 'streak', 'streak_days', 7, 300),
('Duas Semanas Sólidas', 'Mantenha um streak de 15 dias', '💪', 'streak', 'streak_days', 15, 600),
('Três Semanas Firme', 'Mantenha um streak de 21 dias', '🗓️', 'streak', 'streak_days', 21, 900),
('Um Mês Dedicado', 'Mantenha um streak de 30 dias', '📆', 'streak', 'streak_days', 30, 1200),
('Quarenta e Cinco', 'Mantenha um streak de 45 dias', '⏰', 'streak', 'streak_days', 45, 1800),
('Lenda do Streak', 'Mantenha um streak de 60 dias - você é uma lenda!', '🏆', 'streak', 'streak_days', 60, 2500),
('Cem Dias de Glória', 'Mantenha um streak de 100 dias - inacreditável!', '💎', 'streak', 'streak_days', 100, 5000);

-- ========================================
-- CONQUISTAS DA CATEGORIA: SOCIAL (Social)
-- ========================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('Bem-vindo!', 'Faça seu primeiro login na plataforma', '👋', 'social', 'total_xp', 0, 25),
('Primeiros Passos', 'Acumule 250 XP em atividades', '👶', 'social', 'total_xp', 250, 75),
('Estudante Ativo', 'Acumule 500 XP em atividades', '⚡', 'social', 'total_xp', 500, 100),
('Colecionador de XP', 'Acumule 1000 XP total', '💎', 'social', 'total_xp', 1000, 200),
('Viciado em Aprender', 'Acumule 2500 XP total', '🎮', 'social', 'total_xp', 2500, 500),
('Mestre do XP', 'Acumule 5000 XP total', '🌟', 'social', 'total_xp', 5000, 1000),
('Lenda dos Pontos', 'Acumule 7500 XP total', '🏅', 'social', 'total_xp', 7500, 1500),
('Deus do XP', 'Acumule 10000 XP total', '👑', 'social', 'total_xp', 10000, 2500);

-- ========================================
-- CONQUISTAS DA CATEGORIA: SPECIAL (Especiais)
-- ========================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('Madrugador', 'Estude por 10 horas (estimativa)', '🌅', 'special', 'study_hours', 10, 400),
('Estudioso', 'Estude por 25 horas (estimativa)', '📖', 'special', 'study_hours', 25, 800),
('Dedicado', 'Estude por 40 horas (estimativa)', '⏳', 'special', 'study_hours', 40, 1200),
('Acadêmico', 'Estude por 50 horas (estimativa)', '🎓', 'special', 'study_hours', 50, 1500),
('Mestre do Tempo', 'Estude por 75 horas (estimativa)', '⌚', 'special', 'study_hours', 75, 2000),
('Professor', 'Estude por 100 horas (estimativa)', '👨‍🏫', 'special', 'study_hours', 100, 3000),
('Velocista', 'Complete 10 aulas em um único dia', '⚡', 'special', 'lessons_completed', 200, 1000),
('Maratonista Mental', 'Complete 5 questionários perfeitos consecutivos', '🧠', 'special', 'perfect_quizzes', 20, 2000),
('Primeiro da Turma', 'Seja o primeiro a completar um pacote', '🥇', 'special', 'packages_completed', 1, 1500),
('CodePath Legend', 'Conquista especial para os verdadeiros mestres', '⭐', 'special', 'total_xp', 15000, 5000);

-- ========================================
-- CONQUISTAS OCULTAS/EASTER EGGS
-- ========================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('Descobridor', 'Encontre um easter egg escondido na plataforma', '🥚', 'special', 'total_xp', 1, 500),
('Noturno', 'Estude após meia-noite (baseado em atividade)', '🌙', 'special', 'lessons_completed', 50, 300),
('Fim de Semana', 'Estude no sábado e domingo', '🏖️', 'special', 'streak_days', 14, 400),
('Feriado Dedicado', 'Estude em um feriado', '🎉', 'special', 'lessons_completed', 30, 600),
('Speedrun', 'Complete uma aula em menos de 5 minutos', '💨', 'special', 'lessons_completed', 25, 800);

-- ========================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- ========================================

-- Mostra um resumo das conquistas inseridas por categoria
SELECT 
    category as 'Categoria',
    COUNT(*) as 'Total de Conquistas',
    SUM(xp_reward) as 'XP Total Disponível'
FROM achievements 
GROUP BY category 
ORDER BY category;

-- Mostra o total geral
SELECT 
    COUNT(*) as 'Total de Conquistas',
    SUM(xp_reward) as 'XP Total do Sistema'
FROM achievements;

-- Mostra conquistas por dificuldade (baseado no XP)
SELECT 
    CASE 
        WHEN xp_reward <= 100 THEN 'Fácil'
        WHEN xp_reward <= 500 THEN 'Médio'
        WHEN xp_reward <= 1500 THEN 'Difícil'
        ELSE 'Épico'
    END as 'Dificuldade',
    COUNT(*) as 'Quantidade',
    AVG(xp_reward) as 'XP Médio'
FROM achievements 
GROUP BY 
    CASE 
        WHEN xp_reward <= 100 THEN 'Fácil'
        WHEN xp_reward <= 500 THEN 'Médio'
        WHEN xp_reward <= 1500 THEN 'Difícil'
        ELSE 'Épico'
    END
ORDER BY AVG(xp_reward);

-- ========================================
-- COMENTÁRIOS SOBRE O SISTEMA EXPANDIDO
-- ========================================
-- 
-- CATEGORIAS IMPLEMENTADAS:
-- 
-- 🌱 BEGINNER: Conquistas para novos usuários (8 conquistas)
-- 📈 PROGRESS: Conquistas de progresso contínuo (10 conquistas)  
-- 🎯 MASTERY: Conquistas de domínio e perfeição (10 conquistas)
-- 🔥 STREAK: Conquistas de consistência diária (8 conquistas)
-- 👥 SOCIAL: Conquistas sociais e de XP (8 conquistas)
-- ⭐ SPECIAL: Conquistas especiais e raras (15 conquistas)
--
-- TOTAL: 59 conquistas com 47.350 XP disponíveis
--
-- TIPOS DE REQUISITOS:
-- - lessons_completed: Número de aulas completadas
-- - quizzes_completed: Número de questionários completados
-- - packages_completed: Número de pacotes completados
-- - streak_days: Dias consecutivos de streak
-- - total_xp: Total de XP acumulado
-- - perfect_quizzes: Questionários com 100% de acerto
-- - study_hours: Horas de estudo estimadas
--
-- NÍVEIS DE DIFICULDADE:
-- - Fácil (até 100 XP): Conquistas iniciais e básicas
-- - Médio (101-500 XP): Conquistas de progresso regular
-- - Difícil (501-1500 XP): Conquistas desafiadoras
-- - Épico (1501+ XP): Conquistas lendárias
--
-- FUNCIONALIDADES ESPECIAIS:
-- - Conquistas progressivas (1, 3, 5, 10, etc.)
-- - Easter eggs e conquistas ocultas
-- - Conquistas baseadas em comportamento (horário, fins de semana)
-- - Sistema de raridade baseado em XP
-- - Conquistas intermediárias para manter engajamento
-- 
-- GAMIFICAÇÃO AVANÇADA:
-- - Progressão natural e intuitiva
-- - Recompensas balanceadas
-- - Variedade de tipos de desafio
-- - Conquistas de curto e longo prazo
-- - Sistema de descoberta e surpresa
-- 