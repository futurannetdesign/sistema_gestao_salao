-- Migração: Adicionar tabela fornecedores e atualizar produtos
-- Execute este script no Supabase SQL Editor se as tabelas já existirem

-- Criar tabela fornecedores se não existir
CREATE TABLE IF NOT EXISTS fornecedores (
  id bigint generated always as identity primary key,
  nome text not null,
  telefone text,
  whatsapp text,
  email text,
  endereco text,
  cidade text,
  estado text,
  cep text,
  observacoes text,
  ativo boolean default true,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Adicionar coluna fornecedor_id na tabela produtos se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'produtos' 
    AND column_name = 'fornecedor_id'
  ) THEN
    ALTER TABLE produtos ADD COLUMN fornecedor_id bigint;
    
    -- Criar foreign key se não existir
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'produtos_fornecedor_id_fkey'
    ) THEN
      ALTER TABLE produtos 
      ADD CONSTRAINT produtos_fornecedor_id_fkey 
      FOREIGN KEY (fornecedor_id) 
      REFERENCES fornecedores(id) 
      ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- Migrar dados do campo fornecedor (text) para fornecedor_id se existir
-- Nota: Esta migração cria fornecedores a partir dos nomes existentes no campo fornecedor
DO $$
DECLARE
  produto_record RECORD;
  fornecedor_id_var bigint;
BEGIN
  -- Verificar se existe coluna fornecedor (text) antiga
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'produtos' 
    AND column_name = 'fornecedor'
  ) THEN
    -- Para cada produto com fornecedor (text) preenchido
    FOR produto_record IN 
      SELECT id, fornecedor FROM produtos WHERE fornecedor IS NOT NULL AND fornecedor != ''
    LOOP
      -- Verificar se já existe fornecedor com este nome
      SELECT id INTO fornecedor_id_var 
      FROM fornecedores 
      WHERE nome = produto_record.fornecedor 
      LIMIT 1;
      
      -- Se não existe, criar
      IF fornecedor_id_var IS NULL THEN
        INSERT INTO fornecedores (nome, ativo) 
        VALUES (produto_record.fornecedor, true)
        RETURNING id INTO fornecedor_id_var;
      END IF;
      
      -- Atualizar produto com fornecedor_id
      UPDATE produtos 
      SET fornecedor_id = fornecedor_id_var 
      WHERE id = produto_record.id;
    END LOOP;
    
    -- Remover coluna fornecedor antiga (opcional - descomente se quiser remover)
    -- ALTER TABLE produtos DROP COLUMN IF EXISTS fornecedor;
  END IF;
END $$;

