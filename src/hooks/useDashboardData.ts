import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import type { Organizacao } from './useOrganizacoes';

export interface DashboardFilters {
  startDate: Date | undefined;
  endDate: Date | undefined;
  selectedOM: string;
  selectedOrgaoSetorial: string;
}

interface Solicitacao {
  id: number;
  data_solicitacao: string;
  status: string;
  organizacao_id: number;
}

// Helper: Aplicar filtros aos dados
const applyFilters = (data: Solicitacao[], filters: DashboardFilters) => {
  const filtered = data.filter((item) => {
    const itemDate = new Date(item.data_solicitacao);
    const matchesDate = 
      (!filters.startDate || itemDate >= filters.startDate) && 
      (!filters.endDate || itemDate <= filters.endDate);
    const matchesOM = 
      filters.selectedOM === "all" || 
      item.organizacao_id === parseInt(filters.selectedOM);
    return matchesDate && matchesOM;
  });

  console.log('🔍 [useDashboardData] Filtros aplicados:', {
    total: data.length,
    filtrados: filtered.length,
  });

  return filtered;
};

// Helper: Calcular estatísticas
const calculateStats = (
  filtered: Solicitacao[],
  vistoriasCount: number,
  anexosCount: number
) => {
  const pendentes = filtered.filter((s) => s.status === "pending").length;
  const finalizadas = filtered.filter((s) => s.status === "completed").length;
  const emExecucao = filtered.filter((s) => s.status === "in_progress").length;

  return {
    totalSolicitacoes: filtered.length,
    totalVistorias: vistoriasCount,
    totalAnexos: anexosCount,
    pendentes,
    finalizadas,
    emExecucao,
  };
};

// Helper: Calcular dados mensais
const calculateMonthlyData = (filtered: Solicitacao[]) => {
  const monthlyStats: Record<string, { Recebidas: number; Realizadas: number }> = {};

  filtered.forEach((item) => {
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

  return Object.entries(monthlyStats)
    .map(([mes, counts]) => ({
      mes,
      Recebidas: counts.Recebidas,
      Realizadas: counts.Realizadas,
    }))
    .sort((a, b) => {
      const [aMonth, aYear] = a.mes.split('/');
      const [bMonth, bYear] = b.mes.split('/');
      return new Date(`20${aYear}-${aMonth}-01`).getTime() - 
             new Date(`20${bYear}-${bMonth}-01`).getTime();
    });
};

// Helper: Calcular dados por OM
const calculateOMData = (filtered: Solicitacao[], organizacoes: Organizacao[]) => {
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
      om: org.sigla,
      name: org.nome,
      value: omCounts[org.id],
      percentage: total > 0 ? ((omCounts[org.id] / total) * 100).toFixed(1) : '0.0',
    }))
    .sort((a, b) => b.value - a.value);

  const top10 = allData.slice(0, 10);
  const outros = allData.slice(10);

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

  return { chartData, allData };
};

// Helper: Calcular dados por Órgão Setorial
const calculateOrgaoSetorialData = (
  filtered: Solicitacao[],
  organizacoes: Organizacao[],
  selectedOrgaoSetorial: string
) => {
  const setorialCounts: Record<string, number> = {};
  filtered.forEach((item) => {
    const org = organizacoes.find((o) => o.id === item.organizacao_id);
    if (org) {
      const setorial = org.diretoria;
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
    return chartData.filter((item) => item.orgao === selectedOrgaoSetorial);
  }

  return chartData;
};

export const useDashboardData = (
  filters: DashboardFilters,
  organizacoes: Organizacao[]
) => {
  return useQuery({
    queryKey: ['dashboard', filters, organizacoes.length],
    queryFn: async () => {
      console.log('🔄 [useDashboardData] Carregando dados do dashboard...');

      // Fazer uma única query para solicitações
      const { data: solicitacoes, error: solicitacoesError } = await supabase
        .from("solicitacoes")
        .select("id, data_solicitacao, status, organizacao_id");

      if (solicitacoesError) throw solicitacoesError;

      // Buscar contagens de vistorias e anexos em paralelo
      const [{ count: vistoriasCount }, { count: anexosCount }] = await Promise.all([
        supabase.from("vistorias").select("*", { count: "exact", head: true }),
        supabase.from("anexos").select("*", { count: "exact", head: true }),
      ]);

      // Aplicar filtros uma única vez
      const filtered = applyFilters(solicitacoes || [], filters);

      // Processar todos os dados localmente
      const stats = calculateStats(filtered, vistoriasCount || 0, anexosCount || 0);
      const monthlyData = calculateMonthlyData(filtered);
      const { chartData: omData, allData: allOMData } = calculateOMData(filtered, organizacoes);
      const orgaoSetorialData = calculateOrgaoSetorialData(
        filtered,
        organizacoes,
        filters.selectedOrgaoSetorial
      );

      console.log('✅ [useDashboardData] Dados processados:', {
        stats,
        monthlyData: monthlyData.length,
        omData: omData.length,
        orgaoSetorialData: orgaoSetorialData.length,
      });

      return {
        stats,
        monthlyData,
        omData,
        allOMData,
        orgaoSetorialData,
      };
    },
    enabled: organizacoes.length > 0, // Só busca quando organizações estão carregadas
    staleTime: 5 * 60 * 1000, // 5 minutos - dados do dashboard podem ser atualizados com frequência moderada
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};
