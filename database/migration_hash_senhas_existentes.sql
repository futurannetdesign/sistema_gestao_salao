-- ⚠️ IMPORTANTE: Este script deve ser executado APENAS após deploy da Edge Function hash-password
-- Este script migra senhas existentes em texto plano para hash bcrypt

-- NOTA: Este script usa uma função PostgreSQL que chama a Edge Function
-- Como não podemos chamar Edge Functions diretamente do SQL, você precisa:
-- 1. Executar a migração via aplicação Angular
-- 2. Ou criar uma função PostgreSQL que use http extension para chamar a Edge Function
-- 3. Ou migrar manualmente via interface do sistema

-- Opção 1: Migrar via aplicação Angular (RECOMENDADO)
-- Use o componente de migração de senhas que será criado

-- Opção 2: Criar função PostgreSQL com http extension
-- Requer extensão http no Supabase
/*
CREATE EXTENSION IF NOT EXISTS http;

CREATE OR REPLACE FUNCTION migrar_senha_para_hash(usuario_id_param bigint, senha_plana text)
RETURNS text AS $$
DECLARE
  hash_result text;
  response http_response;
BEGIN
  -- Chamar Edge Function para hash
  SELECT content INTO hash_result
  FROM http((
    'POST',
    'https://seu-projeto.supabase.co/functions/v1/hash-password',
    ARRAY[
      http_header('Content-Type', 'application/json'),
      http_header('Authorization', 'Bearer ' || current_setting('app.supabase_anon_key'))
    ],
    'application/json',
    json_build_object('senha', senha_plana)::text
  )::http_request);
  
  -- Atualizar senha no banco
  UPDATE usuarios 
  SET senha_hash = (hash_result::json->>'hash')::text
  WHERE id = usuario_id_param;
  
  RETURN hash_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- Opção 3: Migrar manualmente via interface
-- 1. Faça login com cada usuário
-- 2. O sistema automaticamente migrará a senha para hash no primeiro login
-- 3. Ou use o componente de migração de senhas

-- ⚠️ NOTA: A migração automática acontece no primeiro login após implementar hash
-- O sistema detecta senhas em texto plano e as migra automaticamente para hash

