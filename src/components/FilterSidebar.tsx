import { X, Filter, Palette, Ruler, Shield, Tag } from 'lucide-react';
import { useFilterStore } from '../store/useStore';
import {
  CATEGORY_LABELS,
  PRINT_SIZE_LABELS,
  COLOR_MODE_LABELS,
  LICENSE_TYPE_LABELS,
} from '../../shared/types';
import type { StickerCategory, PrintSize, ColorMode, LicenseType } from '../../shared/types';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterSidebar({ isOpen, onClose }: FilterSidebarProps) {
  const {
    category,
    printSize,
    colorMode,
    licenseType,
    setCategory,
    setPrintSize,
    setColorMode,
    setLicenseType,
    clearFilters,
  } = useFilterStore();

  const activeFilters = [category, printSize, colorMode, licenseType].filter(
    Boolean
  ).length;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside
        className={`fixed md:sticky top-16 md:top-20 left-0 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-72 bg-white border-r border-primary-100 z-50 transform transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-lg flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary-500" />
              筛选
              {activeFilters > 0 && (
                <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-600 rounded-full">
                  {activeFilters}
                </span>
              )}
            </h3>
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary-400" />
                贴纸分类
              </h4>
              <div className="space-y-2">
                {(Object.keys(CATEGORY_LABELS) as StickerCategory[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(category === cat ? null : cat)}
                    className={`w-full px-4 py-2 rounded-xl text-left transition-all ${
                      category === cat
                        ? 'bg-primary-100 text-primary-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-mint-400" />
                打印尺寸
              </h4>
              <div className="space-y-2">
                {(Object.keys(PRINT_SIZE_LABELS) as PrintSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => setPrintSize(printSize === size ? null : size)}
                    className={`w-full px-4 py-2 rounded-xl text-left transition-all ${
                      printSize === size
                        ? 'bg-mint-100 text-mint-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {PRINT_SIZE_LABELS[size]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-lavender-400" />
                色彩模式
              </h4>
              <div className="space-y-2">
                {(Object.keys(COLOR_MODE_LABELS) as ColorMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setColorMode(colorMode === mode ? null : mode)}
                    className={`w-full px-4 py-2 rounded-xl text-left transition-all ${
                      colorMode === mode
                        ? 'bg-lavender-100 text-lavender-400 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {COLOR_MODE_LABELS[mode]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                授权方式
              </h4>
              <div className="space-y-2">
                {(Object.keys(LICENSE_TYPE_LABELS) as LicenseType[]).map((license) => (
                  <button
                    key={license}
                    onClick={() => setLicenseType(licenseType === license ? null : license)}
                    className={`w-full px-4 py-2 rounded-xl text-left transition-all ${
                      licenseType === license
                        ? 'bg-butter-200 text-amber-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {LICENSE_TYPE_LABELS[license]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="mt-4 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-medium transition-colors"
            >
              清除所有筛选
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
