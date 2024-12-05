import { useCommonStore, useFileListStore } from '@/store';
import { useUploaderStore } from '@/store/useUploaderStore';
import { FileCategory, FsDirentDto } from '@/types/FsDirentDto';
import { Chunk, Uploader } from '../modules/uploader';

export const upload = async (fileArray: File[], server: string): Promise<void> => {
  useCommonStore.getState().setIsUploading(true);
  const uploader = new Uploader(fileArray);

  uploader.on('ready', (event) => {
    useUploaderStore.getState().init(event.detail);
  });

  uploader.on('update', (event) => {
    const transferFile = event.detail;
    useUploaderStore.getState().update(transferFile);
    if (transferFile.status === 'success') {
      fetchNewFileByName(transferFile.serverName, server);
    }
  });

  uploader.on('close', () => {
    useCommonStore.getState().setIsUploading(false);
  });

  uploader.ready();

  uploader.start(async (chunk) => {
    return fetch(`${server}/upload?name=${chunk.name}&index=${chunk.index}`, {
      method: 'POST',
      body: chunk.data,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error(`Response not ok: ${res.status} - ${res.statusText}`);
        }
      })
      .then((data) => {
        if (data.code === 0) {
          const { loaded } = data.payload;
          const done = uploader.updateReceivedBytes(chunk.id, loaded);
          if (done) {
            sseMerge(chunk, uploader, server);
          }
        } else {
          console.error(`Upload chunk failed: ${chunk.index} - ${chunk.name}`);
          uploader.updateStatus(chunk.id, 'failure');
        }
      })
      .catch((error) => {
        console.error(`Failed to upload chunk: ${chunk.index} - ${chunk.name}\n${error}`);
        uploader.updateStatus(chunk.id, 'failure');
      });
  });
};

const sseMerge = async (chunk: Chunk, uploader: Uploader, server: string): Promise<void> => {
  uploader.updateStatus(chunk.id, 'merging');

  const searchParams = new URLSearchParams();
  searchParams.append('name', chunk.name);

  const eventSource = new EventSource(`${server}/upload?${searchParams.toString()}`);

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

const fetchNewFileByName = async (name: string, server: string): Promise<void> => {
  return fetch(`${server}/shares/list?keyword=${name}&category=${FileCategory.All}`)
    .then((res) => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error(`Response not ok: ${res.status} - ${res.statusText}`);
      }
    })
    .then((data) => {
      if (data.code === 0 && data.payload) {
        const file = data.payload[0] as FsDirentDto;
        useFileListStore.getState().addFile(file);
      } else {
        throw new Error(`Code not 0: ${data.code}`);
      }
    })
    .catch((error) => {
      console.error(`Failed to fetch new file: ${name}\n${error}`);
    });
};
