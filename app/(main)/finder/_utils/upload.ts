import { Uploader } from '@/modules/uploader';
import { useCommonStore } from '@/store';
import { useUploaderStore } from '@/store/useUploaderStore';
import { fetchNewFileByName, uploadChunk } from '../_api';

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
    return uploadChunk(uploader, chunk, server);
  });
};
