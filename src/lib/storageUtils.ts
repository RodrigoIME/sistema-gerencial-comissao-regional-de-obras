import { supabase } from "@/integrations/supabase/client";

const BUCKET_NAME = "projetos-anexos";

export interface ProjetoAnexo {
  id: string;
  projeto_id: string;
  nome_arquivo: string;
  url: string;
  tipo: string;
  tamanho: number;
  uploaded_by: string;
  uploaded_at: string;
}

export const uploadProjetoAnexo = async (
  projetoId: string,
  file: File,
  userId: string
): Promise<{ success: boolean; error?: string; anexo?: ProjetoAnexo }> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${projetoId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload para o storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file);

    if (uploadError) {
      console.error("Erro no upload:", uploadError);
      return { success: false, error: uploadError.message };
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    // Registrar na tabela projetos_anexos
    const { data, error: dbError } = await supabase
      .from("projetos_anexos")
      .insert({
        projeto_id: projetoId,
        nome_arquivo: file.name,
        url: urlData.publicUrl,
        tipo: file.type,
        tamanho: file.size,
        uploaded_by: userId,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Erro ao salvar registro:", dbError);
      // Tentar deletar arquivo do storage
      await supabase.storage.from(BUCKET_NAME).remove([fileName]);
      return { success: false, error: dbError.message };
    }

    return { success: true, anexo: data };
  } catch (error) {
    console.error("Erro inesperado:", error);
    return { success: false, error: "Erro inesperado ao fazer upload" };
  }
};

export const getProjetoAnexos = async (
  projetoId: string
): Promise<{ success: boolean; anexos?: ProjetoAnexo[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from("projetos_anexos")
      .select("*")
      .eq("projeto_id", projetoId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar anexos:", error);
      return { success: false, error: error.message };
    }

    return { success: true, anexos: data || [] };
  } catch (error) {
    console.error("Erro inesperado:", error);
    return { success: false, error: "Erro ao buscar anexos" };
  }
};

export const downloadProjetoAnexo = async (
  filePath: string,
  fileName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath);

    if (error) {
      console.error("Erro ao fazer download:", error);
      return { success: false, error: error.message };
    }

    // Criar link temporário e iniciar download
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Erro inesperado:", error);
    return { success: false, error: "Erro ao fazer download" };
  }
};

export const deleteProjetoAnexo = async (
  anexoId: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Deletar do storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (storageError) {
      console.error("Erro ao deletar do storage:", storageError);
      return { success: false, error: storageError.message };
    }

    // Deletar registro do banco
    const { error: dbError } = await supabase
      .from("projetos_anexos")
      .delete()
      .eq("id", anexoId);

    if (dbError) {
      console.error("Erro ao deletar registro:", dbError);
      return { success: false, error: dbError.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro inesperado:", error);
    return { success: false, error: "Erro ao deletar anexo" };
  }
};

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ACCEPTED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/acad",
    "application/x-acad",
    "application/autocad_dwg",
    "image/x-dwg",
  ];

  if (file.size > MAX_SIZE) {
    return { valid: false, error: "Arquivo muito grande. Máximo: 10MB" };
  }

  if (!ACCEPTED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.dwg')) {
    return {
      valid: false,
      error: "Tipo não aceito. Use: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG ou DWG",
    };
  }

  return { valid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};
