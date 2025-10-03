-- Adicionar novas colunas na tabela usuarios existente
ALTER TABLE public.usuarios 
  ADD COLUMN IF NOT EXISTS nome_guerra TEXT,
  ADD COLUMN IF NOT EXISTS posto_graduacao TEXT,
  ADD COLUMN IF NOT EXISTS organizacao_militar_id INTEGER REFERENCES public.organizacoes(id),
  ADD COLUMN IF NOT EXISTS telefone TEXT,
  ADD COLUMN IF NOT EXISTS telefone_alternativo TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Comentários para documentação
COMMENT ON COLUMN public.usuarios.nome_guerra IS 'Nome de guerra utilizado no meio militar';
COMMENT ON COLUMN public.usuarios.posto_graduacao IS 'Posto ou graduação militar';
COMMENT ON COLUMN public.usuarios.organizacao_militar_id IS 'OM a qual o usuário pertence';
COMMENT ON COLUMN public.usuarios.telefone IS 'Telefone principal de contato';
COMMENT ON COLUMN public.usuarios.telefone_alternativo IS 'Telefone secundário';
COMMENT ON COLUMN public.usuarios.avatar_url IS 'URL da foto de perfil';

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_usuarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER usuarios_updated_at
BEFORE UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION update_usuarios_updated_at();

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_organizacao ON public.usuarios(organizacao_militar_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_posto ON public.usuarios(posto_graduacao);