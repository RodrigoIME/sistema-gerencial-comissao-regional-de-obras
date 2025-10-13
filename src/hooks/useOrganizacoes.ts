import { useQuery } from '@tanstack/react-query';
import { OrganizacoesService, Organizacao } from '@/services/organizacoes.service';

export type { Organizacao };

export const useOrganizacoes = () => {
  return useQuery({
    queryKey: ['organizacoes'],
    queryFn: async () => {
      console.log('🔄 [useOrganizacoes] Carregando organizações...');
      const data = await OrganizacoesService.list();
      console.log('✅ [useOrganizacoes] Organizações carregadas:', data?.length || 0);
      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutos - dados de organizações mudam raramente
    gcTime: 60 * 60 * 1000, // 1 hora
  });
};
