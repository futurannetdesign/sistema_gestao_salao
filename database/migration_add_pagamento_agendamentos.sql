-- Migração: Adicionar campos de pagamento na tabela agendamentos
-- Execute este script no Supabase SQL Editor se a tabela agendamentos já existir

-- Adicionar coluna data_pagamento se não existir
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS data_pagamento date;

-- Adicionar coluna forma_pagamento se não existir
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS forma_pagamento text;

