# 📊 Documentação do Banco de Dados - CodePath

## Visão Geral

O CodePath utiliza **SQLite** como banco de dados, proporcionando simplicidade, portabilidade e performance adequada para a aplicação educacional. O banco está estruturado para suportar o sistema de aprendizado gamificado com pacotes de tecnologia, perfis profissionais e acompanhamento de progresso.

## 🗄️ Estrutura do Banco

### Arquivos Principais
- **`db/codepath.db`** - Banco SQLite principal
- **`db/schema.sql`** - Esquema completo das tabelas
- **`db/seed.sql`** - Dados iniciais para desenvolvimento e teste
- **`models/database.js`** - Classe JavaScript para conexão e operações

## 📋 Tabelas Implementadas

### 1. `users` - Usuários da Plataforma
Armazena informações dos usuários cadastrados na plataforma.

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,                    -- Nome para "Bem-vindo de volta, [Nome]!"
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    birth_date DATE,
    education_level VARCHAR(50),
    current_package_id INTEGER,                    -- Pacote atual do usuário
    selected_career_profile_id INTEGER,            -- Perfil profissional selecionado
    level INTEGER DEFAULT 1,                       -- Nível para gamificação
    xp_points INTEGER DEFAULT 0,                   -- Pontos de experiência
    streak_days INTEGER DEFAULT 0,                 -- Dias consecutivos de estudo
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (current_package_id) REFERENCES packages(id),
    FOREIGN KEY (selected_career_profile_id) REFERENCES career_profiles(id)
);
```

**Campos Principais:**
- `name`: Exibido no dashboard ("Bem-vindo de volta, Carlos!")
- `level`, `xp_points`, `streak_days`: Sistema de gamificação
- `current_package_id`: Pacote que o usuário está estudando atualmente

### 2. `packages` - Pacotes de Tecnologia
Armazena os pacotes de estudo disponíveis (C, Python, Java, etc.).

```sql
CREATE TABLE packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,                    -- "Pacote C", "Pacote Front-end"
    description TEXT,
    icon VARCHAR(50),                              -- Identificador do ícone
    current_lesson VARCHAR(200),                   -- Aula atual do pacote
    progress_percentage INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Dados Atuais:**
1. Pacote C (13% - "C - Operações")
2. Pacote Front-end (67% - "Aula 51")
3. Pacote Python (25% - "Python Básico")
4. Pacote Java (40% - "Java OOP")
5. Pacote Back-end (30% - "APIs REST")
6. Pacote C# (15% - "C# Fundamentos")

### 3. `career_profiles` - Perfis Profissionais
Define os perfis de carreira disponíveis para seleção.

```sql
CREATE TABLE career_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Perfis Disponíveis:**
1. Desenvolvedor de Software
2. Gestor de Projeto
3. Analista de Suporte
4. Administrador de Banco de Dados
5. Segurança da Informação
6. Indefinido (para quem ainda está explorando)

### 4. `lessons` - Aulas dos Pacotes
Armazena as aulas individuais de cada pacote de tecnologia.

```sql
CREATE TABLE lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    package_id INTEGER NOT NULL,
    name VARCHAR(150) NOT NULL,                    -- "C - Operações", "HTML Básico"
    description TEXT,
    lesson_number INTEGER,
    order_sequence INTEGER NOT NULL,               -- Ordem das aulas
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (package_id) REFERENCES packages(id)
);
```

### 5. `quizzes` - Questionários de Código
Sistema de questionários para prática e avaliação.

```sql
CREATE TABLE quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,                   -- Enunciado da questão
    question_number INTEGER,                       -- "Questão 3/3"
    expected_code TEXT,                           -- Código esperado como resposta
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);
```

### 6. `user_progress` - Progresso dos Usuários
Rastreia o progresso e métricas de cada usuário.

```sql
CREATE TABLE user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    package_id INTEGER,
    quiz_id INTEGER,
    status VARCHAR(20) CHECK(status IN ('not_started', 'in_progress', 'completed')),
    progress_percentage INTEGER DEFAULT 0,
    lessons_watched INTEGER DEFAULT 0,             -- Para métricas do dashboard
    courses_completed INTEGER DEFAULT 0,           -- Cursos concluídos
    challenges_delivered INTEGER DEFAULT 0,        -- Desafios entregues
    quizzes_completed INTEGER DEFAULT 0,           -- Questionários realizados
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (package_id) REFERENCES packages(id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);
```

### 7. `user_sessions` - Sessões de Autenticação
Gerencia as sessões ativas dos usuários.

```sql
CREATE TABLE user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🔍 Índices para Performance

```sql
-- Otimização de consultas frequentes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_package_id ON user_progress(package_id);
CREATE INDEX idx_lessons_package_id ON lessons(package_id);
CREATE INDEX idx_quizzes_lesson_id ON quizzes(lesson_id);
```

## 🎯 Dados de Teste Implementados

### Usuário de Teste
- **Nome:** Carlos Pereira
- **Email:** carlos@codepath.com
- **Nível:** 5
- **XP:** 1250 pontos
- **Streak:** 2 dias consecutivos

### Métricas do Usuário
- **Aulas assistidas:** 3
- **Cursos concluídos:** 1
- **Desafios entregues:** 1
- **Questionários realizados:** 2

## 🔧 Classe Database (JavaScript)

A classe `Database` em `models/database.js` fornece:

### Métodos Principais
- `connect()` - Conecta ao banco SQLite
- `initialize()` - Cria estrutura se não existir
- `all(query, params)` - SELECT múltiplos resultados
- `get(query, params)` - SELECT único resultado
- `run(query, params)` - INSERT/UPDATE/DELETE
- `close()` - Fecha conexão

### Exemplo de Uso
```javascript
const { database } = require('./models/database');

// Buscar todos os pacotes
const packages = await database.all('SELECT * FROM packages');

// Buscar usuário específico
const user = await database.get('SELECT * FROM users WHERE id = ?', [1]);

// Inserir novo progresso
const result = await database.run(
  'INSERT INTO user_progress (user_id, package_id, status) VALUES (?, ?, ?)',
  [1, 2, 'in_progress']
);
```

## 🚀 Como Testar o Banco

### Via Interface Web
```bash
# Iniciar servidor
npm start

# Acessar páginas de teste
http://localhost:4000          # Status geral do banco
http://localhost:4000/test-db  # Dados detalhados
```

### Via SQLite CLI
```bash
# Conectar ao banco
sqlite3 db/codepath.db

# Comandos úteis
.tables                        # Listar tabelas
.schema users                  # Ver estrutura da tabela users
SELECT * FROM packages;        # Ver todos os pacotes
SELECT name, level, xp_points FROM users;  # Ver usuários
```

### Resetar Dados de Teste
```bash
# Re-executar dados iniciais
sqlite3 db/codepath.db < db/seed.sql
```

## 📈 Próximas Implementações

### Fase 3 - Autenticação
- Uso das tabelas `users` e `user_sessions`
- Implementação de login/logout
- Middleware de autenticação

### Fase 5 - Dashboard
- Consultas em `user_progress` para métricas
- Exibição de dados do usuário logado
- Sistema "Continue estudando"

### Fase 6 - Sistema de Carreiras
- Uso das tabelas `packages` e `career_profiles`
- Interface para seleção de perfis
- Navegação entre pacotes

---

**Versão:** 1.0.0  
**Última Atualização:** Dezembro 2024  
**Status:** ✅ Implementado e Funcional 