import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjetoCard } from "@/components/projetos/ProjetoCard";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Filter, Download, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { exportProjetosToExcel } from "@/lib/projetoExportUtils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 20;

export default function ProjetosLista() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filtros básicos
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "todos");
  const [diretoriaFilter, setDiretoriaFilter] = useState(searchParams.get("diretoria") || "todos");
  
  // Filtros avançados
  const [valorMin, setValorMin] = useState(Number(searchParams.get("minValor")) || 0);
  const [valorMax, setValorMax] = useState(Number(searchParams.get("maxValor")) || 10000000);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : undefined
  );
  const [omExecutoraFilter, setOmExecutoraFilter] = useState(searchParams.get("omExecutora") || "todos");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
  );
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    fetchProjetos();
  }, [currentPage, searchTerm, statusFilter, diretoriaFilter, omExecutoraFilter, sortBy, sortOrder, valorMin, valorMax, dateFrom, dateTo]);

  useEffect(() => {
    // Atualizar URL com filtros
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (statusFilter !== "todos") params.status = statusFilter;
    if (diretoriaFilter !== "todos") params.diretoria = diretoriaFilter;
    if (omExecutoraFilter !== "todos") params.omExecutora = omExecutoraFilter;
    if (valorMin > 0) params.minValor = valorMin.toString();
    if (valorMax < 10000000) params.maxValor = valorMax.toString();
    if (dateFrom) params.dateFrom = dateFrom.toISOString();
    if (dateTo) params.dateTo = dateTo.toISOString();
    if (sortBy !== "created_at") params.sortBy = sortBy;
    if (sortOrder !== "desc") params.sortOrder = sortOrder;
    
    setSearchParams(params);
  }, [searchTerm, statusFilter, diretoriaFilter, omExecutoraFilter, valorMin, valorMax, dateFrom, dateTo, sortBy, sortOrder]);

  const fetchProjetos = async () => {
    try {
      setLoading(true);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from("projetos")
        .select(`
          *,
          organizacao:organizacoes(*)
        `, { count: 'exact' });

      // Aplicar filtros
      if (searchTerm) {
        query = query.or(`numero_opus.ilike.%${searchTerm}%,objeto.ilike.%${searchTerm}%`);
      }
      if (statusFilter !== "todos") {
        query = query.eq("status", statusFilter);
      }
      if (diretoriaFilter !== "todos") {
        query = query.eq("diretoria_responsavel", diretoriaFilter);
      }
      if (omExecutoraFilter !== "todos") {
        query = query.eq("om_executora", omExecutoraFilter);
      }
      if (valorMin > 0 || valorMax < 10000000) {
        query = query.gte("valor_estimado_dfd", valorMin).lte("valor_estimado_dfd", valorMax);
      }
      if (dateFrom) {
        query = query.gte("created_at", dateFrom.toISOString());
      }
      if (dateTo) {
        query = query.lte("created_at", dateTo.toISOString());
      }

      // Ordenação
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Paginação
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setProjetos(data || []);
      setTotalCount(count || 0);
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

  const handleExport = (format: "excel" | "pdf") => {
    if (format === "excel") {
      exportProjetosToExcel(projetos);
      toast({
        title: "Exportação concluída",
        description: "Lista de projetos exportada para Excel",
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("todos");
    setDiretoriaFilter("todos");
    setOmExecutoraFilter("todos");
    setValorMin(0);
    setValorMax(10000000);
    setDateFrom(undefined);
    setDateTo(undefined);
    setSortBy("created_at");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    searchTerm,
    statusFilter !== "todos" ? statusFilter : null,
    diretoriaFilter !== "todos" ? diretoriaFilter : null,
    omExecutoraFilter !== "todos" ? omExecutoraFilter : null,
    valorMin > 0 ? "min" : null,
    valorMax < 10000000 ? "max" : null,
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalCount);

  const renderPaginationItems = () => {
    const items = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => setCurrentPage(1)}
            isActive={currentPage === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(<PaginationEllipsis key="ellipsis1" />);
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => setCurrentPage(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(<PaginationEllipsis key="ellipsis2" />);
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => setCurrentPage(totalPages)}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  if (loading && currentPage === 1) {
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
            {totalCount} projeto(s) encontrado(s)
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                Exportar para Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => navigate("/projetos/novo")}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </div>
      </div>

      {/* Filtros Básicos */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por OPUS ou objeto..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select 
          value={statusFilter} 
          onValueChange={(val) => {
            setStatusFilter(val);
            setCurrentPage(1);
          }}
        >
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
        <Select 
          value={diretoriaFilter} 
          onValueChange={(val) => {
            setDiretoriaFilter(val);
            setCurrentPage(1);
          }}
        >
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
        <Button
          variant="outline"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros Avançados
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filtros Avançados */}
      {showAdvancedFilters && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filtros Avançados</h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Faixa de Valor */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Faixa de Valor (DFD)</label>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={10000000}
                    step={100000}
                    value={[valorMin, valorMax]}
                    onValueChange={([min, max]) => {
                      setValorMin(min);
                      setValorMax(max);
                      setCurrentPage(1);
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>R$ {valorMin.toLocaleString("pt-BR")}</span>
                    <span>R$ {valorMax.toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              </div>

              {/* Período de Criação */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Período de Criação</label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateFrom && "text-muted-foreground"
                        )}
                      >
                        {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "De"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFrom}
                        onSelect={(date) => {
                          setDateFrom(date);
                          setCurrentPage(1);
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateTo && "text-muted-foreground"
                        )}
                      >
                        {dateTo ? format(dateTo, "dd/MM/yyyy") : "Até"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateTo}
                        onSelect={(date) => {
                          setDateTo(date);
                          setCurrentPage(1);
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* OM Executora */}
              <div className="space-y-2">
                <label className="text-sm font-medium">OM Executora</label>
                <Select 
                  value={omExecutoraFilter} 
                  onValueChange={(val) => {
                    setOmExecutoraFilter(val);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    <SelectItem value="CRO 1">CRO 1</SelectItem>
                    <SelectItem value="5º Gpt E">5º Gpt E</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenação */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Ordenar por</label>
                <div className="flex gap-2">
                  <Select 
                    value={sortBy} 
                    onValueChange={(val) => {
                      setSortBy(val);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Data de Criação</SelectItem>
                      <SelectItem value="valor_estimado_dfd">Valor Estimado</SelectItem>
                      <SelectItem value="numero_opus">Número OPUS</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={sortOrder} 
                    onValueChange={(val: "asc" | "desc") => {
                      setSortOrder(val);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Crescente</SelectItem>
                      <SelectItem value="desc">Decrescente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Lista de Projetos */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : projetos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum projeto encontrado</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projetos.map((projeto) => (
              <ProjetoCard key={projeto.id} projeto={projeto} />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Mostrando {startItem} a {endItem} de {totalCount} projetos
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {renderPaginationItems()}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
