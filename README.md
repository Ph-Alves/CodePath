# CodePath - Plataforma Educacional

> **Descubra o seu caminho na tecnologia**  
> Trilhas de estudo pensadas pra onde você quer ir!

[![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)](https://github.com)
[![Progresso](https://img.shields.io/badge/Progresso-45%25-blue)](docs/status-projeto.md)
[![Fase Atual](https://img.shields.io/badge/Fase%20Atual-6%20(Carreiras)-blue)](docs/status-projeto.md)

## 📋 Sobre o Projeto

O **CodePath** é uma plataforma web educacional moderna desenvolvida para jovens que desejam descobrir seu caminho na tecnologia. Com design roxo/gradiente atrativo e interface responsiva, oferece trilhas de estudo organizadas por tecnologia e carreiras profissionais.

### 🎯 Características Principais

- **Interface Moderna**: Design roxo/gradiente responsivo e acessível
- **Trilhas Personalizadas**: Pacotes de estudo por tecnologia (C, Python, Java, etc.)
- **Carreiras Profissionais**: Orientação para diferentes perfis (Desenvolvedor, Gestor, Analista, etc.)
- **Gamificação**: Sistema de XP, níveis e progresso visual
- **Dashboard Completo**: Métricas, atividades e acompanhamento de progresso

## 🚀 Status do Projeto

### ✅ Fases Concluídas (36%)

| Fase | Descrição | Status |
|------|-----------|--------|
| **Fase 1** | Configuração inicial e estrutura base | ✅ Concluída |
| **Fase 2** | Banco de dados e autenticação | ✅ Concluída |
| **Fase 3** | Sistema de usuários | ✅ Concluída |
| **Fase 4** | Layout base e navegação | ✅ Concluída |

### ⏳ Próximas Fases

| Fase | Descrição | Prioridade |
|------|-----------|------------|
| **Fase 5** | Dashboard e métricas | ✅ Concluída |
| **Fase 6** | Sistema de carreiras | 🔥 Alta |
| **Fase 7** | Sistema de conteúdos | 📋 Média |
| **Fase 8** | Sistema de questionários | 📋 Média |

📊 **Consulte** [`docs/status-projeto.md`](docs/status-projeto.md) **para detalhes completos**

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite3** - Banco de dados
- **Mustache Express** - Template engine
- **bcrypt** - Criptografia de senhas
- **express-session** - Gerenciamento de sessões

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização moderna com variáveis CSS
- **JavaScript ES6+** - Interatividade e funcionalidades
- **Font Awesome** - Ícones
- **Inter Font** - Tipografia

### Ferramentas
- **Git** - Controle de versão
- **npm** - Gerenciador de pacotes
- **SQLite** - Banco de dados local

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- Git

### Passo a Passo

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd Projeto
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o banco de dados**
```bash
# O banco será criado automaticamente na primeira execução
# Localização: db/codepath.db
```

4. **Execute o projeto**
```bash
npm start
# ou
node app.js
```

5. **Acesse a aplicação**
```
http://localhost:4000
```

### 🔧 Scripts Disponíveis

```bash
npm start          # Inicia o servidor
npm run dev        # Modo desenvolvimento (se configurado)
npm test           # Executa testes (quando implementados)
```

## 🏗️ Arquitetura do Projeto

```
CodePath/
├── 📁 controllers/     # Lógica de controle das rotas
├── 📁 models/          # Acesso e manipulação de dados
├── 📁 routes/          # Definição de rotas modulares
├── 📁 views/           # Templates Mustache
│   ├── 📁 layouts/     # Layouts principais
│   ├── 📁 pages/       # Páginas da aplicação
│   └── 📁 partials/    # Componentes reutilizáveis
├── 📁 public/          # Arquivos estáticos
│   ├── 📁 css/         # Estilos CSS
│   ├── 📁 js/          # Scripts JavaScript
│   └── 📁 images/      # Imagens e assets
├── 📁 db/              # Banco de dados SQLite
├── 📁 middleware/      # Middlewares customizados
├── 📁 docs/            # Documentação do projeto
└── 📄 app.js           # Arquivo principal do servidor
```

## 🎨 Design e Interface

### Tema Visual
- **Cores Principais**: Roxo/gradiente (#6366f1, #8b5cf6, #a855f7)
- **Tipografia**: Inter (sans-serif)
- **Estilo**: Moderno, minimalista e funcional

### Componentes Implementados
- ✅ Layout responsivo com sidebar
- ✅ Header com navegação e informações do usuário
- ✅ Dashboard com métricas e progresso
- ✅ Sistema de cards interativos
- ✅ Modais e dropdowns funcionais
- ✅ Animações e transições suaves

### Acessibilidade
- ♿ Navegação por teclado
- 🏷️ ARIA labels implementados
- 🎨 Contraste adequado (4.5:1)
- 📱 Design responsivo (mobile-first)

## 🗄️ Banco de Dados

### SQLite Schema
- **15 tabelas** implementadas
- **Relacionamentos** com foreign keys
- **Dados de teste** inseridos
- **Localização**: `db/codepath.db`

### Principais Tabelas
- `users` - Usuários da plataforma
- `packages` - Pacotes de tecnologia
- `careers` - Carreiras profissionais
- `contents` - Conteúdos educacionais
- `user_progress` - Progresso dos usuários

## 📚 Documentação

### Documentos Principais
- [`docs/projeto-codepath-completo.md`](docs/projeto-codepath-completo.md) - Especificação completa
- [`docs/status-projeto.md`](docs/status-projeto.md) - Status atual e progresso
- [`docs/arquitetura.md`](docs/arquitetura.md) - Documentação da arquitetura
- [`docs/db-schema.md`](docs/db-schema.md) - Esquema do banco de dados

### Funcionalidades Implementadas

#### ✅ Sistema de Autenticação
- Cadastro de usuários
- Login/logout seguro
- Gerenciamento de sessões
- Validação de dados

#### ✅ Layout e Navegação
- Layout base responsivo
- Sidebar com navegação
- Header com informações do usuário
- Footer minimalista

#### ✅ Dashboard
- Página principal do usuário
- Métricas de progresso (mockadas)
- Seção "Continue Estudando"
- Cards interativos

## 🤝 Contribuição

### Padrões de Desenvolvimento
1. **Arquitetura MVC** - Separação clara de responsabilidades
2. **Código Limpo** - Comentários e nomenclatura descritiva
3. **Responsividade** - Mobile-first approach
4. **Acessibilidade** - Seguir diretrizes WCAG

### Fluxo de Trabalho
1. Criar branch para feature
2. Implementar seguindo os padrões
3. Testar funcionalidade
4. Atualizar documentação
5. Commit com mensagem clara
6. Pull request para revisão

## 📈 Roadmap

### Curto Prazo (2 semanas)
- [x] Finalizar Fase 5 (Dashboard funcional)
- [ ] Implementar Fase 6 (Sistema de carreiras)
- [ ] Integrar dados reais do banco

### Médio Prazo (1-2 meses)
- [x] Sistema de conteúdos (Fase 7)
- [x] Sistema de questionários (Fase 8)
- [x] Sistema de progresso (Fase 9)

### Longo Prazo (3+ meses)
- [x] Notificações e Melhorias de UX (Fase 10)
- [ ] Testes automatizados (Fase 11)
- [ ] Deploy e produção

## 📄 Licença

Este projeto está sob licença [MIT](LICENSE) - veja o arquivo LICENSE para detalhes.

## 👥 Equipe

- **Desenvolvimento**: Equipe CodePath
- **Design**: Baseado em protótipos fornecidos
- **Documentação**: Mantida pela equipe de desenvolvimento

## 📞 Contato

Para dúvidas, sugestões ou contribuições:
- 📧 Email: [contato@codepath.com]
- 📋 Issues: [GitHub Issues]
- 📖 Documentação: [`docs/`](docs/)

---

**CodePath** - Transformando o futuro através da educação em tecnologia 🚀 