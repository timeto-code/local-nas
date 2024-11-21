'use client';

import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { LiaSpinnerSolid } from 'react-icons/lia';

import { bytesToSize } from '@/lib/utils';
import { TransferFile } from '@/modules/uploader';
import { useShowProgressStore } from '@/store';
import { useUploaderStore } from '@/store/useUploaderStore';
import ProgressBar from '../ProgressBar';

/* 进度条 label */
const Label = ({ transferFile }: { transferFile: TransferFile }) => {
  return (
    <div className="flex items-end justify-between space-x-4">
      <p
        className={`mt-1 truncate text-sm ${transferFile.status === 'failure' && 'text-failed'}`}
        title={transferFile.file.name}
      >
        {transferFile.file.name}
      </p>

      {transferFile.status === 'success' ? (
        <span className="whitespace-nowrap text-sm leading-3 text-success">
          <IoCheckmarkCircle size={20} />
        </span>
      ) : transferFile.status === 'merging' ? (
        <span className="whitespace-nowrap text-sm leading-3 text-[#6da2f8]">
          <LiaSpinnerSolid size={20} className="animate-spin" />
        </span>
      ) : (
        <span className="whitespace-nowrap text-sm">
          <span>{bytesToSize(transferFile.receivedBytes)}</span>
          {' / '}
          <span>{bytesToSize(transferFile.file.size)}</span>
        </span>
      )}
    </div>
  );
};

/* 进度条 */
const Progress = () => {
  const transferFileArray = useUploaderStore((state) => state.transferFileArray);
  const showProgress = useShowProgressStore((state) => state.showProgress);
  const height = 56 + 26 * transferFileArray.length + 10 * (transferFileArray.length - 1) + 8 + 16;

  if (transferFileArray.length === 0) return null;

  return (
    <div
      className={`fixed bottom-0 right-6 flex max-h-[calc(60%)] flex-col h-[calc(60%-${height}px)] w-[300px] overflow-hidden rounded-t-3xl border bg-background shadow-rounded-1px transition-transform duration-500 md:w-[380px] ${transferFileArray.length > 0 && showProgress ? `animate-slide-up` : `animate-slide-down`}`}
    >
      <div className="flex items-center justify-between bg-hover px-4 py-3">
        <p className="text-lg">上传队列（{transferFileArray.length}）</p>
        <button
          className="flex size-8 items-center justify-center rounded-full hover:bg-button-hover"
          onClick={() => useShowProgressStore.getState().setShowProgress(!showProgress)}
        >
          {showProgress ? <IoIosArrowDown size={24} /> : <IoIosArrowUp size={24} />}
        </button>
      </div>
      <div className="flex-1 overflow-hidden overflow-y-auto pt-2">
        <ul className="space-y-2.5 px-4 pb-4">
          {transferFileArray.map((tf, index) => (
            <li key={index} className="flex flex-col justify-center">
              <Label transferFile={tf} />
              <ProgressBar
                progress={(tf.receivedBytes / tf.file.size) * 100}
                color={tf.status === 'success' ? '#f2f2f2' : tf.status === 'failure' ? '#ef4444' : ''}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Progress;
