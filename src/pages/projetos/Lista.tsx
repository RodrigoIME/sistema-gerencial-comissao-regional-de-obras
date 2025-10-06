import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjetoCard } from "@/components/projetos/ProjetoCard";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProjetosLista() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [filteredProjetos, setFilteredProjetos] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [diretoriaFilter, setDiretoriaFilter] = useState<string>("todos");

  useEffect(() => {
    fetchProjetos();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, diretoriaFilter, projetos]);

  const fetchProjetos = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("projetos")
        .select(`
          *,
          organizacao:organizacoes(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProjetos(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar projetos:", error);
      toast({
        title: "Erro ao carregar projetos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...projetos];

    // Filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.numero_opus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.objeto?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro de status
    if (statusFilter !== "todos") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Filtro de diretoria
    if (diretoriaFilter !== "todos") {
      filtered = filtered.filter((p) => p.diretoria_responsavel === diretoriaFilter);
    }

    setFilteredProjetos(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projetos</h1>
          <p className="text-muted-foreground">
            {filteredProjetos.length} projeto(s) encontrado(s)
          </p>
        </div>
        <Button onClick={() => navigate("/projetos/novo")}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por OPUS ou objeto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="Em Andamento">Em Andamento</SelectItem>
            <SelectItem value="Em Pausa">Em Pausa</SelectItem>
            <SelectItem value="Concluído">Concluído</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={diretoriaFilter} onValueChange={setDiretoriaFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filtrar por diretoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as diretorias</SelectItem>
            <SelectItem value="COLOG">COLOG</SelectItem>
            <SelectItem value="COTER">COTER</SelectItem>
            <SelectItem value="DCT">DCT</SelectItem>
            <SelectItem value="DEC">DEC</SelectItem>
            <SelectItem value="DECEx">DECEx</SelectItem>
            <SelectItem value="DGP">DGP</SelectItem>
            <SelectItem value="SEF">SEF</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Projetos */}
      {filteredProjetos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum projeto encontrado</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjetos.map((projeto) => (
            <ProjetoCard key={projeto.id} projeto={projeto} />
          ))}
        </div>
      )}
    </div>
  );
}
