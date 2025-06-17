-- Tabela de Beneficiários
CREATE TABLE beneficiarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    data_nascimento DATE,
    numero_dependentes INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Limite Atingido')),
    limite_mensal_real DECIMAL(10,2) DEFAULT 200.00,
    limite_usado_atual DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Tabela de Dependentes dos Beneficiários
CREATE TABLE dependentes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    beneficiario_id UUID REFERENCES beneficiarios(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    data_nascimento DATE,
    parentesco VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Doadores
CREATE TABLE doadores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('Pessoa Física', 'Pessoa Jurídica', 'Empresa', 'Organização')),
    cpf_cnpj VARCHAR(18),
    telefone VARCHAR(20),
    email VARCHAR(255),
    endereco TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Categorias de Produtos
CREATE TABLE categorias_produtos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Produtos/Itens do Estoque
CREATE TABLE produtos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    categoria_id UUID REFERENCES categorias_produtos(id),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tamanho VARCHAR(20),
    cor VARCHAR(50),
    condicao VARCHAR(50) DEFAULT 'Bom' CHECK (condicao IN ('Ótimo', 'Bom', 'Regular', 'Ruim')),
    quantidade_estoque INTEGER DEFAULT 0,
    quantidade_minima INTEGER DEFAULT 5,
    valor_estimado DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Doações Recebidas
CREATE TABLE doacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doador_id UUID REFERENCES doadores(id),
    data_doacao DATE NOT NULL,
    valor_total DECIMAL(10,2),
    tipo_doacao VARCHAR(50) CHECK (tipo_doacao IN ('Dinheiro', 'Produtos', 'Mista')),
    status VARCHAR(50) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Processada', 'Cancelada')),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Tabela de Itens da Doação (para doações de produtos)
CREATE TABLE itens_doacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doacao_id UUID REFERENCES doacoes(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES produtos(id),
    quantidade INTEGER NOT NULL,
    valor_unitario DECIMAL(10,2),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Distribuições
CREATE TABLE distribuicoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    beneficiario_id UUID REFERENCES beneficiarios(id),
    data_distribuicao DATE NOT NULL,
    valor_total DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Concluída', 'Cancelada')),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Tabela de Itens da Distribuição
CREATE TABLE itens_distribuicao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    distribuicao_id UUID REFERENCES distribuicoes(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES produtos(id),
    quantidade INTEGER NOT NULL,
    valor_unitario DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Movimentações de Estoque
CREATE TABLE movimentacoes_estoque (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    produto_id UUID REFERENCES produtos(id),
    tipo_movimentacao VARCHAR(50) CHECK (tipo_movimentacao IN ('Entrada', 'Saída', 'Ajuste')),
    quantidade INTEGER NOT NULL,
    quantidade_anterior INTEGER,
    quantidade_nova INTEGER,
    motivo VARCHAR(100),
    referencia_id UUID, -- Pode referenciar doação ou distribuição
    referencia_tipo VARCHAR(50), -- 'doacao' ou 'distribuicao'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
); 