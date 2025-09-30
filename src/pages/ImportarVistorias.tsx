import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as XLSX from 'xlsx';

export default function ImportarVistorias() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "application/vnd.ms-excel"
      ) {
        setFile(selectedFile);
      } else {
        toast.error("Por favor, selecione um arquivo Excel (.xlsx ou .xls)");
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Por favor, selecione um arquivo");
      return;
    }

    setLoading(true);
    setProgress("Lendo arquivo...");

    try {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            throw new Error("Erro ao ler arquivo");
          }

          setProgress("Processando Excel...");
          
          // Ler o arquivo Excel
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          console.log(`Total de linhas no arquivo: ${jsonData.length}`);
          
          setProgress("Importando dados...");
          
          // Enviar dados parseados para a edge function
          const { data: result, error } = await supabase.functions.invoke("importar-vistorias", {
            body: {
              data: jsonData
            }
          });

          if (error) throw error;

          if (result.error) {
            throw new Error(result.error);
          }

          setProgress("Importação concluída!");
          toast.success(`Importação concluída! ${result.imported} de ${result.total} registros importados.`);
          
          if (result.errors && result.errors.length > 0) {
            console.warn("Erros durante importação:", result.errors);
            toast.warning(`Alguns registros apresentaram erros. Verifique o console para detalhes.`);
          }
          
          setTimeout(() => {
            navigate("/solicitacoes");
          }, 2000);
        } catch (err: any) {
          console.error("Erro ao processar:", err);
          toast.error(err.message || "Erro ao processar o arquivo");
          setProgress("");
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        toast.error("Erro ao ler o arquivo");
        setLoading(false);
        setProgress("");
      };
    } catch (error: any) {
      console.error("Erro na importação:", error);
      toast.error(error.message || "Erro ao importar dados");
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6" />
            Importar Dados de Vistorias
          </CardTitle>
          <CardDescription>
            Faça upload do arquivo Excel com os dados de acompanhamento de vistorias técnicas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              O arquivo deve conter as seguintes colunas:
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>OBJETO DE VISTORIA</li>
                <li>OM APOIADA</li>
                <li>Diretoria Responsável</li>
                <li>Classificação da Urgência</li>
                <li>Situação</li>
                <li>ORIGEM DA SOLICITAÇÃO</li>
                <li>DATA DA SOLICITAÇÃO</li>
                <li>REFERÊNCIA OPUS</li>
                <li>OBJETIVO</li>
                <li>OBSERVAÇÕES</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="file">Arquivo Excel</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={loading}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado: {file.name}
              </p>
            )}
          </div>

          {progress && (
            <Alert>
              <AlertDescription>{progress}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button
              onClick={handleImport}
              disabled={!file || loading}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              {loading ? "Importando..." : "Importar Dados"}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/solicitacoes")}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
