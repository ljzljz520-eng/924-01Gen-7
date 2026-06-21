import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Grid3X3, LayoutList } from 'lucide-react';
import StickerCard from '../components/StickerCard';
import FilterSidebar from '../components/FilterSidebar';
import { useFilterStore, useDataStore } from '../store/useStore';
import type { Sticker, StickerCategory } from '../../shared/types';
import { CATEGORY_LABELS } from '../../shared/types';

export default function Browse() {
  const { category } = useParams<{ category?: string }>();
  const [searchParams] = useSearchParams();
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const {
    printSize,
    colorMode,
    licenseType,
    setCategory,
  } = useFilterStore();

  const search = searchParams.get('search') || '';
  const theme = searchParams.get('theme');

  useEffect(() => {
    if (category) {
      setCategory(category as StickerCategory);
    }
  }, [category, setCategory]);

  useEffect(() => {
    const fetchStickers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (printSize) params.append('printSize', printSize);
        if (colorMode) params.append('colorMode', colorMode);
        if (licenseType) params.append('licenseType', licenseType);
        if (search) params.append('search', search);

        const res = await fetch(`/api/stickers?${params.toString()}`);
        const data = await res.json();
        setStickers(data);
      } catch (error) {
        console.error('Failed to fetch stickers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStickers();
  }, [category, printSize, colorMode, licenseType, search]);

  const getPageTitle = () => {
    if (category) {
      return CATEGORY_LABELS[category as StickerCategory] || '浏览贴纸';
    }
    if (theme) {
      return '主题贴纸';
    }
    if (search) {
      return `搜索: ${search}`;
    }
    return '全部贴纸';
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      <FilterSidebar isOpen={filterOpen} onClose={() => setFilterOpen(false)} />

      <div className="flex-1">
        <div className="sticky top-16 md:top-20 z-30 bg-cream-100/90 backdrop-blur-lg border-b border-primary-100">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="font-display font-bold text-2xl text-gray-800">
                  {getPageTitle()}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  共 {stickers.length} 张贴纸
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索贴纸..."
                    defaultValue={search}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value;
                        if (value) {
                          window.location.href = `/browse?search=${encodeURIComponent(value)}`;
                        }
                      }
                    }}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary-400"
                  />
                </div>

                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="md:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-soft"
                >
                  <Filter className="w-4 h-4" />
                  筛选
                </button>

                <div className="hidden md:flex items-center gap-1 bg-white rounded-full p-1 shadow-soft">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-full transition-colors ${
                      viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-full transition-colors ${
                      viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded-full w-16" />
                      <div className="h-6 bg-gray-200 rounded-full w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : stickers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <SlidersHorizontal className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="font-display font-bold text-xl text-gray-800 mb-2">
                没有找到贴纸
              </h3>
              <p className="text-gray-500">
                试试调整筛选条件，或者搜索其他关键词
              </p>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 max-w-3xl mx-auto'
            }`}>
              {stickers.map((sticker, index) => (
                <div
                  key={sticker.id}
                  className="sticker-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <StickerCard
                    sticker={sticker}
                    index={index}
                    showAddButton={true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
