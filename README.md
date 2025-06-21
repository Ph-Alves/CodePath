# CodePath - Plataforma Educacional

> **Descubra o seu caminho na tecnologia**  
> Trilhas de estudo pensadas pra onde você quer ir!

**Última Atualização:** 28 de Janeiro de 2025  
**Status:** 92% Concluído (23 de 26 fases implementadas)  
**Objetivo:** Plataforma web educacional interativa com foco em carreiras de tecnologia

[![Status](https://img.shields.io/badge/Status-92%25%20Concluído-brightgreen)](https://github.com)
[![Progresso](https://img.shields.io/badge/Progresso-23%20de%2026%20Fases-blue)](docs/codepath-projeto-completo.md)
[![Fase Atual](https://img.shields.io/badge/Fase%20Atual-24%20(Performance)-green)](docs/codepath-projeto-completo.md)

## 📋 Sobre o Projeto

O **CodePath** é uma plataforma web educacional moderna e completa, desenvolvida para jovens que desejam descobrir seu caminho na tecnologia. Com design roxo/gradiente atrativo e interface totalmente responsiva, oferece uma experiência educacional interativa e gamificada.

### 🎯 Características Principais

- **Interface Moderna**: Design roxo/gradiente responsivo e acessível
- **10 Tecnologias Disponíveis**: C, Python, Java, JavaScript, HTML/CSS, C#, React, DevOps, Mobile, Data Science
- **Sistema Completo de Gamificação**: XP, níveis, conquistas e badges
- **Dashboard Interativo**: Métricas em tempo real e analytics
- **Chat e Comunidade**: Simulação de tempo real com grupos de estudo
- **Sistema de Quizzes**: Validação automática com 3 tipos de questões

## 🚀 Status do Projeto - 92% Concluído

### ✅ Sistemas Implementados e Funcionais

| Sistema | Status | Descrição |
|---------|--------|-----------|
| **Autenticação** | ✅ 100% | Login/registro com validação e segurança |
| **Dashboard** | ✅ 100% | Métricas, gráficos Chart.js e navegação |
| **Pacotes** | ✅ 100% | 10 tecnologias com filtros avançados |
| **Visualização de Aulas** | ✅ 100% | Player de vídeo e conteúdo educacional |
| **Sistema de Quizzes** | ✅ 100% | 3 tipos de questões com validação |
| **Gamificação** | ✅ 100% | XP, níveis e 59 conquistas |
| **Progresso** | ✅ 100% | Tracking completo com analytics |
| **Notificações** | ✅ 100% | 9 tipos de eventos em tempo real |
| **Chat** | ✅ 100% | Simulação de tempo real com 6 salas |
| **Design Responsivo** | ✅ 100% | Mobile-first (320px - 1440px+) |
| **Correção de Bugs** | ✅ 100% | Tela branca e problemas críticos resolvidos |

### 🚧 Fases Restantes (3 de 26)

| Fase | Descrição | Tempo Estimado |
|------|-----------|----------------|
| **Fase 24** | Otimização de performance avançada | 3-4 horas |
| **Fase 25** | Polish final da interface | 2-3 horas |
| **Fase 26** | Testes e documentação final | 2-3 horas |

📊 **Consulte** [`docs/codepath-projeto-completo.md`](docs/codepath-projeto-completo.md) **para documentação completa**

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite3** - Banco de dados (15 tabelas)
- **Mustache Express** - Template engine
- **bcrypt** - Criptografia de senhas
- **express-session** - Gerenciamento de sessões

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização moderna com variáveis CSS
- **JavaScript ES6+** - Interatividade e funcionalidades
- **Chart.js** - Gráficos e analytics
- **Font Awesome** - Ícones
- **Inter Font** - Tipografia

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js >= 16.0.0
- NPM >= 8.0.0
- SQLite3

### Instalação Rápida

```bash
# 1. Clone o repositório
git clone [url-do-repositorio]
cd Projeto

# 2. Instale as dependências
npm install

# 3. Configure o banco de dados
sqlite3 db/codepath.db < db/schema.sql
sqlite3 db/codepath.db < db/seed.sql

# 4. Inicie o servidor
npm start

# 5. Acesse a aplicação
# http://localhost:3000
```

### 🔧 Scripts Disponíveis

```bash
npm start          # Inicia o servidor
npm run dev        # Modo desenvolvimento (com nodemon)
npm test           # Executa testes de performance
```

## 🏗️ Arquitetura do Projeto

```
Projeto/
├── 📄 app.js                     # Servidor principal
├── 📁 controllers/               # Lógica de negócio (12 arquivos)
├── 📁 models/                    # Acesso a dados (13 arquivos)
├── 📁 routes/                    # Definição de rotas (12 arquivos)
├── 📁 views/                     # Templates Mustache
│   ├── 📁 layouts/               # Layout principal
│   ├── 📁 pages/                 # 16 páginas implementadas
│   └── 📁 partials/              # 7 componentes reutilizáveis
├── 📁 public/                    # Assets estáticos
│   ├── 📁 css/                   # 15 arquivos CSS modulares
│   └── 📁 js/                    # 12 scripts JavaScript
├── 📁 db/                        # Banco SQLite + schemas
├── 📁 middleware/                # 4 middlewares customizados
└── 📁 docs/                      # Documentação completa
```

## 🎨 Funcionalidades Implementadas

### 🔐 Sistema de Autenticação
- Cadastro e login com validação completa
- Sessões seguras com middleware
- Rate limiting para proteção
- Validação de dados em tempo real

### 📊 Dashboard Interativo
- Métricas em tempo real (aulas, XP, conquistas)
- Gráficos Chart.js para analytics
- Seção "Continue Estudando" funcional
- Cards clicáveis com navegação inteligente

### 📚 Sistema de Pacotes
- 10 tecnologias disponíveis
- Filtros avançados (dificuldade, duração, busca)
- Cards interativos com hover effects
- Modal de preview com estatísticas

### 🎮 Gamificação Completa
- Sistema XP (+50 por aula, +500 por pacote)
- Níveis automáticos baseados em XP
- 59 conquistas com critérios específicos
- Streak de dias consecutivos

### �� Chat e Comunidade
- 6 salas por tecnologia
- Simulação de tempo real
- Grupos de estudo organizados
- Interface responsiva com indicadores

## 🗄️ Banco de Dados SQLite

### 15 Tabelas Implementadas
- `users` - Usuários e perfis
- `packages` - Pacotes de tecnologia
- `lessons` - Aulas com conteúdo
- `quizzes` - Questionários e validações
- `user_progress` - Progresso individual
- `achievements` - Sistema de conquistas
- `notifications` - Sistema de notificações
- `chat_rooms` - Salas de chat
- `study_groups` - Grupos de estudo
- `analytics_data` - Métricas e relatórios
- E mais 5 tabelas de relacionamento

## 📚 Documentação

### Documentos Principais
- **[`docs/codepath-projeto-completo.md`](docs/codepath-projeto-completo.md)** - 📋 **Documento Principal** (Status, Funcionalidades, Próximos Passos)
- [`docs/arquitetura.md`](docs/arquitetura.md) - Documentação da arquitetura técnica
- [`docs/rotas.md`](docs/rotas.md) - Documentação completa das rotas e APIs
- [`docs/db-schema.md`](docs/db-schema.md) - Esquema detalhado do banco de dados
- [`docs/casos-de-uso.md`](docs/casos-de-uso.md) - Casos de uso e fluxos do usuário

## 🔧 Configuração

### Variáveis de Ambiente
```env
NODE_ENV=development
PORT=3000
SESSION_SECRET=sua_chave_secreta_aqui
DB_PATH=./db/codepath.db
```

### Comandos Úteis
```bash
# Verificar banco de dados
sqlite3 db/codepath.db ".tables"

# Backup do banco
cp db/codepath.db db/backup_$(date +%Y%m%d).db

# Logs em tempo real
tail -f logs/app.log
```

## 🎯 Próximos Passos

1. **Fase 24** - Otimização de performance avançada
2. **Fase 25** - Polish final da interface
3. **Fase 26** - Testes finais e documentação de deployment

## 🤝 Contribuição

### Padrões de Desenvolvimento
- **Arquitetura MVC** rigorosa
- **Modularização** (máximo 400 linhas por arquivo)
- **Separação de responsabilidades** clara
- **Documentação** completa e atualizada

---

**Projeto desenvolvido com foco em qualidade, performance e experiência do usuário.**  
**92% concluído - Plataforma educacional completa e funcional.** 