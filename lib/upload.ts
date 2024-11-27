import axios from 'axios';

import { useCommonStore, useFileListStore } from '@/store';
import { useUploaderStore } from '@/store/useUploaderStore';
import { Chunk, Uploader } from '../modules/uploader';
import { FileCategory, FsDirentDto } from '@/types/FsDirentDto';

export const upload = async (fileArray: File[]): Promise<void> => {
  useCommonStore.getState().setIsUploading(true);
  const uploader = new Uploader(fileArray);

  uploader.on('ready', (event) => {
    useUploaderStore.getState().init(event.detail);
  });

  uploader.on('update', (event) => {
    const transferFile = event.detail;
    useUploaderStore.getState().update(transferFile);
    if (transferFile.status === 'success') {
      fetchNewFileByName(transferFile.serverName);
    }
  });

  uploader.on('close', () => {
    useCommonStore.getState().setIsUploading(false);
  });

  uploader.ready();

  uploader.start(async (chunk) => {
    try {
      const res = await axios({
        method: 'POST',
        // url: '/api/upload',
        url: 'http://localhost:8080/upload',
        params: {
          name: chunk.name,
          index: chunk.index,
        },
        data: chunk.data,
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });

      if (res.data.code === 0 && res.data) {
        const { loaded } = res.data.payload;
        const done = uploader.updateReceivedBytes(chunk.id, loaded);
        if (done) {
          await sseMerge(chunk, uploader);
        }
      } else {
        console.error(`Upload chunk failed: ${chunk.index} - ${chunk.name}`);
        uploader.updateStatus(chunk.id, 'failure');
      }
    } catch (error) {
      console.error(`Failed to upload chunk: ${chunk.index} - ${chunk.name}\n${error}`);
      uploader.updateStatus(chunk.id, 'failure');
    }
  });
};

const sseMerge = async (chunk: Chunk, uploader: Uploader): Promise<void> => {
  uploader.updateStatus(chunk.id, 'merging');

  const searchParams = new URLSearchParams();
  searchParams.append('name', chunk.name);
  // const eventSource = new EventSource(`/api/upload?${searchParams.toString()}`);
  const eventSource = new EventSource(`http://localhost:8080/upload?${searchParams.toString()}`);

  eventSource.addEventListener('success', (event) => {
    const { name, stats } = JSON.parse(event.data).payload;
    uploader.setUploadDoneTimestamp(chunk.id);
    uploader.syncFileStats(chunk.id, name, stats.birthtime);
    uploader.updateStatus(chunk.id, 'success');

    eventSource.close();
  });

  eventSource.addEventListener('failed', () => {
    uploader.updateStatus(chunk.id, 'failure');
    eventSource.close();
  });

  eventSource.onerror = (error) => {
    console.error(`SSE 文件合并失败 : ${chunk.id}\n${JSON.stringify(error)}`);

    uploader.updateStatus(chunk.id, 'failure');
    eventSource!.close();
  };
};

const fetchNewFileByName = async (name: string): Promise<void> => {
  try {
    const res = await axios({
      url: 'http://localhost:8080/shares/list',
      method: 'GET',
      params: {
        keyword: name,
        category: FileCategory.All,
      },
    });
    if (res.data.code === 0 && res.data) {
      const file = res.data.payload[0] as FsDirentDto;
      useFileListStore.getState().addFile(file);
    }
  } catch (error) {
    console.error(`Failed to fetch new file: ${name}\n${error}`);
  }
};
