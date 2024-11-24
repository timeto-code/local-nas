import Image from 'next/image';

import { category, getCategoryByType } from '@/store';

const specialFileType = ['txt', 'md', 'pdf'];

const page = ({ params }: { params: { name: string } }) => {
  const decodedName = decodeURIComponent(params.name);
  if (!params.name || !params.name.includes('.')) {
    throw new Error(decodedName);
  }

  const extension = params.name.split('.').pop() || '';
  const fileType = specialFileType.includes(extension) ? extension : getCategoryByType(extension) || category.all;

  switch (fileType) {
    case 'txt':
    case 'md':
    case 'pdf':
      return <iframe src={`/shared/${params.name}`} width="100%" height="100%" />;

    case category.image:
      return <Image src={`/shared/${params.name}`} alt={params.name} className="object-contain" fill />;

    case category.video:
      return (
        <div className="flex h-full items-center justify-center bg-black md:p-20">
          <div className="overflow-hidden rounded">
            <video className="rounded outline-none" src={`/api/play/${params.name}`} controls />
          </div>
        </div>
      );

    case category.audio:
      return (
        <div className="flex h-full items-center justify-center p-5 md:p-10">
          <div className="w-full max-w-[550px] space-y-2 md:w-[50%]">
            <p className="pl-5 text-lg">{decodedName}</p>
            <audio className="w-full outline-none" src={`/shared/${params.name}`} controls />
          </div>
        </div>
      );

    default:
      return (
        <div className="flex h-full flex-col items-center justify-center text-lg">
          <span>{decodedName}</span>
          <span>文件类型不支持预览</span>
        </div>
      );
  }
};

export default page;
