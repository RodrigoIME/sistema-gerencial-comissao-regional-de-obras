-- Criar função para obter a organização do usuário autenticado
CREATE OR REPLACE FUNCTION public.user_organization_id()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organizacao_militar_id
  FROM public.usuarios
  WHERE id = auth.uid()
$$;

-- ========================================
-- ATUALIZAR POLICIES DE SOLICITACOES
-- ========================================

DROP POLICY IF EXISTS "Usuários veem suas solicitações" ON public.solicitacoes;
DROP POLICY IF EXISTS "Usuários veem solicitações de sua organização" ON public.solicitacoes;

CREATE POLICY "Usuários veem solicitações de sua organização" 
ON public.solicitacoes
FOR SELECT 
USING (
  usuario_id = auth.uid()
  OR has_role(auth.uid(), 'admin')
  OR (
    has_module_access(auth.uid(), 'vistorias') 
    AND organizacao_id = user_organization_id()
  )
);

-- ========================================
-- ATUALIZAR POLICIES DE PROJETOS
-- ========================================

DROP POLICY IF EXISTS "Usuários com módulo projetos podem ver projetos" ON public.projetos;
DROP POLICY IF EXISTS "Usuários veem projetos de sua organização" ON public.projetos;

CREATE POLICY "Usuários veem projetos de sua organização" 
ON public.projetos
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin')
  OR (
    has_module_access(auth.uid(), 'projetos') 
    AND organizacao_id = user_organization_id()
  )
);

-- ========================================
-- ATUALIZAR POLICIES DE VISTORIAS
-- ========================================

DROP POLICY IF EXISTS "Usuários veem vistorias de suas solicitações" ON public.vistorias;
DROP POLICY IF EXISTS "Usuários veem vistorias de sua organização" ON public.vistorias;

CREATE POLICY "Usuários veem vistorias de sua organização" 
ON public.vistorias
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM solicitacoes
    WHERE solicitacoes.id = vistorias.solicitacao_id
    AND (
      solicitacoes.usuario_id = auth.uid()
      OR has_role(auth.uid(), 'admin')
      OR (
        has_module_access(auth.uid(), 'vistorias')
        AND solicitacoes.organizacao_id = user_organization_id()
      )
    )
  )
);

-- ========================================
-- ATUALIZAR POLICIES DE ANEXOS
-- ========================================

DROP POLICY IF EXISTS "Usuários veem anexos de suas solicitações" ON public.anexos;
DROP POLICY IF EXISTS "Usuários veem anexos de sua organização" ON public.anexos;

CREATE POLICY "Usuários veem anexos de sua organização" 
ON public.anexos
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM solicitacoes
    WHERE solicitacoes.id = anexos.solicitacao_id
    AND (
      solicitacoes.usuario_id = auth.uid()
      OR has_role(auth.uid(), 'admin')
      OR (
        has_module_access(auth.uid(), 'vistorias')
        AND solicitacoes.organizacao_id = user_organization_id()
      )
    )
  )
);

-- ========================================
-- ATUALIZAR POLICIES DE PROJETOS_ANEXOS
-- ========================================

DROP POLICY IF EXISTS "Usuários podem ver anexos de projetos que acessam" ON public.projetos_anexos;
DROP POLICY IF EXISTS "Usuários veem anexos de projetos de sua organização" ON public.projetos_anexos;

CREATE POLICY "Usuários veem anexos de projetos de sua organização" 
ON public.projetos_anexos
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM projetos
    WHERE projetos.id = projetos_anexos.projeto_id
    AND (
      has_role(auth.uid(), 'admin')
      OR (
        has_module_access(auth.uid(), 'projetos')
        AND projetos.organizacao_id = user_organization_id()
      )
    )
  )
);

-- ========================================
-- ATUALIZAR POLICIES DE PROJETOS_HISTORICO
-- ========================================

DROP POLICY IF EXISTS "Usuários podem ver histórico de projetos que acessam" ON public.projetos_historico;
DROP POLICY IF EXISTS "Usuários veem histórico de projetos de sua organização" ON public.projetos_historico;

CREATE POLICY "Usuários veem histórico de projetos de sua organização" 
ON public.projetos_historico
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM projetos
    WHERE projetos.id = projetos_historico.projeto_id
    AND (
      has_role(auth.uid(), 'admin')
      OR (
        has_module_access(auth.uid(), 'projetos')
        AND projetos.organizacao_id = user_organization_id()
      )
    )
  )
);