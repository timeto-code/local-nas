import { useSearchFileStore } from '@/store';
import { FileCategory } from '@/types/FsDirentDto';
import { useEffect, useState } from 'react';
import Icons from '../../../../components/Icons';

const CATEGORY_CONFIG: Record<
  string,
  {
    category: FileCategory;
    color: string;
    borderColor: string;
    icon: JSX.Element;
  }
> = {
  文档: {
    category: FileCategory.Document,
    color: '#FFC107',
    borderColor: 'border-[#FFC107]',
    icon: <Icons name="txt" size={21} />,
  },
  图片: {
    category: FileCategory.Image,
    color: '#4CAF50',
    borderColor: 'border-[#4CAF50]',
    icon: <Icons name="png" size={20} className="mr-0.5" />,
  },
  视频: {
    category: FileCategory.Video,
    color: '#F44336',
    borderColor: 'border-[#F44336]',
    icon: <Icons name="mp4" size={20} />,
  },
  音频: {
    category: FileCategory.Audio,
    color: '#2196F3',
    borderColor: 'border-[#2196F3]',
    icon: <Icons name="mp3" size={20} />,
  },
  压缩包LG: {
    category: FileCategory.Zip,
    color: '#795548',
    borderColor: 'border-[#795548]',
    icon: <Icons name="zip" size={20} />,
  },
  压缩包MD: {
    category: FileCategory.Zip,
    color: '#795548',
    borderColor: 'border-[#795548]',
    icon: <Icons name="zip" size={20} />,
  },
  安装包: {
    category: FileCategory.Installer,
    color: '#607D8B',
    borderColor: 'border-[#607D8B]',
    icon: <Icons name="exe" size={20} />,
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
    useSearchFileStore.getState().setCategory(!isActive ? CATEGORY_CONFIG[label].category : FileCategory.All);
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
