-- ==============================================================================
-- 🆕 SCRIPT DE ONBOARDING (NOVO CLIENTE SAAS)
-- ==============================================================================
-- Este script facilita a venda para um novo cliente.
-- Ele cria o Salão e o Usuário Admin do Dono em uma única tacada.

-- Crie esta Procedure no SQL Editor para usar sempre que vender o sistema:

CREATE OR REPLACE FUNCTION public.cadastrar_novo_cliente_saas(
    p_nome_salao text,
    p_plano text, -- 'free', 'pro', 'enterprise'
    p_nome_dono text,
    p_email_dono text
)
RETURNS table (
    novo_salao_id uuid,
    novo_usuario_id bigint,
    mensagem text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_salao_id uuid;
    v_usuario_id bigint;
BEGIN
    -- 1. Criar o Salão
    INSERT INTO public.saloes (nome, plano, ativo)
    VALUES (p_nome_salao, p_plano, true)
    RETURNING id INTO v_salao_id;

    -- 2. Criar o Usuário Dono (Admin) vinculado a este salão
    INSERT INTO public.usuarios (nome, email, perfil, ativo, salao_id)
    VALUES (p_nome_dono, p_email_dono, 'admin', true, v_salao_id)
    RETURNING id INTO v_usuario_id;

    -- 3. Clonar Permissões Padrão para o novo Salão
    -- Busca todos os registros onde salao_id é NULL e replica para o novo salao_id
    INSERT INTO public.permissoes (perfil, modulo, acao, permitido, salao_id)
    SELECT perfil, modulo, acao, permitido, v_salao_id
    FROM public.permissoes
    WHERE salao_id IS NULL;

    -- 4. Criar Configurações Básicas para o novo Salão
    INSERT INTO public.configuracoes (chave, valor, salao_id)
    VALUES 
        ('nome_salao', p_nome_salao, v_salao_id),
        ('limite_usuarios', CASE WHEN p_plano = 'free' THEN '3' ELSE '20' END, v_salao_id);

    -- Retornar os IDs gerados para confirmação
    RETURN QUERY SELECT 
        v_salao_id, 
        v_usuario_id, 
        format('✅ Cliente "%s" cadastrado com sucesso! Dono: %s (%s).', p_nome_salao, p_nome_dono, p_email_dono)::text;
END;
$$;

-- ==============================================================================
-- 📋 COMO USAR (EXEMPLO):
-- ==============================================================================
-- Quando você vender para o "Salão da Maria", rode apenas isso no SQL Editor:
-- SELECT * FROM cadastrar_novo_cliente_saas('Salão da Maria', 'pro', 'Maria Silva', 'maria@salao.com');

-- DEPOIS:
-- 1. Peça para a Maria se cadastrar/logar no sistema com o email 'maria@salao.com'.
-- 2. O Trigger automático vai vincular o login dela com esse usuário criado.
-- 3. Ela entrará direto no painel "Salão da Maria" com perfil ADMIN.
