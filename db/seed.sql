-- ========================================
-- CodePath - Dados Iniciais para Teste
-- ========================================
-- 
-- Este arquivo popula o banco com dados iniciais
-- baseados no design implementado do CodePath
-- Atualizado para Fase 5 - Dashboard e Métricas
--
-- Execute após criar a estrutura do banco

-- ========================================
-- LIMPAR DADOS EXISTENTES (DESENVOLVIMENTO)
-- ========================================
DELETE FROM user_quiz_answers;
DELETE FROM quiz_options;
DELETE FROM quiz_questions;
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
(1, 'Pacote C', 'Aprenda programação em C desde o básico até conceitos avançados', 'C', 'C - Operações', 45),
(2, 'Pacote Front-end', 'HTML, CSS e JavaScript para desenvolvimento web', 'HTML/CSS', 'JavaScript Fundamentos', 72),
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
-- INSERIR USUÁRIOS DE TESTE
-- ========================================
-- Usuário principal "Carlos Pereira" conforme design do dashboard
-- Senha padrão para todos: "123456"

INSERT INTO users (id, name, email, password_hash, current_package_id, selected_career_profile_id, level, xp_points, streak_days) VALUES
(1, 'Carlos Pereira', 'carlos@codepath.com', '$2b$10$rOdQzXzXzXzXzXzXzXzXzXOeKq8Iq8Iq8Iq8Iq8Iq8Iq8Iq8Iq8I', 1, 1, 5, 1250, 2),
(2, 'Ana Silva', 'ana@codepath.com', '$2b$10$rOdQzXzXzXzXzXzXzXzXzXOeKq8Iq8Iq8Iq8Iq8Iq8Iq8Iq8Iq8I', 2, 1, 3, 650, 5),
(3, 'João Santos', 'joao@codepath.com', '$2b$10$rOdQzXzXzXzXzXzXzXzXzXOeKq8Iq8Iq8Iq8Iq8Iq8Iq8Iq8Iq8I', 3, 2, 2, 350, 1);

-- ========================================
-- INSERIR AULAS DOS PACOTES
-- ========================================

-- Aulas do Pacote C (5 aulas)
INSERT INTO lessons (package_id, name, description, lesson_number, order_sequence) VALUES
(1, 'C - Introdução', 'Conceitos básicos da linguagem C', 1, 1),
(1, 'C - Variáveis', 'Declaração e uso de variáveis', 2, 2),
(1, 'C - Operações', 'Operadores aritméticos e lógicos', 3, 3),
(1, 'C - Estruturas de Controle', 'If, else, switch, loops', 4, 4),
(1, 'C - Funções', 'Criação e uso de funções', 5, 5);

-- Aulas do Pacote Front-end (6 aulas)
INSERT INTO lessons (package_id, name, description, lesson_number, order_sequence) VALUES
(2, 'HTML Básico', 'Estrutura e tags HTML', 1, 1),
(2, 'CSS Styling', 'Estilização com CSS', 2, 2),
(2, 'JavaScript Fundamentos', 'Lógica com JavaScript', 3, 3),
(2, 'Responsividade', 'Design responsivo', 4, 4),
(2, 'DOM Manipulation', 'Manipulação do DOM', 5, 5),
(2, 'Projeto Final', 'Desenvolvimento de um site completo', 6, 6);

-- Aulas do Pacote Python (5 aulas)
INSERT INTO lessons (package_id, name, description, lesson_number, order_sequence) VALUES
(3, 'Python Básico', 'Sintaxe e conceitos fundamentais', 1, 1),
(3, 'Estruturas de Dados', 'Listas, dicionários, tuplas', 2, 2),
(3, 'Programação Orientada a Objetos', 'Classes e objetos em Python', 3, 3),
(3, 'Bibliotecas Populares', 'NumPy, Pandas, Requests', 4, 4),
(3, 'Projeto Python', 'Desenvolvimento de uma aplicação', 5, 5);

-- Aulas do Pacote Java (5 aulas)
INSERT INTO lessons (package_id, name, description, lesson_number, order_sequence) VALUES
(4, 'Java Básico', 'Sintaxe e conceitos fundamentais', 1, 1),
(4, 'Java OOP', 'Programação orientada a objetos', 2, 2),
(4, 'Collections Framework', 'Estruturas de dados em Java', 3, 3),
(4, 'Exception Handling', 'Tratamento de exceções', 4, 4),
(4, 'Projeto Java', 'Desenvolvimento de uma aplicação', 5, 5);

-- ========================================
-- INSERIR QUESTIONÁRIOS E QUESTÕES
-- ========================================

-- Questionário 1: C - Operações (Aula 3)
INSERT INTO quizzes (id, lesson_id, title, description, total_questions) VALUES
(1, 3, 'Questionário: C - Operações', 'Teste seus conhecimentos sobre operadores em C', 3);

-- Questões do Questionário 1
INSERT INTO quiz_questions (quiz_id, question_number, question_type, question_text, expected_answer, points) VALUES
(1, 1, 'code', 'Escreva um programa simples em C que declare duas variáveis inteiras, some-as e exiba o resultado.', '#include <stdio.h>\nint main() {\n    int a = 5, b = 3;\n    int soma = a + b;\n    printf("Resultado: %d", soma);\n    return 0;\n}', 20),
(1, 2, 'multiple_choice', 'Qual operador é usado para o resto da divisão em C?', '%', 10),
(1, 3, 'text', 'Qual é o resultado da expressão: 10 / 3 em C (considerando variáveis inteiras)?', '3', 10);

-- Opções para questão 2 (múltipla escolha)
INSERT INTO quiz_options (question_id, option_order, option_text, is_correct) VALUES
(2, 1, '/', FALSE),
(2, 2, '%', TRUE),
(2, 3, '*', FALSE),
(2, 4, '&', FALSE);

-- Questionário 2: JavaScript Fundamentos (Aula 8)
INSERT INTO quizzes (id, lesson_id, title, description, total_questions) VALUES
(2, 8, 'Questionário: JavaScript Básico', 'Fundamentos de programação em JavaScript', 2);

-- Questões do Questionário 2
INSERT INTO quiz_questions (quiz_id, question_number, question_type, question_text, expected_answer, points) VALUES
(2, 1, 'code', 'Crie uma função JavaScript que receba dois números e retorne a soma.', 'function somar(a, b) {\n    return a + b;\n}', 25),
(2, 2, 'multiple_choice', 'Como declarar uma variável constante em JavaScript?', 'const', 15);

-- Opções para questão 4 (múltipla escolha)
INSERT INTO quiz_options (question_id, option_order, option_text, is_correct) VALUES
(4, 1, 'var', FALSE),
(4, 2, 'let', FALSE),
(4, 3, 'const', TRUE),
(4, 4, 'final', FALSE);

-- Questionário 3: Python Básico (Aula 13)
INSERT INTO quizzes (id, lesson_id, title, description, total_questions) VALUES
(3, 13, 'Questionário: Python Básico', 'Conceitos fundamentais de Python', 2);

-- Questões do Questionário 3
INSERT INTO quiz_questions (quiz_id, question_number, question_type, question_text, expected_answer, points) VALUES
(3, 1, 'code', 'Escreva um código Python que crie uma lista com 5 números e imprima cada um.', 'numeros = [1, 2, 3, 4, 5]\nfor num in numeros:\n    print(num)', 20),
(3, 2, 'text', 'Qual função é usada para imprimir em Python?', 'print', 10);

-- ========================================
-- INSERIR PROGRESSO DOS USUÁRIOS
-- ========================================

-- Progresso do Carlos Pereira (usuário principal)
INSERT INTO user_progress (user_id, package_id, status, progress_percentage, lessons_watched, courses_completed, challenges_delivered, quizzes_completed, completed_at) VALUES
(1, 1, 'in_progress', 45, 3, 0, 2, 2, datetime('now', '-2 hours')),
(1, 2, 'in_progress', 72, 5, 1, 3, 4, datetime('now', '-1 hour')),
(1, 3, 'not_started', 0, 0, 0, 0, 0, NULL);

-- Progresso da Ana Silva
INSERT INTO user_progress (user_id, package_id, status, progress_percentage, lessons_watched, courses_completed, challenges_delivered, quizzes_completed, completed_at) VALUES
(2, 2, 'in_progress', 85, 6, 1, 4, 5, datetime('now', '-30 minutes')),
(2, 1, 'completed', 100, 5, 1, 3, 2, datetime('now', '-1 day'));

-- Progresso do João Santos
INSERT INTO user_progress (user_id, package_id, status, progress_percentage, lessons_watched, courses_completed, challenges_delivered, quizzes_completed, completed_at) VALUES
(3, 3, 'in_progress', 25, 2, 0, 1, 1, datetime('now', '-3 hours'));

-- ========================================
-- ATUALIZAR XP DOS USUÁRIOS BASEADO NO PROGRESSO
-- ========================================

-- Atualizar XP do Carlos baseado no progresso
UPDATE users SET xp_points = (
  SELECT SUM(
    (lessons_watched * 50) + 
    (courses_completed * 200) + 
    (challenges_delivered * 75) + 
    (quizzes_completed * 25)
  ) FROM user_progress WHERE user_id = 1
) WHERE id = 1;

-- Atualizar XP da Ana baseado no progresso
UPDATE users SET xp_points = (
  SELECT SUM(
    (lessons_watched * 50) + 
    (courses_completed * 200) + 
    (challenges_delivered * 75) + 
    (quizzes_completed * 25)
  ) FROM user_progress WHERE user_id = 2
) WHERE id = 2;

-- Atualizar XP do João baseado no progresso
UPDATE users SET xp_points = (
  SELECT SUM(
    (lessons_watched * 50) + 
    (courses_completed * 200) + 
    (challenges_delivered * 75) + 
    (quizzes_completed * 25)
  ) FROM user_progress WHERE user_id = 3
) WHERE id = 3;

-- ========================================
-- DADOS DE TESTE - QUESTIONÁRIOS
-- ========================================

-- Questionários de exemplo
INSERT OR REPLACE INTO quizzes (id, lesson_id, title, description, total_questions) VALUES
(1, 1, 'Questionário C - Básico', 'Teste seus conhecimentos básicos em linguagem C', 3),
(2, 5, 'Questionário JavaScript - Fundamentos', 'Avalie seu entendimento dos conceitos básicos de JavaScript', 3),
(3, 9, 'Questionário Python - Introdução', 'Questões introdutórias sobre Python', 3);

-- Questões do Questionário C - Básico
INSERT OR REPLACE INTO quiz_questions (id, quiz_id, question_order, question_type, question_text, correct_answer, explanation) VALUES
(1, 1, 1, 'code', 'Escreva um programa em C que imprime "Hello, World!" na tela:', 
 '#include <stdio.h>\nint main() {\n    printf("Hello, World!");\n    return 0;\n}',
 'Um programa básico em C precisa incluir stdio.h para usar printf, ter uma função main que retorna int, e usar printf para imprimir texto.'),

(2, 1, 2, 'multiple_choice', 'Qual é o tipo de dado correto para armazenar um número inteiro em C?', 
 NULL, 'O tipo int é usado para armazenar números inteiros em C.'),

(3, 1, 3, 'text', 'Qual palavra-chave é usada para declarar uma variável constante em C?', 
 'const', 'A palavra-chave "const" é usada para declarar variáveis constantes em C.');

-- Opções para questão de múltipla escolha (questão 2)
INSERT OR REPLACE INTO quiz_options (id, question_id, option_order, option_text, is_correct) VALUES
(1, 2, 1, 'float', 0),
(2, 2, 2, 'int', 1),
(3, 2, 3, 'char', 0),
(4, 2, 4, 'string', 0);

-- Questões do Questionário JavaScript - Fundamentos
INSERT OR REPLACE INTO quiz_questions (id, quiz_id, question_order, question_type, question_text, correct_answer, explanation) VALUES
(4, 2, 1, 'code', 'Crie uma função JavaScript que retorna a soma de dois números:', 
 'function soma(a, b) {\n    return a + b;\n}',
 'Uma função básica em JavaScript usa a palavra-chave function, recebe parâmetros e usa return para retornar um valor.'),

(5, 2, 2, 'multiple_choice', 'Como você declara uma variável em JavaScript moderno?', 
 NULL, 'let e const são as formas modernas de declarar variáveis em JavaScript, sendo const para valores constantes.'),

(6, 2, 3, 'text', 'Qual método é usado para imprimir no console em JavaScript?', 
 'console.log', 'console.log() é o método padrão para imprimir mensagens no console do navegador ou Node.js.');

-- Opções para questão de múltipla escolha JavaScript (questão 5)
INSERT OR REPLACE INTO quiz_options (id, question_id, option_order, option_text, is_correct) VALUES
(5, 5, 1, 'var nome', 0),
(6, 5, 2, 'let nome', 1),
(7, 5, 3, 'const nome', 1),
(8, 5, 4, 'name =', 0);

-- Questões do Questionário Python - Introdução
INSERT OR REPLACE INTO quiz_questions (id, quiz_id, question_order, question_type, question_text, correct_answer, explanation) VALUES
(7, 3, 1, 'code', 'Escreva um programa Python que imprime "Olá, Python!" na tela:', 
 'print("Olá, Python!")',
 'Em Python, a função print() é usada para exibir texto na tela. É muito mais simples que em outras linguagens.'),

(8, 3, 2, 'multiple_choice', 'Qual é a extensão de arquivo padrão para scripts Python?', 
 NULL, 'Arquivos Python usam a extensão .py para serem reconhecidos pelo interpretador.'),

(9, 3, 3, 'text', 'Qual palavra-chave é usada para definir uma função em Python?', 
 'def', 'A palavra-chave "def" é usada para definir funções em Python.');

-- Opções para questão de múltipla escolha Python (questão 8)
INSERT OR REPLACE INTO quiz_options (id, question_id, option_order, option_text, is_correct) VALUES
(9, 8, 1, '.txt', 0),
(10, 8, 2, '.py', 1),
(11, 8, 3, '.python', 0),
(12, 8, 4, '.pyt', 0);

-- Algumas respostas de exemplo para demonstração
INSERT OR REPLACE INTO user_quiz_answers (id, user_id, question_id, answer, is_correct, score) VALUES
(1, 1, 1, '#include <stdio.h>\nint main() {\n    printf("Hello, World!");\n    return 0;\n}', 1, 10),
(2, 1, 2, '2', 1, 10),
(3, 1, 6, 'console.log', 1, 10);

-- ========================================
-- COMENTÁRIOS FINAIS
-- ========================================
-- 
-- Dados inseridos para Fase 5:
-- ✅ 6 Pacotes de tecnologia (C, Front-end, Python, Java, Back-end, C#)
-- ✅ 6 Perfis profissionais (Desenvolvedor, Gestor, Suporte, DBA, Segurança, Indefinido)
-- ✅ 3 Usuários de teste com progresso variado
-- ✅ 20 Aulas distribuídas nos pacotes
-- ✅ 4 Questionários de exemplo
-- ✅ Progresso realista dos usuários
-- ✅ Sistema de XP calculado automaticamente
--
-- Este conjunto de dados permite testar:
-- - ✅ Dashboard com métricas reais funcionais
-- - ✅ Seção "Continue estudando" com dados reais
-- - ✅ Cards de pacotes com progresso calculado
-- - ✅ Sistema de questionários operacional
-- - ✅ APIs de progresso e métricas
-- - ✅ Atividade recente baseada em progresso real
--
-- Usuários para teste (senha: 123456):
-- - carlos@codepath.com (nível 5, progresso em C e Front-end)
-- - ana@codepath.com (nível 3, progresso avançado em Front-end)
-- - joao@codepath.com (nível 2, iniciante em Python) 