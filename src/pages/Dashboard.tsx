import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, Clock, Paperclip, CalendarIcon, Filter, TrendingUp, ChevronDown, Trophy } from "lucide-react";
import { toast } from "sonner";
import { format, startOfYear, endOfYear } from "date-fns";
import { cn } from "@/lib/utils";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, LabelList, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Organizacao {
  id: number;
  "Organização Militar": string;
  "Órgão Setorial Responsável": string;
  "Sigla da OM": string;
}

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSolicitacoes: 0,
    totalVistorias: 0,
    totalAnexos: 0,
    pendentes: 0,
    finalizadas: 0,
    emExecucao: 0,
  });

  const [startDate, setStartDate] = useState<Date>(startOfYear(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfYear(new Date()));
  const [selectedOM, setSelectedOM] = useState<string>("all");
  const [selectedOrgaoSetorial, setSelectedOrgaoSetorial] = useState<string>("all");
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [omData, setOMData] = useState<any[]>([]);
  const [allOMData, setAllOMData] = useState<any[]>([]);
  const [orgaoSetorialData, setOrgaoSetorialData] = useState<any[]>([]);
  const [isLoadingOrganizacoes, setIsLoadingOrganizacoes] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isOMTableOpen, setIsOMTableOpen] = useState(false);

  // Paleta de cores para os gráficos
  const OM_COLORS = [
    '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6',
    '#EF4444', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  ];

  const ORGAO_COLORS = [
    '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444',
  ];

  useEffect(() => {
    fetchOrganizacoes();
  }, []);

  useEffect(() => {
    // Aguarda organizacoes serem carregadas antes de buscar dados
    if (organizacoes.length === 0) return;

    console.log('🔄 [Dashboard] Iniciando carregamento de dados', {
      organizacoesCount: organizacoes.length,
      filtros: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        selectedOM,
        selectedOrgaoSetorial
      }
    });

    const fetchAllData = async () => {
      setIsLoadingData(true);
      try {
        await Promise.all([
          fetchStats(),
          fetchMonthlyData(),
          fetchOMData(),
          fetchOrgaoSetorialData(),
        ]);
        console.log('✅ [Dashboard] Dados carregados com sucesso');
      } catch (error) {
        console.error('❌ [Dashboard] Erro ao carregar dados:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchAllData();
  }, [startDate, endDate, selectedOM, selectedOrgaoSetorial, organizacoes]);

  const fetchOrganizacoes = async () => {
    console.log('🔄 [Dashboard] Carregando organizações...');
    setIsLoadingOrganizacoes(true);
    try {
      const { data, error } = await supabase
        .from("organizacoes")
        .select("*")
        .order('"Organização Militar"');

      if (error) throw error;
      console.log('✅ [Dashboard] Organizações carregadas:', data?.length || 0);
      setOrganizacoes(data || []);
    } catch (error) {
      console.error('❌ [Dashboard] Erro ao carregar organizações:', error);
      toast.error("Erro ao carregar organizações");
    } finally {
      setIsLoadingOrganizacoes(false);
    }
  };

  const applyFilters = (data: any[]) => {
    const filtered = data.filter((item) => {
      const itemDate = new Date(item.data_solicitacao);
      const matchesDate = (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
      const matchesOM = selectedOM === "all" || item.organizacao_id === parseInt(selectedOM);
      return matchesDate && matchesOM;
    });
    
    console.log('🔍 [Dashboard] Filtros aplicados:', {
      total: data.length,
      filtrados: filtered.length,
      diferenca: data.length - filtered.length
    });
    
    return filtered;
  };

  const fetchStats = async () => {
    try {
      console.log('📊 [Dashboard] Buscando estatísticas...');
      const { data: allSolicitacoes, error } = await supabase
        .from("solicitacoes")
        .select("data_solicitacao, status, organizacao_id");

      if (error) throw error;

      const filtered = applyFilters(allSolicitacoes || []);

      const pendentes = filtered.filter((s) => s.status === "pending").length;
      const finalizadas = filtered.filter((s) => s.status === "completed").length;
      const emExecucao = filtered.filter((s) => s.status === "in_progress").length;

      const { count: vistoriasCount } = await supabase
        .from("vistorias")
        .select("*", { count: "exact", head: true });

      const { count: anexosCount } = await supabase
        .from("anexos")
        .select("*", { count: "exact", head: true });

      const stats = {
        totalSolicitacoes: filtered.length,
        totalVistorias: vistoriasCount || 0,
        totalAnexos: anexosCount || 0,
        pendentes,
        finalizadas,
        emExecucao,
      };
      
      console.log('✅ [Dashboard] Estatísticas:', stats);
      setStats(stats);
    } catch (error: any) {
      console.error('❌ [Dashboard] Erro ao carregar estatísticas:', error);
      toast.error("Erro ao carregar estatísticas");
    }
  };

  const fetchMonthlyData = async () => {
    try {
      console.log('📈 [Dashboard] Buscando dados mensais...');
      const { data, error } = await supabase
        .from("solicitacoes")
        .select("data_solicitacao, status, organizacao_id");

      if (error) throw error;

      const filtered = applyFilters(data || []);

      // Agregar por mês (Recebidas vs Realizadas)
      const monthlyStats: Record<string, { Recebidas: number; Realizadas: number }> = {};
      
      filtered.forEach((item: any) => {
        const date = new Date(item.data_solicitacao);
        const monthKey = format(date, "MMM/yy");
        
        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = { Recebidas: 0, Realizadas: 0 };
        }
        
        monthlyStats[monthKey].Recebidas++;
        if (item.status === "completed") {
          monthlyStats[monthKey].Realizadas++;
        }
      });

      // Converter para array ordenado por data
      const chartData = Object.entries(monthlyStats)
        .map(([mes, counts]) => ({
          mes,
          Recebidas: counts.Recebidas,
          Realizadas: counts.Realizadas,
        }))
        .sort((a, b) => {
          const [aMonth, aYear] = a.mes.split('/');
          const [bMonth, bYear] = b.mes.split('/');
          return new Date(`20${aYear}-${aMonth}-01`).getTime() - new Date(`20${bYear}-${bMonth}-01`).getTime();
        });

      console.log('✅ [Dashboard] Dados mensais processados:', chartData);
      setMonthlyData(chartData);
    } catch (error) {
      console.error("❌ [Dashboard] Erro ao buscar dados mensais:", error);
    }
  };

  const fetchOMData = async () => {
    try {
      console.log('🏢 [Dashboard] Buscando dados por OM...');
      const { data: solicitacoes, error } = await supabase
        .from("solicitacoes")
        .select("organizacao_id, data_solicitacao");

      if (error) throw error;

      const filtered = applyFilters(solicitacoes || []);

      const omCounts: Record<number, number> = {};
      filtered.forEach((item) => {
        if (item.organizacao_id) {
          omCounts[item.organizacao_id] = (omCounts[item.organizacao_id] || 0) + 1;
        }
      });

      const total = filtered.length;
      const allData = organizacoes
        .filter((org) => omCounts[org.id])
        .map((org) => ({
          om: org["Sigla da OM"],
          name: org["Organização Militar"],
          value: omCounts[org.id],
          percentage: total > 0 ? ((omCounts[org.id] / total) * 100).toFixed(1) : '0.0',
        }))
        .sort((a, b) => b.value - a.value);

      // Separar top 10 e outros
      const top10 = allData.slice(0, 10);
      const outros = allData.slice(10);
      
      // Criar entrada "Outros" se houver mais de 10 OMs
      const chartData = [...top10];
      if (outros.length > 0) {
        const outrosTotal = outros.reduce((sum, item) => sum + item.value, 0);
        const outrosPercentage = total > 0 ? ((outrosTotal / total) * 100).toFixed(1) : '0.0';
        chartData.push({
          om: `Outros (${outros.length})`,
          name: `Outras ${outros.length} Organizações Militares`,
          value: outrosTotal,
          percentage: outrosPercentage,
        });
      }

      console.log('✅ [Dashboard] Dados por OM processados:', allData.length, 'organizações (mostrando top 10)');
      setOMData(chartData);
      setAllOMData(allData);
    } catch (error) {
      console.error("❌ [Dashboard] Erro ao buscar dados por OM:", error);
    }
  };

  const fetchOrgaoSetorialData = async () => {
    try {
      console.log('🏛️ [Dashboard] Buscando dados por Órgão Setorial...');
      const { data: solicitacoes, error } = await supabase
        .from("solicitacoes")
        .select("organizacao_id, data_solicitacao");

      if (error) throw error;

      const filtered = applyFilters(solicitacoes || []);

      const setorialCounts: Record<string, number> = {};
      filtered.forEach((item) => {
        const org = organizacoes.find((o) => o.id === item.organizacao_id);
        if (org) {
          const setorial = org["Órgão Setorial Responsável"];
          setorialCounts[setorial] = (setorialCounts[setorial] || 0) + 1;
        }
      });

      const total = filtered.length;
      const chartData = Object.entries(setorialCounts).map(([orgao, count]) => ({
        orgao,
        Total: count,
        percentage: total > 0 ? (((count as number) / total) * 100).toFixed(1) : '0.0',
      }));

      if (selectedOrgaoSetorial !== "all") {
        const filteredData = chartData.filter((item) => item.orgao === selectedOrgaoSetorial);
        console.log('✅ [Dashboard] Dados por Órgão Setorial processados (filtrado):', filteredData.length);
        setOrgaoSetorialData(filteredData);
      } else {
        console.log('✅ [Dashboard] Dados por Órgão Setorial processados:', chartData.length, 'órgãos');
        setOrgaoSetorialData(chartData);
      }
    } catch (error) {
      console.error("❌ [Dashboard] Erro ao buscar dados por Órgão Setorial:", error);
    }
  };

  const orgaosSetoriais = Array.from(new Set(organizacoes.map((o) => o["Órgão Setorial Responsável"])));

  const cards = [
    {
      title: "Vistorias Recebidas",
      value: stats.totalSolicitacoes,
      icon: FileText,
      gradient: "from-primary to-primary/80",
    },
    {
      title: "Vistorias Finalizadas",
      value: stats.finalizadas,
      icon: CheckCircle2,
      gradient: "from-secondary to-secondary/80",
    },
    {
      title: "Vistorias Pendentes",
      value: stats.pendentes,
      icon: Clock,
      gradient: "from-accent to-accent/80",
    },
    {
      title: "Em Execução",
      value: stats.emExecucao,
      icon: TrendingUp,
      gradient: "from-purple-500 to-purple-400",
    },
  ];

  return (
    <div 
      className="min-h-[calc(100vh-8rem)] bg-cover bg-center bg-no-repeat relative -m-6 p-6"
      style={{ backgroundImage: 'url(/dashboard-bg.jpg)' }}
    >
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      <div className="relative z-10 space-y-8 animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral do sistema de inspeções com filtros e análises
          </p>
        </div>

      {/* Filtros */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Período Inicial */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Período Inicial</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy") : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Período Final */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Período Final</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy") : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Organização Militar */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Organização Militar</label>
              <Select value={selectedOM} onValueChange={setSelectedOM}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">Todas</SelectItem>
                  {organizacoes.map((org) => (
                    <SelectItem key={org.id} value={org.id.toString()}>
                      {org["Organização Militar"]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Órgão Setorial */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Órgão Setorial</label>
              <Select value={selectedOrgaoSetorial} onValueChange={setSelectedOrgaoSetorial}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">Todos</SelectItem>
                  {orgaosSetoriais.map((orgao) => (
                    <SelectItem key={orgao} value={orgao}>
                      {orgao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicadores Rápidos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isLoadingOrganizacoes || isLoadingData ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="w-10 h-10 rounded-xl" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          // Actual cards
          cards.map((card, index) => (
            <Card
              key={card.title}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}
                >
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Gráfico Mensal */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Vistorias por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : monthlyData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              <p>Nenhum dado disponível para o período selecionado</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))" 
                  }}
                />
                <Legend />
                <Bar dataKey="Recebidas" fill="#8B5CF6" />
                <Bar dataKey="Realizadas" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Gráficos por OM e Órgão Setorial */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico por OM */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Vistorias por Organização Militar</span>
              {allOMData.length > 0 && (
                <Badge variant="secondary">
                  {allOMData.length} OM{allOMData.length > 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingData ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : omData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>Nenhum dado disponível para o período selecionado</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={omData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="om" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))" 
                      }}
                      formatter={(value: any, name: any, props: any) => [
                        `${value} vistorias (${props.payload.percentage}%)`,
                        props.payload.name
                      ]}
                    />
                    <Bar dataKey="value">
                      <LabelList 
                        dataKey="percentage" 
                        position="top" 
                        formatter={(value: any) => `${value}%`}
                        style={{ fontSize: 11 }}
                      />
                      {omData.map((entry, index) => {
                        const isOutros = entry.om.startsWith('Outros');
                        const color = isOutros ? '#9CA3AF' : OM_COLORS[index % OM_COLORS.length];
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Tabela Expansível */}
                {allOMData.length > 10 && (
                  <Collapsible open={isOMTableOpen} onOpenChange={setIsOMTableOpen}>
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full"
                      >
                        {isOMTableOpen ? 'Ocultar' : 'Ver'} todas as {allOMData.length} OMs
                        <ChevronDown 
                          className={cn(
                            "ml-2 h-4 w-4 transition-transform",
                            isOMTableOpen && "rotate-180"
                          )} 
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4">
                      <div className="border rounded-lg overflow-hidden">
                        <div className="max-h-[400px] overflow-y-auto">
                          <Table>
                            <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur">
                              <TableRow>
                                <TableHead className="w-16 text-center">#</TableHead>
                                <TableHead>Sigla</TableHead>
                                <TableHead>Organização Militar</TableHead>
                                <TableHead className="text-right">Vistorias</TableHead>
                                <TableHead className="text-right">%</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {allOMData.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell className="text-center font-medium">
                                    {index < 3 ? (
                                      <Trophy className={cn(
                                        "h-4 w-4 inline",
                                        index === 0 && "text-yellow-500",
                                        index === 1 && "text-gray-400",
                                        index === 2 && "text-amber-600"
                                      )} />
                                    ) : (
                                      index + 1
                                    )}
                                  </TableCell>
                                  <TableCell className="font-medium">{item.om}</TableCell>
                                  <TableCell className="text-muted-foreground">{item.name}</TableCell>
                                  <TableCell className="text-right font-medium">{item.value}</TableCell>
                                  <TableCell className="text-right">
                                    <Badge variant="secondary">{item.percentage}%</Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Gráfico por Órgão Setorial */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Vistorias por Órgão Setorial</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingData ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : orgaoSetorialData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <p>Nenhum dado disponível para o período selecionado</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={orgaoSetorialData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="orgao" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))" 
                    }}
                    formatter={(value: any, name: any, props: any) => [
                      `${value} vistorias (${props.payload.percentage}%)`,
                      "Total"
                    ]}
                  />
                  <Bar dataKey="Total">
                    <LabelList 
                      dataKey="percentage" 
                      position="top" 
                      formatter={(value: any) => `${value}%`}
                    />
                    {orgaoSetorialData.map((entry, index) => {
                      const cor = entry.orgao === 'DGP' ? '#9CA3AF' : ORGAO_COLORS[index % ORGAO_COLORS.length];
                      return <Cell key={`cell-${index}`} fill={cor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
