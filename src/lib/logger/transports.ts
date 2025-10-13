import { LogEntry, LogLevel, LogTransport } from './index';

export class ConsoleTransport implements LogTransport {
  private getLevelColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return 'color: gray';
      case LogLevel.INFO: return 'color: blue';
      case LogLevel.WARN: return 'color: orange';
      case LogLevel.ERROR: return 'color: red';
    }
  }

  private getLevelLabel(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return '🐛 DEBUG';
      case LogLevel.INFO: return '📘 INFO';
      case LogLevel.WARN: return '⚠️ WARN';
      case LogLevel.ERROR: return '❌ ERROR';
    }
  }

  log(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const label = this.getLevelLabel(entry.level);
    const contextStr = entry.context?.module ? `[${entry.context.module}]` : '';
    
    const message = `${timestamp} ${label} ${contextStr} ${entry.message}`;
    const style = this.getLevelColor(entry.level);

    if (entry.level === LogLevel.ERROR && entry.error) {
      console.error(`%c${message}`, style, entry.error, entry.context);
    } else if (entry.level === LogLevel.WARN) {
      console.warn(`%c${message}`, style, entry.context);
    } else {
      console.log(`%c${message}`, style, entry.context);
    }
  }
}
