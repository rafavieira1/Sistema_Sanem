-- Migração para corrigir problemas de exclusão de usuários
-- Esta migração permite excluir usuários que não possuem dados relacionados críticos

-- 1. Modificar as constraints de chave estrangeira para permitir SET NULL quando apropriado
-- Isso permite manter o histórico mas remove a referência ao usuário excluído

-- Primeiro, vamos adicionar colunas para armazenar nomes dos usuários que criaram registros
-- Isso preserva a informação mesmo após exclusão do usuário

ALTER TABLE beneficiarios ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(255);
ALTER TABLE doacoes ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(255);
ALTER TABLE distribuicoes ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(255);
ALTER TABLE movimentacoes_estoque ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(255);

-- Atualizar registros existentes com os nomes dos usuários
UPDATE beneficiarios 
SET created_by_name = (
    SELECT name FROM users WHERE users.id = beneficiarios.created_by
)
WHERE created_by IS NOT NULL AND created_by_name IS NULL;

UPDATE doacoes 
SET created_by_name = (
    SELECT name FROM users WHERE users.id = doacoes.created_by
)
WHERE created_by IS NOT NULL AND created_by_name IS NULL;

UPDATE distribuicoes 
SET created_by_name = (
    SELECT name FROM users WHERE users.id = distribuicoes.created_by
)
WHERE created_by IS NOT NULL AND created_by_name IS NULL;

UPDATE movimentacoes_estoque 
SET created_by_name = (
    SELECT name FROM users WHERE users.id = movimentacoes_estoque.created_by
)
WHERE created_by IS NOT NULL AND created_by_name IS NULL;

-- Modificar constraints para permitir SET NULL
ALTER TABLE beneficiarios 
DROP CONSTRAINT IF EXISTS beneficiarios_created_by_fkey,
ADD CONSTRAINT beneficiarios_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE doacoes 
DROP CONSTRAINT IF EXISTS doacoes_created_by_fkey,
ADD CONSTRAINT doacoes_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE distribuicoes 
DROP CONSTRAINT IF EXISTS distribuicoes_created_by_fkey,
ADD CONSTRAINT distribuicoes_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE movimentacoes_estoque 
DROP CONSTRAINT IF EXISTS movimentacoes_estoque_created_by_fkey,
ADD CONSTRAINT movimentacoes_estoque_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Para tabelas de sistema, usar CASCADE onde apropriado
ALTER TABLE notificacoes 
DROP CONSTRAINT IF EXISTS notificacoes_user_id_fkey,
ADD CONSTRAINT notificacoes_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE atividades_sistema 
DROP CONSTRAINT IF EXISTS atividades_sistema_user_id_fkey,
ADD CONSTRAINT atividades_sistema_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE configuracoes_sistema 
DROP CONSTRAINT IF EXISTS configuracoes_sistema_updated_by_fkey,
ADD CONSTRAINT configuracoes_sistema_updated_by_fkey 
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- Criar função para verificar dependências críticas de um usuário
CREATE OR REPLACE FUNCTION check_user_dependencies(user_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}';
    beneficiarios_count INTEGER := 0;
    doacoes_count INTEGER := 0;
    distribuicoes_count INTEGER := 0;
    movimentacoes_count INTEGER := 0;
BEGIN
    -- Contar registros relacionados
    SELECT COUNT(*) INTO beneficiarios_count 
    FROM beneficiarios WHERE created_by = user_id;
    
    SELECT COUNT(*) INTO doacoes_count 
    FROM doacoes WHERE created_by = user_id;
    
    SELECT COUNT(*) INTO distribuicoes_count 
    FROM distribuicoes WHERE created_by = user_id;
    
    SELECT COUNT(*) INTO movimentacoes_count 
    FROM movimentacoes_estoque WHERE created_by = user_id;
    
    -- Montar resultado
    result := jsonb_build_object(
        'beneficiarios', beneficiarios_count,
        'doacoes', doacoes_count,
        'distribuicoes', distribuicoes_count,
        'movimentacoes', movimentacoes_count,
        'total_registros', beneficiarios_count + doacoes_count + distribuicoes_count + movimentacoes_count,
        'pode_excluir', (beneficiarios_count + doacoes_count + distribuicoes_count + movimentacoes_count) = 0
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para atualizar o nome do usuário quando um registro é criado
CREATE OR REPLACE FUNCTION update_created_by_name()
RETURNS TRIGGER AS $$
BEGIN
    -- Buscar o nome do usuário e atualizar o campo created_by_name
    IF NEW.created_by IS NOT NULL THEN
        SELECT name INTO NEW.created_by_name 
        FROM users WHERE id = NEW.created_by;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers nas tabelas principais
DROP TRIGGER IF EXISTS update_beneficiarios_created_by_name ON beneficiarios;
CREATE TRIGGER update_beneficiarios_created_by_name
    BEFORE INSERT OR UPDATE ON beneficiarios
    FOR EACH ROW
    EXECUTE FUNCTION update_created_by_name();

DROP TRIGGER IF EXISTS update_doacoes_created_by_name ON doacoes;
CREATE TRIGGER update_doacoes_created_by_name
    BEFORE INSERT OR UPDATE ON doacoes
    FOR EACH ROW
    EXECUTE FUNCTION update_created_by_name();

DROP TRIGGER IF EXISTS update_distribuicoes_created_by_name ON distribuicoes;
CREATE TRIGGER update_distribuicoes_created_by_name
    BEFORE INSERT OR UPDATE ON distribuicoes
    FOR EACH ROW
    EXECUTE FUNCTION update_created_by_name();

DROP TRIGGER IF EXISTS update_movimentacoes_created_by_name ON movimentacoes_estoque;
CREATE TRIGGER update_movimentacoes_created_by_name
    BEFORE INSERT OR UPDATE ON movimentacoes_estoque
    FOR EACH ROW
    EXECUTE FUNCTION update_created_by_name();

-- Comentários para documentar as mudanças
COMMENT ON FUNCTION check_user_dependencies(UUID) IS 'Verifica quantos registros estão relacionados a um usuário específico';
COMMENT ON FUNCTION update_created_by_name() IS 'Atualiza automaticamente o nome do usuário que criou o registro'; 