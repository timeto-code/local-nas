'use client';

import { BiSolidError } from 'react-icons/bi';
import { IoCheckmarkCircle } from 'react-icons/io5';

import { useUploaderStore } from '@/store/useUploaderStore';

interface Props {
  className?: string;
  iconSize?: number;
  iconClassName?: string;
}

const Failures = ({ className, iconSize = 18, iconClassName }: Props) => {
  const transferFileArray = useUploaderStore((state) => state.transferFileArray).filter(
    (tf) => tf.status === 'failure',
  );

  if (transferFileArray.length === 0) return null;

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <BiSolidError size={iconSize} className={`text-failed ${iconClassName}`} />
      <span className="">{transferFileArray.length}</span>
    </div>
  );
};

const Successes = ({ className, iconSize = 18, iconClassName }: Props) => {
  const transferFileArray = useUploaderStore((state) => state.transferFileArray).filter(
    (tf) => tf.status === 'success',
  );

  if (transferFileArray.length === 0) return null;

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <IoCheckmarkCircle size={iconSize} className={`text-success ${iconClassName}`} />
      <span className="">{transferFileArray.length}</span>
    </div>
  );
};

export { Failures, Successes };
