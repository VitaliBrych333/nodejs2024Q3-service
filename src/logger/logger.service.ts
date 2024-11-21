import * as fs from 'fs/promises';
import * as path from 'path';
import { ConsoleLogger, LogLevel } from '@nestjs/common';

export class CustomLogger extends ConsoleLogger {
  private level: LogLevel[] = [];
  private maxFileSize: number;
  private counters: Map<LogLevel, number> = new Map();

  constructor() {
    super();
    this.maxFileSize = +process.env.LOGGER_FILE_SIZE;

    const envLevels = process.env.LOGGER_LEVEL.replace('[', '')
      .replace(']', '')
      .split(', ');

    if (Array.isArray(envLevels)) {
      envLevels.forEach((level) => {
        if (['log', 'error', 'warn', 'debug', 'verbose'].includes(level)) {
          this.level.push(level as LogLevel);
          this.counters.set(level as LogLevel, 1);
        }
      });
    }

    process.on('unhandledRejection', (reason: unknown) => {
      this.error('unhandled Rejection', reason);
    });

    process.on('uncaughtException', (error: Error) => {
      this.error('uncaught Exception', error.stack);
    });
  }

  log(message: any) {
    if (!this.level.includes('log')) return;
    this.writeLogs('log', this.logMessage(message));
  }

  error(message: any, stack?: any) {
    if (!this.level.includes('error')) return;
    this.writeLogs('error', this.logMessage(message, stack));
  }

  warn(message: any) {
    if (!this.level.includes('warn')) return;
    this.writeLogs('warn', this.logMessage(message));
  }

  debug(message: any) {
    if (!this.level.includes('debug')) return;
    this.writeLogs('debug', this.logMessage(message));
  }

  verbose(message: any) {
    if (!this.level.includes('verbose')) return;
    this.writeLogs('verbose', this.logMessage(message));
  }

  private async writeLogs(logType: LogLevel, data: string) {
    data += '\n';
    const logFolderPath = path.resolve('/app/dist', 'logs');

    await fs.mkdir(logFolderPath, { recursive: true });

    let counter = this.counters.get(logType) ?? 0;
    let logFilePath = path.resolve(logFolderPath, `${logType}_${counter}.txt`);

    fs.access(logFilePath)
      .then(() => {
        fs.stat(logFilePath).then((stats) => {
          if (stats.size > this.maxFileSize) {
            counter += 1;
            this.counters.set(logType, counter);

            logFilePath = path.resolve(
              logFolderPath,
              `${logType}_${counter}.txt`,
            );
          }
        });
      })
      .catch((error) => console.log(error));

    await fs.writeFile(logFilePath, data, { flag: 'a' });
  }

  private logMessage(message: string, stack?: any) {
    let msg = `${new Date().toISOString()}: ${message}`;

    if (stack) {
      msg += `_${stack instanceof Error ? stack.stack : stack}`;
    }
    return msg;
  }
}
