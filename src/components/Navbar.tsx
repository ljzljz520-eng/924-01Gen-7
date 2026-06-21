import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  Upload,
  Download,
  ShoppingCart,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useDownloadCart } from '../store/useStore';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const cartCount = useDownloadCart((state) => state.count);

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/browse', label: '浏览贴纸', icon: Search },
    { path: '/upload', label: '上传作品', icon: Upload },
    { path: '/download', label: '下载中心', icon: Download },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-primary-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-glow transition-all duration-300">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-800 hidden sm:block">
              StickerHub
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary-100 text-primary-600 font-medium'
                    : 'text-gray-600 hover:text-primary-500 hover:bg-primary-50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.path === '/download' && cartCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/download"
              className="relative md:hidden p-2 text-gray-600 hover:text-primary-500"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-100 animate-fade-in-up">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-600 hover:bg-primary-50'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
