-- Tabela de Notificações
CREATE TABLE notificacoes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'info' CHECK (tipo IN ('info', 'warning', 'error', 'success')),
    lida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Configurações do Sistema
CREATE TABLE configuracoes_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    descricao TEXT,
    tipo VARCHAR(50) DEFAULT 'text' CHECK (tipo IN ('text', 'number', 'boolean', 'json')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES users(id)
);

-- Tabela de Atividades do Sistema (Log de ações)
CREATE TABLE atividades_sistema (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    acao VARCHAR(100) NOT NULL,
    tabela_afetada VARCHAR(100),
    registro_id UUID,
    detalhes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Períodos Mensais (para controle de limites)
CREATE TABLE periodos_mensais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ano INTEGER NOT NULL,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Fechado')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ano, mes)
);

-- Inserir dados padrão
INSERT INTO configuracoes_sistema (chave, valor, descricao, tipo) VALUES
('sistema_nome', 'SANEM - Sistema de Arrecadação e Necessidades', 'Nome do sistema', 'text'),
('limite_padrao_beneficiario', '200.00', 'Limite padrão mensal por beneficiário (R$)', 'number'),
('dias_alerta_estoque_baixo', '7', 'Dias para alerta de estoque baixo', 'number'),
('email_notificacoes', 'admin@sanem.org', 'E-mail para notificações do sistema', 'text'),
('backup_automatico', 'true', 'Ativar backup automático', 'boolean'); 