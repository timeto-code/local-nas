'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';

import { toast } from '@/lib/utils';
import { useFileListStore, useSearchFileStore } from '@/store';
import { ListHeader, ListRow } from './FileListItem';

const FileList = () => {
  const files = useFileListStore((state) => state.files);
  const [loading, setLoading] = useState(true);
  const keyword = useSearchFileStore((state) => state.keyword);
  const category = useSearchFileStore((state) => state.category);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios({
          url: 'http://localhost:8080/shares/list',
          method: 'GET',
          params: {
            keyword,
            category,
          },
        });
        if (res.data.code === 0) {
          useFileListStore.getState().setFiles(res.data.payload);
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
  }, [keyword, category]);

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
