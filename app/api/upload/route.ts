import fs from 'fs';
import path from 'path';
import { type NextRequest, NextResponse } from 'next/server';

import { createJsonResponse, directory, generateUniquePath, Logger, msg } from '../_utils';

/**
 * 分片上传接口
 *
 * 使用 web ReadableStreamDefaultReader 读取 body 中的字节流（二进制流）。
 * 同时通过 node fs.promises.FileHandle.createWriteStream 写入临时文件。
 *
 * - name: 分片所属的文件名。
 * - index: 前台分片被创建时的循环下标。
 */
export const POST = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const name = searchParams.get('name');
  const index = searchParams.get('index');

  if (!name || !index) {
    Logger.debug(msg.invalidParameters);
    return createJsonResponse({ code: 1, message: msg.invalidParameters });
  }

  const chunksDir = path.join(directory.temp, name);
  const chunkPath = path.join(chunksDir, `chunk_${index}`);

  let filehandle: fs.promises.FileHandle | null = null;
  let fileWriteStream: fs.WriteStream | null = null;

  try {
    const reader = req.body?.getReader();
    if (!reader) {
      Logger.error(msg.invalidBody);
      return createJsonResponse({ code: 1, message: msg.invalidBody });
    }

    /* 创建目录时 recursive 为 true 防止目录已存在时报错 */
    await fs.promises.mkdir(chunksDir, { recursive: true });

    filehandle = await fs.promises.open(chunkPath, 'w');

    /* 流起始位置为 0。分片上传失败，重传时有用 */
    fileWriteStream = filehandle.createWriteStream({
      start: 0,
      highWaterMark: 1024 * 1024 * 5,
    });

    /* 记录成功读取的分别大小，返回给前端做相应检查 */
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        /* 支持 TypedArray 类型参数，所以直接写入 */
        const status = fileWriteStream.write(value);

        /* 缓冲区大小与 body 相同，所以 drain 应该只触发一次 */
        if (!status) {
          await new Promise((resolve) => fileWriteStream!.once('drain', resolve));
        }

        loaded += value.byteLength;
      }
    }

    return createJsonResponse({ code: 0, message: { index, loaded } });
  } catch (error) {
    Logger.error(error);
    return createJsonResponse({ code: 1, message: msg.serverError });
  } finally {
    await filehandle?.close();
    fileWriteStream?.end();
  }
};

/**
 * 分片合并接口
 *
 * 使用 node fs.promises.readdir 读取特定分片目录。
 * 遍历目录下的分片，同时使用 fs.promises.readFile 读取分片内容。
 * 遍历同时，使用 fs.promise.FileHandle.createWriteStream 写入最终文件。
 * 遍历同时，使用 TransformStream 的可读流定期发送心跳，保持 SSE 活跃。
 * 遍历结束，文件写入成功后，使用 TransformStream 的可读流发送成功事件。
 * 最后删除存储分片的目录以及内部所有分片文件。
 *
 * - name: 存储分片的目录名。
 */
export const GET = async (req: NextRequest) => {
  const name = req.nextUrl.searchParams.get('name');

  if (!name) {
    Logger.debug(msg.invalidParameters);
    return createJsonResponse({ code: 1, message: msg.invalidParameters });
  }

  const chunksDir = path.join(directory.temp, name);

  let filehandle: fs.promises.FileHandle | null = null;
  let writeStream: fs.WriteStream | null = null;
  let transformWriter: WritableStreamDefaultWriter<Uint8Array> | null = null;

  try {
    const chunks = await fs.promises.readdir(chunksDir);

    const uniqueFilePath = generateUniquePath(directory.shared, name);
    filehandle = await fs.promises.open(uniqueFilePath, 'w');
    writeStream = filehandle.createWriteStream({
      highWaterMark: 1024 * 1024 * 50,
    });

    const messageTransformStream = new TransformStream();
    transformWriter = messageTransformStream.writable.getWriter();
    const encoder = new TextEncoder();

    for (let i = 0; i < chunks.length; i++) {
      const chunkPath = path.join(chunksDir, `chunk_${i}`);
      const chunk = await fs.promises.readFile(chunkPath);

      const status = writeStream.write(chunk);
      if (!status) {
        await new Promise((resolve) => writeStream!.once('drain', resolve));
      }

      /* ？？？write 返回 promise 但是 await 会一直阻塞程序，原理未知？？？ */
      transformWriter.write(encoder.encode(`: heartbeat\n\n`));
    }

    // 获取新文件的 stats 信息
    const stats = await fs.promises.stat(uniqueFilePath);
    const fileInfo = JSON.stringify({ name: path.basename(uniqueFilePath), stats });

    /* ？？？write 返回 promise 但是 await 会一直阻塞程序，原理未知？？？ */
    transformWriter.write(encoder.encode(`event: success\ndata: ${fileInfo}\n\n`));

    // 合并结束后清理分片文件。可 await 也可不 await
    fs.promises.rm(chunksDir, { recursive: true, force: true });

    return new NextResponse(messageTransformStream.readable, {
      headers: {
        'Cache-Control': 'no-cache, no-transform',
        'Content-Type': 'text/event-stream; charset=utf-8',
      },
    });
  } catch (error) {
    Logger.error(error);

    const message = `event: failed\ndata: ${name}\n\n`;
    return new NextResponse(message, {
      headers: {
        'Cache-Control': 'no-cache, no-transform',
        'Content-Type': 'text/event-stream; charset=utf-8',
      },
    });
  } finally {
    writeStream?.end();
    await filehandle?.close();
    /* ？？？close 返回 promise 但是 await 会一直阻塞程序，原理未知？？？ */
    transformWriter?.close();
  }
};
