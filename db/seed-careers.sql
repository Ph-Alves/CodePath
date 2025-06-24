-- ========================================
-- CodePath - Dados de Seed para Carreiras
-- ========================================
-- 
-- Este arquivo contém os dados iniciais das carreiras
-- disponíveis para seleção pelos usuários.
--
-- Data: Janeiro 2025

-- ========================================
-- INSERIR CARREIRAS DE TECNOLOGIA
-- ========================================

INSERT OR REPLACE INTO careers (id, name, description, icon, package_count, estimated_hours, difficulty_level, tags) VALUES
(1, 'Desenvolvimento Web', 'Criação de sites e aplicações web modernas usando HTML, CSS, JavaScript e frameworks populares.', 'fas fa-globe', 8, 120, 'iniciante', 'HTML,CSS,JavaScript,React,Node.js'),
(2, 'Desenvolvimento Mobile', 'Desenvolvimento de aplicativos para dispositivos móveis iOS e Android usando tecnologias nativas e híbridas.', 'fas fa-mobile-alt', 6, 100, 'intermediário', 'Swift,Kotlin,React Native,Flutter'),
(3, 'Ciência de Dados', 'Análise e interpretação de dados para extrair insights valiosos usando Python, R e ferramentas de machine learning.', 'fas fa-chart-bar', 7, 150, 'avançado', 'Python,R,SQL,Machine Learning,Pandas'),
(4, 'DevOps e Cloud', 'Automação de processos de desenvolvimento e implantação usando ferramentas de CI/CD e plataformas em nuvem.', 'fas fa-cloud', 5, 90, 'intermediário', 'Docker,Kubernetes,AWS,Azure,Jenkins'),
(5, 'Segurança da Informação', 'Proteção de sistemas e dados contra ameaças cibernéticas usando técnicas de segurança avançadas.', 'fas fa-shield-alt', 4, 80, 'avançado', 'Cybersecurity,Ethical Hacking,Cryptography'),
(6, 'Programação Básica', 'Fundamentos da programação usando linguagens como C, Python e Java para iniciantes.', 'fas fa-code', 10, 60, 'iniciante', 'C,Python,Java,Algoritmos,Lógica');

-- ========================================
-- VERIFICAR INSERÇÃO
-- ========================================

-- Exibir carreiras inseridas para verificação
SELECT 
    id,
    name,
    difficulty_level,
    package_count,
    estimated_hours
FROM careers 
ORDER BY id; 