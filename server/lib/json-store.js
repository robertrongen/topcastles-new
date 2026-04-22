import { readFile, writeFile, rename, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { Mutex } from 'async-mutex';

const mutex = new Mutex();

export async function readJson(filePath) {
  try {
    const text = await readFile(filePath, 'utf-8');
    return JSON.parse(text);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

export async function writeJson(filePath, data) {
  return mutex.runExclusive(async () => {
    const tmp = filePath + '.tmp';
    try {
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
      await rename(tmp, filePath);
    } catch (err) {
      await unlink(tmp).catch(() => {});
      throw err;
    }
  });
}
