-- Migration para corrigir limite mensal dos beneficiários
-- Problema: limite_mensal_real estava configurado como 200 (valor monetário)
-- Solução: ajustar para 10 (quantidade de itens por mês)

-- 1. Atualizar todos os beneficiários existentes que têm limite de 200 para 10
UPDATE beneficiarios 
SET limite_mensal_real = 10.00 
WHERE limite_mensal_real = 200.00;

-- 2. Alterar o valor padrão da coluna para 10
ALTER TABLE beneficiarios 
ALTER COLUMN limite_mensal_real SET DEFAULT 10.00;

-- 3. Atualizar a configuração do sistema
UPDATE configuracoes_sistema 
SET valor = '10.00', 
    descricao = 'Limite padrão mensal por beneficiário (quantidade de itens)'
WHERE chave = 'limite_padrao_beneficiario';

-- 4. Resetar o limite usado atual para beneficiários que possam ter ultrapassado o novo limite
-- (opcional: manter histórico mas ajustar para não bloquear distribuições futuras)
UPDATE beneficiarios 
SET limite_usado_atual = LEAST(limite_usado_atual, 10.00)
WHERE limite_usado_atual > 10.00;

-- 5. Comentários para documentação
COMMENT ON COLUMN beneficiarios.limite_mensal_real IS 'Limite mensal de itens que o beneficiário pode retirar (quantidade)';
COMMENT ON COLUMN beneficiarios.limite_usado_atual IS 'Quantidade de itens já retirados no mês atual'; 