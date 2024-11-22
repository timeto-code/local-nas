import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

import { createJsonResponse, directory, Logger, msg } from '../../_utils';

const releaseResources = async (
  readStream: fs.ReadStream | null,
  fileHandle: fs.promises.FileHandle | null,
  transformWriter?: WritableStreamDefaultWriter<Uint8Array> | null,
) => {
  /* 不论 fs.ReadStream 还是 stream.Readable 都没有 close() 方法，但是调用时 TS 不报错。很奇怪！！！ */
  readStream?.destroy();
  await fileHandle?.close();
  await transformWriter?.close();
};

export const GET = async (_req: Request, { params }: { params: { filename: string } }) => {
  const { filename } = params;

  if (!filename) {
    Logger.debug(msg.invalidParameters);
    return createJsonResponse({ code: 1, message: msg.invalidParameters });
  }

  const filePath = path.join(directory.shared, filename);
  if (!fs.existsSync(filePath)) {
    Logger.debug(msg.notFound);
    return createJsonResponse({ code: 1, message: msg.notFound });
  }

  let fileHandle: fs.promises.FileHandle | null = null;
  let transformWriter: WritableStreamDefaultWriter<Uint8Array> | null = null;
  let readStream: fs.ReadStream | null = null;

  try {
    fileHandle = await fs.promises.open(filePath, 'r');
    const fileStat = await fileHandle.stat();

    const transformStream = new TransformStream();
    transformWriter = transformStream.writable.getWriter();

    readStream = fileHandle.createReadStream();
    /* readStream 读取返回的 chunk 类型默认为 Buffer。只有通过 readStream.setEncoding('x') 设置编码时才会返回 string。所以直接断言为 Buffer 传递给 transform 流 */
    readStream.on('data', async (chunk: Buffer) => {
      await transformWriter!.write(chunk);
    });

    readStream.on('end', async () => {
      await releaseResources(readStream, fileHandle, transformWriter);
    });

    readStream.on('error', async (error) => {
      throw error;
    });

    return new NextResponse(transformStream.readable, {
      headers: {
        // 通知任何中间件或代理服务器不要转换、修改数据
        'Cache-Control': 'no-transform',
        // 提供文件大小，以便浏览器显示下载进度
        'Content-Length': fileStat.size.toString(),
        // 内容格式统一设置为八位字节流（二进制流）
        'Content-Type': 'application/octet-stream',
        // 通知浏览器下载文件，而不是直接打开，同时提供下载文件名。
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    releaseResources(readStream, fileHandle, transformWriter).catch((error) => Logger.error(error));
    Logger.error(error);
    return createJsonResponse({ code: 1, message: msg.serverError });
  }
};
