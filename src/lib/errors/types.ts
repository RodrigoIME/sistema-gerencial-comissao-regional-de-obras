// Tipos de erro do sistema
export enum ErrorType {
  // Validação e entrada
  VALIDATION = 'VALIDATION',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Autenticação e autorização
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_FORBIDDEN = 'AUTH_FORBIDDEN',
  
  // Banco de dados
  DB_ERROR = 'DB_ERROR',
  DB_NOT_FOUND = 'DB_NOT_FOUND',
  DB_DUPLICATE = 'DB_DUPLICATE',
  
  // Rede e APIs
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  
  // Storage
  STORAGE_UPLOAD = 'STORAGE_UPLOAD',
  STORAGE_DOWNLOAD = 'STORAGE_DOWNLOAD',
  STORAGE_DELETE = 'STORAGE_DELETE',
  STORAGE_QUOTA = 'STORAGE_QUOTA',
  
  // Local storage
  LOCAL_STORAGE = 'LOCAL_STORAGE',
  
  // Outros
  UNKNOWN = 'UNKNOWN',
}

export interface ErrorContext {
  module?: string; // 'projetos', 'solicitacoes', 'admin'
  action?: string; // 'create', 'update', 'delete', 'fetch'
  metadata?: Record<string, any>; // Dados adicionais para debug
}
