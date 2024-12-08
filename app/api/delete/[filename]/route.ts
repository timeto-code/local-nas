import fs from 'fs';
import path from 'path';
import { type NextRequest } from 'next/server';

import { createJsonResponse, directory, Logger, msg } from '../../_utils';

export const DELETE = async (_req: NextRequest, { params }: { params: { filename: string } }) => {
  const { filename } = params;

  try {
    const filePath = path.join(directory.shared, filename);
    if (!fs.existsSync(filePath)) {
      Logger.debug(msg.notFound);
      return createJsonResponse({ code: 1, message: msg.notFound });
    }

    await fs.promises.unlink(path.join(directory.shared, filename));

    return createJsonResponse({ code: 0, message: msg.success });
  } catch (error) {
    Logger.error(error);
    return createJsonResponse({ code: 1, message: msg.serverError });
  }
};
