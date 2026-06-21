import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { ThemeWithStickers } from '../../shared/types';

interface ThemeCardProps {
  theme: ThemeWithStickers;
}

export default function ThemeCard({ theme }: ThemeCardProps) {
  return (
    <Link
      to={`/browse?theme=${theme.id}`}
      className="group relative card overflow-hidden h-64"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-lavender-300 to-mint-300 opacity-80" />
      
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${theme.coverUrl})` }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      <div className="absolute top-4 left-4">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-sm">
          <Sparkles className="w-4 h-4" />
          主题合集
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="font-display font-bold text-2xl mb-2 text-shadow">
          {theme.name}
        </h3>
        <p className="text-sm text-white/80 mb-4 line-clamp-2">
          {theme.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">
            {theme.stickerIds.length} 张贴纸
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium transition-all group-hover:gap-2">
            立即查看
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
