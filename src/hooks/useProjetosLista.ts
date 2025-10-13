import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

const ITEMS_PER_PAGE = 20;

export interface ProjetosFilters {
  searchTerm: string;
  statusFilter: string;
  diretoriaFilter: string;
  omExecutoraFilter: string;
  valorMin: number;
  valorMax: number;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  currentPage: number;
}

interface ProjetosListaResult {
  projetos: any[];
  totalCount: number;
  totalPages: number;
  startItem: number;
  endItem: number;
}

const fetchProjetosPage = async (filters: ProjetosFilters): Promise<ProjetosListaResult> => {
  const from = (filters.currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from("projetos")
    .select(`
      *,
      organizacao:organizacoes(*)
    `, { count: 'exact' });

  // Aplicar todos os filtros
  if (filters.searchTerm) {
    query = query.or(
      `numero_opus.ilike.%${filters.searchTerm}%,objeto.ilike.%${filters.searchTerm}%`
    );
  }
  if (filters.statusFilter !== "todos") {
    query = query.eq("status", filters.statusFilter);
  }
  if (filters.diretoriaFilter !== "todos") {
    query = query.eq("diretoria_responsavel", filters.diretoriaFilter);
  }
  if (filters.omExecutoraFilter !== "todos") {
    query = query.eq("om_executora", filters.omExecutoraFilter);
  }
  if (filters.valorMin > 0 || filters.valorMax < 10000000) {
    query = query
      .gte("valor_estimado_dfd", filters.valorMin)
      .lte("valor_estimado_dfd", filters.valorMax);
  }
  if (filters.dateFrom) {
    query = query.gte("created_at", filters.dateFrom.toISOString());
  }
  if (filters.dateTo) {
    query = query.lte("created_at", filters.dateTo.toISOString());
  }

  // Ordenação e paginação
  query = query
    .order(filters.sortBy, { ascending: filters.sortOrder === "asc" })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const startItem = from + 1;
  const endItem = Math.min(to + 1, totalCount);

  return {
    projetos: data || [],
    totalCount,
    totalPages,
    startItem,
    endItem,
  };
};

export const useProjetosLista = (filters: ProjetosFilters) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['projetos-lista', filters],
    queryFn: () => fetchProjetosPage(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos de cache
    gcTime: 5 * 60 * 1000, // 5 minutos no garbage collector
    placeholderData: (previousData) => previousData, // Mantém dados antigos enquanto carrega
  });

  // Prefetch da próxima página
  useEffect(() => {
    if (query.data && filters.currentPage < query.data.totalPages) {
      const nextPageFilters = { ...filters, currentPage: filters.currentPage + 1 };
      queryClient.prefetchQuery({
        queryKey: ['projetos-lista', nextPageFilters],
        queryFn: () => fetchProjetosPage(nextPageFilters),
        staleTime: 2 * 60 * 1000,
      });
    }
  }, [filters, query.data, queryClient]);

  return query;
};
