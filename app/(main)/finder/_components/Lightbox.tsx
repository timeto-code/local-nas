'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { useLightboxStore } from '@/store';
import { FileCategory } from '@/types/FsDirentDto';

const Lightbox = () => {
  const [ext, setExt] = useState<string>('');
  const file = useLightboxStore((state) => state.file);

  useEffect(() => {
    if (file) {
      const extension = file.playUrl.split('.').pop() || '';
      setExt(extension);
    }
  }, [file]);

  if (!file) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-80">
      <div className="relative h-[85%] w-[85%] p-8">
        <button
          className="absolute right-0 top-0 z-50 rounded-full bg-black bg-opacity-40 p-1 text-white"
          onClick={() => {
            console.log('close');

            useLightboxStore.getState().setFile(null);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="relative h-full w-full">
          {file.category === FileCategory.Image && (
            <Image src={file.playUrl} alt={file.name} className="object-contain" fill unoptimized />
          )}

          {file.category === FileCategory.Video && (
            <div className="flex h-full items-center justify-center">
              <video className="rounded-md" src={file.playUrl} controls preload="auto" />
            </div>
          )}

          {file.category === FileCategory.Audio && (
            <div className="flex h-full items-center justify-center p-5 md:p-10">
              <div className="w-full max-w-[550px] space-y-2 md:w-[50%]">
                <p className="pl-5 text-lg">{file.name}</p>
                <audio className="w-full outline-none" src={file.playUrl} controls />
              </div>
            </div>
          )}

          {['txt', 'md', 'pdf', 'js', 'json'].includes(ext) && (
            <div className="h-full w-full overflow-hidden rounded bg-white">
              <div className="h-full overflow-auto">
                <iframe src={file.playUrl} width="100%" height="100%" />
              </div>
            </div>
          )}

          {file.category !== FileCategory.Image &&
            file.category !== FileCategory.Video &&
            file.category !== FileCategory.Audio &&
            !['txt', 'md', 'pdf', 'js', 'json'].includes(ext) && (
              <div className="flex h-full w-full flex-col items-center justify-center px-3 text-lg">
                <span className="w-full truncate text-center text-white">{file.name}</span>
                <span className="text-white">文件类型不支持预览</span>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
export default Lightbox;
