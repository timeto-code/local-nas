import { FaFilm } from 'react-icons/fa';
import { GoFileZip } from 'react-icons/go';
import { IoDocumentTextOutline, IoImageOutline } from 'react-icons/io5';
import { MdInstallDesktop, MdOutlineAudioFile } from 'react-icons/md';

import { category, FileCategory, useSearchFileStore } from '@/store';
import { useEffect, useState } from 'react';

const CATEGORY_CONFIG: Record<
  string,
  {
    type: FileCategory;
    color: string;
    borderColor: string;
    icon: JSX.Element;
  }
> = {
  文档: {
    type: category.document,
    color: '#FFC107',
    borderColor: 'border-[#FFC107]',
    icon: <IoDocumentTextOutline size={20} color="#FFC107" />,
  },
  图片: {
    type: category.image,
    color: '#4CAF50',
    borderColor: 'border-[#4CAF50]',
    icon: <IoImageOutline size={20} color="#4CAF50" />,
  },
  视频: {
    type: category.video,
    color: '#F44336',
    borderColor: 'border-[#F44336]',
    icon: <FaFilm size={20} color="#F44336" />,
  },
  音频: {
    type: category.audio,
    color: '#2196F3',
    borderColor: 'border-[#2196F3]',
    icon: <MdOutlineAudioFile size={20} color="#2196F3" />,
  },
  压缩包LG: {
    type: category.zip,
    color: '#795548',
    borderColor: 'border-[#795548]',
    icon: <GoFileZip size={20} color="#795548" />,
  },
  压缩包MD: {
    type: category.zip,
    color: '#795548',
    borderColor: 'border-[#795548]',
    icon: <GoFileZip size={20} color="#795548" />,
  },
  安装包: {
    type: category.installer,
    color: '#607D8B',
    borderColor: 'border-[#607D8B]',
    icon: <MdInstallDesktop size={20} color="#607D8B" />,
  },
};

interface ItemProps {
  label: string;
  className?: string;
}

const Item = ({ label, className }: ItemProps) => {
  const [isActive, setIsActive] = useState(false);
  const activatedLabel = useSearchFileStore((state) => state.activatedLabel);

  const handleClick = () => {
    setIsActive(!isActive);

    useSearchFileStore.getState().setActivatedLabel(!isActive ? label : '');
    useSearchFileStore.getState().setType(!isActive ? CATEGORY_CONFIG[label].type : category.all);
  };

  useEffect(() => {
    setIsActive(activatedLabel === label);
  }, [activatedLabel, label]);

  return (
    <div className={`${className}`}>
      <button
        className={`flex items-center space-x-1.5 rounded-full border bg-hover p-2 hover:bg-button-hover sm:py-1.5 sm:pl-3.5 sm:pr-4 ${isActive ? `${CATEGORY_CONFIG[label].borderColor}` : ''}`}
        onClick={handleClick}
      >
        {CATEGORY_CONFIG[label].icon}
        <span className="hidden sm:block">{label.includes('压缩包') ? '压缩包' : label}</span>
      </button>
    </div>
  );
};

const Category = () => {
  return (
    <div className="mt-2 flex space-x-3">
      {Object.keys(CATEGORY_CONFIG).map((key, index) => (
        <Item
          key={index}
          label={key}
          className={!key.includes('压缩包') ? '' : key === '压缩包LG' ? 'hidden lg:block' : 'sm:hidden'}
        />
      ))}
    </div>
  );
};

export default Category;
