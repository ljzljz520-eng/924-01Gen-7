import { Router, Request, Response } from 'express';
import {
  getStickers,
  getStickerById,
  getPopularStickers,
  getLatestStickers,
  getThemes,
} from '../services/stickerService.js';
import type { StickerCategory, PrintSize, ColorMode, LicenseType } from '../../shared/types.js';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const {
    category,
    printSize,
    colorMode,
    licenseType,
    search,
    limit,
    offset,
  } = req.query;

  const stickers = getStickers({
    category: category as StickerCategory | undefined,
    printSize: printSize as PrintSize | undefined,
    colorMode: colorMode as ColorMode | undefined,
    licenseType: licenseType as LicenseType | undefined,
    search: search as string | undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    offset: offset ? parseInt(offset as string) : undefined,
  });

  res.json(stickers);
});

router.get('/popular', (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
  const stickers = getPopularStickers(limit);
  res.json(stickers);
});

router.get('/latest', (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
  const stickers = getLatestStickers(limit);
  res.json(stickers);
});

router.get('/themes', (req: Request, res: Response) => {
  const themes = getThemes();
  res.json(themes);
});

router.get('/:id', (req: Request, res: Response) => {
  const sticker = getStickerById(req.params.id);
  if (!sticker) {
    return res.status(404).json({ error: 'Sticker not found' });
  }
  res.json(sticker);
});

export default router;
