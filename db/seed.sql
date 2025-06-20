-- ========================================
-- CodePath - Dados Iniciais para Teste
-- ========================================
-- 
-- Este arquivo popula o banco com dados iniciais
-- baseados no design implementado do CodePath
--
-- Execute após criar a estrutura do banco

-- ========================================
-- LIMPAR DADOS EXISTENTES (DESENVOLVIMENTO)
-- ========================================
DELETE FROM user_progress;
DELETE FROM user_sessions;
DELETE FROM quizzes;
DELETE FROM lessons;
DELETE FROM users;
DELETE FROM packages;
DELETE FROM career_profiles;

-- ========================================
-- INSERIR PACOTES DE TECNOLOGIA
-- ========================================
-- Pacotes conforme design: C, Front-end, Python, Java, Back-end, C#

INSERT INTO packages (id, name, description, icon, current_lesson, progress_percentage) VALUES
(1, 'Pacote C', 'Aprenda programação em C desde o básico até conceitos avançados', 'C', 'C - Operações', 13),
(2, 'Pacote Front-end', 'HTML, CSS e JavaScript para desenvolvimento web', 'HTML/CSS', 'Aula 51 - Continuar', 67),
(3, 'Pacote Python', 'Python para iniciantes e desenvolvimento de aplicações', 'Python', 'Python Básico', 25),
(4, 'Pacote Java', 'Programação orientada a objetos com Java', 'Java', 'Java OOP', 40),
(5, 'Pacote Back-end', 'Desenvolvimento backend com JavaScript/Node.js', 'JavaScript', 'APIs REST', 30),
(6, 'Pacote C#', 'Desenvolvimento com C# e .NET Framework', 'C#', 'C# Fundamentos', 15);

-- ========================================
-- INSERIR PERFIS PROFISSIONAIS
-- ========================================
-- Perfis conforme design: Desenvolvedor, Gestor, Suporte, DBA, Segurança, Indefinido

INSERT INTO career_profiles (id, name, description, icon) VALUES
(1, 'Desenvolvedor de Software', 'Criação e manutenção de sistemas e aplicações', 'developer'),
(2, 'Gestor de Projeto', 'Coordenação de equipes e projetos de tecnologia', 'manager'),
(3, 'Analista de Suporte', 'Suporte técnico e resolução de problemas', 'support'),
(4, 'Administrador de Banco de Dados', 'Gerenciamento e otimização de bases de dados', 'database'),
(5, 'Segurança da Informação', 'Proteção de dados e sistemas corporativos', 'security'),
(6, 'Indefinido', 'Ainda explorando opções na área de tecnologia', 'question');

-- ========================================
-- INSERIR USUÁRIO DE TESTE
-- ========================================
-- Usuário "Carlos Pereira" conforme design do dashboard

INSERT INTO users (id, name, email, password_hash, current_package_id, selected_career_profile_id, level, xp_points, streak_days) VALUES
(1, 'Carlos Pereira', 'carlos@codepath.com', '$2b$10$example.hash.for.testing.purposes.only', 1, 1, 5, 1250, 2);

-- ========================================
-- INSERIR AULAS DOS PACOTES
-- ========================================

-- Aulas do Pacote C
INSERT INTO lessons (package_id, name, description, lesson_number, order_sequence) VALUES
(1, 'C - Introdução', 'Conceitos básicos da linguagem C', 1, 1),
(1, 'C - Variáveis', 'Declaração e uso de variáveis', 2, 2),
(1, 'C - Operações', 'Operadores aritméticos e lógicos', 3, 3),
(1, 'C - Estruturas de Controle', 'If, else, switch, loops', 4, 4),
(1, 'C - Funções', 'Criação e uso de funções', 5, 5);

-- Aulas do Pacote Front-end
INSERT INTO lessons (package_id, name, description, lesson_number, order_sequence) VALUES
(2, 'HTML Básico', 'Estrutura e tags HTML', 1, 1),
(2, 'CSS Styling', 'Estilização com CSS', 2, 2),
(2, 'JavaScript Fundamentos', 'Lógica com JavaScript', 3, 3),
(2, 'Responsividade', 'Design responsivo', 4, 4),
(2, 'Projeto Final', 'Desenvolvimento de um site completo', 5, 5);

-- Aulas do Pacote Python
INSERT INTO lessons (package_id, name, description, lesson_number, order_sequence) VALUES
(3, 'Python Básico', 'Sintaxe e conceitos fundamentais', 1, 1),
(3, 'Estruturas de Dados', 'Listas, dicionários, tuplas', 2, 2),
(3, 'Programação Orientada a Objetos', 'Classes e objetos em Python', 3, 3),
(3, 'Bibliotecas Populares', 'NumPy, Pandas, Requests', 4, 4),
(3, 'Projeto Python', 'Desenvolvimento de uma aplicação', 5, 5);

-- ========================================
-- INSERIR QUESTIONÁRIOS DE EXEMPLO
-- ========================================

-- Questionários para C - Operações
INSERT INTO quizzes (lesson_id, question_text, question_number, expected_code) VALUES
(3, 'Escreva um programa simples em C que declare duas variáveis inteiras, some-as e exiba o resultado.', 1, '#include <stdio.h>\nint main() {\n    int a = 5, b = 3;\n    int soma = a + b;\n    printf("Resultado: %d", soma);\n    return 0;\n}'),
(3, 'Crie um programa que calcule a média de três números usando operadores aritméticos.', 2, '#include <stdio.h>\nint main() {\n    float a = 8.0, b = 6.0, c = 9.0;\n    float media = (a + b + c) / 3;\n    printf("Média: %.2f", media);\n    return 0;\n}');

-- ========================================
-- INSERIR PROGRESSO DO USUÁRIO
-- ========================================

INSERT INTO user_progress (user_id, package_id, status, progress_percentage, lessons_watched, courses_completed, challenges_delivered, quizzes_completed) VALUES
(1, 1, 'in_progress', 13, 3, 0, 1, 2),
(1, 2, 'in_progress', 67, 15, 1, 5, 8),
(1, 3, 'not_started', 0, 0, 0, 0, 0),
(1, 4, 'not_started', 0, 0, 0, 0, 0),
(1, 5, 'not_started', 0, 0, 0, 0, 0),
(1, 6, 'not_started', 0, 0, 0, 0, 0);

-- ========================================
-- COMENTÁRIOS FINAIS
-- ========================================
-- 
-- Dados inseridos:
-- ✅ 6 Pacotes de tecnologia (C, Front-end, Python, Java, Back-end, C#)
-- ✅ 6 Perfis profissionais (Desenvolvedor, Gestor, Suporte, DBA, Segurança, Indefinido)
-- ✅ 1 Usuário de teste (Carlos Pereira)
-- ✅ 15 Aulas distribuídas nos pacotes
-- ✅ 2 Questionários de exemplo
-- ✅ Progresso inicial do usuário
--
-- Este conjunto de dados permite testar:
-- - Dashboard com métricas reais
-- - Seção "Continue estudando"
-- - Cards de pacotes com progresso
-- - Sistema de questionários
-- - Perfis profissionais 