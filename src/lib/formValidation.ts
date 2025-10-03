import { z } from "zod";

// Schema de validação completo
export const novaSolicitacaoSchema = z.object({
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
  
  contatoEmail: z.string()
    .email("Email inválido")
    .toLowerCase(),
  
  dataSolicitacao: z.date(),
  
  classificacaoUrgencia: z.enum(["Prioritário", "Não Prioritário"], {
    required_error: "Selecione a classificação de urgência"
  }),
  
  justificativaUrgencia: z.string().optional(),
  
  documentoOrigemDados: z.string()
    .min(10, "Descreva os dados do documento (mínimo 10 caracteres)")
    .max(500, "Descrição muito longa"),
  
  numeroReferenciaOpous: z.string().optional(),
  
  objetivoVistoria: z.string()
    .min(20, "Descreva o objetivo com mais detalhes (mínimo 20 caracteres)")
    .max(1000, "Objetivo muito longo"),
  
  tipoVistoria: z.string()
    .min(1, "Selecione o tipo de vistoria"),
}).refine((data) => {
  // Validação condicional: justificativa obrigatória se Prioritário
  if (data.classificacaoUrgencia === "Prioritário") {
    return data.justificativaUrgencia && data.justificativaUrgencia.length >= 20;
  }
  return true;
}, {
  message: "Justificativa obrigatória para solicitações prioritárias (mínimo 20 caracteres)",
  path: ["justificativaUrgencia"],
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
