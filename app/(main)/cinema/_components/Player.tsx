'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { FileCategory, FsDirentDto } from '@/types/FsDirentDto';

const Player = () => {
  const [file, setFile] = useState<FsDirentDto | null>(null);

  useEffect(() => {
    const json = sessionStorage.getItem('file');
    if (json) {
      setFile(JSON.parse(json));

      console.log('file:', JSON.parse(json));
    }
  }, []);

  if (!file) {
    return null;
  }

  const extension = file.playUrl.split('.').pop() || '';
  if (['txt', 'md', 'pdf', 'js', 'json'].includes(extension)) {
    return <iframe src={file.playUrl} width="100%" height="100%" />;
  }

  switch (file.category) {
    case FileCategory.Image:
      return <Image src={file.playUrl} alt={file.name} className="object-contain" fill />;

    case FileCategory.Video:
      return (
        <div className="flex h-full items-center justify-center bg-black md:p-10 lg:p-20">
          <video className="max-h-full max-w-full object-contain md:rounded-lg" src={file.playUrl} controls />
        </div>
      );

    case FileCategory.Audio:
      return (
        <div className="flex h-full items-center justify-center p-5 md:p-10">
          <div className="w-full max-w-[550px] space-y-2 md:w-[50%]">
            <p className="pl-5 text-lg">{file.name}</p>
            <audio className="w-full outline-none" src={file.playUrl} controls />
          </div>
        </div>
      );

    default:
      return (
        <div className="flex h-full w-full flex-col items-center justify-center px-3 text-lg">
          <span className="w-full truncate text-center">{file.name}</span>
          <span>文件类型不支持预览</span>
        </div>
      );
  }
};

export default Player;
