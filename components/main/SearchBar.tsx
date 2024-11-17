'use client';

import { GoSearch } from 'react-icons/go';

import { useSearchFileStore } from '@/store';
import Category from './Category';

const SearchBar = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="relative flex w-[80%] max-w-[650px] items-center justify-center">
        <GoSearch className="absolute left-4 top-[50%] -translate-y-1/2 placeholder:text-foreground" size={20} />
        <input
          type="text"
          placeholder="搜索文件"
          className="h-12 w-full rounded-full bg-hover py-2 pl-12 pr-4 placeholder:text-foreground focus:bg-background focus:shadow-bottom-1px focus:outline-none"
          onChange={(e) => {
            useSearchFileStore.getState().setSearch(e.target.value);
          }}
        />
      </div>
      <Category />
    </div>
  );
};

export default SearchBar;
