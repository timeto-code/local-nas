import fs from 'fs';
import path from 'path';
import config from '@/config.json';

class Logger {
  logPath: string;

  constructor() {
    this.logPath = path.join(config.log_path);
    this.createLogDirectory();
  }

  // Ensure the log directory exists
  private async createLogDirectory() {
    try {
      await fs.promises.mkdir(this.logPath, { recursive: true });
    } catch (err) {
      console.error('Failed to create log directory:', err);
    }
  }

  // Generalized log writing method
  private async writeLog(filename: string, message: string) {
    const logFilePath = path.join(this.logPath, filename);
    try {
      await fs.promises.appendFile(
        logFilePath,
        `[${new Date().toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })}] - ${message}\n`,
      );
    } catch (err) {
      console.error(`Failed to write to ${filename}:`, err);
    }
  }

  // Log error messages
  async error<T>(error: T) {
    await this.writeLog('error.log', `${error}`);
  }

  // Log debug messages
  async debug<T>(msg: T) {
    if (process.env.NODE_ENV === 'development') console.log('\x1b[36m%s\x1b[0m', msg);
  }
}

export const logger = new Logger();
