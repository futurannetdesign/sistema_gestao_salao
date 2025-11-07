-- ⚠️ IMPORTANTE: Script para melhorar segurança de senhas
-- Este script deve ser executado APENAS após implementar hash de senhas no backend
-- Por enquanto, as senhas estão em texto plano apenas para desenvolvimento

-- 1. Adicionar coluna para armazenar hash de senha (se não existir)
-- ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS senha_hash text;

-- 2. Criar função para hash de senha (usando bcrypt)
-- NOTA: Em produção, use uma função server-side ou Edge Function do Supabase
-- Exemplo de função PostgreSQL (requer extensão pgcrypto):
/*
CREATE OR REPLACE FUNCTION hash_senha(senha_plana text)
RETURNS text AS $$
BEGIN
  -- Usar crypt do pgcrypto para hash bcrypt
  RETURN crypt(senha_plana, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql;
*/

-- 3. Criar função para verificar senha
/*
CREATE OR REPLACE FUNCTION verificar_senha(senha_plana text, senha_hash text)
RETURNS boolean AS $$
BEGIN
  RETURN senha_hash = crypt(senha_plana, senha_hash);
END;
$$ LANGUAGE plpgsql;
*/

-- 4. Atualizar senhas existentes para hash (EXECUTAR APENAS APÓS IMPLEMENTAR HASH)
-- ⚠️ NÃO EXECUTAR AGORA - Apenas para referência futura
/*
UPDATE usuarios 
SET senha_hash = hash_senha(senha_hash)
WHERE senha_hash IS NOT NULL;
*/

-- 5. Criar trigger para hash automático de senhas (opcional)
/*
CREATE OR REPLACE FUNCTION trigger_hash_senha()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.senha_hash IS NOT NULL AND NEW.senha_hash != OLD.senha_hash THEN
    NEW.senha_hash := hash_senha(NEW.senha_hash);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hash_senha_trigger
BEFORE INSERT OR UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION trigger_hash_senha();
*/

-- NOTA: Para produção, recomenda-se:
-- 1. Usar Supabase Edge Functions para hash de senhas
-- 2. Ou usar autenticação nativa do Supabase (Auth)
-- 3. Implementar rate limiting para login
-- 4. Adicionar 2FA (autenticação de dois fatores)
-- 5. Implementar recuperação de senha segura

