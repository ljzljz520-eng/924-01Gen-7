import { getDb, saveDatabase } from '../db/database.js';
import type { Sticker, StickerCategory, PrintSize, ColorMode, LicenseType, ThemeWithStickers } from '../../shared/types.js';
import { v4 as uuidv4 } from 'uuid';

function rowToSticker(row: any): Sticker {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category as StickerCategory,
    printSize: row.print_size as PrintSize,
    colorMode: row.color_mode as ColorMode,
    licenseType: row.license_type as LicenseType,
    widthMm: row.width_mm,
    heightMm: row.height_mm,
    tags: row.tags ? row.tags.split(',') : [],
    imageUrl: row.image_url,
    previewUrl: row.preview_url,
    authorId: row.author_id,
    authorName: row.author_name,
    createdAt: row.created_at,
    downloads: row.downloads,
  };
}

function execQuery<T>(query: string, params: any[] = []): T[] {
  const db = getDb();
  const stmt = db.prepare(query);
  stmt.bind(params);
  const results: T[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return results;
}

function execRun(query: string, params: any[] = []): void {
  const db = getDb();
  const stmt = db.prepare(query);
  if (params.length > 0) {
    stmt.bind(params);
  }
  stmt.step();
  stmt.free();
}

function saveDb() {
  saveDatabase();
}

export function getStickers(options?: {
  category?: StickerCategory;
  printSize?: PrintSize;
  colorMode?: ColorMode;
  licenseType?: LicenseType;
  search?: string;
  limit?: number;
  offset?: number;
}): Sticker[] {
  let query = 'SELECT * FROM stickers WHERE 1=1';
  const params: any[] = [];

  if (options?.category) {
    query += ' AND category = ?';
    params.push(options.category);
  }
  if (options?.printSize) {
    query += ' AND print_size = ?';
    params.push(options.printSize);
  }
  if (options?.colorMode) {
    query += ' AND color_mode = ?';
    params.push(options.colorMode);
  }
  if (options?.licenseType) {
    query += ' AND license_type = ?';
    params.push(options.licenseType);
  }
  if (options?.search) {
    query += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
    const searchTerm = `%${options.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += ' ORDER BY created_at DESC';

  if (options?.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
  }
  if (options?.offset) {
    query += ' OFFSET ?';
    params.push(options.offset);
  }

  const rows = execQuery<any>(query, params);
  return rows.map(rowToSticker);
}

export function getStickerById(id: string): Sticker | null {
  const rows = execQuery<any>('SELECT * FROM stickers WHERE id = ?', [id]);
  return rows.length > 0 ? rowToSticker(rows[0]) : null;
}

export function getStickersByIds(ids: string[]): Sticker[] {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  const rows = execQuery<any>(`SELECT * FROM stickers WHERE id IN (${placeholders})`, ids);
  return rows.map(rowToSticker);
}

export function createSticker(data: {
  title: string;
  description: string;
  category: StickerCategory;
  printSize: PrintSize;
  colorMode: ColorMode;
  licenseType: LicenseType;
  widthMm: number;
  heightMm: number;
  tags: string;
  imageUrl: string;
  previewUrl: string;
  authorId: string;
  authorName: string;
}): Sticker {
  const id = uuidv4();
  execRun(
    `INSERT INTO stickers (id, title, description, category, print_size, color_mode, license_type, width_mm, height_mm, tags, image_url, preview_url, author_id, author_name)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.title,
      data.description,
      data.category,
      data.printSize,
      data.colorMode,
      data.licenseType,
      data.widthMm,
      data.heightMm,
      data.tags,
      data.imageUrl,
      data.previewUrl,
      data.authorId,
      data.authorName,
    ]
  );
  saveDb();
  const sticker = getStickerById(id);
  if (!sticker) throw new Error('Failed to create sticker');
  return sticker;
}

export function incrementDownloads(id: string): void {
  execRun('UPDATE stickers SET downloads = downloads + 1 WHERE id = ?', [id]);
  saveDb();
}

export function getThemes(): ThemeWithStickers[] {
  const themes = execQuery<any>('SELECT * FROM themes ORDER BY created_at DESC', []);
  return themes.map(theme => {
    const stickerRows = execQuery<any>(
      'SELECT sticker_id FROM theme_stickers WHERE theme_id = ?',
      [theme.id]
    );
    return {
      id: theme.id,
      name: theme.name,
      description: theme.description,
      coverUrl: theme.cover_url,
      stickerIds: stickerRows.map(s => s.sticker_id),
      createdAt: theme.created_at,
    };
  });
}

export function getPopularStickers(limit: number = 8): Sticker[] {
  const rows = execQuery<any>('SELECT * FROM stickers ORDER BY downloads DESC LIMIT ?', [limit]);
  return rows.map(rowToSticker);
}

export function getLatestStickers(limit: number = 8): Sticker[] {
  const rows = execQuery<any>('SELECT * FROM stickers ORDER BY created_at DESC LIMIT ?', [limit]);
  return rows.map(rowToSticker);
}
