import { toast } from '@/lib/utils';
import { Chunk, Uploader } from '@/modules/uploader';
import { useFileListStore, useRowStore } from '@/store';
import { FileCategory, FsDirentDto } from '@/types/FsDirentDto';

export const uploadChunk = async (uploader: Uploader, chunk: Chunk, server: string): Promise<void> => {
  return fetch(`${server}/finder/upload?name=${chunk.name}&index=${chunk.index}`, {
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
          mergeChunk(chunk, uploader, server);
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
};

export const mergeChunk = async (chunk: Chunk, uploader: Uploader, server: string): Promise<void> => {
  uploader.updateStatus(chunk.id, 'merging');

  const searchParams = new URLSearchParams();
  searchParams.append('name', chunk.name);

  const eventSource = new EventSource(`${server}/finder/merge?${searchParams.toString()}`);

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

export const fetchFileList = async (keyword: string, category: FileCategory, server: string): Promise<void> => {
  return fetch(`${server}/finder/?keyword=${keyword}&category=${category}`)
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
    });
};

export const fetchNewFileByName = async (name: string, server: string): Promise<void> => {
  return fetch(`${server}/finder/?keyword=${name}&category=${FileCategory.All}`)
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

export const downloadFileByName = async (url: string, name: string): Promise<void> => {
  fetch(url, { method: 'HEAD' })
    .then((res) => {
      if (res.ok) {
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        a.remove();
      } else {
        toast('下载失败', '目标资源不存在');
      }
    })
    .catch((error) => {
      console.error(error);
      toast('下载失败', '网络请求失败');
    });
};

export const deleteFileByName = async (name: string, server: string): Promise<void> => {
  fetch(`${server}/finder/${name}`, { method: 'DELETE' })
    .then((res) => {
      if (res.ok) {
        // 触发行元素删除动画
        useRowStore.getState().addDeletedRow(name);
      } else {
        toast('删除失败', '请刷新页面后重试');
      }
    })
    .catch((error) => {
      console.error(`Delete file failed: ${error}`);
      toast('删除失败', '请刷新页面后重试');
    });
};
