import { Link } from 'react-router-dom';
import { Calendar, Cloud, Plane, BookOpen } from 'lucide-react';
import type { StickerCategory } from '../../shared/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../shared/types';

interface CategoryCardProps {
  category: StickerCategory;
  count?: number;
}

const categoryIcons: Record<StickerCategory, typeof Calendar> = {
  date: Calendar,
  weather: Cloud,
  travel: Plane,
  study: BookOpen,
};

export default function CategoryCard({ category, count = 0 }: CategoryCardProps) {
  const Icon = categoryIcons[category];
  const color = CATEGORY_COLORS[category];
  const label = CATEGORY_LABELS[category];

  return (
    <Link
      to={`/browse/${category}`}
      className="group relative card p-6 overflow-hidden"
    >
      <div
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 transition-transform duration-500 group-hover:scale-150"
        style={{ backgroundColor: color }}
      />
      
      <div className="relative z-10">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{ backgroundColor: `${color}30` }}
        >
          <Icon className="w-7 h-7" style={{ color }} />
        </div>
        
        <h3 className="font-display font-bold text-xl text-gray-800 mb-1">
          {label}
        </h3>
        <p className="text-sm text-gray-500">
          {count} 张贴纸
        </p>
        
        <div
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium transition-all duration-300 group-hover:gap-2"
          style={{ color }}
        >
          立即浏览
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
