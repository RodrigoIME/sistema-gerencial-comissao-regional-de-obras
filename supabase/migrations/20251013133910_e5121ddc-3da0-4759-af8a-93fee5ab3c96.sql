-- Corrigir localização da extensão pg_trgm
-- Move a extensão do schema public para extensions

-- Garantir que o schema extensions existe
CREATE SCHEMA IF NOT EXISTS extensions;

-- Mover a extensão pg_trgm para o schema extensions
ALTER EXTENSION pg_trgm SET SCHEMA extensions;