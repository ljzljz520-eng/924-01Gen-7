export type StickerCategory = 'date' | 'weather' | 'travel' | 'study';

export type PrintSize = 'small' | 'medium' | 'large' | 'custom';

export type ColorMode = 'cmyk' | 'rgb';

export type LicenseType = 'personal' | 'commercial';

export interface Sticker {
  id: string;
  title: string;
  description: string;
  category: StickerCategory;
  printSize: PrintSize;
  colorMode: ColorMode;
  licenseType: LicenseType;
  widthMm: number;
  heightMm: number;
  tags: string[];
  imageUrl: string;
  previewUrl: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  downloads: number;
}

export interface A4LayoutSticker {
  id: string;
  x: number;
  y: number;
  rotation: number;
}

export interface A4LayoutParams {
  stickers: A4LayoutSticker[];
  marginMm: number;
  spacingMm: number;
  autoArrange: boolean;
  showCutLines: boolean;
  dpi: number;
}

export interface DownloadPackRequest {
  stickerIds: string[];
  includeA4Layout: boolean;
  layoutParams?: A4LayoutParams;
  format: 'png' | 'pdf' | 'svg';
}

export interface UploadFormData {
  title: string;
  description: string;
  category: StickerCategory;
  printSize: PrintSize;
  colorMode: ColorMode;
  licenseType: LicenseType;
  widthMm: number;
  heightMm: number;
  tags: string;
  authorName?: string;
}

export interface ThemeWithStickers {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  stickerIds: string[];
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'illustrator' | 'admin';
  createdAt: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  stickerIds: string[];
  createdAt: string;
}

export const CATEGORY_LABELS: Record<StickerCategory, string> = {
  date: '日期贴',
  weather: '天气贴',
  travel: '旅行贴',
  study: '学习计划贴',
};

export const CATEGORY_COLORS: Record<StickerCategory, string> = {
  date: '#FFB6C1',
  weather: '#98D8C8',
  travel: '#E6E6FA',
  study: '#FFFACD',
};

export const PRINT_SIZE_LABELS: Record<PrintSize, string> = {
  small: '小 (30mm)',
  medium: '中 (40-50mm)',
  large: '大 (60-80mm)',
  custom: '自定义',
};

export const COLOR_MODE_LABELS: Record<ColorMode, string> = {
  cmyk: 'CMYK (印刷专用)',
  rgb: 'RGB (屏幕显示)',
};

export const LICENSE_TYPE_LABELS: Record<LicenseType, string> = {
  personal: '个人非商用',
  commercial: '商用授权',
};

export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;
