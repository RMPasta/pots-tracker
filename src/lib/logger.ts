type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  userId?: string;
  error?: Error;
}

class Logger {
  private formatEntry(entry: LogEntry): string {
    const { level, message, timestamp, metadata, userId, error } = entry;
    const parts = [`[${timestamp.toISOString()}]`, level.toUpperCase(), message];

    if (userId) {
      parts.push(`userId:${userId}`);
    }

    if (metadata && Object.keys(metadata).length > 0) {
      parts.push(JSON.stringify(metadata));
    }

    if (error) {
      parts.push(`error:${error.message}`);
      if (error.stack) {
        parts.push(`stack:${error.stack}`);
      }
    }

    return parts.join(' ');
  }

  private log(
    level: LogLevel,
    message: string,
    options?: {
      metadata?: Record<string, unknown>;
      userId?: string;
      error?: Error;
    }
  ): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      ...options,
    };

    const formatted = this.formatEntry(entry);

    switch (level) {
      case 'error':
        console.error(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(formatted);
        }
        break;
      default:
        console.log(formatted);
    }
  }

  info(
    message: string,
    options?: {
      metadata?: Record<string, unknown>;
      userId?: string;
    }
  ): void {
    this.log('info', message, options);
  }

  warn(
    message: string,
    options?: {
      metadata?: Record<string, unknown>;
      userId?: string;
      error?: Error;
    }
  ): void {
    this.log('warn', message, options);
  }

  error(
    message: string,
    options?: {
      metadata?: Record<string, unknown>;
      userId?: string;
      error?: Error;
    }
  ): void {
    this.log('error', message, options);
  }

  debug(
    message: string,
    options?: {
      metadata?: Record<string, unknown>;
      userId?: string;
    }
  ): void {
    this.log('debug', message, options);
  }
}

export const logger = new Logger();
