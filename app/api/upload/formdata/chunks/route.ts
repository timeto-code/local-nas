import { NextResponse, type NextRequest } from 'next/server';

import fs from 'fs';
import path from 'path';
import { headers } from 'next/headers';

export const POST = async (req: NextRequest) => {
  let chunks: Uint8Array[] = [];
  const reader = req.body?.getReader();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    chunks.push(value);
  }

  // 提取边界（boundary）
  const headersList = headers();
  const contentType = headersList.get('content-type');
  const boundary = contentType!.split('boundary=')[1];

  // 将所有块数据拼接成一个完整的 Buffer
  const fileData = Buffer.concat(chunks);

  const boundaryBuffer = Buffer.from(`--${boundary}`); // 将边界转换为 Buffer

  // 找到边界并切割 Buffer
  let startIndex = 0;
  let endIndex;

  // 保持 chunkIndex 信息用于返回
  let totalChunks = 0;
  let chunkIndex = 0;
  let fileName = '';

  while ((endIndex = fileData.indexOf(boundaryBuffer, startIndex)) !== -1) {
    const part = fileData.subarray(startIndex, endIndex); // 提取每个部分
    startIndex = endIndex + boundaryBuffer.length;

    // 处理文件部分（你可以在这里继续处理各个部分）
    if (part.includes('Content-Disposition')) {
      if (part.includes('name="fileName"')) {
        const fileContentIndex = part.indexOf('\r\n\r\n');
        const fileContent = part.subarray(fileContentIndex + 4, part.length - 2); // 提取文件内容
        fileName = fileContent.toString();
      }

      if (part.includes('name="totalChunks"')) {
        const fileContentIndex = part.indexOf('\r\n\r\n');
        const fileContent = part.subarray(fileContentIndex + 4, part.length - 2);
        totalChunks = Number(fileContent.toString());
      }

      if (part.includes('name="chunkIndex"')) {
        const fileContentIndex = part.indexOf('\r\n\r\n');
        const fileContent = part.subarray(fileContentIndex + 4, part.length - 2); // 提取文件内容
        chunkIndex = Number(fileContent.toString());
      }

      if (part.includes('name="chunk"')) {
        const fileContentIndex = part.indexOf('\r\n\r\n');
        const fileContent = part.subarray(fileContentIndex + 4, part.length - 2); // 提取文件内容

        // 存储分片到临时目录
        const tempDir = path.join(process.cwd(), 'files', 'temp', fileName);
        if (!fs.existsSync(tempDir)) {
          await fs.promises.mkdir(tempDir, { recursive: true });
        }

        const chunkPath = path.join(tempDir, `chunk_${chunkIndex}`);
        await fs.promises.writeFile(chunkPath, fileContent);

        // 创建标记文件，表示分片上传完成
        const markerFilePath = path.join(tempDir, `chunk_${chunkIndex}.done`);
        await fs.promises.writeFile(markerFilePath, '');
      }
    }
  }

  // 检查是否所有分片都已上传完毕
  const tempDir = path.join(process.cwd(), 'files', 'temp', fileName);
  const uploadedMarkers = await fs.promises.readdir(tempDir);
  const completeChunks = uploadedMarkers.filter((file) => file.endsWith('.done'));
  if (completeChunks.length === totalChunks) {
    const lockFilePath = path.join(process.cwd(), 'files', `${fileName}.lock`);

    // 尝试创建锁文件，防止并发冲突
    let fileHandle;
    try {
      fileHandle = await fs.promises.open(lockFilePath, 'wx');
    } catch (err) {
      console.log('Another process is already assembling the file.');
      return NextResponse.json({ data: { chunkIndex } });
    } finally {
      if (fileHandle) {
        await fileHandle.close(); // 确保在结束时关闭文件句柄，防止 FD 泄漏
      }
    }

    // 所有块上传完毕，开始拼接文件
    let finalFilePath = path.join(process.cwd(), 'files', fileName);

    // 如果文件存在，添加 (n) 编号
    if (fs.existsSync(finalFilePath)) {
      console.log(`File ${fileName} already exists. Renaming file...`);

      const ext = path.extname(fileName!);
      const baseName = path.basename(fileName!, ext);
      let counter = 1;

      // 生成新的文件名，直到不存在为止
      while (fs.existsSync(finalFilePath)) {
        fileName = `${baseName} (${counter})${ext}`;
        finalFilePath = path.join(process.cwd(), 'files', fileName);
        counter++;
      }
    }

    const writeStream = fs.createWriteStream(finalFilePath);

    // 按顺序读取每个块并写入文件
    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(tempDir, `chunk_${i}`);
      const chunkData = await fs.promises.readFile(chunkPath);
      writeStream.write(chunkData);
    }

    writeStream.end();

    // 删除临时文件夹及其内容
    await fs.promises.rm(tempDir, { recursive: true, force: true });

    console.log(`File ${fileName} successfully reassembled and written to disk.`);

    await fs.promises.unlink(lockFilePath);
  }

  return NextResponse.json({ data: { chunkIndex } });
};
