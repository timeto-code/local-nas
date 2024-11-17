export interface FileDto {
  name: string;
  stats: {
    birthtime: string;
    size: number;
  };
}
