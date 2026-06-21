import type { A4LayoutParams, Sticker } from '../../shared/types.js';
import { A4_WIDTH_MM, A4_HEIGHT_MM } from '../../shared/types.js';
import { getStickersByIds, incrementDownloads } from './stickerService.js';
import archiver from 'archiver';
import { v4 as uuidv4 } from 'uuid';
import { getDb, saveDatabase } from '../db/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../../tmp');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export function calculateAutoLayout(
  stickers: Sticker[],
  marginMm: number,
  spacingMm: number
): A4LayoutParams['stickers'] {
  const layoutStickers: A4LayoutParams['stickers'] = [];
  let currentX = marginMm;
  let currentY = marginMm;
  let rowMaxHeight = 0;

  for (const sticker of stickers) {
    if (currentX + sticker.widthMm + marginMm > A4_WIDTH_MM) {
      currentX = marginMm;
      currentY += rowMaxHeight + spacingMm;
      rowMaxHeight = 0;
    }

    if (currentY + sticker.heightMm + marginMm > A4_HEIGHT_MM) {
      break;
    }

    layoutStickers.push({
      id: sticker.id,
      x: currentX,
      y: currentY,
      rotation: 0,
    });

    currentX += sticker.widthMm + spacingMm;
    rowMaxHeight = Math.max(rowMaxHeight, sticker.heightMm);
  }

  return layoutStickers;
}

export interface LayoutCalculation {
  stickers: {
    sticker: Sticker;
    x: number;
    y: number;
    rotation: number;
    widthPx: number;
    heightPx: number;
  }[];
  widthPx: number;
  heightPx: number;
}

export function calculateLayoutPx(
  layoutParams: A4LayoutParams,
  stickers: Sticker[],
  dpi: number
): LayoutCalculation {
  const mmToPx = (mm: number) => (mm * dpi) / 25.4;
  
  const widthPx = mmToPx(A4_WIDTH_MM);
  const heightPx = mmToPx(A4_HEIGHT_MM);

  const stickerMap = new Map(stickers.map(s => [s.id, s]));

  const layoutStickers = layoutParams.autoArrange
    ? calculateAutoLayout(stickers, layoutParams.marginMm, layoutParams.spacingMm)
    : layoutParams.stickers;

  const result: LayoutCalculation['stickers'] = [];

  for (const ls of layoutStickers) {
    const sticker = stickerMap.get(ls.id);
    if (!sticker) continue;

    result.push({
      sticker,
      x: mmToPx(ls.x),
      y: mmToPx(ls.y),
      rotation: ls.rotation,
      widthPx: mmToPx(sticker.widthMm),
      heightPx: mmToPx(sticker.heightMm),
    });
  }

  return {
    stickers: result,
    widthPx,
    heightPx,
  };
}

export interface GenerateLayoutSvgOptions {
  layoutParams: A4LayoutParams;
  stickers: Sticker[];
  dpi?: number;
}

export function generateLayoutSvg(options: GenerateLayoutSvgOptions): string {
  const { layoutParams, stickers, dpi = 300 } = options;
  const layout = calculateLayoutPx(layoutParams, stickers, dpi);
  const mmToPx = (mm: number) => (mm * dpi) / 25.4;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.widthPx}" height="${layout.heightPx}" viewBox="0 0 ${layout.widthPx} ${layout.heightPx}">`;
  svg += `<rect width="${layout.widthPx}" height="${layout.heightPx}" fill="white"/>`;

  if (layoutParams.showCutLines) {
    const marginPx = mmToPx(layoutParams.marginMm);
    svg += `<rect x="${marginPx}" y="${marginPx}" width="${layout.widthPx - 2 * marginPx}" height="${layout.heightPx - 2 * marginPx}" fill="none" stroke="#ccc" stroke-dasharray="5,5" stroke-width="1"/>`;
  }

  for (const ls of layout.stickers) {
    const transform = `translate(${ls.x + ls.widthPx / 2}, ${ls.y + ls.heightPx / 2}) rotate(${ls.rotation})`;
    svg += `<g transform="${transform}">`;
    svg += `<rect x="${-ls.widthPx / 2}" y="${-ls.heightPx / 2}" width="${ls.widthPx}" height="${ls.heightPx}" fill="#f0f0f0" stroke="#999" stroke-width="2" rx="4"/>`;
    svg += `<text x="0" y="0" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="14" fill="#666">${ls.sticker.title}</text>`;
    svg += `<text x="0" y="${ls.heightPx / 4}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="10" fill="#999">${ls.sticker.widthMm}×${ls.sticker.heightMm}mm</text>`;
    svg += `</g>`;

    if (layoutParams.showCutLines) {
      svg += `<rect x="${ls.x}" y="${ls.y}" width="${ls.widthPx}" height="${ls.heightPx}" fill="none" stroke="#ff6b6b" stroke-dasharray="3,3" stroke-width="1"/>`;
    }
  }

  svg += `</svg>`;
  return svg;
}

export interface CreatePackOptions {
  stickerIds: string[];
  includeA4Layout: boolean;
  layoutParams?: A4LayoutParams;
  format: 'png' | 'pdf' | 'svg';
  userId?: string;
  packName?: string;
}

export async function createDownloadPack(options: CreatePackOptions): Promise<{
  filePath: string;
  fileName: string;
}> {
  const { stickerIds, includeA4Layout, layoutParams, format, userId, packName } = options;
  
  const stickers = getStickersByIds(stickerIds);
  if (stickers.length === 0) {
    throw new Error('No stickers found');
  }

  for (const id of stickerIds) {
    incrementDownloads(id);
  }

  const packId = uuidv4();
  const fileName = `${packName || 'sticker-pack'}-${packId.slice(0, 8)}.zip`;
  const filePath = path.join(OUTPUT_DIR, fileName);

  const downloadId = uuidv4();
  const db = getDb();
  const insertStmt = db.prepare(`
    INSERT INTO downloads (id, user_id, pack_name, sticker_ids, format)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertStmt.bind([downloadId, userId || null, packName || null, stickerIds.join(','), format]);
  insertStmt.step();
  insertStmt.free();
  saveDatabase();

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(filePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      resolve({ filePath, fileName });
    });

    archive.on('error', reject);
    archive.pipe(output);

    for (const sticker of stickers) {
      const imagePath = path.join(__dirname, '../../public', sticker.imageUrl);
      if (fs.existsSync(imagePath)) {
        archive.file(imagePath, { name: `stickers/${sticker.id}-${sticker.title}.png` });
      } else {
        const svgContent = generateStickerPlaceholderSvg(sticker);
        archive.append(svgContent, { name: `stickers/${sticker.id}-${sticker.title}.svg` });
      }

      const metadata = JSON.stringify({
        id: sticker.id,
        title: sticker.title,
        description: sticker.description,
        category: sticker.category,
        widthMm: sticker.widthMm,
        heightMm: sticker.heightMm,
        colorMode: sticker.colorMode,
        licenseType: sticker.licenseType,
        author: sticker.authorName,
      }, null, 2);
      archive.append(metadata, { name: `stickers/${sticker.id}-metadata.json` });
    }

    if (includeA4Layout && layoutParams) {
      const layoutSvg = generateLayoutSvg({
        layoutParams,
        stickers,
        dpi: layoutParams.dpi,
      });
      archive.append(layoutSvg, { name: 'A4-layout.svg' });

      const readme = `
手账贴纸下载包
================

包含贴纸: ${stickers.length} 张

A4拼版说明:
- 纸张尺寸: A4 (210×297mm)
- 边距: ${layoutParams.marginMm}mm
- 间距: ${layoutParams.spacingMm}mm
- DPI: ${layoutParams.dpi}
- 显示裁切线: ${layoutParams.showCutLines ? '是' : '否'}

打印提示:
1. 请使用实际尺寸 (100%) 打印
2. 建议使用不干胶打印纸
3. CMYK模式贴纸请使用专业印刷
4. 请遵守授权协议使用

授权信息:
- 个人非商用: 仅限个人学习和手账使用
- 商用授权: 可用于商业用途（如有授权）
`.trim();
      archive.append(readme, { name: 'README.txt' });
    }

    archive.finalize();
  });
}

function generateStickerPlaceholderSvg(sticker: Sticker): string {
  const dpi = 300;
  const mmToPx = (mm: number) => (mm * dpi) / 25.4;
  const width = mmToPx(sticker.widthMm);
  const height = mmToPx(sticker.heightMm);

  const colors: Record<string, string> = {
    date: '#FFB6C1',
    weather: '#98D8C8',
    travel: '#E6E6FA',
    study: '#FFFACD',
  };

  const bgColor = colors[sticker.category] || '#f0f0f0';

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${bgColor}" rx="8"/>
  <rect x="4" y="4" width="${width - 8}" height="${height - 8}" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" rx="4"/>
  <text x="${width / 2}" y="${height / 2 - 10}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="24" font-weight="bold" fill="rgba(0,0,0,0.6)">${sticker.title}</text>
  <text x="${width / 2}" y="${height / 2 + 20}" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="14" fill="rgba(0,0,0,0.4)">${sticker.widthMm}×${sticker.heightMm}mm</text>
</svg>
  `.trim();
}

export function cleanupOldFiles(maxAgeHours: number = 24): void {
  const now = Date.now();
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

  fs.readdir(OUTPUT_DIR, (err, files) => {
    if (err) return;
    for (const file of files) {
      const filePath = path.join(OUTPUT_DIR, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlink(filePath, () => {});
        }
      });
    }
  });
}
