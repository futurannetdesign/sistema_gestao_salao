-- Script para criar usuários iniciais SEM senhas em texto plano
-- ⚠️ IMPORTANTE: Execute este script APENAS após configurar hash de senhas

-- Este script NÃO contém senhas em texto plano
-- As senhas devem ser criadas via interface do sistema ou Edge Function

-- Criar usuário administrador (senha deve ser definida via sistema)
INSERT INTO usuarios (nome, email, perfil, ativo)
VALUES 
  ('Administrador', 'admin@salao.com', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Criar usuário funcionário (senha deve ser definida via sistema)
INSERT INTO usuarios (nome, email, perfil, ativo)
VALUES 
  ('Funcionário', 'funcionario@salao.com', 'funcionario', true)
ON CONFLICT (email) DO NOTHING;

-- ⚠️ NOTA DE SEGURANÇA:
-- 1. Após criar os usuários, defina as senhas via interface do sistema
-- 2. Ou use uma Edge Function do Supabase para criar usuários com senha hasheada
-- 3. NUNCA armazene senhas em texto plano em produção
-- 4. Use bcrypt ou similar para hash de senhas
-- 5. Implemente recuperação de senha segura

