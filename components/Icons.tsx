import { AiOutlineFileGif, AiOutlineFilePdf, AiOutlineFilePpt } from 'react-icons/ai';
import { CgFileDocument } from 'react-icons/cg';
import { GoFileZip } from 'react-icons/go';
import { LuFileAudio, LuFileBox } from 'react-icons/lu';
import { MdInstallDesktop } from 'react-icons/md';
import { PiVideoBold } from 'react-icons/pi';
import { RxImage } from 'react-icons/rx';

interface Props {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}

const Icons = ({ name, className, size = 20, color }: Props) => {
  const extension = name.split('.').pop() || '';

  switch (extension) {
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'webp':
    case 'bmp':
    case 'ico':
      return <RxImage size={size} color={color || '#4CAF50'} className={className} />;
    case 'gif':
      return <AiOutlineFileGif size={size} color={color || '#4CAF50'} className={className} />;
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'mkv':
    case 'flv':
    case 'wmv':
    case 'rmvb':
      return <PiVideoBold size={size} color={color || '#F44336'} className={className} />;
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'ape':
    case 'aac':
    case 'ogg':
    case 'm4a':
      return <LuFileAudio size={size} color={color || '#2196F3'} className={className} />;
    case 'doc':
    case 'docx':
    case 'pptx':
    case 'xls':
    case 'xlsx':
    case 'pdf':
    case 'txt':
    case 'md':
    case 'json':
    case 'js':
      return (
        <div className={className}>
          <CgFileDocument size={size} color={color || '#FFC107'} className={className} />
        </div>
      );
    case 'pdf':
      return <AiOutlineFilePdf size={size} color={color || '#FFC107'} className={className} />;
    case 'ppt':
      return <AiOutlineFilePpt size={size} color={color || '#FFC107'} className={className} />;
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return <GoFileZip size={size} color={color || '#795548'} className={className} />;
    case 'exe':
    case 'dmg':
    case 'pkg':
    case 'apk':
    case 'xapk':
      return <MdInstallDesktop size={size} color={color || '#607D8B'} className={className} />;
    default:
      return <LuFileBox size={size} color={color || 'gray'} className={className} />;
  }
};

export default Icons;
