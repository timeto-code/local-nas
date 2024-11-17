export type TransferFile = {
  id: string;
  file: File;
  sentBytes: number;
  receivedBytes: number;
  chunkIndex: number;
  uploadStartTimestamp: number;
  uploadDoneTimestamp: number;
  serverName: string;
  serverBirthtime: string;
  status: 'waiting' | 'processing' | 'merging' | 'success' | 'failure';
};

export type Chunk = {
  id: string;
  name: string;
  index: number;
  data: Blob;
};

const events = {
  ready: 'ready',
  update: 'update',
  close: 'close',
} as const;

type EventMap = {
  [events.ready]: TransferFile[];
  [events.update]: TransferFile;
  [events.close]: undefined;
};

export class Uploader extends EventTarget {
  #poolMap: Map<string, TransferFile>;
  #filePool: Set<TransferFile>;
  #chunkPool: Chunk[];
  #httpPool: Map<string, Promise<void>>;
  #fillPoolTrigger: (() => void) | null;
  #chunkPoolTrigger: (() => void) | null;
  #httpTrigger: (() => void) | null;
  #chunkSize: number;
  static isClosed: boolean;

  constructor(files: File[], chunkSize?: number) {
    super();
    this.#poolMap = new Map(
      files.map((file) => {
        const id = Uploader.uuid();
        return [
          id,
          {
            id,
            file,
            sentBytes: 0,
            receivedBytes: 0,
            chunkIndex: 0,
            uploadStartTimestamp: 0,
            uploadDoneTimestamp: 0,
            serverName: '',
            serverBirthtime: '',
            status: 'waiting',
          },
        ];
      }),
    );
    this.#filePool = new Set();
    this.#chunkPool = [];
    this.#httpPool = new Map();
    this.#fillPoolTrigger = null;
    this.#chunkPoolTrigger = null;
    this.#httpTrigger = null;
    this.#chunkSize = chunkSize || 1024 * 1024 * 5 * 2; // 10MB
  }

  ready(): void {
    Uploader.isClosed = false;
    this.dispatchEvent(
      new CustomEvent<EventMap[typeof events.ready]>(events.ready, {
        detail: [...this.#poolMap.values()],
      }),
    );
    this.#fillFilePool();
    this.#fillChunkPool();
  }

  start(httpUploadRequest: (chunk: Chunk) => Promise<void>): void {
    this.#fillHttpPool(httpUploadRequest);
  }

  updateReceivedBytes(id: string, bytes: number): boolean {
    const transferFile = this.#poolMap.get(id);
    if (!transferFile) return false;

    transferFile.receivedBytes += bytes;
    this.#emitUpdateEvent(id);

    return transferFile.receivedBytes >= transferFile.file.size;
  }

  updateStatus(id: string, status: TransferFile['status']): void {
    const transferFile = this.#poolMap.get(id);
    if (!transferFile) return;

    transferFile.status = status;
    this.#emitUpdateEvent(id);

    const allDone = [...this.#poolMap.values()].every((f) => f.status !== 'waiting' && f.status !== 'processing');
    if (allDone) {
      this.dispatchEvent(new CustomEvent(events.close));
    }
  }

  setUploadDoneTimestamp(id: string): void {
    const transferFile = this.#poolMap.get(id);
    if (!transferFile) return;

    transferFile.uploadDoneTimestamp = Date.now();
  }

  syncFileStats(id: string, name: string, birthtime: string): void {
    const transferFile = this.#poolMap.get(id);
    if (!transferFile) return;

    transferFile.serverName = name;
    transferFile.serverBirthtime = birthtime;
  }

  on<E extends keyof EventMap>(event: E, listener: (event: CustomEvent<EventMap[E]>) => void): void {
    this.addEventListener(event, listener as EventListener);
  }

  off(event: string): void {
    this.removeEventListener(event, null);
  }

  #emitUpdateEvent(id: string): void {
    this.dispatchEvent(new CustomEvent(events.update, { detail: this.#poolMap.get(id) }));
  }

  async #fillFilePool(): Promise<void> {
    while (true) {
      if (Uploader.isClosed) break;

      if (this.#filePool.size >= 6) {
        await new Promise<void>((resolve) => {
          this.#fillPoolTrigger = resolve;
        });
      }

      const transferFile = Array.from(this.#poolMap.values()).find((f) => f.status === 'waiting');
      if (!transferFile) {
        break;
      }

      this.#filePool.add(transferFile);
      transferFile.status = 'processing';
      transferFile.uploadStartTimestamp = transferFile.uploadStartTimestamp || Date.now();
    }
  }

  async #fillChunkPool(): Promise<void> {
    while (true) {
      if (Uploader.isClosed) break;

      if (this.#chunkPool.length >= 12) {
        await new Promise<void>((resolve) => {
          this.#chunkPoolTrigger = resolve;
        });
      }

      const index = Math.floor(Math.random() * this.#filePool.size);
      const transferFile = Array.from(this.#filePool)[index];
      if (!transferFile) {
        break;
      }

      const start = transferFile.chunkIndex * this.#chunkSize;
      const end = (transferFile.chunkIndex + 1) * this.#chunkSize;
      const chunk = transferFile.file.slice(start, end);

      this.#chunkPool.push({
        id: transferFile.id,
        name: transferFile.file.name,
        index: transferFile.chunkIndex,
        data: chunk,
      });

      if (end < transferFile.file.size) {
        transferFile.chunkIndex++;
      } else {
        this.#filePool.delete(transferFile);
        this.#fillPoolTrigger?.();
        this.#fillPoolTrigger = null;
      }
    }
  }

  async #fillHttpPool(httpUploadRequest: (chunk: Chunk) => Promise<void>): Promise<void> {
    while (true) {
      if (Uploader.isClosed) break;

      if (this.#httpPool.size >= 6) {
        await new Promise<void>((resolve) => {
          this.#httpTrigger = resolve;
        });
      }

      const chunk = this.#chunkPool.shift();
      this.#chunkPoolTrigger?.();
      this.#chunkPoolTrigger = null;
      if (!chunk) {
        break;
      }

      const id = Uploader.uuid();
      const promise = httpUploadRequest(chunk).finally(() => {
        this.#httpPool.delete(id);
        this.#httpTrigger?.();
        this.#httpTrigger = null;
      });
      this.#httpPool.set(id, promise);
    }
  }

  destroy(): void {
    console.log(`destroy`);
    Uploader.isClosed = true;
    this.#filePool.clear();
    this.#chunkPool.length = 0;
    this.#httpPool.clear();
    this.#fillPoolTrigger?.();
    this.#chunkPoolTrigger?.();
    this.#httpTrigger?.();
    this.off(events.ready);
    this.off(events.update);
    this.off(events.close);
    this.dispatchEvent(new CustomEvent(events.close));
  }

  static uuid(): string {
    const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

    return `${id}-${Date.now()}`;
  }
}
