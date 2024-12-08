import Image from 'next/image';

import { Failures, Successes } from './Status';
import Upload from './Upload';

const Navbar = () => {
  return (
    <div className="flex h-full items-center justify-between bg-background px-4 shadow-md">
      <div className="flex h-full items-center justify-center space-x-2 py-1">
        <div className="relative h-full w-8">
          <Image src="/icons/icons8-onedrive-96.svg" alt="folder" fill className="object-contain" />
        </div>
        <p className="text-lg">文件共享</p>
      </div>
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-2">
          <Failures />
          <Successes />
        </div>
        <Upload />
      </div>
    </div>
  );
};

export default Navbar;
