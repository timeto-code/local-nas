import { TransferFile } from '@/modules/uploader';
import { create } from 'zustand';

type UploaderStore = {
  transferFileArray: TransferFile[];
  init: (tfArray: TransferFile[]) => void;
  update: (newtf: TransferFile) => void;
};

export const useUploaderStore = create<UploaderStore>((set) => ({
  transferFileArray: [],
  init: (transferFileArray) => set(() => ({ transferFileArray })),
  update: (newtf) =>
    set((state) => ({
      transferFileArray: state.transferFileArray.map((tf) => (tf.id === newtf.id ? newtf : tf)),
    })),
}));
