import { QueryClient } from '@tanstack/react-query';
import { handleError } from './errors';
import { AppError, ErrorType } from './errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: (failureCount, error) => {
        // Não retry em erros de autenticação ou validação
        if (error instanceof AppError) {
          if ([ErrorType.AUTH_REQUIRED, ErrorType.VALIDATION].includes(error.type)) {
            return false;
          }
        }
        return failureCount < 1; // Apenas 1 retry
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        // Tratamento global de erros em mutations
        handleError(error, { context: 'Mutation' });
      },
    },
  },
});
