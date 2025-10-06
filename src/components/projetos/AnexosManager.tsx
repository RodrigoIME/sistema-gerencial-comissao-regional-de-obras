import { useState, useEffect, useCallback } from "react";
import { Upload, File, Download, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import {
  uploadProjetoAnexo,
  getProjetoAnexos,
  deleteProjetoAnexo,
  validateFile,
  formatFileSize,
  ProjetoAnexo,
} from "@/lib/storageUtils";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AnexosManagerProps {
  projetoId: string;
  mode?: "view" | "edit";
}

export const AnexosManager = ({ projetoId, mode = "view" }: AnexosManagerProps) => {
  const [anexos, setAnexos] = useState<ProjetoAnexo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anexoToDelete, setAnexoToDelete] = useState<ProjetoAnexo | null>(null);

  const fetchAnexos = useCallback(async () => {
    setLoading(true);
    const result = await getProjetoAnexos(projetoId);
    if (result.success && result.anexos) {
      setAnexos(result.anexos);
    } else if (result.error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar anexos",
        description: result.error,
      });
    }
    setLoading(false);
  }, [projetoId]);

  useEffect(() => {
    fetchAnexos();
  }, [fetchAnexos]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    setUploading(true);
    setUploadProgress(0);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Usuário não autenticado",
      });
      setUploading(false);
      return;
    }

    const totalFiles = files.length;
    let uploadedCount = 0;
    let errorCount = 0;

    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast({
          variant: "destructive",
          title: `Erro em ${file.name}`,
          description: validation.error,
        });
        errorCount++;
        uploadedCount++;
        setUploadProgress((uploadedCount / totalFiles) * 100);
        continue;
      }

      const result = await uploadProjetoAnexo(projetoId, file, user.id);
      if (result.success) {
        toast({
          title: "Upload concluído",
          description: `${file.name} enviado com sucesso!`,
        });
      } else {
        toast({
          variant: "destructive",
          title: `Erro ao enviar ${file.name}`,
          description: result.error,
        });
        errorCount++;
      }

      uploadedCount++;
      setUploadProgress((uploadedCount / totalFiles) * 100);
    }

    if (errorCount === 0) {
      toast({
        title: "Sucesso!",
        description: `${totalFiles} arquivo(s) enviado(s) com sucesso`,
      });
    }

    setUploading(false);
    setUploadProgress(0);
    await fetchAnexos();
  };

  const handleDelete = async () => {
    if (!anexoToDelete) return;

    // Extrair o caminho do arquivo da URL
    const urlParts = anexoToDelete.url.split("/");
    const bucketIndex = urlParts.indexOf("projetos-anexos");
    const filePath = urlParts.slice(bucketIndex + 1).join("/");

    const result = await deleteProjetoAnexo(anexoToDelete.id, filePath);
    
    if (result.success) {
      toast({
        title: "Anexo deletado",
        description: "Arquivo removido com sucesso",
      });
      await fetchAnexos();
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao deletar",
        description: result.error,
      });
    }

    setDeleteDialogOpen(false);
    setAnexoToDelete(null);
  };

  const handleDownload = async (anexo: ProjetoAnexo) => {
    // Extrair o caminho do arquivo da URL
    const urlParts = anexo.url.split("/");
    const bucketIndex = urlParts.indexOf("projetos-anexos");
    const filePath = urlParts.slice(bucketIndex + 1).join("/");

    // Criar link e forçar download
    const { data } = supabase.storage
      .from("projetos-anexos")
      .getPublicUrl(filePath);

    const link = document.createElement('a');
    link.href = data.publicUrl;
    link.download = anexo.nome_arquivo;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download iniciado",
      description: anexo.nome_arquivo,
    });
  };

  const getFileIcon = (tipo: string) => {
    if (tipo.includes("pdf")) return "📄";
    if (tipo.includes("image")) return "🖼️";
    if (tipo.includes("word") || tipo.includes("document")) return "📝";
    if (tipo.includes("excel") || tipo.includes("spreadsheet")) return "📊";
    if (tipo.includes("dwg") || tipo.includes("acad")) return "📐";
    return "📎";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {mode === "edit" && (
        <Card>
          <CardContent className="pt-6">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Arraste arquivos aqui ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Máximo 10MB por arquivo. Formatos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, DWG
              </p>
              <input
                type="file"
                multiple
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.dwg"
              />
              <label htmlFor="file-upload">
                <Button asChild disabled={uploading}>
                  <span>Selecionar Arquivos</span>
                </Button>
              </label>
            </div>

            {uploading && (
              <div className="mt-4">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Enviando... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {anexos.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhum anexo encontrado para este projeto.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {anexos.map((anexo) => (
            <Card key={anexo.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">{getFileIcon(anexo.tipo)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" title={anexo.nome_arquivo}>
                      {anexo.nome_arquivo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(anexo.tamanho)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(anexo.uploaded_at), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(anexo)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                  {mode === "edit" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setAnexoToDelete(anexo);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o arquivo "{anexoToDelete?.nome_arquivo}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
