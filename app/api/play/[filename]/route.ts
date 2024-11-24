import { NextRequest } from 'next/server';
import { createJsonResponse, directory, Logger, msg } from '../../_utils';
import path from 'path';
import fs from 'fs';

export const GET = async (req: NextRequest, { params }: { params: { filename: string } }) => {
  const { filename } = params;
  const range = req.headers.get('range');

  let fileHandle: fs.promises.FileHandle | null = null;
  let fileReader: fs.ReadStream | null = null;
  let transformWriter: WritableStreamDefaultWriter | null = null;

  try {
    if (!filename || !range) {
      Logger.debug(msg.invalidParameters);
      return createJsonResponse({ code: 1, message: msg.invalidParameters });
    }

    const filePath = path.join(directory.shared, filename);
    if (!fs.existsSync(filePath)) {
      Logger.debug(msg.notFound);
      return createJsonResponse({ code: 1, message: msg.notFound });
    }

    fileHandle = await fs.promises.open(filePath, 'r');
    const fileStat = await fileHandle.stat();
    const chunkSize = 1024 * 1024 * 5; // 3MB
    const start = Number(range.replace(/bytes=/, '').split('-')[0]);
    const end = Math.min(start + chunkSize, fileStat.size - 1);
    fileReader = fileHandle.createReadStream({ start, end });

    // const webReadableStream = new ReadableStream({
    //   start(controller) {
    //     fileReader!.on('data', (chunk) => {
    //       controller.enqueue(chunk);
    //     });

    //     fileReader!.on('end', () => {
    //       controller.close();
    //     });

    //     fileReader!.on('error', (error) => {
    //       controller.error(error);
    //     });
    //   },
    // });

    const transformStream = new TransformStream();
    transformWriter = transformStream.writable.getWriter();

    fileReader.on('data', async (chunk: Buffer) => {
      await transformWriter!.write(chunk);
    });

    fileReader.on('end', async () => {
      await transformWriter!.close();
      await fileHandle!.close();
    });

    fileReader.on('error', async (error) => {
      throw error;
    });

    return new Response(transformStream.readable, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileStat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': `${end - start + 1}`,
        'Content-Type': 'video/mp4',
      },
    });
  } catch (error) {
    transformWriter?.close();
    fileReader?.destroy();
    fileHandle?.close();
    Logger.error(error);
    return createJsonResponse({ code: 1, message: msg.serverError });
  }
};
