import { Router, Request, Response } from 'express';
import {
  createDownloadPack,
  generateLayoutSvg,
  calculateAutoLayout,
} from '../services/downloadService.js';
import { getStickersByIds } from '../services/stickerService.js';
import type { A4LayoutParams, DownloadPackRequest } from '../../shared/types.js';
import fs from 'fs';

const router = Router();

router.post('/preview', (req: Request, res: Response) => {
  try {
    const { stickerIds, layoutParams } = req.body as {
      stickerIds: string[];
      layoutParams: A4LayoutParams;
    };

    if (!stickerIds || stickerIds.length === 0) {
      return res.status(400).json({ error: '请选择至少一张贴纸' });
    }

    const stickers = getStickersByIds(stickerIds);
    if (stickers.length === 0) {
      return res.status(404).json({ error: '未找到贴纸' });
    }

    const params: A4LayoutParams = {
      marginMm: 10,
      spacingMm: 5,
      autoArrange: true,
      showCutLines: true,
      dpi: 300,
      stickers: [],
      ...layoutParams,
    };

    if (params.autoArrange) {
      params.stickers = calculateAutoLayout(stickers, params.marginMm, params.spacingMm);
    }

    const svg = generateLayoutSvg({
      layoutParams: params,
      stickers,
      dpi: params.dpi,
    });

    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({ error: '生成预览失败' });
  }
});

router.post('/pack', async (req: Request, res: Response) => {
  try {
    const {
      stickerIds,
      includeA4Layout,
      layoutParams,
      format,
      packName,
    } = req.body as DownloadPackRequest & { packName?: string };

    if (!stickerIds || stickerIds.length === 0) {
      return res.status(400).json({ error: '请选择至少一张贴纸' });
    }

    const { filePath, fileName } = await createDownloadPack({
      stickerIds,
      includeA4Layout: includeA4Layout || false,
      layoutParams,
      format: format || 'png',
      packName,
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('end', () => {
      fs.unlink(filePath, () => {});
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: '下载包生成失败' });
  }
});

router.get('/layout/calculate', (req: Request, res: Response) => {
  const { stickerIds, marginMm = 10, spacingMm = 5 } = req.query;
  
  if (!stickerIds) {
    return res.status(400).json({ error: '请提供贴纸ID' });
  }

  const ids = Array.isArray(stickerIds) ? stickerIds as string[] : [stickerIds as string];
  const stickers = getStickersByIds(ids);
  
  const layout = calculateAutoLayout(
    stickers,
    parseInt(marginMm as string),
    parseInt(spacingMm as string)
  );

  res.json({
    layout,
    canFitAll: layout.length === stickers.length,
    totalStickers: stickers.length,
    fittedCount: layout.length,
  });
});

export default router;
