import { useState } from 'react';
import { Plus, Check, Download, Eye, Palette, Ruler, Shield } from 'lucide-react';
import type { Sticker } from '../../shared/types';
import { 
  CATEGORY_LABELS, 
  CATEGORY_COLORS, 
  PRINT_SIZE_LABELS, 
  COLOR_MODE_LABELS, 
  LICENSE_TYPE_LABELS 
} from '../../shared/types';
import { useDownloadCart } from '../store/useStore';

interface StickerCardProps {
  sticker: Sticker;
  index?: number;
  showAddButton?: boolean;
  onPreview?: (sticker: Sticker) => void;
}

export default function StickerCard({ 
  sticker, 
  index = 0, 
  showAddButton = true,
  onPreview 
}: StickerCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { hasSticker, toggleSticker } = useDownloadCart();
  const isInCart = hasSticker(sticker.id);
  
  const categoryColor = CATEGORY_COLORS[sticker.category];

  const generateStickerSvg = () => {
    const size = 200;
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <defs>
          <linearGradient id="grad-${sticker.id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${categoryColor};stop-opacity:0.8" />
            <stop offset="100%" style="stop-color:${categoryColor};stop-opacity:0.4" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" fill="url(#grad-${sticker.id})" rx="16"/>
        <rect x="8" y="8" width="${size - 16}" height="${size - 16}" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="2" stroke-dasharray="8,4" rx="12"/>
        <text x="${size/2}" y="${size/2 - 15}" text-anchor="middle" dominant-baseline="middle" font-family="Quicksand, sans-serif" font-size="16" font-weight="600" fill="rgba(0,0,0,0.6)">${sticker.title}</text>
        <text x="${size/2}" y="${size/2 + 15}" text-anchor="middle" dominant-baseline="middle" font-family="Quicksand, sans-serif" font-size="12" fill="rgba(0,0,0,0.4)">${sticker.widthMm}×${sticker.heightMm}mm</text>
        <circle cx="25" cy="25" r="12" fill="white" opacity="0.8"/>
        <text x="25" y="29" text-anchor="middle" dominant-baseline="middle" font-family="Quicksand, sans-serif" font-size="10" font-weight="bold" fill="${categoryColor}">${sticker.downloads}</text>
      </svg>
    `;
  };

  return (
    <div
      className="card group relative"
      style={{ animationDelay: `${index * 0.05}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-cream-50">
        <img
          src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(generateStickerSvg())}`}
          alt={sticker.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
            {onPreview && (
              <button
                onClick={() => onPreview(sticker)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/90 backdrop-blur rounded-full text-gray-800 font-medium text-sm transition-all hover:bg-white"
              >
                <Eye className="w-4 h-4" />
                预览
              </button>
            )}
            <button
              onClick={() => window.open(`/api/download/pack`, '_blank')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-400 rounded-full text-white font-medium text-sm transition-all hover:bg-primary-500"
            >
              <Download className="w-4 h-4" />
              下载
            </button>
          </div>
        </div>

        {showAddButton && (
          <button
            onClick={() => toggleSticker(sticker.id)}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-soft ${
              isInCart
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-500'
            }`}
          >
            {isInCart ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        )}

        <div
          className="absolute top-3 left-3 tag text-xs"
          style={{ backgroundColor: `${categoryColor}30`, color: categoryColor }}
        >
          {CATEGORY_LABELS[sticker.category]}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display font-bold text-lg text-gray-800 mb-2 line-clamp-1">
          {sticker.title}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {sticker.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="tag bg-mint-100 text-mint-500">
            <Ruler className="w-3 h-3 mr-1" />
            {PRINT_SIZE_LABELS[sticker.printSize]}
          </span>
          <span className="tag bg-lavender-100 text-lavender-400">
            <Palette className="w-3 h-3 mr-1" />
            {COLOR_MODE_LABELS[sticker.colorMode]}
          </span>
          <span className="tag bg-butter-100 text-amber-600">
            <Shield className="w-3 h-3 mr-1" />
            {LICENSE_TYPE_LABELS[sticker.licenseType]}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">作者：{sticker.authorName}</span>
          <span className="text-primary-400 font-medium">{sticker.downloads} 次下载</span>
        </div>
      </div>
    </div>
  );
}
