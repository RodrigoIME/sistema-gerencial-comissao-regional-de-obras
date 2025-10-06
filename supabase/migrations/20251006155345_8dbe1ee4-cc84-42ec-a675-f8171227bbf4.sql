-- Criar bucket para anexos de projetos
INSERT INTO storage.buckets (id, name, public)
VALUES ('projetos-anexos', 'projetos-anexos', false);

-- RLS: Usuários com módulo projetos podem ver anexos
CREATE POLICY "Usuários podem ver anexos de projetos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'projetos-anexos' 
  AND (
    has_module_access(auth.uid(), 'projetos'::app_module) 
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- RLS: Usuários podem fazer upload
CREATE POLICY "Usuários podem fazer upload de anexos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'projetos-anexos'
  AND (
    has_module_access(auth.uid(), 'projetos'::app_module) 
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- RLS: Usuários podem deletar anexos
CREATE POLICY "Usuários podem deletar anexos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'projetos-anexos'
  AND (
    has_module_access(auth.uid(), 'projetos'::app_module) 
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);