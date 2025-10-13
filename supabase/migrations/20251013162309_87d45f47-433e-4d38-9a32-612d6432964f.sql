-- Atualizar política SELECT da tabela solicitacoes
DROP POLICY IF EXISTS "Usuários veem solicitações de sua organização" ON public.solicitacoes;

CREATE POLICY "Usuários veem solicitações de sua organização" 
ON public.solicitacoes
FOR SELECT
USING (
  (usuario_id = auth.uid()) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_module_access(auth.uid(), 'vistorias'::app_module)
);

-- Atualizar política SELECT da tabela vistorias
DROP POLICY IF EXISTS "Usuários veem vistorias de sua organização" ON public.vistorias;

CREATE POLICY "Usuários veem vistorias de sua organização" 
ON public.vistorias
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM solicitacoes 
    WHERE solicitacoes.id = vistorias.solicitacao_id 
    AND (
      solicitacoes.usuario_id = auth.uid() OR 
      has_role(auth.uid(), 'admin'::app_role) OR 
      has_module_access(auth.uid(), 'vistorias'::app_module)
    )
  )
);

-- Atualizar política SELECT da tabela anexos
DROP POLICY IF EXISTS "Usuários veem anexos de sua organização" ON public.anexos;

CREATE POLICY "Usuários veem anexos de sua organização" 
ON public.anexos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM solicitacoes 
    WHERE solicitacoes.id = anexos.solicitacao_id 
    AND (
      solicitacoes.usuario_id = auth.uid() OR 
      has_role(auth.uid(), 'admin'::app_role) OR 
      has_module_access(auth.uid(), 'vistorias'::app_module)
    )
  )
);