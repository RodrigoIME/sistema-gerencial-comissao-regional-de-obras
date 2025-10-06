import { z } from "zod";

// Schema de validação completo
export const novaSolicitacaoSchema = z.object({
  // NOVO - número da vistoria (primeiro campo)
  numeroVistoria: z.string()
    .min(1, "Número da vistoria é obrigatório")
    .max(50, "Máximo de 50 caracteres"),
  
  objeto: z.string()
    .min(10, "O objeto deve ter no mínimo 10 caracteres")
    .max(500, "Máximo de 500 caracteres"),
  
  organizacaoId: z.string()
    .min(1, "Selecione uma Organização Militar"),
  
  enderecoCompleto: z.string()
    .min(10, "Digite o endereço completo (mínimo 10 caracteres)")
    .max(500, "Endereço muito longo (máximo 500 caracteres)"),
  
  contatoNome: z.string()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome muito longo"),
  
  contatoTelefone: z.string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Formato: (00) 00000-0000"),
  
  // Email OPCIONAL
  contatoEmail: z.string()
    .email("Email inválido")
    .optional()
    .or(z.literal("")),
  
  dataSolicitacao: z.date(),
  
  classificacaoUrgencia: z.enum(["Normal", "Prioritário", "Urgente", "Urgentíssimo"], {
    required_error: "Selecione a prioridade de atendimento"
  }),
  
  justificativaUrgencia: z.string().optional(),
  
  // NOVO - tipo de documento origem
  tipoDocumentoOrigem: z.enum(["DIEx", "Mensagem de Texto", "Outros"], {
    required_error: "Selecione o tipo de documento"
  }),
  
  // Campos condicionais para DIEx
  diexNumero: z.string().optional(),
  diexAssunto: z.string().optional(),
  diexData: z.string().optional(), // ISO date string
  diexOrganizacaoMilitar: z.string().optional(),
  
  // Campos condicionais para Mensagem de Texto
  mensagemTelefone: z.string().optional(),
  mensagemResponsavel: z.string().optional(),
  
  documentoOrigemDados: z.string().optional(),
  
  // NOVO - especialidades (array)
  especialidadesEnvolvidas: z.array(z.string())
    .min(1, "Selecione ao menos uma especialidade"),
  
  numeroReferenciaOpous: z.string().optional(),
  
  tipoVistoria: z.string()
    .min(1, "Selecione o tipo de vistoria"),
  
  // REMOVIDO: objetivoVistoria
})
.refine((data) => {
  // Validação condicional: justificativa obrigatória se Urgente ou Urgentíssimo
  if (data.classificacaoUrgencia === "Urgente" || data.classificacaoUrgencia === "Urgentíssimo") {
    return data.justificativaUrgencia && data.justificativaUrgencia.length >= 20;
  }
  return true;
}, {
  message: "Justificativa obrigatória para solicitações urgentes ou urgentíssimas (mínimo 20 caracteres)",
  path: ["justificativaUrgencia"],
})
.refine((data) => {
  // Se tipo de documento é DIEx, validar campos obrigatórios
  if (data.tipoDocumentoOrigem === "DIEx") {
    return data.diexNumero && data.diexAssunto && data.diexData && data.diexOrganizacaoMilitar;
  }
  return true;
}, {
  message: "Preencha todos os campos obrigatórios do DIEx",
  path: ["diexNumero"]
})
.refine((data) => {
  // Se tipo de documento é Mensagem, validar campos obrigatórios
  if (data.tipoDocumentoOrigem === "Mensagem de Texto") {
    return data.mensagemTelefone && data.mensagemResponsavel;
  }
  return true;
}, {
  message: "Preencha todos os campos da mensagem de texto",
  path: ["mensagemTelefone"]
});

export type NovaSolicitacaoFormData = z.infer<typeof novaSolicitacaoSchema>;

// Validação de arquivos
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const validarArquivo = (file: File): { valid: boolean; error?: string } => {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `Arquivo muito grande. Máximo: 10MB` };
  }
  
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: "Tipo não permitido. Use: PDF, JPG, PNG ou DOCX" };
  }
  
  return { valid: true };
};
