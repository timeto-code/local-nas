import Progress from '@/app/(main)/finder/_components/ProgressDrawer';
import Confirmation from '@/app/(main)/finder/_components/Confirmation';
import FileList from '@/app/(main)/finder/_components/FileList';
import SearchBar from '@/app/(main)/finder/_components/SearchBar';
import Navbar from '@/app/(main)/finder/_components/Navbar';
import Toast from '@/components/Toast';

const page = () => {
  return (
    <div className="flex h-full flex-col overflow-hidden pt-12">
      <nav className="fixed inset-x-0 top-0 z-20 h-12">
        <Navbar />
      </nav>

      <main className="relative flex-1 overflow-y-scroll px-2 md:px-4">
        <div className="sticky top-0 z-10 h-44 bg-background">
          <SearchBar />
        </div>
        <div className="pb-20">
          <FileList />
        </div>
      </main>

      <Progress />
      <Confirmation />
      <Toast />
    </div>
  );
};

export default page;
