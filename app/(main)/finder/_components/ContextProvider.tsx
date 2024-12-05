'use client';

import { loadConfig } from '@/actions/setup';
import { ConfigContext } from '@/contexts';
import React, { useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

const ContextProvider = ({ children }: Props) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [config, setConfig] = React.useState<Config | null>(null);

  useEffect(() => {
    loadConfig().then((config) => {
      if (!config) {
        return setError(true);
      }

      setConfig(config);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>配置文件读取失败！</div>;
  }

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
};

export default ContextProvider;
