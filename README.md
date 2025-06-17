# 🏥 SANEM - Sistema de Gerenciamento de Doações

Sistema completo para gestão de doações e apoio a pessoas em vulnerabilidade social.

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Estado**: Context API + React Query
- **Validação**: Zod + React Hook Form
- **Linting**: ESLint + TypeScript ESLint
- **Formatação**: Prettier

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── common/         # Componentes comuns (LoadingSpinner, ErrorBoundary)
│   ├── ui/             # Componentes de UI (shadcn/ui)
│   ├── AppSidebar.tsx  # Sidebar principal
│   ├── ProtectedRoute.tsx
│   └── ThemeToggle.tsx
├── contexts/           # React Contexts
│   └── AuthContext.tsx
├── hooks/              # Custom hooks
│   ├── useLocalStorage.ts
│   ├── useTheme.tsx
│   └── use-toast.ts
├── pages/              # Páginas da aplicação
├── types/              # Definições de tipos TypeScript
├── constants/          # Constantes da aplicação
├── utils/              # Funções utilitárias
├── integrations/       # Integrações externas (Supabase)
└── lib/               # Configurações e utilitários
```

## 🔧 Configuração do Ambiente

1. **Clone o repositório**
```bash
git clone <repository-url>
cd sanem
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

4. **Execute o projeto**
```bash
npm run dev
```

## 🎯 Funcionalidades

- ✅ **Autenticação** - Sistema de login com diferentes níveis de acesso
- ✅ **Dashboard** - Visão geral das atividades
- ✅ **Gestão de Beneficiários** - Cadastro e controle de beneficiários
- ✅ **Controle de Doações** - Registro e acompanhamento de doações
- ✅ **Gestão de Estoque** - Controle de itens disponíveis
- ✅ **Distribuição** - Registro de retiradas pelos beneficiários
- ✅ **Relatórios** - Análises e estatísticas
- ✅ **Gestão de Usuários** - Controle de acesso (Super Admin)
- ✅ **Tema Escuro/Claro** - Interface adaptável

## 👥 Níveis de Acesso

### Super Administrador
- Acesso total ao sistema
- Gerenciamento de usuários
- Configurações do sistema

### Administrador
- Gestão de beneficiários, doações, estoque e distribuições
- Visualização de relatórios
- Sem acesso ao gerenciamento de usuários

### Voluntário
- Gestão básica de beneficiários
- Registro de doações
- Acesso limitado ao dashboard

## 🛠️ Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Verificação de código
npm run type-check   # Verificação de tipos
```

## 📐 Padrões de Código

### TypeScript
- Strict mode habilitado
- Tipagem forte obrigatória
- Interfaces bem definidas

### React
- Functional Components com Hooks
- Props tipadas com interfaces
- Error Boundaries implementados

### Organização
- Imports absolutos com `@/`
- Componentes organizados por responsabilidade
- Constantes centralizadas
- Utilitários reutilizáveis

## 🔒 Segurança

- Variáveis de ambiente para dados sensíveis
- Validação de entrada nos formulários
- Sanitização de dados
- Controle de acesso baseado em roles

## 🧪 Testes

```bash
npm run test         # Executar testes
npm run test:watch   # Testes em modo watch
npm run coverage     # Relatório de cobertura
```

## 📱 Responsividade

- Mobile-first design
- Breakpoints consistentes
- Componentes adaptáveis

## 🚀 Deploy

O projeto está configurado para deploy em:
- Vercel
- Netlify
- GitHub Pages

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Em caso de dúvidas ou problemas:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com ❤️ para apoiar comunidades em vulnerabilidade social**
