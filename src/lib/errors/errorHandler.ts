import { toast } from 'sonner';
import { AppError } from './AppError';
import { ErrorType } from './types';
import { PostgrestError } from '@supabase/supabase-js';
import { logger } from '@/lib/logger/init';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  rethrow?: boolean;
  context?: string;
}

export const handleError = (
  error: unknown,
  options: ErrorHandlerOptions = {}
): AppError => {
  const {
    showToast = true,
    logToConsole = true,
    rethrow = false,
    context,
  } = options;

  let appError: AppError;

  // Converter erro para AppError
  if (error instanceof AppError) {
    appError = error;
  } else if (isPostgrestError(error)) {
    appError = handlePostgrestError(error);
  } else if (error instanceof Error) {
    appError = new AppError(
      error.message,
      ErrorType.UNKNOWN,
      {
        userMessage: 'Ocorreu um erro inesperado',
        cause: error,
        context: context ? { module: context } : undefined,
      }
    );
  } else {
    appError = new AppError(
      'Unknown error',
      ErrorType.UNKNOWN,
      {
        userMessage: 'Ocorreu um erro inesperado',
        context: context ? { module: context, metadata: { rawError: error } } : undefined,
      }
    );
  }

  // Logar no console
  if (logToConsole) {
    logger.error(
      appError.userMessage,
      new Error(appError.message),
      {
        module: context || 'Unknown',
        metadata: {
          code: appError.code,
          type: appError.type,
          context: appError.context,
        },
      }
    );
  }

  // Mostrar toast
  if (showToast) {
    toast.error(appError.userMessage, {
      description: import.meta.env.DEV ? appError.code : undefined,
    });
  }

  // Re-throw se solicitado
  if (rethrow) {
    throw appError;
  }

  return appError;
};

// Helper para identificar erro do Supabase
function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
}

// Converter erros do Postgrest para AppError
function handlePostgrestError(error: PostgrestError): AppError {
  // Mapear códigos PostgreSQL comuns
  const errorTypeMap: Record<string, ErrorType> = {
    '23505': ErrorType.DB_DUPLICATE, // unique_violation
    '23503': ErrorType.DB_ERROR, // foreign_key_violation
    '42P01': ErrorType.DB_ERROR, // undefined_table
    'PGRST116': ErrorType.DB_NOT_FOUND, // Row not found
  };

  const type = errorTypeMap[error.code] || ErrorType.DB_ERROR;

  return new AppError(error.message, type, {
    code: error.code,
    userMessage: getUserMessageForPostgrestError(error),
    context: {
      metadata: {
        details: error.details,
        hint: error.hint,
      },
    },
  });
}

function getUserMessageForPostgrestError(error: PostgrestError): string {
  switch (error.code) {
    case '23505':
      return 'Este registro já existe no sistema';
    case '23503':
      return 'Este registro está sendo usado e não pode ser removido';
    case 'PGRST116':
      return 'Registro não encontrado';
    default:
      return 'Erro ao processar sua solicitação';
  }
}
