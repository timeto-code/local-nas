'use client';

import axios from 'axios';

import { toast } from '@/lib/utils';
import { useRowStore, useDeleteFileStore } from '@/store';

const Confirmation = () => {
  const fileName = useDeleteFileStore((state) => state.deleteFile);

  const handleConfirm = async () => {
    // 添加到正在执行的操作列表中，用于显示转圈提示
    useRowStore.getState().addRow(fileName);

    axios
      .delete(`/api/delete/${fileName}`)
      .then((res) => {
        if (res.data.code === 0) {
          // 触发行元素删除动画
          useRowStore.getState().addDeletedRow(fileName);

          // useDeleteFileStore.getState().setFileDeleted();
        } else {
          toast('删除失败', '请刷新页面后重试');
        }
      })
      .catch((error) => {
        console.error(`Delete file failed: ${error}`);
        toast('删除失败', '请刷新页面后重试');
      });

    handleCancel();
  };

  const handleCancel = () => {
    useDeleteFileStore.getState().setDeleteFile('');
  };

  if (!fileName) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-confirmation shadow-md">
      <div className="w-[80%] max-w-[768px] cursor-default space-y-4 rounded bg-background p-4 md:p-6">
        <div className="space-y-2">
          <p className="text-lg font-bold">确定要删除吗？</p>
          <p className="w-full truncate py-1 text-lighten">{fileName}</p>
        </div>
        <div className="flex items-center justify-between">
          <button className="cancel-btn rounded px-4 py-2 text-sm" onClick={handleCancel}>
            取消
          </button>
          <button
            className="rounded bg-failed px-4 py-2 text-sm text-background hover:bg-failed-hover"
            onClick={handleConfirm}
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
