'use server';

import fs from 'fs';
import os from 'os';

import { logger } from '@/app/api/_utils';
import path from 'path';

export const hostInfo = async () => {
  try {
    const interfaces = os.networkInterfaces();

    for (const key in interfaces) {
      const networkInterfaces = interfaces[key];
      if (!networkInterfaces) continue;

      for (const net of networkInterfaces) {
        if (net.family === 'IPv4' && net.address.includes('192.168')) {
          return net.address;
        }
      }
    }

    return null;
  } catch (error) {
    logger.error(error);
    return null;
  }
};

export const loadConfig = async () => {
  try {
    const configPath = path.join(
      process.cwd(),
      process.env.NODE_ENV === 'production' ? 'config.json' : 'config.dev.json',
    );

    if (!fs.existsSync(configPath)) {
      logger.error('配置文件不存在！');
      return null;
    }

    const data = await fs.promises.readFile(configPath, 'utf8');
    const config = JSON.parse(data) as Config;
    if (!config) {
      logger.error('配置文件解析失败！');
      return null;
    }

    if (!config.server_protocol || !config.server_host || !config.server_port || !config.log_path) {
      logger.error('配置文件参数缺失！');
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    logger.error(error);
    return null;
  }
};
