#SANEM - Sistema de Assistência e Apoio à Necessitados

> **Sistema completo para gestão de doações, beneficiários e distribuição de recursos para pessoas em vulnerabilidade social**

[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC.svg)](https://tailwindcss.com/)

## 🎯 Sobre o Projeto

O **SANEM** é um sistema web desenvolvido para organizações sociais, ONGs e instituições de caridade que trabalham com assistência a pessoas em vulnerabilidade social. O sistema oferece controle completo sobre:

- 👥 **Cadastro e gestão de beneficiários** e seus dependentes
- 🎁 **Registro e controle de doações** (produtos e dinheiro)
- 📦 **Gestão de estoque** com controle de entrada e saída
- 📋 **Distribuição controlada** de recursos para beneficiários
- 📊 **Relatórios e estatísticas** em tempo real
- 👤 **Gestão de usuários** com diferentes níveis de acesso
- 🔍 **Auditoria completa** de todas as operações

## 🚀 Tecnologias Utilizadas

### **Frontend**
- **React 18** com TypeScript para interface moderna e tipada
- **Vite** para desenvolvimento rápido e build otimizado
- **Tailwind CSS** + **shadcn/ui** para design system consistente
- **Lucide React** para ícones vetoriais
- **React Hook Form** + **Zod** para validação de formulários

### **Backend & Database**
- **Supabase** como Backend-as-a-Service
- **PostgreSQL** para banco de dados relacional
- **Row Level Security (RLS)** para segurança de dados
- **Real-time subscriptions** para atualizações em tempo real

### **Arquitetura & Padrões**
- **Context API** para gerenciamento de estado global
- **Custom Hooks** para lógica reutilizável
- **Protected Routes** com controle de permissões
- **Error Boundaries** para tratamento de erros
- **Responsive Design** para acesso mobile e desktop

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── common/         # Componentes comuns (LoadingSpinner, ErrorBoundary)
│   ├── ui/             # Componentes de UI (shadcn/ui)
│   ├── AppSidebar.tsx  # Sidebar principal com navegação
│   ├── ProtectedRoute.tsx # Proteção de rotas por permissão
│   └── ThemeToggle.tsx # Alternador de tema claro/escuro
├── contexts/           # React Contexts
│   └── AuthContext.tsx # Contexto de autenticação e permissões
├── hooks/              # Custom hooks
│   ├── useLocalStorage.ts
│   ├── useTheme.tsx
│   └── use-toast.ts
├── pages/              # Páginas da aplicação
│   ├── Index.tsx       # Página de login
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── Beneficiarios.tsx # Gestão de beneficiários
│   ├── Cadastro.tsx    # Cadastro de pessoas (beneficiários, doadores, dependentes)
│   ├── Doacoes.tsx     # Controle de doações
│   ├── Estoque.tsx     # Gestão de estoque
│   ├── Distribuicao.tsx # Distribuição de itens
│   ├── Relatorios.tsx  # Relatórios e análises
│   ├── Perfil.tsx      # Perfil do usuário
│   ├── GestaoUsuarios.tsx # Gestão de usuários (Admin)
│   └── NotFound.tsx    # Página 404
├── types/              # Definições de tipos TypeScript
├── constants/          # Constantes e permissões
├── utils/              # Funções utilitárias
├── integrations/       # Integrações externas
│   └── supabase/      # Cliente e tipos do Supabase
└── lib/               # Configurações e utilitários
```

## 🗄️ Estrutura do Banco de Dados

O sistema utiliza **16 tabelas** organizadas logicamente:

### 👥 **Gestão de Pessoas**
- `users` - Usuários do sistema (superadmin, admin, voluntario)
- `beneficiarios` - Pessoas que recebem as doações
- `dependentes` - Familiares dos beneficiários  
- `doadores` - Pessoas/empresas que fazem doações

### 📦 **Controle de Estoque**
- `categorias_produtos` - Categorias (roupas, calçados, alimentos, etc.)
- `produtos` - Itens individuais do estoque
- `movimentacoes_estoque` - Histórico de entrada/saída

### 🎁 **Gestão de Doações**
- `doacoes` - Registro das doações recebidas
- `itens_doacao` - Produtos específicos de cada doação

### 📋 **Controle de Distribuição**
- `distribuicoes` - Entregas para beneficiários
- `itens_distribuicao` - Produtos específicos distribuídos

### ⚙️ **Sistema e Controle**
- `audit_logs` - Logs de auditoria para rastreabilidade
- `configuracoes_sistema` - Configurações globais
- `notificacoes` - Sistema de notificações
- `atividades_sistema` - Atividades para o dashboard
- `periodos_mensais` - Controle de períodos e limites

## 🔧 Configuração do Ambiente

> **💡 O projeto utiliza um banco de dados compartilhado no Supabase. Todas as máquinas de desenvolvimento podem usar o mesmo banco para ter acesso aos mesmos dados.**

### **🚀 Como Configurar em uma Nova Máquina**

### 1. **Clone o repositório**
```bash
git clone https://github.com/LuizAltissimo/Sistema_Sanem.git
cd Sistema_Sanem
```

### 2. **Instale as dependências**
```bash
npm install
```

### 3. **Configure o banco existente**

Crie o arquivo `.env.local` na raiz do projeto com as credenciais do banco já configurado:

```env
# Banco de dados SANEM já configurado (use estas credenciais)
VITE_SUPABASE_URL=https://jqpfqwbzdpdvguoulmff.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcGZxd2J6ZHBkdmd1b3VsbWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTU0NjgsImV4cCI6MjA2NTY3MTQ2OH0.ryOYXPDk72A-Qukjf9lq8-BjdiiCMQGsoBQLxPbK764
```

### 4. **Execute o projeto**
```bash
npm run dev
```

### 5. **Acesse o sistema**
- **URL:** `http://localhost:5173`
- **Email:** `superadmin@sanem.org`
- **Senha:** `123`
- **Papel:** Super Administrador

- **Email:** `admin@sanem.org`
- **Senha:** `123`
- **Papel:** Administrador

- **Email:** `voluntario@sanem.org`
- **Senha:** `123`
- **Papel:** Voluntário

---

## 🔍 **Verificação da Instalação**

### **Como saber se deu certo:**
1. Execute `npm run dev`
2. Acesse `http://localhost:5173`
3. Faça login com `superadmin@sanem.org` / `123`
4. Se aparecer o **Dashboard** = ✅ **Sucesso!**

### **📋 Checklist de verificação:**
- [ ] Arquivo `.env.local` criado na raiz do projeto
- [ ] Credenciais copiadas exatamente como mostrado
- [ ] `npm install` executado sem erros
- [ ] `npm run dev` rodando na porta 5173
- [ ] Navegador acessando `http://localhost:5173`

---

## 👥 Níveis de Acesso e Permissões

### 🔴 **Super Administrador**
- **Acesso:** Completo ao sistema
- **Permissões:**
  - Gerenciamento de usuários (criar, editar, desativar)
  - Configurações do sistema
  - Todos os relatórios e estatísticas
  - Logs de auditoria completos
  - Gestão completa de todas as funcionalidades

### 🟡 **Administrador**
- **Acesso:** Operacional completo
- **Permissões:**
  - Gestão de beneficiários, doações, estoque
  - Controle de distribuições
  - Processamento de doações
  - Relatórios operacionais
  - **Sem acesso:** Gestão de usuários e configurações do sistema

### 🟢 **Voluntário**
- **Acesso:** Operações básicas
- **Permissões:**
  - Dashboard com estatísticas básicas
  - Cadastro de beneficiários
  - Registro de doações
  - Visualização de estoque
  - **Sem acesso:** Distribuições, relatórios avançados, gestão de usuários

## 🔄 Fluxos de Trabalho

### **1. Fluxo de Doações**
```
Doador faz doação → Registro no sistema → Processamento → Entrada no estoque → Disponível para distribuição
```

### **2. Fluxo de Distribuição**
```
Beneficiário solicita → Verificação de limite → Separação de itens → Distribuição → Baixa no estoque
```

### **3. Fluxo de Cadastro**
```
Nova pessoa → Cadastro básico → Documentação → Ativação → Disponível no sistema
```

### **Padrões de Commit**
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação
- `refactor:` refatoração
- `test:` testes
- `chore:` tarefas de manutenção