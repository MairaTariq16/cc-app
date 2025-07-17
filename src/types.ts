export type CompressionFormat = 'zip' | 'tar.gz';

export type HashResult = {
  originalName: string;
  hash: string;
  size: number;
};

export type HashResponse = HashResult[];
