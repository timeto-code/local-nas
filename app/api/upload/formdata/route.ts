import { type NextRequest } from 'next/server';

import fs from 'fs';
import path from 'path';
import { headers } from 'next/headers';

/**
 * 一次性接受单个 formdata, 内存中拼接，并写入磁盘
 */
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

  while ((endIndex = fileData.indexOf(boundaryBuffer, startIndex)) !== -1) {
    const part = fileData.subarray(startIndex, endIndex); // 提取每个部分
    startIndex = endIndex + boundaryBuffer.length;

    // 处理文件部分（你可以在这里继续处理各个部分）
    if (part.includes('Content-Disposition')) {
      const fileNameMatch = part.toString().match(/filename="(.+)"/);
      if (fileNameMatch) {
        let fileName = fileNameMatch[1];
        const fileContentIndex = part.indexOf('\r\n\r\n');
        const fileContent = part.subarray(fileContentIndex + 4, part.length - 2); // 提取文件内容

        // 保存文件
        let filePath = path.join(process.cwd(), 'files', fileName);

        // 如果文件存在，添加 (n) 编号
        if (fs.existsSync(filePath)) {
          const ext = path.extname(fileName!);
          const baseName = path.basename(fileName!, ext);
          let counter = 1;

          // 生成新的文件名，直到不存在为止
          while (fs.existsSync(filePath)) {
            fileName = `${baseName}(${counter})${ext}`;
            filePath = path.join(process.cwd(), 'files', fileName);
            counter++;
          }
        }

        await fs.promises.writeFile(filePath, fileContent);
      }
    }
  }

  return Response.json({ message: 'File uploaded successfully' });
};
