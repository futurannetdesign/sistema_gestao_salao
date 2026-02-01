-- ==============================================================================
-- 🛡️ SCRIPT DE SEGURANÇA E POLÍTICAS DE ACESSO (RLS) 🛡️ 
-- ==============================================================================
-- Este script blinda o banco de dados contra acesso não autorizado.
-- Deve ser executado no SQL Editor do Supabase.

-- 1. 🔗 INTEGRAÇÃO AUTH.USERS <-> PUBLIC.USUARIOS
-- Adicionar coluna para vincular o usuário do Auth com o usuário do sistema
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'auth_id') THEN
        ALTER TABLE public.usuarios ADD COLUMN auth_id uuid REFERENCES auth.users(id);
        CREATE INDEX idx_usuarios_auth_id ON public.usuarios(auth_id);
    END IF;
END $$;

-- 2. 🕵️ FUNÇÕES AUXILIARES DE SEGURANÇA
-- Função para verificar se o usuário logado é ADMIN (Otimizada para RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
SELECT EXISTS (
  SELECT 1 FROM public.usuarios
  WHERE auth_id = auth.uid()
  AND perfil = 'admin'
  AND ativo = true
);
$$ LANGUAGE sql SECURITY DEFINER;

-- Função para verificar se o usuário logado é FUNCIONARIO ou ADMIN (Acesso Básico)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean AS $$
SELECT EXISTS (
  SELECT 1 FROM public.usuarios
  WHERE auth_id = auth.uid()
  AND ativo = true
);
$$ LANGUAGE sql SECURITY DEFINER;

-- 3. 🔒 HABILITAR RLS EM TODAS AS TABELAS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
-- Adicione permissões também na tabela de permissoes criada anteriormente
ALTER TABLE permissoes ENABLE ROW LEVEL SECURITY;

-- 4. 📜 DEFINIÇÃO DE POLÍTICAS (POLICIES)

-- --- TABELA: CLIENTES ---
-- Todos os staff podem ver e criar clientes
CREATE POLICY "Staff vê clientes" ON clientes FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff cria clientes" ON clientes FOR INSERT TO authenticated WITH CHECK (is_staff());
CREATE POLICY "Staff edita clientes" ON clientes FOR UPDATE TO authenticated USING (is_staff());
-- Apenas Admin deleta clientes (Exemplo de regra mais restrita)
CREATE POLICY "Admin deleta clientes" ON clientes FOR DELETE TO authenticated USING (is_admin());

-- --- TABELA: AGENDAMENTOS ---
CREATE POLICY "Staff vê agendamentos" ON agendamentos FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Staff cria agendamentos" ON agendamentos FOR INSERT TO authenticated WITH CHECK (is_staff());
CREATE POLICY "Staff edita agendamentos" ON agendamentos FOR UPDATE TO authenticated USING (is_staff());
CREATE POLICY "Staff deleta agendamentos" ON agendamentos FOR DELETE TO authenticated USING (is_staff()); -- Talvez mudar para admin?

-- --- TABELA: FINANCEIRO (Contas, Caixa) ---
-- Apenas ADMIN vê financeiro completo? Ou funcionário vê contas a receber?
-- Regra atual: Staff vê tudo (simplificado para MVP). Para restringir, user is_admin().
CREATE POLICY "Staff acessa contas_receber" ON contas_receber FOR ALL TO authenticated USING (is_staff());
CREATE POLICY "Staff acessa contas_pagar" ON contas_pagar FOR ALL TO authenticated USING (is_staff());
CREATE POLICY "Staff acessa caixa" ON movimentacoes_caixa FOR ALL TO authenticated USING (is_staff());

-- --- TABELA: ESTOQUE ---
CREATE POLICY "Staff acessa produtos" ON produtos FOR ALL TO authenticated USING (is_staff());
CREATE POLICY "Staff acessa mov_estoque" ON movimentacoes_estoque FOR ALL TO authenticated USING (is_staff());

-- --- TABELA: USUARIOS ---
-- Usuário só vê o próprio perfil OU Admin vê todos
CREATE POLICY "Admin vê tudo" ON usuarios FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Usuario vê proprio perfil" ON usuarios FOR SELECT TO authenticated USING (auth_id = auth.uid());

-- --- TABELA: CONFIGURACOES ---
CREATE POLICY "Staff lê configs" ON configuracoes FOR SELECT TO authenticated USING (is_staff());
CREATE POLICY "Admin edita configs" ON configuracoes FOR ALL TO authenticated USING (is_admin());

-- --- TABELA: PERMISSOES (Tabela auxiliar da UI) ---
CREATE POLICY "Staff lê permissões" ON permissoes FOR SELECT TO authenticated USING (is_staff());

-- 5. ⚡ TRIGGER PARA AUTO-VINCULAR USER (Opcional mas recomendado)
-- Atualiza a tabela public.usuarios com o auth.uid() quando o email bate
-- (til para quando você criar o usuário no Auth depois de criar no Public)
CREATE OR REPLACE FUNCTION public.sync_auth_user()
RETURNS trigger AS $$
BEGIN
  UPDATE public.usuarios
  SET auth_id = NEW.id
  WHERE email = NEW.email AND auth_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tentar criar trigger no schema auth (geralmente bloqueado no dashboard, mas útil documentar)
-- CREATE TRIGGER on_auth_user_created
-- AFTER INSERT ON auth.users
-- FOR EACH ROW EXECUTE FUNCTION public.sync_auth_user();

-- ==============================================================================
-- ⚠️ INSTRUÇÕES FINAIS:
-- 1. Execute este script no SQL Editor do Supabase.
-- 2. IMPORTANTE: Para usuários JÁ EXISTENTES no 'public.usuarios', você precisará
--    rodar um UPDATE manual para preencher o 'auth_id' pegando do 'auth.users'.
--    Exemplo: 
--    UPDATE public.usuarios p
--    SET auth_id = a.id
--    FROM auth.users a
--    WHERE p.email = a.email;
-- ==============================================================================
