-- ==============================================================================
-- 🏢 MIGRATION: MULTI-TENANCY (ISOLAMENTO DE DADOS POR SALÃO)
-- ==============================================================================
-- Este script transforma o sistema Single Tenant em SAAS Multi-Tenant.
-- Execute no SQL Editor do Supabase.

-- 1. CRIAR TABELA DE SALÕES (TENANTS)
CREATE TABLE IF NOT EXISTS public.saloes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nome text NOT NULL,
    cnpj text,
    plano text DEFAULT 'free', -- free, pro, enterprise
    ativo boolean DEFAULT true,
    owner_id uuid REFERENCES auth.users(id), -- Dono da conta (usuário que criou)
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- Habilitar RLS em Saloes
ALTER TABLE public.saloes ENABLE ROW LEVEL SECURITY;

-- 2. VINCULAR USUÁRIOS A UM SALÃO
-- Adicionar coluna salao_id na tabela usuarios
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS salao_id uuid REFERENCES public.saloes(id);
CREATE INDEX IF NOT EXISTS idx_usuarios_salao_id ON public.usuarios(salao_id);

-- 3. FUNÇÃO PARA DESCOBRIR O SALÃO DO USUÁRIO LOGADO
-- Esta função é o CORAÇÃO da segurança. Ela diz: "Quem está logado pertence a qual salão?"
CREATE OR REPLACE FUNCTION public.get_my_salao_id()
RETURNS uuid AS $$
    SELECT salao_id FROM public.usuarios
    WHERE auth_id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4. ADICIONAR COLUNA salao_id EM TODASAS TABELAS DE NEGÓCIO
-- Lista de tabelas que precisam de isolamento
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'clientes', 'profissionais', 'servicos', 'agendamentos', 
        'contas_receber', 'contas_pagar', 'movimentacoes_caixa', 
        'fornecedores', 'produtos', 'movimentacoes_estoque', 
        'configuracoes', 'permissoes'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS salao_id uuid REFERENCES public.saloes(id)', t);
        EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%I_salao_id ON public.%I(salao_id)', t, t);
    END LOOP;
END $$;

-- 5. ATUALIZAR POLÍTICAS DE SEGURANÇA (RLS)
-- Vamos remover as policies antigas (que davam acesso a tudo para staff) e criar as novas (filtradas por salão)

-- Helper para recriar policy padrão de isolamento
CREATE OR REPLACE PROCEDURE public.create_tenant_policy(table_name text)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Drop policies antigas de leitura/escrita genérica se existirem (nomes do script anterior)
    EXECUTE format('DROP POLICY IF EXISTS "Staff vê %I" ON public.%I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Staff cria %I" ON public.%I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Staff edita %I" ON public.%I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Staff deleta %I" ON public.%I', table_name, table_name);
    EXECUTE format('DROP POLICY IF EXISTS "Staff acessa %I" ON public.%I', table_name, table_name);

    -- Criar Policy de Isolamento Total (Tenant Isolation)
    -- "Eu só vejo/edito linhas onde salao_id é igual ao meu salao_id"
    EXECUTE format('
        CREATE POLICY "Tenant Isolation %I" ON public.%I
        FOR ALL
        TO authenticated
        USING (salao_id = public.get_my_salao_id())
        WITH CHECK (salao_id = public.get_my_salao_id())
    ', table_name, table_name);
END;
$$;

-- Aplicar a nova policy em todas as tabelas
CALL public.create_tenant_policy('clientes');
CALL public.create_tenant_policy('profissionais');
CALL public.create_tenant_policy('servicos');
CALL public.create_tenant_policy('agendamentos');
CALL public.create_tenant_policy('contas_receber');
CALL public.create_tenant_policy('contas_pagar');
CALL public.create_tenant_policy('movimentacoes_caixa');
CALL public.create_tenant_policy('fornecedores');
CALL public.create_tenant_policy('produtos');
CALL public.create_tenant_policy('movimentacoes_estoque');
CALL public.create_tenant_policy('configuracoes');
CALL public.create_tenant_policy('permissoes');

-- Policy específica para tabela USUARIOS (Eu vejo meu perfil OU Vejo todos do meu salão se for Admin)
DROP POLICY IF EXISTS "Admin vê tudo" ON public.usuarios;
CREATE POLICY "Tenant Isolation Usuarios" ON public.usuarios
FOR SELECT TO authenticated
USING (salao_id = public.get_my_salao_id());

-- Policy para tabela SALOES (Eu vejo meu próprio salão)
CREATE POLICY "Ver meu salao" ON public.saloes
FOR SELECT TO authenticated
USING (id = public.get_my_salao_id());

-- 6. TRIGGER PARA PREENCHER SALAO_ID AUTOMATICAMENTE
-- Para não precisar enviar o salao_id do frontend toda hora (embora seja bom enviar),
-- vamos garantir que no INSERT ele pegue o salao do usuário.
CREATE OR REPLACE FUNCTION public.set_tenant_id()
RETURNS trigger AS $$
BEGIN
    NEW.salao_id := public.get_my_salao_id();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar Trigger
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'clientes', 'profissionais', 'servicos', 'agendamentos', 
        'contas_receber', 'contas_pagar', 'movimentacoes_caixa', 
        'fornecedores', 'produtos', 'movimentacoes_estoque', 
        'configuracoes', 'permissoes'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_set_tenant_%I ON public.%I', t, t);
        EXECUTE format('CREATE TRIGGER trg_set_tenant_%I BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id()', t, t);
    END LOOP;
END $$;

-- 7. ⚠️ DADOS LEGADOS (MIGRAÇÃO DE DADOS EXISTENTES)
-- Se já houver dados no banco sem salao_id, precisamos atribuir a um salão padrão.
-- Descomente e edite abaixo se precisar migrar dados reais.

-- INSERT INTO public.saloes (nome) VALUES ('Salão Padrão - Migração') RETURNING id;
-- \gset -- salva o id gerado numa variavel (se fosse psql cliente)

-- Como não temos variaveis aqui, vamos assumir que você rodará isso manualmente:
-- 1. Crie um salão manualmente na tabela saloes via Dashboard.
-- 2. Pegue o ID dele (ex: uuid-123).
-- 3. UPDATE clientes SET salao_id = 'uuid-123' WHERE salao_id IS NULL;
-- ... repetir para todas as tabelas.

