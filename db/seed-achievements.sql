-- ========================================
-- Seed de Conquistas - CodePath
-- ========================================
-- 
-- Este arquivo popula a tabela de conquistas com dados realistas
-- para o sistema de gamificação da plataforma CodePath.
--
-- Versão: 1.0.0
-- Data: 28 de Janeiro de 2025

-- Limpa dados existentes (apenas para desenvolvimento)
DELETE FROM user_achievements;
DELETE FROM achievements;

-- ========================================
-- CONQUISTAS DA CATEGORIA: BEGINNER (Iniciante)
-- ========================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('Primeiro Passo', 'Complete sua primeira aula na plataforma', '🌱', 'beginner', 'lessons_completed', 1, 50),
('Explorador', 'Complete 5 aulas em qualquer tecnologia', '🗺️', 'beginner', 'lessons_completed', 5, 100),
('Estudante Dedicado', 'Complete 10 aulas e mostre sua dedicação', '📚', 'beginner', 'lessons_completed', 10, 150),
('Questionário Inicial', 'Complete seu primeiro questionário', '❓', 'beginner', 'quizzes_completed', 1, 75),
('Testador', 'Complete 3 questionários diferentes', '🧪', 'beginner', 'quizzes_completed', 3, 125);

-- ========================================
-- CONQUISTAS DA CATEGORIA: PROGRESS (Progresso)
-- ========================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('Maratonista', 'Complete 25 aulas e prove sua resistência', '🏃', 'progress', 'lessons_completed', 25, 250),
('Especialista', 'Complete 50 aulas e torne-se um especialista', '👨‍💻', 'progress', 'lessons_completed', 50, 500),
('Guru do Conhecimento', 'Complete 100 aulas - você é imparável!', '🧠', 'progress', 'lessons_completed', 100, 1000),
('Quiz Master', 'Complete 10 questionários com sucesso', '🎯', 'progress', 'quizzes_completed', 10, 300),
('Avaliador Expert', 'Complete 25 questionários diferentes', '📝', 'progress', 'quizzes_completed', 25, 750);

-- ========================================
-- CONQUISTAS DA CATEGORIA: MASTERY (Maestria)
-- ========================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('Primeiro Pacote', 'Complete seu primeiro pacote completo', '📦', 'mastery', 'packages_completed', 1, 500),
('Colecionador', 'Complete 3 pacotes diferentes', '🎁', 'mastery', 'packages_completed', 3, 1000),
('Mestre dos Pacotes', 'Complete 5 pacotes - você domina tudo!', '👑', 'mastery', 'packages_completed', 5, 2000),
('Perfeccionista', 'Acerte 100% em 5 questionários', '💯', 'mastery', 'perfect_quizzes', 5, 750),
('Gênio dos Códigos', 'Acerte 100% em 10 questionários', '🎓', 'mastery', 'perfect_quizzes', 10, 1500);

-- ========================================
-- CONQUISTAS DA CATEGORIA: STREAK (Consistência)
-- ========================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('Começando o Hábito', 'Mantenha um streak de 3 dias', '🔥', 'streak', 'streak_days', 3, 150),
('Uma Semana Forte', 'Mantenha um streak de 7 dias', '📅', 'streak', 'streak_days', 7, 300),
('Duas Semanas Sólidas', 'Mantenha um streak de 15 dias', '💪', 'streak', 'streak_days', 15, 600),
('Um Mês Dedicado', 'Mantenha um streak de 30 dias', '🗓️', 'streak', 'streak_days', 30, 1200),
('Lenda do Streak', 'Mantenha um streak de 60 dias - você é uma lenda!', '🏆', 'streak', 'streak_days', 60, 2500);

-- ========================================
-- CONQUISTAS DA CATEGORIA: SOCIAL (Social)
-- ========================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('Bem-vindo!', 'Faça seu primeiro login na plataforma', '👋', 'social', 'total_xp', 0, 25),
('Estudante Ativo', 'Acumule 500 XP em atividades', '⚡', 'social', 'total_xp', 500, 100),
('Colecionador de XP', 'Acumule 1000 XP total', '💎', 'social', 'total_xp', 1000, 200),
('Viciado em Aprender', 'Acumule 2500 XP total', '🎮', 'social', 'total_xp', 2500, 500),
('Mestre do XP', 'Acumule 5000 XP total', '🌟', 'social', 'total_xp', 5000, 1000);

-- ========================================
-- CONQUISTAS DA CATEGORIA: SPECIAL (Especiais)
-- ========================================

INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, xp_reward) VALUES
('Madrugador', 'Estude por 10 horas (estimativa)', '🌅', 'special', 'study_hours', 10, 400),
('Estudioso', 'Estude por 25 horas (estimativa)', '📖', 'special', 'study_hours', 25, 800),
('Acadêmico', 'Estude por 50 horas (estimativa)', '🎓', 'special', 'study_hours', 50, 1500),
('Professor', 'Estude por 100 horas (estimativa)', '👨‍🏫', 'special', 'study_hours', 100, 3000),
('CodePath Legend', 'Conquista especial para os verdadeiros mestres', '⭐', 'special', 'total_xp', 10000, 5000);

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

-- ========================================
-- COMENTÁRIOS SOBRE O SISTEMA
-- ========================================
-- 
-- CATEGORIAS IMPLEMENTADAS:
-- 
-- 🌱 BEGINNER: Conquistas para novos usuários (5 conquistas)
-- 📈 PROGRESS: Conquistas de progresso contínuo (5 conquistas)  
-- 🎯 MASTERY: Conquistas de domínio e perfeição (5 conquistas)
-- 🔥 STREAK: Conquistas de consistência diária (5 conquistas)
-- 👥 SOCIAL: Conquistas sociais e de XP (5 conquistas)
-- ⭐ SPECIAL: Conquistas especiais e raras (5 conquistas)
--
-- TOTAL: 30 conquistas com 21.600 XP disponíveis
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