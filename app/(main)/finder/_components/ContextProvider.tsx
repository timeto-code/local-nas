'use client';

import { ConfigContext } from '@/contexts';
import React from 'react';

interface Props {
  children: React.ReactNode;
  value: Config;
}

const ContextProvider = ({ children, value }: Props) => {
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export default ContextProvider;
