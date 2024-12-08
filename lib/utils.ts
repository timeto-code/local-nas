import { useToastStore } from '@/store';

export const bytesToSize = (bytes: number): string => {
  if (bytes === 0) return '0 KB';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

export const toast = (title: string, content: string) => {
  useToastStore.getState().setToast(title, content);
};
