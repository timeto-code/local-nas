'use client';

import React, { useEffect } from 'react';

import { loadConfig } from '@/actions/setup';
import Circle from '@/components/Spinner';
import { ConfigContext } from '@/contexts';

interface Props {
  children: React.ReactNode;
}

const ContextProvider = ({ children }: Props) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [config, setConfig] = React.useState<Config | null>(null);

  useEffect(() => {
    loadConfig()
      .then((config) => {
        if (!config) return setError(true);
        setConfig(config);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Circle />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-md bg-red-100 p-6 shadow-md">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1" fill="currentColor" />
          </svg>
          <p className="text-lg font-semibold text-red-600">配置文件加载失败</p>
        </div>
        <p className="mt-2 text-sm text-gray-600">请检查配置文件是否存在或配置文件是否正确。</p>
      </div>
    );
  }

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
};

export default ContextProvider;
