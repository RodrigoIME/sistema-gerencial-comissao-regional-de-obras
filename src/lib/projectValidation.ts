import { z } from "zod";

// Schema de validação completo para projetos
export const projetoSchema = z.object({
  // Informações Básicas
  numero_opus: z.string()
    .min(1, "Número OPUS é obrigatório")
    .regex(/^[0-9]+$/, "Número OPUS deve conter apenas números"),
  
  objeto: z.string()
    .min(10, "O objeto deve ter no mínimo 10 caracteres")
    .max(1000, "Máximo de 1000 caracteres"),
  
  organizacao_id: z.number()
    .min(1, "Selecione uma Organização Militar"),
  
  diretoria_responsavel: z.enum(["COLOG", "COTER", "DCT", "DEC", "DECEx", "DGP", "SEF"], {
    required_error: "Selecione a Diretoria Responsável"
  }),
  
  // Dados Orçamentários
  valor_estimado_dfd: z.number()
    .positive("Valor deve ser maior que zero")
    .max(999999999999.99, "Valor muito alto"),
  
  plano_orcamentario: z.string()
    .min(1, "Plano Orçamentário é obrigatório"),
  
  acao_orcamentaria: z.string()
    .min(1, "Ação Orçamentária é obrigatória"),
  
  recursos_previstos_2025: z.number()
    .nonnegative("Valor não pode ser negativo")
    .max(999999999999.99, "Valor muito alto"),
  
  pro: z.string().optional(),
  
  natureza_objeto: z.enum([
    "Construção Nova",
    "Reforma",
    "Ampliação",
    "Manutenção Corretiva",
    "Manutenção Preventiva",
    "Projeto Especial"
  ], {
    required_error: "Selecione a natureza do objeto"
  }),
  
  // OM Executora e Equipe
  om_executora: z.enum(["CRO 1", "5º Gpt E"], {
    required_error: "Selecione a OM Executora"
  }),
  
  arquiteto: z.string().optional(),
  engenheiro_civil: z.string().optional(),
  engenheiro_eletricista: z.string().optional(),
  engenheiro_mecanico: z.string().optional(),
  
  // Controle
  prioridade: z.enum(["Alta", "Média", "Baixa"]).default("Média"),
  observacoes_iniciais: z.string().optional(),
  
  // Checkboxes
  esta_no_pca_2025: z.boolean().default(false),
  esta_no_dfd: z.boolean().default(false),
  foi_lancado_opus: z.boolean().default(false),
  data_lancamento_opus: z.date().optional(),
  
  // Prazos
  prazo_inicial: z.date().optional(),
  prazo_previsto: z.date().optional(),
});

export type ProjetoFormData = z.infer<typeof projetoSchema>;

// Schema para mudança de status
export const statusChangeSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("Em Andamento"),
  }),
  z.object({
    status: z.literal("Em Pausa"),
    motivo_pausa: z.string().min(10, "Motivo da pausa é obrigatório (mín. 10 caracteres)"),
  }),
  z.object({
    status: z.literal("Concluído"),
    data_conclusao: z.date(),
    prazo_real_conclusao: z.date().optional(),
  }),
  z.object({
    status: z.literal("Cancelado"),
    motivo_cancelamento: z.string().min(10, "Motivo do cancelamento é obrigatório (mín. 10 caracteres)"),
  }),
]);

export type StatusChangeData = z.infer<typeof statusChangeSchema>;

// Validação de arquivos anexos
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export const validarArquivo = (file: File): { valid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `Arquivo muito grande. Máximo: 10MB` };
  }
  
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: "Tipo não permitido. Use: PDF, JPG, PNG, DOCX ou XLSX" };
  }
  
  return { valid: true };
};
