import { logger } from './index';
import { ConsoleTransport } from './transports';

// Inicializar logger com transports
logger.addTransport(new ConsoleTransport());

// Em produção, adicionar outros transports
if (!import.meta.env.DEV) {
  // logger.addTransport(new SentryTransport());
  // logger.addTransport(new BackendTransport());
}

export { logger };
