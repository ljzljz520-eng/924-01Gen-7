import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Search, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import CategoryCard from '../components/CategoryCard';
import StickerCard from '../components/StickerCard';
import ThemeCard from '../components/ThemeCard';
import { useDataStore } from '../store/useStore';
import type { StickerCategory } from '../../shared/types';

export default function Home() {
  const { popularStickers, latestStickers, themes, setPopularStickers, setLatestStickers, setThemes, setLoading } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [popularRes, latestRes, themesRes] = await Promise.all([
          fetch('/api/stickers/popular?limit=8').then((r) => r.json()),
          fetch('/api/stickers/latest?limit=8').then((r) => r.json()),
          fetch('/api/stickers/themes').then((r) => r.json()),
        ]);
        setPopularStickers(popularRes);
        setLatestStickers(latestRes);
        setThemes(themesRes);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setPopularStickers, setLatestStickers, setThemes, setLoading]);

  const categories: StickerCategory[] = ['date', 'weather', 'travel', 'study'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/browse?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen">
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-cream-100 to-mint-100" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary-200 rounded-full blur-3xl opacity-50 animate-float" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-mint-200 rounded-full blur-3xl opacity-50 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-lavender-200 rounded-full blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full text-primary-600 text-sm font-medium mb-6 shadow-soft">
              <Sparkles className="w-4 h-4" />
              发现独一无二的手账贴纸
            </div>
            
            <h1 className="font-display font-bold text-4xl md:text-6xl text-gray-800 mb-6 text-shadow">
              让手账充满
              <span className="bg-gradient-to-r from-primary-500 via-lavender-400 to-mint-400 bg-clip-text text-transparent">
              创意与灵感
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              精选插画师原创贴纸，支持A4拼版预览，打印尺寸精准无误
            </p>

            <form onSubmit={handleSearch} className="max-w-xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索贴纸、主题、标签..."
                  className="w-full pl-12 pr-32 py-4 bg-white/80 backdrop-blur-md rounded-full shadow-soft focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2">
                  搜索
                </button>
              </div>
            </form>

            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-primary-400 rounded-full" />
                1000+ 原创贴纸
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-mint-400 rounded-full" />
                50+ 插画师入驻
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-lavender-400 rounded-full" />
                A4精准打印
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-800 mb-2">
                按分类浏览
              </h2>
              <p className="text-gray-500">选择你需要的贴纸类型</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div key={category} className="sticker-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CategoryCard category={category} count={12} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary-500" />
              </div>
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-800">
                热门贴纸
              </h2>
              <p className="text-gray-500">最受欢迎的贴纸作品</p>
            </div>
            </div>
            <Link to="/browse" className="btn-ghost flex items-center gap-1 text-primary-500 hover:text-primary-600">
              查看全部
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularStickers.slice(0, 4).map((sticker, index) => (
              <StickerCard key={sticker.id} sticker={sticker} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-mint-100 rounded-2xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-mint-500" />
              </div>
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-800">
                最新上架
              </h2>
              <p className="text-gray-500">新鲜出炉的贴纸作品</p>
            </div>
            </div>
            <Link to="/browse?sort=newest" className="btn-ghost flex items-center gap-1 text-primary-500 hover:text-primary-600">
              查看全部
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestStickers.slice(0, 4).map((sticker, index) => (
              <StickerCard key={sticker.id} sticker={sticker} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-primary-50 to-cream-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-gray-800 mb-2">
              精选主题合集
            </h2>
            <p className="text-gray-500">按主题打包下载，一键获取整套贴纸</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {themes.slice(0, 4).map((theme, index) => (
              <div key={theme.id} className="sticker-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <ThemeCard theme={theme} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="card p-8 md:p-12 bg-gradient-to-br from-primary-400 to-lavender-400 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="relative z-10">
              <h2 className="font-display font-bold text-3xl md:text-4xl mb-4 text-shadow">
              成为插画师
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              上传你的原创贴纸作品，让更多人看到你的创意，同时获得收益
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/upload" className="btn-secondary bg-white text-primary-600 border-white hover:bg-cream-50">
                立即上传作品
              </Link>
              <button className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-full font-medium transition-all hover:bg-white/20">
                了解更多
              </button>
            </div>
          </div>
        </div>
      </div>
      </section>

      <footer className="bg-white border-t border-primary-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-xl text-gray-800">StickerHub</span>
              </div>
              <p className="text-sm text-gray-500">
                专业的手账贴纸下载平台，让创意触手可及
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-800 mb-4">快速链接</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/browse" className="hover:text-primary-500">浏览贴纸</Link></li>
                <li><Link to="/upload" className="hover:text-primary-500">上传作品</Link></li>
                <li><Link to="/download" className="hover:text-primary-500">下载中心</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-800 mb-4">帮助中心</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-primary-500">使用教程</a></li>
                <li><a href="#" className="hover:text-primary-500">打印指南</a></li>
                <li><a href="#" className="hover:text-primary-500">常见问题</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-800 mb-4">关于我们</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-primary-500">联系我们</a></li>
                <li><a href="#" className="hover:text-primary-500">隐私政策</a></li>
                <li><a href="#" className="hover:text-primary-500">服务条款</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
            © 2026 StickerHub. 保留所有权利。
          </div>
        </div>
      </footer>
    </div>
  );
}
