import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, Clock, CalendarIcon, Filter, TrendingUp, ChevronDown, Trophy } from "lucide-react";
import { format, startOfYear, endOfYear } from "date-fns";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Cell } from "recharts";
import { useOrganizacoes } from "@/hooks/useOrganizacoes";
import { useDashboardData } from "@/hooks/useDashboardData";

const Dashboard = () => {
  const [startDate, setStartDate] = useState<Date>(startOfYear(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfYear(new Date()));
  const [selectedOM, setSelectedOM] = useState<string>("all");
  const [selectedOrgaoSetorial, setSelectedOrgaoSetorial] = useState<string>("all");
  const [isOMTableOpen, setIsOMTableOpen] = useState(false);

  // Buscar organizações com React Query
  const { data: organizacoes = [], isLoading: isLoadingOrganizacoes } = useOrganizacoes();

  // Buscar dados do dashboard com React Query
  const { 
    data: dashboardData,
    isLoading: isLoadingData 
  } = useDashboardData(
    { startDate, endDate, selectedOM, selectedOrgaoSetorial },
    organizacoes
  );

  // Extrair dados do hook ou usar valores padrão
  const stats = dashboardData?.stats || {
    totalSolicitacoes: 0,
    totalVistorias: 0,
    totalAnexos: 0,
    pendentes: 0,
    finalizadas: 0,
    emExecucao: 0,
  };
  const monthlyData = dashboardData?.monthlyData || [];
  const omData = dashboardData?.omData || [];
  const allOMData = dashboardData?.allOMData || [];
  const orgaoSetorialData = dashboardData?.orgaoSetorialData || [];

  // Paleta de cores para os gráficos
  const OM_COLORS = [
    '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6',
    '#EF4444', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  ];

  const ORGAO_COLORS = [
    '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444',
  ];

  const orgaosSetoriais = Array.from(new Set(organizacoes.map((o) => o.diretoria).filter(Boolean)));

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
                      {org.nome}
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
                    <SelectItem key={orgao || 'unknown'} value={orgao || ''}>
                      {orgao || 'Sem Órgão'}
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
                        const isOutros = entry.om?.startsWith('Outros') || false;
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
