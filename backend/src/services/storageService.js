import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/index.js';

export async function saveToStorage(filePath, subfolder = 'translations') {
  const destDir = path.join(config.storageDir, subfolder);
  await fs.mkdir(destDir, { recursive: true });

  const fileName = path.basename(filePath);
  const destPath = path.join(destDir, fileName);
  await fs.copyFile(filePath, destPath);

  return {
    localPath: destPath,
    url: `/storage/${subfolder}/${fileName}`,
    cloudUrl: null,
  };
}

export async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch {
    /* ignore */
  }
}

export function getStoragePath(relativePath) {
  return path.join(config.storageDir, relativePath);
}
