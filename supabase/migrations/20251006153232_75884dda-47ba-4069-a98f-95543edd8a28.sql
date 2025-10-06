-- Adicionar 'projetos' ao enum de módulos se ainda não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    WHERE t.typname = 'app_module' AND e.enumlabel = 'projetos'
  ) THEN
    ALTER TYPE app_module ADD VALUE 'projetos';
  END IF;
END $$;

-- Tabela principal de projetos
CREATE TABLE public.projetos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_opus TEXT NOT NULL UNIQUE,
  objeto TEXT NOT NULL,
  organizacao_id INTEGER REFERENCES public.organizacoes(id),
  diretoria_responsavel TEXT NOT NULL,
  
  -- Dados Orçamentários
  valor_estimado_dfd NUMERIC(15,2) NOT NULL CHECK (valor_estimado_dfd > 0),
  plano_orcamentario TEXT NOT NULL,
  acao_orcamentaria TEXT NOT NULL,
  recursos_previstos_2025 NUMERIC(15,2) NOT NULL CHECK (recursos_previstos_2025 >= 0),
  pro TEXT,
  natureza_objeto TEXT NOT NULL,
  
  -- OM Executora e Equipe
  om_executora TEXT NOT NULL CHECK (om_executora IN ('CRO 1', '5º Gpt E')),
  arquiteto TEXT,
  engenheiro_civil TEXT,
  engenheiro_eletricista TEXT,
  engenheiro_mecanico TEXT,
  
  -- Controle
  usuario_responsavel_id UUID REFERENCES auth.users(id),
  prioridade TEXT DEFAULT 'Média' CHECK (prioridade IN ('Alta', 'Média', 'Baixa')),
  observacoes_iniciais TEXT,
  
  -- Status e Indicadores
  status TEXT DEFAULT 'Em Andamento' CHECK (status IN ('Em Andamento', 'Em Pausa', 'Concluído', 'Cancelado')),
  motivo_pausa TEXT,
  data_conclusao DATE,
  motivo_cancelamento TEXT,
  
  -- Checkboxes de Controle
  esta_no_pca_2025 BOOLEAN DEFAULT false,
  esta_no_dfd BOOLEAN DEFAULT false,
  foi_lancado_opus BOOLEAN DEFAULT false,
  data_lancamento_opus DATE,
  
  -- Prazos
  prazo_inicial DATE,
  prazo_previsto DATE,
  prazo_real_conclusao DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de histórico de alterações (auditoria)
CREATE TABLE public.projetos_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES auth.users(id),
  acao TEXT NOT NULL,
  campo_alterado TEXT,
  valor_anterior TEXT,
  valor_novo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de anexos
CREATE TABLE public.projetos_anexos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  projeto_id UUID NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  nome_arquivo TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo TEXT,
  tamanho BIGINT,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_projetos_numero_opus ON public.projetos(numero_opus);
CREATE INDEX idx_projetos_status ON public.projetos(status);
CREATE INDEX idx_projetos_organizacao ON public.projetos(organizacao_id);
CREATE INDEX idx_projetos_usuario ON public.projetos(usuario_responsavel_id);
CREATE INDEX idx_projetos_diretoria ON public.projetos(diretoria_responsavel);
CREATE INDEX idx_projetos_created_at ON public.projetos(created_at DESC);
CREATE INDEX idx_projetos_historico_projeto ON public.projetos_historico(projeto_id);
CREATE INDEX idx_projetos_anexos_projeto ON public.projetos_anexos(projeto_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_projetos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_projetos_updated_at
BEFORE UPDATE ON public.projetos
FOR EACH ROW
EXECUTE FUNCTION public.update_projetos_updated_at();

-- Enable RLS
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos_anexos ENABLE ROW LEVEL SECURITY;

-- RLS Policies para projetos
CREATE POLICY "Usuários com módulo projetos podem ver projetos"
ON public.projetos FOR SELECT
USING (
  has_module_access(auth.uid(), 'projetos'::app_module) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Usuários com módulo projetos podem inserir projetos"
ON public.projetos FOR INSERT
WITH CHECK (
  (has_module_access(auth.uid(), 'projetos'::app_module) OR has_role(auth.uid(), 'admin'::app_role))
  AND usuario_responsavel_id = auth.uid()
);

CREATE POLICY "Usuários podem atualizar projetos que criaram"
ON public.projetos FOR UPDATE
USING (
  usuario_responsavel_id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins podem deletar projetos"
ON public.projetos FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies para histórico
CREATE POLICY "Usuários podem ver histórico de projetos que acessam"
ON public.projetos_historico FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projetos 
    WHERE id = projetos_historico.projeto_id 
    AND (usuario_responsavel_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_module_access(auth.uid(), 'projetos'::app_module))
  )
);

CREATE POLICY "Sistema pode inserir no histórico"
ON public.projetos_historico FOR INSERT
WITH CHECK (true);

-- RLS Policies para anexos
CREATE POLICY "Usuários podem ver anexos de projetos que acessam"
ON public.projetos_anexos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projetos 
    WHERE id = projetos_anexos.projeto_id 
    AND (usuario_responsavel_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_module_access(auth.uid(), 'projetos'::app_module))
  )
);

CREATE POLICY "Usuários podem inserir anexos em projetos que criaram"
ON public.projetos_anexos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projetos 
    WHERE id = projetos_anexos.projeto_id 
    AND (usuario_responsavel_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Usuários podem deletar anexos de projetos que criaram"
ON public.projetos_anexos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projetos 
    WHERE id = projetos_anexos.projeto_id 
    AND (usuario_responsavel_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);