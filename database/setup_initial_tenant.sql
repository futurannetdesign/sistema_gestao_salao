-- ==============================================================================
-- 🚀 SCRIPT DE SETUP INICIAL (BOOTSTRAP)
-- ==============================================================================
-- Use este script para criar o PRIMEIRO SALÃO e vincular o ADMIN a ele.
-- Execute no Supabase SQL Editor.

DO $$
DECLARE
    v_salao_id uuid;
    v_admin_email text := 'admin@salao.com'; -- O email do seu admin
    v_admin_exists boolean;
BEGIN
    -- 1. Verificar/Criar o Salão Principal
    -- Tenta achar um salão já criado pelo admin
    SELECT id INTO v_salao_id FROM public.saloes WHERE nome = 'Salão Matriz' LIMIT 1;

    IF v_salao_id IS NULL THEN
        INSERT INTO public.saloes (nome, plano, ativo)
        VALUES ('Salão Matriz', 'pro', true)
        RETURNING id INTO v_salao_id;
        RAISE NOTICE '✅ Salão Matriz criado com ID: %', v_salao_id;
    ELSE
        RAISE NOTICE 'ℹ️ Salão Matriz já existe com ID: %', v_salao_id;
    END IF;

    -- 2. Vincular Usuário Admin ao Salão
    -- Verifica se o usuário admin existe na tabela publica
    SELECT EXISTS (SELECT 1 FROM public.usuarios WHERE email = v_admin_email) INTO v_admin_exists;

    IF v_admin_exists THEN
        -- Atualiza o salão do admin
        UPDATE public.usuarios 
        SET salao_id = v_salao_id,
            perfil = 'admin',
            ativo = true
        WHERE email = v_admin_email;
        
        RAISE NOTICE '✅ Usuário % vinculado ao Salão Matriz.', v_admin_email;
    ELSE
        -- Se não existe, cria
        INSERT INTO public.usuarios (nome, email, perfil, ativo, salao_id)
        VALUES ('Administrador', v_admin_email, 'admin', true, v_salao_id);
        
        RAISE NOTICE '✅ Usuário % criado e vinculado.', v_admin_email;
    END IF;

    -- 3. Tentar vincular com Supabase Auth (auth.users)
    -- Isso só funciona se o script tiver permissão de ler auth.users (SQL Editor tem)
    BEGIN
        UPDATE public.usuarios u
        SET auth_id = a.id
        FROM auth.users a
        WHERE u.email = a.email
        AND u.auth_id IS NULL;
        
        RAISE NOTICE '✅ Vínculos com Supabase Auth atualizados para emails coincidentes.';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Não foi possível vincular auth.users automaticamente (permissão insuficiente ou tabela vazia). O trigger de login resolverá isso depois.';
    END;

    -- 4. Opcional: Migrar dados órfãos (sem salão) para este salão
    -- Útil se você já tinha clientes cadastrados antes da migração
    UPDATE public.clientes SET salao_id = v_salao_id WHERE salao_id IS NULL;
    UPDATE public.agendamentos SET salao_id = v_salao_id WHERE salao_id IS NULL;
    UPDATE public.servicos SET salao_id = v_salao_id WHERE salao_id IS NULL;
    UPDATE public.profissionais SET salao_id = v_salao_id WHERE salao_id IS NULL;
    -- UPDATE public.financeiro SET salao_id = v_salao_id WHERE salao_id IS NULL; -- tabela generica se existir
    UPDATE public.contas_receber SET salao_id = v_salao_id WHERE salao_id IS NULL;
    UPDATE public.contas_pagar SET salao_id = v_salao_id WHERE salao_id IS NULL;
    
    RAISE NOTICE '✅ Dados órfãos migrados para o Salão Matriz.';

END $$;
