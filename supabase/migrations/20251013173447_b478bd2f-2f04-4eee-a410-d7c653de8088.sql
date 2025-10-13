-- Inserir Comissão Regional de Obras 1
INSERT INTO organizacoes (
  "Organização Militar",
  "Sigla da OM",
  "Órgão Setorial Responsável"
) VALUES (
  'Comissão Regional de Obras 1',
  'CRO 1',
  'DEC'
)
ON CONFLICT DO NOTHING;

-- Inserir 5º Grupamento de Engenharia
INSERT INTO organizacoes (
  "Organização Militar",
  "Sigla da OM",
  "Órgão Setorial Responsável"
) VALUES (
  '5º Grupamento de Engenharia',
  '5º Gpt E',
  'DEC'
)
ON CONFLICT DO NOTHING;