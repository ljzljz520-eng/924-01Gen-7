import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import type { UploadFormData } from '../../shared/types.js';
import { createSticker } from './stickerService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const PUBLIC_STICKER_DIR = path.join(__dirname, '../../public/images/stickers');
const PUBLIC_PREVIEW_DIR = path.join(__dirname, '../../public/images/previews');

[UPLOAD_DIR, PUBLIC_STICKER_DIR, PUBLIC_PREVIEW_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /png|svg|pdf|jpg|jpeg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('只支持 PNG, SVG, PDF, JPG 格式'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export async function processStickerUpload(
  file: Express.Multer.File,
  formData: UploadFormData,
  authorId: string,
  authorName: string
) {
  const fileId = uuidv4();
  const ext = path.extname(file.originalname).toLowerCase();
  
  const stickerFileName = `${fileId}${ext}`;
  const previewFileName = `${fileId}-preview.png`;
  
  const stickerDest = path.join(PUBLIC_STICKER_DIR, stickerFileName);
  const previewDest = path.join(PUBLIC_PREVIEW_DIR, previewFileName);

  fs.copyFileSync(file.path, stickerDest);
  fs.copyFileSync(file.path, previewDest);

  fs.unlink(file.path, () => {});

  const sticker = createSticker({
    title: formData.title,
    description: formData.description,
    category: formData.category,
    printSize: formData.printSize,
    colorMode: formData.colorMode,
    licenseType: formData.licenseType,
    widthMm: formData.widthMm,
    heightMm: formData.heightMm,
    tags: formData.tags,
    imageUrl: `/images/stickers/${stickerFileName}`,
    previewUrl: `/images/previews/${previewFileName}`,
    authorId,
    authorName,
  });

  return sticker;
}
