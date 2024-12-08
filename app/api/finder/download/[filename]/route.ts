import { type NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest, { params }: { params: { filename: string } }) => {
  const filename = params.filename;
  const filesize = req.nextUrl.searchParams.get('filesize');
  const downloadUrl = req.nextUrl.searchParams.get('downloadUrl');

  if (!filename || !filesize || !downloadUrl) {
    return new NextResponse('Invalid parameters', { status: 400 });
  }

  try {
    const res = await fetch(downloadUrl, { method: 'GET' });

    if (!res.ok) {
      return new NextResponse(res.body, {
        status: res.status,
      });
    }

    const reader = res.body?.getReader();

    if (!reader) {
      return new NextResponse(res.body, {
        status: 500,
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            break;
          }
          controller.enqueue(value);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        // 通知任何中间件或代理服务器不要转换、修改数据
        'Cache-Control': 'no-transform',
        // 提供文件大小，以便浏览器显示下载进度
        'Content-Length': filesize!,
        // 内容格式统一设置为八位字节流（二进制流）
        'Content-Type': 'application/octet-stream',
        // 通知浏览器下载文件，而不是直接打开，同时提供下载文件名。
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error((error as Error).message);
    return new NextResponse('Next.js Server Error', { status: 500 });
  }
};
