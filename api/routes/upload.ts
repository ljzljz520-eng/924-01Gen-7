import { Router, Request, Response } from 'express';
import { upload, processStickerUpload } from '../services/uploadService.js';
import type { UploadFormData } from '../../shared/types.js';

const router = Router();

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const formData = req.body as UploadFormData;
    
    const requiredFields = ['title', 'category', 'printSize', 'colorMode', 'licenseType', 'widthMm', 'heightMm'];
    for (const field of requiredFields) {
      if (!formData[field as keyof UploadFormData]) {
        return res.status(400).json({ error: `缺少必填字段: ${field}` });
      }
    }

    const sticker = await processStickerUpload(
      req.file,
      formData,
      'demo-author-123',
      formData.authorName || '匿名插画师'
    );

    res.status(201).json({
      success: true,
      sticker,
      message: '贴纸上传成功！',
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: '上传失败，请重试' });
  }
});

export default router;
