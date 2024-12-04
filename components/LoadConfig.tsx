'use client';

import { loadConfig } from '@/actions/setup';
import React, { useEffect } from 'react';

const LoadConfig = ({ children }: { children: React.ReactNode }) => {
  const [error, setError] = React.useState(false);

  useEffect(() => {
    const config = sessionStorage.getItem('server');
    if (config) return;

    loadConfig().then((config) => {
      if (config) {
        sessionStorage.setItem('server', `${config.server_protocol}://${config.server_host}:${config.server_port}`);
      } else {
        setError(true);
      }
    });
  }, []);

  if (error) {
    return <div className="flex h-full items-center justify-center text-xl">读取配置失败，请检查配置文件。</div>;
  }

  return <>{children}</>;
};

export default LoadConfig;
