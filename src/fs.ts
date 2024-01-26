import * as fs from 'node:fs/promises';

export async function listFiles(dir: string): Promise<ReadonlyArray<string>> {
  const files = await fs.readdir(dir, { recursive: true });

  return files;
}

export async function readFile(file: string): Promise<Uint8Array> {
  const buffer = fs.readFile(file);

  return buffer;
}
