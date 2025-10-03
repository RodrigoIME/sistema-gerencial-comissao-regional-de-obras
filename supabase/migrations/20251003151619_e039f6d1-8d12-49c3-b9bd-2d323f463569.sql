-- Adicionar campo de justificativa para urgência prioritária
ALTER TABLE public.solicitacoes
ADD COLUMN IF NOT EXISTS justificativa_urgencia TEXT;

COMMENT ON COLUMN public.solicitacoes.justificativa_urgencia 
IS 'Justificativa obrigatória quando classificação é Prioritário';