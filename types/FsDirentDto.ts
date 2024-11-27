export enum FileCategory {
  All = 'all',
  Document = 'document',
  Image = 'image',
  Video = 'video',
  Audio = 'audio',
  Zip = 'zip',
  Installer = 'installer',
}

export const fileType: Record<FileCategory, string[]> = {
  [FileCategory.All]: [''],
  [FileCategory.Document]: [
    'doc',
    'docx',
    'ppt',
    'pptx',
    'xls',
    'xlsx',
    'pdf',
    'txt',
    'md',
    'json',
    'js',
    'html',
    'css',
  ],
  [FileCategory.Image]: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico'],
  [FileCategory.Video]: ['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'rmvb'],
  [FileCategory.Audio]: ['mp3', 'wav', 'flac', 'ape', 'aac', 'ogg', 'm4a'],
  [FileCategory.Zip]: ['zip', 'rar', '7z', 'tar', 'gz'],
  [FileCategory.Installer]: ['exe', 'dmg', 'pkg'],
};

export type FsDirentDto = {
  name: string;
  category: FileCategory;
  stats: {
    birthtime: string;
    size: number;
  };
  playUrl: string;
  downloadUrl: string;
};
