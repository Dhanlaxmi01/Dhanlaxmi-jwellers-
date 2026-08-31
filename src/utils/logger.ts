/**
 * Centralized Application Logger & Telemetry Hub
 * Provides structured logging with levels, runtime diagnostic metadata, and silent error capturing.
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
  timestamp: string;
  errorStack?: string;
}

class TelemetryLogger {
  private inMemoryLogs: LogEntry[] = [];
  private readonly maxInMemoryLogs = 100;

  private formatMessage(entry: LogEntry): string {
    return `[${entry.timestamp}] [${entry.level}] [${entry.module}]: ${entry.message}`;
  }

  private pushLog(entry: LogEntry) {
    this.inMemoryLogs.unshift(entry);
    if (this.inMemoryLogs.length > this.maxInMemoryLogs) {
      this.inMemoryLogs.pop();
    }
  }

  debug(module: string, message: string, data?: any) {
    const entry: LogEntry = {
      level: 'DEBUG',
      module,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    this.pushLog(entry);
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage(entry), data || '');
    }
  }

  info(module: string, message: string, data?: any) {
    const entry: LogEntry = {
      level: 'INFO',
      module,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    this.pushLog(entry);
    console.info(this.formatMessage(entry), data || '');
  }

  warn(module: string, message: string, data?: any) {
    const entry: LogEntry = {
      level: 'WARN',
      module,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    this.pushLog(entry);
    console.warn(this.formatMessage(entry), data || '');
  }

  error(module: string, message: string, error?: unknown, data?: any) {
    let errorStack: string | undefined;
    if (error instanceof Error) {
      errorStack = error.stack;
    } else if (typeof error === 'string') {
      errorStack = error;
    }

    const entry: LogEntry = {
      level: 'ERROR',
      module,
      message,
      data: { ...(data || {}), rawError: error },
      timestamp: new Date().toISOString(),
      errorStack,
    };
    this.pushLog(entry);
    console.error(this.formatMessage(entry), errorStack || error || '', data || '');
  }

  getRecentLogs(): LogEntry[] {
    return [...this.inMemoryLogs];
  }

  clearLogs() {
    this.inMemoryLogs = [];
  }
}

export const logger = new TelemetryLogger();
