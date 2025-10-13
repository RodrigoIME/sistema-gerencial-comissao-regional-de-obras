import { ErrorType, ErrorContext } from './types';

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code: string;
  public readonly statusCode: number;
  public readonly context?: ErrorContext;
  public readonly userMessage: string; // Mensagem amigável para o usuário
  public readonly timestamp: Date;

  constructor(
    message: string,
    type: ErrorType,
    options?: {
      code?: string;
      statusCode?: number;
      context?: ErrorContext;
      userMessage?: string;
      cause?: Error;
    }
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = options?.code || this.generateCode(type);
    this.statusCode = options?.statusCode || 500;
    this.context = options?.context;
    this.userMessage = options?.userMessage || this.getDefaultUserMessage(type);
    this.timestamp = new Date();
    
    // Preservar stack trace original se houver
    if (options?.cause) {
      this.stack = options.cause.stack;
    }
  }

  private generateCode(type: ErrorType): string {
    const timestamp = Date.now().toString(36);
    return `${type}_${timestamp}`;
  }

  private getDefaultUserMessage(type: ErrorType): string {
    const messages: Record<ErrorType, string> = {
      [ErrorType.VALIDATION]: 'Por favor, verifique os dados informados',
      [ErrorType.INVALID_INPUT]: 'Dados inválidos fornecidos',
      [ErrorType.AUTH_REQUIRED]: 'Você precisa estar autenticado',
      [ErrorType.AUTH_FORBIDDEN]: 'Você não tem permissão para esta ação',
      [ErrorType.DB_ERROR]: 'Erro ao acessar o banco de dados',
      [ErrorType.DB_NOT_FOUND]: 'Registro não encontrado',
      [ErrorType.DB_DUPLICATE]: 'Este registro já existe',
      [ErrorType.NETWORK_ERROR]: 'Erro de conexão. Verifique sua internet',
      [ErrorType.API_ERROR]: 'Erro ao comunicar com o servidor',
      [ErrorType.STORAGE_UPLOAD]: 'Erro ao fazer upload do arquivo',
      [ErrorType.STORAGE_DOWNLOAD]: 'Erro ao baixar o arquivo',
      [ErrorType.STORAGE_DELETE]: 'Erro ao deletar o arquivo',
      [ErrorType.STORAGE_QUOTA]: 'Espaço de armazenamento insuficiente',
      [ErrorType.LOCAL_STORAGE]: 'Erro ao salvar dados localmente',
      [ErrorType.UNKNOWN]: 'Ocorreu um erro inesperado',
    };
    
    return messages[type] || 'Ocorreu um erro inesperado';
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp,
    };
  }
}
