import fs from 'fs';
import path from 'path';
import { type NextRequest, NextResponse } from 'next/server';

import { FileDto } from '@/dtos';
import { ApiSerializableResponse, createJsonResponse, directory, Logger, msg } from '../_utils';
import { category, FileCategory, fileType } from '@/store';

/**
 * 获取文件列表接口
 *
 * 通过 node fs.promises.readdir 读取文件夹下的所有内容。
 * 同时筛掉文件夹、隐藏文件和名称不包含 search 关键字的文件。
 * 将筛选后的文件转换为 FileDto 对象。按创建时间倒序排序。
 *
 * - search: 搜索关键字。
 */
export const GET = async <T>(req: NextRequest): Promise<NextResponse<ApiSerializableResponse<T>>> => {
  const search = req.nextUrl.searchParams.get('search')?.toLowerCase() || '';
  const type = req.nextUrl.searchParams.get('type') || '';

  if (type && !Object.keys(category).includes(type)) {
    return createJsonResponse({ code: 1, message: msg.invalidParameters });
  }

  try {
    const files = (
      await fs.promises.readdir(directory.shared, {
        withFileTypes: true,
        recursive: false,
      })
    ).filter(
      (file) =>
        file.isFile() &&
        !file.name.startsWith('.') &&
        file.name.toLowerCase().includes(search) &&
        (type === '' ||
          type === category.all ||
          fileType[type as FileCategory].includes(path.extname(file.name).toLowerCase().split('.').pop() || '')),
    );

    const FileDtos = await Promise.all(
      files.map(async (file): Promise<FileDto> => {
        const stats = await fs.promises.stat(path.join(file.parentPath, file.name));

        return {
          name: file.name,
          stats: {
            birthtime: stats.birthtime.toISOString(),
            size: stats.size,
          },
        };
      }),
    );

    FileDtos.sort((a, b) => new Date(b.stats.birthtime).getTime() - new Date(a.stats.birthtime).getTime());

    return NextResponse.json(
      { code: 0, message: FileDtos },
      {
        headers: {
          'Cache-Control': 'no-cache',
        },
      },
    );
  } catch (error) {
    Logger.error(error);
    return createJsonResponse({ code: 1, message: msg.serverError });
  }
};
