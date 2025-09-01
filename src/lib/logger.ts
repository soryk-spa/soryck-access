/**
 * Professional logging system for SorykPass
 * Replaces console.log with structured logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
  userId?: string;
  eventId?: string;
  requestId?: string;
  service?: string;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private minLevel: LogLevel = this.isDevelopment ? 'debug' : 'info';

  private levelToNumber(level: LogLevel): number {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level];
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelToNumber(level) >= this.levelToNumber(this.minLevel);
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      context,
      error
    };

    if (this.isDevelopment) {
      // Development: Pretty console logging
      const emoji = { debug: '🔍', info: 'ℹ️', warn: '⚠️', error: '❌' }[level];
      const color = { debug: '\x1b[36m', info: '\x1b[32m', warn: '\x1b[33m', error: '\x1b[31m' }[level];
      const reset = '\x1b[0m';
      
      console.log(`${color}${emoji} [${level.toUpperCase()}]${reset} ${message}`);
      if (context && Object.keys(context).length > 0) {
        console.log(`${color}   Context:${reset}`, context);
      }
      if (error) {
        console.error(`${color}   Error:${reset}`, error);
      }
    } else {
      // Production: Structured JSON logging
      console.log(JSON.stringify(logEntry));
    }
  }

  debug(message: string, context?: LogContext): void {
    this.formatMessage('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.formatMessage('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.formatMessage('warn', message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.formatMessage('error', message, context, error);
  }

  // Email service specific logging
  email = {
    sent: (type: string, recipient: string, subject: string, context?: LogContext) => {
      this.info(`Email sent: ${type}`, {
        type,
        recipient,
        subject,
        service: 'email',
        ...context
      });
    },

    failed: (type: string, recipient: string, error: Error, context?: LogContext) => {
      this.error(`Email failed: ${type}`, error, {
        type,
        recipient,
        service: 'email',
        ...context
      });
    },

    processing: (type: string, recipient: string, context?: LogContext) => {
      this.info(`Email processing: ${type}`, {
        type,
        recipient,
        service: 'email',
        ...context
      });
    }
  };

  // API request logging
  api = {
    request: (method: string, path: string, context?: LogContext) => {
      this.debug(`API Request: ${method} ${path}`, {
        method,
        path,
        service: 'api',
        ...context
      });
    },

    response: (method: string, path: string, status: number, duration?: number, context?: LogContext) => {
      const level = status >= 400 ? 'warn' : 'info';
      this.formatMessage(level, `API Response: ${method} ${path} - ${status}`, {
        method,
        path,
        status,
        duration,
        service: 'api',
        ...context
      });
    },

    error: (method: string, path: string, error: Error, context?: LogContext) => {
      this.error(`API Error: ${method} ${path}`, error, {
        method,
        path,
        service: 'api',
        ...context
      });
    }
  };

  // Event management logging
  event = {
    created: (eventId: string, title: string, organizerId: string, context?: LogContext) => {
      this.info(`Event created: ${title}`, {
        eventId,
        title,
        organizerId,
        service: 'events',
        ...context
      });
    },

    updated: (eventId: string, title: string, changes: string[], context?: LogContext) => {
      this.info(`Event updated: ${title}`, {
        eventId,
        title,
        changes,
        service: 'events',
        ...context
      });
    },

    deleted: (eventId: string, title: string, context?: LogContext) => {
      this.warn(`Event deleted: ${title}`, {
        eventId,
        title,
        service: 'events',
        ...context
      });
    }
  };

  // Payment logging
  payment = {
    initiated: (orderId: string, amount: number, currency: string, context?: LogContext) => {
      this.info(`Payment initiated`, {
        orderId,
        amount,
        currency,
        service: 'payment',
        ...context
      });
    },

    completed: (orderId: string, amount: number, currency: string, context?: LogContext) => {
      this.info(`Payment completed`, {
        orderId,
        amount,
        currency,
        service: 'payment',
        ...context
      });
    },

    failed: (orderId: string, error: Error, context?: LogContext) => {
      this.error(`Payment failed`, error, {
        orderId,
        service: 'payment',
        ...context
      });
    }
  };
}

export const logger = new Logger();

// Utility function to create contextual logger
export function createLogger(defaultContext: LogContext) {
  return {
    debug: (message: string, context?: LogContext) => 
      logger.debug(message, { ...defaultContext, ...context }),
    info: (message: string, context?: LogContext) => 
      logger.info(message, { ...defaultContext, ...context }),
    warn: (message: string, context?: LogContext) => 
      logger.warn(message, { ...defaultContext, ...context }),
    error: (message: string, error?: Error, context?: LogContext) => 
      logger.error(message, error, { ...defaultContext, ...context }),
  };
}
