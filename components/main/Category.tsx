import { FaFilm } from 'react-icons/fa';
import { GoFileZip } from 'react-icons/go';
import { IoDocumentTextOutline, IoImageOutline } from 'react-icons/io5';
import { MdInstallDesktop, MdOutlineAudioFile } from 'react-icons/md';

import { category, FileCategory, useSearchFileStore } from '@/store';

const CATEGORY_CONFIG: Record<
  string,
  {
    type: FileCategory;
    color: string;
    icon: JSX.Element;
  }
> = {
  文档: {
    type: category.document,
    color: '#FFC107',
    icon: <IoDocumentTextOutline size={20} color="#FFC107" />,
  },
  图片: {
    type: category.image,
    color: '#4CAF50',
    icon: <IoImageOutline size={20} color="#4CAF50" />,
  },
  视频: {
    type: category.video,
    color: '#F44336',
    icon: <FaFilm size={20} color="#F44336" />,
  },
  音频: {
    type: category.audio,
    color: '#2196F3',
    icon: <MdOutlineAudioFile size={20} color="#2196F3" />,
  },
  压缩包LG: {
    type: category.zip,
    color: '#795548',
    icon: <GoFileZip size={20} color="#795548" />,
  },
  压缩包MD: {
    type: category.zip,
    color: '#795548',
    icon: <GoFileZip size={20} color="#795548" />,
  },
  安装包: {
    type: category.installer,
    color: '#607D8B',
    icon: <MdInstallDesktop size={20} color="#607D8B" />,
  },
};

interface ItemProps {
  id: FileCategory;
  label: string;
  className?: string;
}

const Item = ({ id, label, className }: ItemProps) => {
  const type = useSearchFileStore((state) => state.type);

  const handleClick = () => {
    const isActived = id === useSearchFileStore.getState().activedType;
    useSearchFileStore.getState().setActivedType(CATEGORY_CONFIG[label].type);
    useSearchFileStore.getState().setType(isActived ? category.all : CATEGORY_CONFIG[label].type);
  };

  return (
    <div className={`${className}`}>
      <button
        className={`flex items-center space-x-1.5 rounded-full border bg-hover p-2 hover:bg-button-hover sm:py-1.5 sm:pl-3.5 sm:pr-4 ${id === type ? 'bg-button-hover shadow' : 'border-hover'}`}
        onClick={handleClick}
        style={{
          borderColor: id === type ? CATEGORY_CONFIG[label].color : '',
        }}
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
          id={CATEGORY_CONFIG[key].type}
          className={!key.includes('压缩包') ? '' : key === '压缩包LG' ? 'hidden lg:block' : 'sm:hidden'}
        />
      ))}
    </div>
  );
};

export default Category;
