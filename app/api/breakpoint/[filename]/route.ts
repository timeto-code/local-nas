import { ERROR_CODE, handleApiError, handleApiResponse } from '@/util';
import fs from 'fs';
import { NextResponse, type NextRequest } from 'next/server';
import path from 'path';

export const GET = async (req: NextRequest, { params }: { params: { filename: string } }) => {
  const fileName = params.filename;

  try {
    const fileDir = path.join(process.cwd(), 'files', 'temp', fileName);
    const fileExists = fs.existsSync(fileDir);

    if (!fileExists) {
      return NextResponse.json(handleApiResponse({ chunks: [], uploadedSize: 0 }));
    }

    const chunks = (await fs.promises.readdir(fileDir)).map((chunk) => Number(chunk.split('_')[1]));

    if (chunks.length === 0) {
      return NextResponse.json(handleApiResponse({ chunks: [], uploadedSize: 0 }));
    }

    // 计算已上传的分片的总大小
    const uploadedSize = chunks.reduce((acc, chunk) => {
      const chunkPath = path.join(fileDir, `chunk_${chunk}`);
      const stats = fs.statSync(chunkPath);
      return acc + stats.size;
    }, 0);

    return NextResponse.json(handleApiResponse({ chunks, uploadedSize }));
  } catch (error) {
    return NextResponse.json(handleApiError(ERROR_CODE.API_UPLOAD_BREAKPOINT_GET, error));
  }
};
