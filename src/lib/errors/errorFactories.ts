// Factories para criar erros específicos com contexto
import { AppError } from './AppError';
import { ErrorType, ErrorContext } from './types';

export const createValidationError = (
  message: string,
  context?: ErrorContext
) => {
  return new AppError(message, ErrorType.VALIDATION, {
    userMessage: message, // Mensagens de validação já são user-friendly
    context,
  });
};

export const createAuthError = (
  isRequired: boolean = true,
  context?: ErrorContext
) => {
  return new AppError(
    isRequired ? 'Authentication required' : 'Forbidden',
    isRequired ? ErrorType.AUTH_REQUIRED : ErrorType.AUTH_FORBIDDEN,
    { context }
  );
};

export const createStorageError = (
  action: 'upload' | 'download' | 'delete',
  fileName?: string,
  context?: ErrorContext
) => {
  const typeMap = {
    upload: ErrorType.STORAGE_UPLOAD,
    download: ErrorType.STORAGE_DOWNLOAD,
    delete: ErrorType.STORAGE_DELETE,
  };

  return new AppError(
    `Storage ${action} failed${fileName ? ` for ${fileName}` : ''}`,
    typeMap[action],
    {
      context: {
        ...context,
        metadata: { ...context?.metadata, fileName },
      },
    }
  );
};

export const createNetworkError = (
  message: string = 'Network request failed',
  context?: ErrorContext
) => {
  return new AppError(message, ErrorType.NETWORK_ERROR, { context });
};
