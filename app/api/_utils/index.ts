import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

import { FileDto } from '@/dtos';

export const msg = {
  success: 'success',
  invalidParameters: 'Invalid parameters',
  invalidBody: 'Invalid body',
  notFound: 'Not found',
  serverError: 'Server error',
} as const;

export class Logger {
  static error<T>(error: T) {
    console.log(`\u001b[31m${new Date().toLocaleTimeString()} [ERROR]\u001b[0m`, error);
  }

  static debug<T>(msg: T) {
    console.log(`\u001b[32m${new Date().toLocaleTimeString()} [DEBUG]\u001b[0m`, msg);
  }
}

const shared = process.env.SHARED_FOLDER_PATH || path.join(process.cwd(), 'public', 'shared');
export const directory = {
  shared,
  temp: path.join(shared, 'temp'),
};

/**
 * 目标目录下生成唯一的文件名。如果文件名已存在，添加 (n) 编号。
 *
 * @param {string} dirPath 目录绝对路径
 * @param {string} fileName 文件名
 */
export const generateUniquePath = (dirPath: string, fileName: string) => {
  let counter = 1;
  let uniqueFilePath = path.join(dirPath, fileName);

  while (fs.existsSync(uniqueFilePath)) {
    const ext = fileName.slice(fileName.lastIndexOf('.'));
    const baseName = fileName.slice(0, fileName.lastIndexOf('.'));
    uniqueFilePath = path.join(dirPath, `${baseName} (${counter})${ext}`);
    counter++;
  }

  return uniqueFilePath;
};

export type ApiSerializableResponse<T> = { code: 0 | 1; message: T | string | FileDto[] };

export const createJsonResponse = <T>({ code, message }: ApiSerializableResponse<T>) => {
  return NextResponse.json({ code, message });
};
