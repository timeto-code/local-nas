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
    const data = await fs.promises.readFile(path.join(process.cwd(), 'config.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    logger.error(error);
    return null;
  }
};
