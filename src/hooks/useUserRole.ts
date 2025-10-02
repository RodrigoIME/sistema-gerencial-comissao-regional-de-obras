import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'user';
export type AppModule = 'vistorias' | 'projetos' | 'fiscalizacao';

interface UserRoleData {
  roles: AppRole[];
  modules: AppModule[];
  isAdmin: boolean;
  hasModule: (module: AppModule) => boolean;
  loading: boolean;
}

export const useUserRole = (user: User | null): UserRoleData => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [modules, setModules] = useState<AppModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setModules([]);
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        // Buscar roles
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        // Buscar módulos
        const { data: modulesData } = await supabase
          .from('user_modules')
          .select('module')
          .eq('user_id', user.id);

        setRoles(rolesData?.map(r => r.role as AppRole) || []);
        setModules(modulesData?.map(m => m.module as AppModule) || []);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const hasModule = (module: AppModule) => modules.includes(module);
  const isAdmin = roles.includes('admin');

  return { roles, modules, isAdmin, hasModule, loading };
};
