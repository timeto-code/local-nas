'use client';

import React from 'react';

const Error = ({ error }: { error: Error & { digest?: string } }) => {
  return (
    <div className="flex h-full flex-col items-center justify-center text-lg">
      <p>{error.message}</p>
      <p>文件名无效</p>
    </div>
  );
};

export default Error;
