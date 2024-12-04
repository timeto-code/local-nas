'use client';

import { useEffect, useState } from 'react';
import { AiFillDelete } from 'react-icons/ai';
import { GoSortAsc, GoSortDesc } from 'react-icons/go';
import { IoMdMore } from 'react-icons/io';
import { LiaSpinnerSolid } from 'react-icons/lia';
import { LuDownload } from 'react-icons/lu';

import { bytesToSize, toast } from '@/lib/utils';
import { useDeleteFileStore, useFileListStore, useRowStore } from '@/store';
import { FsDirentDto } from '@/types/FsDirentDto';
import { useRouter } from 'next/navigation';
import Icons from '../../../../components/Icons';

const ListHeader = () => {
  const [animateColumn, setAnimateColumn] = useState(false);
  const [nameSort, setNameSort] = useState<'asc' | 'desc' | 'none'>('none');
  const [dateSort, setDateSort] = useState<'asc' | 'desc' | 'none'>('desc');

  const sortByNames = () => {
    if (nameSort === 'none') {
      useFileListStore.getState().sortByNamesAsc(true);
      setNameSort('asc');
      setDateSort('none');
    } else if (nameSort === 'asc') {
      useFileListStore.getState().sortByNamesAsc(false);
      setNameSort('desc');
      setDateSort('none');
    } else {
      useFileListStore.getState().sortByNamesAsc(true);
      setNameSort('asc');
      setDateSort('none');
    }
  };

  const sortByDates = () => {
    if (dateSort === 'none') {
      useFileListStore.getState().sortByDatesAsc(true);
      setDateSort('asc');
      setNameSort('none');
    } else if (dateSort === 'asc') {
      useFileListStore.getState().sortByDatesAsc(false);
      setDateSort('desc');
      setNameSort('none');
    } else {
      useFileListStore.getState().sortByDatesAsc(true);
      setDateSort('asc');
      setNameSort('none');
    }
  };

  useEffect(() => {
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) {
        setAnimateColumn(true);
      } else {
        setAnimateColumn(false);
      }
    });

    return () => {
      window.removeEventListener('resize', () => {});
    };
  }, []);

  return (
    <>
      <div className="flex h-12 items-end space-x-2 px-2 pb-2">
        <div className="flex-1 pr-5">
          <button className="group flex items-center space-x-0.5" onClick={sortByNames}>
            <p className="">名称</p>
            {nameSort !== 'none' && (
              <>
                {nameSort === 'asc' ? (
                  <GoSortAsc className={`translate-y-[1px]`} size={18} />
                ) : (
                  <GoSortDesc className={`translate-y-[1px]`} size={18} />
                )}
              </>
            )}
          </button>
        </div>
        <div className="flex w-44 items-end justify-end lg:w-[40%]">
          <button className="hidden basis-1/2 items-center space-x-0.5 overflow-hidden lg:flex" onClick={sortByDates}>
            <p className={`${animateColumn && 'animate-birthtime-label-slide-in'}`}>创建日期</p>
            <div className={`${animateColumn && 'animate-birthtime-label-slide-in'}`}>
              {dateSort !== 'none' && (
                <>
                  {dateSort === 'asc' ? (
                    <GoSortAsc className={`translate-y-[1px]`} size={18} />
                  ) : (
                    <GoSortDesc className={`translate-y-[1px]`} size={18} />
                  )}
                </>
              )}
            </div>
          </button>
          <p className="hidden min-w-20 text-end md:block lg:basis-1/4">大小</p>
          <div className="flex min-w-24 items-center justify-end lg:basis-1/4">
            <button
              className="file-list-row-btn"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
              }}
            >
              <IoMdMore size={22} />
            </button>
          </div>
        </div>
      </div>
      <hr className="border-t-black/30" />
    </>
  );
};

interface Props {
  file: FsDirentDto;
}

const ListRow = ({ file }: Props) => {
  const router = useRouter();
  const [animateColumn, setAnimateColumn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [visible, setVisible] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const row = Array.from(useRowStore((state) => state.rows)).find((row) => row === file.name);
  const deletedRow = useRowStore((state) => state.deletedRows);

  const option = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  } as Intl.DateTimeFormatOptions;

  useEffect(() => {
    if (deletedRow.has(file.name)) {
      // 开始文字消除动画
      setVisible(false);

      setTimeout(() => {
        // 删除内部内容元素，防止高度动画被卡住
        setHidden(true);
        setDeleted(true);
      }, 300);
    }
  }, [deletedRow, file]);

  useEffect(() => {
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) {
        setAnimateColumn(true);
      } else {
        setAnimateColumn(false);
      }
    });

    return () => {
      window.removeEventListener('resize', () => {});
    };
  }, []);

  const handlePlay = () => {
    sessionStorage.setItem('file', JSON.stringify(file));
    router.push(`/finder/preview/${file.name}`);
  };

  const handleDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    // 服务端：express res.download() 提供下载
    // 客户端：HEAD 请求 + a 标签请求下载
    fetch(file.downloadUrl, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          const a = document.createElement('a');
          a.href = file.downloadUrl;
          a.download = file.name;
          a.click();
          a.remove();
        } else {
          toast('下载失败', '目标资源不存在');
        }
      })
      .catch((error) => {
        console.error(error);
        toast('下载失败', '网络请求失败');
      });

    // 后端能配合 express download 和自定义实现使用。但是性能都低下，不如上面的直接和 express download 配合使用。
    // 服务器：fs.createReadStream() + res.pipe() 提供二进制流下载
    // 客户端（next.js 页面）：a 标签携带参数请求 next.js 后台
    // 客户端（next.js 后台）：提取参数，fetch 请求服务器，获得二进制流，返回 web ReadableStream，提供 a 标签下载
    // const a = document.createElement('a');
    // a.href = `/api/download/${file.name}?filesize=${file.stats.size}&downloadUrl=${file.downloadUrl}`;
    // a.download = file.name;
    // a.click();
    // a.remove();
  };

  return (
    <div className={`max-h-[48px] overflow-hidden ${deleted && 'animate-row-delete'}`}>
      {hidden ? (
        <div className="h-12"></div>
      ) : (
        <div
          className={`flex h-12 flex-col overflow-hidden opacity-0 transition-opacity duration-300 ${visible && 'opacity-100'}`}
        >
          <div
            className={`flex flex-1 items-center space-x-2 px-2 hover:bg-hover`}
            onMouseEnter={() => setShowMenu(true)}
            onMouseLeave={() => setShowMenu(false)}
          >
            <div className="flex flex-1 space-x-2 truncate text-sm lg:pr-5">
              <div className="w-5">
                <Icons name={file.name} size={20} />
              </div>
              <button className="truncate" onClick={handlePlay}>
                {file.name}
              </button>
            </div>
            <div className="flex w-20 items-center justify-end overflow-hidden md:w-44 lg:w-[40%]">
              <div className="hidden basis-1/2 overflow-hidden lg:block">
                <p className={`${animateColumn && 'animate-birthtime-slide-in'} text-sm`}>
                  {new Date(file.stats.birthtime).toLocaleDateString('zh', option)}
                </p>
              </div>
              <p className="hidden min-w-20 text-end text-sm md:block lg:basis-1/4">{bytesToSize(file.stats.size)}</p>
              <div className="flex min-w-20 items-center justify-end space-x-2 lg:basis-1/4">
                {showMenu && (
                  <>
                    {row ? (
                      <div className="flex size-8 items-center justify-center">
                        <LiaSpinnerSolid size={20} className="animate-spin" />
                      </div>
                    ) : (
                      <button
                        title="删除"
                        className="flex size-8 items-center justify-center rounded-full text-transparent/80 hover:bg-button-hover"
                        onClick={() => useDeleteFileStore.getState().setDeleteFile(file.name)}
                      >
                        <AiFillDelete size={18} />
                      </button>
                    )}
                  </>
                )}
                <button title="下载" className="file-list-row-btn" onClick={handleDownload}>
                  <LuDownload size={18} />
                </button>
              </div>
            </div>
          </div>
          <hr className="border-t-black/30" />
        </div>
      )}
    </div>
  );
};

export { ListHeader, ListRow };
