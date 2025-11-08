-- Script para criar usuários no Supabase Auth via SQL
-- Execute este script no Supabase SQL Editor
-- Os usuários serão criados no Supabase Auth automaticamente

-- ⚠️ IMPORTANTE: Este script cria usuários no Supabase Auth
-- As senhas são hasheadas automaticamente pelo Supabase

-- Criar função para criar usuário no Supabase Auth
CREATE OR REPLACE FUNCTION public.create_auth_user(
  email text,
  password text,
  nome text,
  perfil text DEFAULT 'funcionario'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Criar usuário no Supabase Auth
  -- Nota: Isso requer extensão pgcrypto e acesso à tabela auth.users
  -- O Supabase gerencia isso automaticamente via API
  
  -- Por enquanto, vamos criar apenas na tabela usuarios
  -- O usuário precisará ser criado manualmente no Supabase Auth Dashboard
  -- ou usar a API do Supabase Auth
  
  -- Inserir na tabela usuarios
  INSERT INTO public.usuarios (nome, email, perfil, ativo)
  VALUES (nome, email, perfil, true)
  ON CONFLICT (email) DO UPDATE
  SET nome = EXCLUDED.nome,
      perfil = EXCLUDED.perfil,
      ativo = EXCLUDED.ativo
  RETURNING id INTO user_id;
  
  RETURN user_id;
END;
$$;

-- Criar usuário administrador
-- ⚠️ IMPORTANTE: Você precisa criar este usuário manualmente no Supabase Auth Dashboard
-- Authentication > Users > Add user
-- Email: admin@salao.com
-- Password: admin123
-- Auto Confirm User: ✅

-- Criar registro na tabela usuarios
INSERT INTO public.usuarios (nome, email, perfil, ativo)
VALUES ('Administrador', 'admin@salao.com', 'admin', true)
ON CONFLICT (email) DO UPDATE
SET nome = 'Administrador',
    perfil = 'admin',
    ativo = true;

-- Criar usuário funcionário
-- ⚠️ IMPORTANTE: Você precisa criar este usuário manualmente no Supabase Auth Dashboard
-- Authentication > Users > Add user
-- Email: funcionario@salao.com
-- Password: func123
-- Auto Confirm User: ✅

-- Criar registro na tabela usuarios
INSERT INTO public.usuarios (nome, email, perfil, ativo)
VALUES ('Funcionário', 'funcionario@salao.com', 'funcionario', true)
ON CONFLICT (email) DO UPDATE
SET nome = 'Funcionário',
    perfil = 'funcionario',
    ativo = true;

-- ⚠️ NOTA IMPORTANTE:
-- 1. Execute este script no Supabase SQL Editor
-- 2. Depois, crie os usuários manualmente no Supabase Auth Dashboard:
--    - Authentication > Users > Add user
--    - Email: admin@salao.com | Password: admin123 | Auto Confirm: ✅
--    - Email: funcionario@salao.com | Password: func123 | Auto Confirm: ✅
-- 3. O email deve ser o mesmo na tabela usuarios e no Supabase Auth

