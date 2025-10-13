import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Organizacao {
  id: number;
  "Organização Militar": string;
  "Órgão Setorial Responsável": string;
  "Sigla da OM": string;
}

export const useOrganizacoes = () => {
  return useQuery({
    queryKey: ['organizacoes'],
    queryFn: async () => {
      console.log('🔄 [useOrganizacoes] Carregando organizações...');
      const { data, error } = await supabase
        .from("organizacoes")
        .select("*")
        .order('"Organização Militar"');

      if (error) {
        console.error('❌ [useOrganizacoes] Erro:', error);
        throw error;
      }
      
      console.log('✅ [useOrganizacoes] Organizações carregadas:', data?.length || 0);
      return (data || []) as Organizacao[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutos - dados de organizações mudam raramente
    gcTime: 60 * 60 * 1000, // 1 hora
  });
};
