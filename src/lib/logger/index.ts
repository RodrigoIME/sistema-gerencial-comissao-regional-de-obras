export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  module?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: Date;
  error?: Error;
}

export interface LogTransport {
  log(entry: LogEntry): void;
}

class Logger {
  private minLevel: LogLevel = import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO;
  private transports: LogTransport[] = [];

  addTransport(transport: LogTransport) {
    this.transports.push(transport);
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date(),
      error,
    };

    this.transports.forEach((transport) => transport.log(entry));
  }

  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error: Error, context?: LogContext) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // Método para performance tracking
  startTimer(label: string) {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.debug(`⏱️ ${label}`, { metadata: { duration: `${duration.toFixed(2)}ms` } });
    };
  }
}

// Singleton
export const logger = new Logger();
