'use client';

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
    fetch(`${sessionStorage.getItem('server')}/shares/list?keyword=${keyword}&category=${category}`)
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error(`Response not ok: ${res.status} - ${res.statusText}`);
        }
      })
      .then((data) => {
        if (data.code === 0 && data.payload) {
          useFileListStore.getState().setFiles(data.payload);
        } else {
          throw new Error(`Code not 0: ${data.code}`);
        }
      })
      .catch((error) => {
        console.error(`Failed to fetch files: ${error}`);
        toast('获取文件列表失败', '请刷新页面后重试');
      })
      .finally(() => {
        setLoading(false);
      });
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
