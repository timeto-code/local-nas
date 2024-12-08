import Progress from '@/components/footer/ProgressDrawer';
import Confirmation from '@/components/main/Confirmation';
import FileList from '@/components/main/FileList';
import SearchBar from '@/components/main/SearchBar';
import Navbar from '@/components/navbar/Navbar';
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
