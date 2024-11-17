'use server';

import os from 'os';

export const getLocalIp = async () => {
  try {
    const interfaces = os.networkInterfaces();

    const ip = Object.values(interfaces)
      .flat()
      .find((net) => net!.family === 'IPv4' && net!.address.includes('192.168'))?.address;

    return ip;
  } catch (error) {
    console.error(error);
    return null;
  }
};
