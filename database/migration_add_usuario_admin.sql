-- ⚠️ ATENÇÃO: Script para DESENVOLVIMENTO APENAS
-- NÃO use este script em produção sem implementar hash de senhas!

-- Script para criar usuário administrador inicial
-- Execute este script no Supabase SQL Editor após criar a tabela usuarios

-- ⚠️ SEGURANÇA: Este script usa senhas em texto plano
-- Apenas para desenvolvimento e testes locais
-- Para produção, use migration_usuarios_seguro.sql ou crie via interface

-- Criar usuário administrador padrão
-- Email: admin@salao.com
-- Senha: admin123 (⚠️ ALTERE APÓS PRIMEIRO LOGIN!)
INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo)
VALUES 
  ('Administrador', 'admin@salao.com', 'admin123', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Criar usuário funcionário de exemplo
-- Email: funcionario@salao.com
-- Senha: func123 (⚠️ ALTERE APÓS PRIMEIRO LOGIN!)
INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo)
VALUES 
  ('Funcionário', 'funcionario@salao.com', 'func123', 'funcionario', true)
ON CONFLICT (email) DO NOTHING;

-- ⚠️ NOTA IMPORTANTE DE SEGURANÇA: 
-- 1. Este script usa senhas em TEXTO PLANO - apenas para desenvolvimento
-- 2. Em produção, as senhas DEVEM ser hasheadas usando bcrypt ou similar
-- 3. Implemente hash de senha no backend antes de usar em produção
-- 4. Consulte SEGURANCA.md para instruções completas
-- 5. Use migration_usuarios_seguro.sql para produção
-- 6. Ou crie usuários via interface do sistema após implementar hash

