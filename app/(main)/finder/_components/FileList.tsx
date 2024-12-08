'use client';

import { useContext, useEffect, useState } from 'react';

import Circle from '@/components/Spinner';
import { ConfigContext } from '@/contexts';
import { useFileListStore, useSearchFileStore } from '@/store';
import { fetchFileList } from '../_api';
import { ListHeader, ListRow } from './FileListItem';

const FileList = () => {
  const files = useFileListStore((state) => state.files);
  const [loading, setLoading] = useState(true);
  const keyword = useSearchFileStore((state) => state.keyword);
  const category = useSearchFileStore((state) => state.category);
  const config = useContext(ConfigContext);
  const server = `${config?.server_protocol}://${config?.server_host}:${config?.server_port}`;

  useEffect(() => {
    fetchFileList(keyword, category, server).finally(() => {
      setLoading(false);
    });
  }, [keyword, category, server]);

  if (loading) {
    return (
      <div className="mt-20 flex items-center justify-center">
        <Circle radius={10} storkWidth={3} />
      </div>
    );
  }

  if (files.length !== 0) {
    return (
      <>
        <ListHeader />
        <ul>
          {files.map((file, index) => (
            <li key={index} className="">
              <ListRow key={index} file={file} />
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <div className="mt-20 text-center">
      <p className="font-black opacity-30">未找到任何文件</p>
    </div>
  );
};

export default FileList;
