import { FileCategory, fileType, FsDirentDto } from '@/types/FsDirentDto';
import { create } from 'zustand';

// export const category = {
//   all: 'all',
//   document: 'document',
//   image: 'image',
//   video: 'video',
//   audio: 'audio',
//   zip: 'zip',
//   installer: 'installer',
// } as const;
// export type FileCategory = (typeof category)[keyof typeof category];

// export const fileType = {
//   [category.all]: [''],
//   [category.document]: ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'pdf', 'txt'],
//   [category.image]: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico'],
//   [category.video]: ['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'rmvb'],
//   [category.audio]: ['mp3', 'wav', 'flac', 'ape', 'aac', 'ogg', 'm4a'],
//   [category.zip]: ['zip', 'rar', '7z', 'tar', 'gz'],
//   [category.installer]: ['exe', 'dmg', 'pkg'],
// };

// export function getCategoryByType(type: string): FileCategory | null {
//   for (const [key, extensions] of Object.entries(fileType)) {
//     if (extensions.includes(type)) {
//       return key as FileCategory;
//     }
//   }
//   return null;
// }

type CommonStore = {
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;

  playFile: FsDirentDto | null;
  setPlayFile: (file: FsDirentDto | null) => void;
};

export const useCommonStore = create<CommonStore>((set) => ({
  isUploading: false,
  setIsUploading: (isUploading) => set(() => ({ isUploading })),

  playFile: null,
  setPlayFile: (file) => set(() => ({ playFile: file })),
}));

type ShowProgressStore = {
  showProgress: boolean;
  setShowProgress: (show: boolean) => void;
};

export const useShowProgressStore = create<ShowProgressStore>((set) => ({
  showProgress: false,
  setShowProgress: (show) => set(() => ({ showProgress: show })),
}));

type DeleteFileStore = {
  deleteFile: string;
  setDeleteFile: (fileName: string) => void;
};

export const useDeleteFileStore = create<DeleteFileStore>((set) => ({
  deleteFile: '',
  setDeleteFile: (fileName) => set(() => ({ deleteFile: fileName })),
}));

type SearchFileStore = {
  keyword: string;
  category: FileCategory;
  activatedLabel: string;
  setKeyword: (keyword: string) => void;
  setCategory: (category: FileCategory) => void;
  setActivatedLabel: (label: string) => void;
};

export const useSearchFileStore = create<SearchFileStore>((set) => ({
  keyword: '',
  setKeyword: (keyword) => set(() => ({ keyword })),
  category: FileCategory.All,
  setCategory: (category) => set(() => ({ category })),
  activatedLabel: '',
  setActivatedLabel: (label) => set(() => ({ activatedLabel: label })),
}));

type ToastStore = {
  toastId: number;
  title: string;
  content: string;
  setToast: (title: string, content: string) => void;
};

export const useToastStore = create<ToastStore>((set) => ({
  toastId: 0,
  title: '',
  content: '',
  setToast: (title, content) => set(() => ({ toastId: Date.now(), title, content })),
}));

type RowStore = {
  deletedRows: Set<string>;
  addDeletedRow: (row: string) => void;
  rows: Set<string>;
  addRow: (row: string) => void;
  removeRow: (row: string) => void;
  clear: () => void;
};

export const useRowStore = create<RowStore>((set) => ({
  deletedRows: new Set(),
  addDeletedRow: (row) => set((state) => ({ deletedRows: new Set([...Array.from(state.deletedRows), row]) })),
  rows: new Set(),
  addRow: (row) => set((state) => ({ rows: new Set([...Array.from(state.deletedRows), row]) })),
  removeRow: (row) =>
    set((state) => {
      state.rows.delete(row);
      return { rows: new Set(state.rows) };
    }),
  clear: () => set(() => ({ rows: new Set() })),
}));

type FileListStore = {
  files: FsDirentDto[];
  setFiles: (files: FsDirentDto[]) => void;
  addFile: (file: FsDirentDto) => void;
  removeFile: (file: FsDirentDto) => void;
  sortByNamesAsc: (asc: boolean) => void;
  sortByDatesAsc: (asc: boolean) => void;
};

export const useFileListStore = create<FileListStore>((set) => ({
  files: [],
  setFiles: (files) => set(() => ({ files })),
  addFile: (file) =>
    set((state) => {
      const extention = file.name.split('.').pop()!;
      const extentions = fileType[useSearchFileStore.getState().category];

      const label = useSearchFileStore.getState().activatedLabel;
      if (extentions.includes(extention) || !label) {
        return { files: [file, ...state.files] };
      }

      return { files: state.files };
    }),
  removeFile: (file) => set((state) => ({ files: state.files.filter((f) => f.name !== file.name) })),
  sortByNamesAsc: (asc) =>
    set((state) => {
      const files = [...state.files].sort((a, b) =>
        asc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
      );
      return { files };
    }),
  sortByDatesAsc: (asc) =>
    set((state) => {
      const files = [...state.files].sort((a, b) =>
        asc
          ? new Date(a.stats.birthtime).getTime() - new Date(b.stats.birthtime).getTime()
          : new Date(b.stats.birthtime).getTime() - new Date(a.stats.birthtime).getTime(),
      );
      return { files };
    }),
}));
