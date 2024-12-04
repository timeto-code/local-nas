import LoadConfig from '@/components/LoadConfig';
import React from 'react';

const layout = ({ children }: { children: React.ReactNode }) => {
  return <LoadConfig>{children}</LoadConfig>;
};

export default layout;
