// Status de Solicitações
export const SOLICITACAO_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
} as const;

export type SolicitacaoStatus = typeof SOLICITACAO_STATUS[keyof typeof SOLICITACAO_STATUS];

// Status de Projetos
export const PROJETO_STATUS = {
  EM_ANDAMENTO: 'Em Andamento',
  EM_PAUSA: 'Em Pausa',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
} as const;

export type ProjetoStatus = typeof PROJETO_STATUS[keyof typeof PROJETO_STATUS];

// Diretorias
export const DIRETORIAS = [
  { value: "COLOG", label: "Comando Logístico - COLOG" },
  { value: "COTER", label: "Comando de Operações Terrestres - COTER" },
  { value: "DCT", label: "Departamento de Ciência e Tecnologia - DCT" },
  { value: "DEC", label: "Departamento de Engenharia e Construção - DEC" },
  { value: "DECEx", label: "Departamento de Educação e Cultura do Exército - DECEx" },
  { value: "DGP", label: "Departamento Geral do Pessoal - DGP" },
  { value: "SEF", label: "Secretaria de Economia e Finanças - SEF" },
] as const;

// Tipos de Vistoria
export const TIPOS_VISTORIA = [
  "Técnica Regular",
  "Preventiva",
  "De Rotina",
  "De Ordem Superior",
  "Corretiva/Emergencial",
  "Para Recebimento de Obra",
  "Administrativa/Patrimonial",
] as const;

// Especialidades
export const ESPECIALIDADES = [
  "Arquitetura",
  "Engenharia Civil",
  "Engenharia Elétrica",
  "Engenharia Mecânica",
  "Especialidade Indisponível"
] as const;

// Tipos de Documento
export const TIPOS_DOCUMENTO = [
  { value: "DIEx", label: "DIEx" },
  { value: "Mensagem de Texto", label: "Mensagem de Texto" },
  { value: "Outros", label: "Outros" }
] as const;

// OM Executoras
export const OM_EXECUTORAS = [
  { value: "CRO 1", label: "Comissão Regional de Obras 1 (CRO 1)" },
  { value: "5º Gpt E", label: "5º Grupamento de Engenharia (5º Gpt E)" },
] as const;

// Natureza do Objeto
export const NATUREZA_OBJETO = [
  "Construção Nova",
  "Reforma",
  "Ampliação",
  "Manutenção Corretiva",
  "Manutenção Preventiva",
  "Projeto Especial",
] as const;

// Prioridades
export const PRIORIDADES = ["Alta", "Média", "Baixa"] as const;

// Classificação de Urgência
export const CLASSIFICACAO_URGENCIA = [
  "Prioritário",
  "Não Prioritário",
  "Urgente",
  "Urgentíssimo"
] as const;

// Validação de Arquivos
export const FILE_VALIDATION = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: {
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    IMAGES: ['image/jpeg', 'image/png'],
    CAD: ['image/vnd.dwg', 'application/acad'],
  },
  ALL_ACCEPTED: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/vnd.dwg',
  ] as const,
} as const;

// Cores para Status de Projetos
export const STATUS_COLORS = {
  "Em Andamento": "#22c55e",
  "Em Pausa": "#eab308",
  "Concluído": "#3b82f6",
  "Cancelado": "#ef4444",
} as const;
