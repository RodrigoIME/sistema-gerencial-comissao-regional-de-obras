import { useCallback } from 'react';
import { handleError, ErrorHandlerOptions } from '@/lib/errors';

export const useErrorHandler = (defaultContext?: string) => {
  const handler = useCallback(
    (error: unknown, options?: Partial<ErrorHandlerOptions>) => {
      return handleError(error, {
        context: defaultContext,
        ...options,
      });
    },
    [defaultContext]
  );

  return handler;
};
