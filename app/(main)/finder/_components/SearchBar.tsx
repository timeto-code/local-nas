'use client';

import { GoSearch } from 'react-icons/go';

import { useSearchFileStore } from '@/store';
import { useRef } from 'react';
import Category from './Category';

const SearchBar = () => {
  const debounceTimerId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOnchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (debounceTimerId.current) clearTimeout(debounceTimerId.current);
    debounceTimerId.current = setTimeout(() => {
      useSearchFileStore.getState().setKeyword(e.target.value);
    }, 500);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="relative flex w-[80%] max-w-[650px] items-center justify-center">
        <GoSearch className="absolute left-4 top-[50%] -translate-y-1/2 placeholder:text-foreground" size={20} />
        <input
          type="text"
          placeholder="搜索文件"
          className="h-12 w-full rounded-full bg-hover py-2 pl-12 pr-4 placeholder:text-foreground focus:bg-background focus:shadow-bottom-1px focus:outline-none"
          onChange={handleOnchange}
        />
      </div>
      <Category />
    </div>
  );
};

export default SearchBar;
