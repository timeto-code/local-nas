'use server';

import { logger } from '@/app/api/_utils';
import config from '@/config.json';
import os from 'os';

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
    return config;
  } catch (error) {
    logger.error(error);
    return null;
  }
};
