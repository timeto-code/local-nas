'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

import { toast } from '@/lib/utils';
import { useFileListStore, useSearchFileStore } from '@/store';
import { ListHeader, ListRow } from './FileListItem';

const FileList = () => {
  const files = useFileListStore((state) => state.files);
  const [loading, setLoading] = useState(true);
  const searchKey = useSearchFileStore((state) => state.search);
  const type = useSearchFileStore((state) => state.type);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios({
          url: '/api/list',
          method: 'GET',
          params: {
            search: searchKey,
            type,
          },
        });
        if (res.data.code === 0) {
          // setFiles(res.data.message);
          useFileListStore.getState().setFiles(res.data.message);
        } else {
          toast('获取文件列表失败', '请刷新页面后重试');
        }
      } catch (error) {
        console.error(error);
        toast('获取文件列表失败', '请刷新页面后重试');
      }

      setLoading(false);
    };

    fetchFiles();
  }, [searchKey, type]);

  if (loading) {
    return (
      <div className="mt-20 text-center">
        <p className="font-black tracking-widest opacity-30">加载中...</p>
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
