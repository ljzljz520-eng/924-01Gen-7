import { useState, useEffect, useMemo } from 'react';
import {
  Download,
  Trash2,
  Settings,
  FileText,
  Package,
  AlertTriangle,
  Check,
  X,
  ChevronDown,
} from 'lucide-react';
import A4Preview from '../components/A4Preview';
import { useDownloadCart, useLayoutStore } from '../store/useStore';
import type { Sticker, A4LayoutParams } from '../../shared/types';
import { A4_WIDTH_MM, A4_HEIGHT_MM } from '../../shared/types';

export default function DownloadCenter() {
  const { stickers: cartStickerIds, removeSticker, clearCart, count } = useDownloadCart();
  const { params, setMarginMm, setSpacingMm, setAutoArrange, setShowCutLines, setDpi, updateStickerPosition, resetParams } = useLayoutStore();
  const [selectedStickers, setSelectedStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'pdf' | 'svg'>('png');
  const [includeA4Layout, setIncludeA4Layout] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    const fetchStickers = async () => {
      if (cartStickerIds.length === 0) {
        setSelectedStickers([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/stickers?limit=${cartStickerIds.length}`);
        const allStickers = await res.json();
        const selected = allStickers.filter((s: Sticker) => cartStickerIds.includes(s.id));
        setSelectedStickers(selected);
      } catch (error) {
        console.error('Failed to fetch stickers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStickers();
  }, [cartStickerIds]);

  const layoutFit = useMemo(() => {
    let currentX = params.marginMm;
    let currentY = params.marginMm;
    let rowMaxHeight = 0;
    let fittedCount = 0;

    for (const sticker of selectedStickers) {
      if (currentX + sticker.widthMm + params.marginMm > A4_WIDTH_MM) {
        currentX = params.marginMm;
        currentY += rowMaxHeight + params.spacingMm;
        rowMaxHeight = 0;
      }

      if (currentY + sticker.heightMm + params.marginMm > A4_HEIGHT_MM) {
        break;
      }

      fittedCount++;
      currentX += sticker.widthMm + params.spacingMm;
      rowMaxHeight = Math.max(rowMaxHeight, sticker.heightMm);
    }

    return {
      fitted: fittedCount,
      total: selectedStickers.length,
      canFitAll: fittedCount === selectedStickers.length,
    };
  }, [selectedStickers, params.marginMm, params.spacingMm]);

  const handleDownload = async () => {
    if (selectedStickers.length === 0) return;

    setDownloading(true);
    try {
      const res = await fetch('/api/download/pack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stickerIds: cartStickerIds,
          includeA4Layout,
          layoutParams: params,
          format: downloadFormat,
          packName: '手账贴纸包',
        }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `手账贴纸包-${new Date().toLocaleDateString()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleLayoutChange = (stickers: A4LayoutParams['stickers']) => {
    updateStickerPosition('', 0, 0);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-80 xl:w-96 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-xl text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary-500" />
                    下载包
                  </h2>
                  <span className="px-3 py-1 bg-primary-100 text-primary-600 rounded-full text-sm font-medium">
                    {count} 张
                  </span>
                </div>

                {selectedStickers.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-2">下载包是空的</p>
                    <p className="text-sm text-gray-400">去浏览页面添加贴纸吧</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-hide">
                    {selectedStickers.map((sticker, index) => (
                      <div
                        key={sticker.id}
                        className="flex items-center gap-3 p-3 bg-cream-50 rounded-2xl group"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-xs text-gray-600 font-medium shadow-soft flex-shrink-0">
                          {sticker.widthMm}×{sticker.heightMm}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{sticker.title}</p>
                          <p className="text-xs text-gray-500">{sticker.widthMm}×{sticker.heightMm}mm</p>
                        </div>
                        <button
                          onClick={() => removeSticker(sticker.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedStickers.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="w-full mt-4 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
                  >
                    清空下载包
                  </button>
                )}
              </div>

              <div className="card p-6">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-full flex items-center justify-between mb-4"
                >
                  <h3 className="font-display font-bold text-lg text-gray-800 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary-500" />
                    拼版设置
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      showSettings ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showSettings && (
                  <div className="space-y-4 animate-fade-in-up">
                    <div>
                      <label className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">自动排版</span>
                        <button
                          onClick={() => setAutoArrange(!params.autoArrange)}
                          className={`w-12 h-6 rounded-full transition-colors relative ${
                            params.autoArrange ? 'bg-primary-400' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              params.autoArrange ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        边距: {params.marginMm}mm
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        value={params.marginMm}
                        onChange={(e) => setMarginMm(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-full appearance-none accent-primary-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        间距: {params.spacingMm}mm
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={params.spacingMm}
                        onChange={(e) => setSpacingMm(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-full appearance-none accent-primary-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        分辨率: {params.dpi} DPI
                      </label>
                      <select
                        value={params.dpi}
                        onChange={(e) => setDpi(Number(e.target.value))}
                        className="select-field py-2 text-sm"
                      >
                        <option value={150}>150 DPI（快速）</option>
                        <option value={300}>300 DPI（标准）</option>
                        <option value={600}>600 DPI（高清）</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">显示裁切线</span>
                        <button
                          onClick={() => setShowCutLines(!params.showCutLines)}
                          className={`w-12 h-6 rounded-full transition-colors relative ${
                            params.showCutLines ? 'bg-primary-400' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              params.showCutLines ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </label>
                    </div>

                    <button
                      onClick={resetParams}
                      className="w-full py-2 text-sm text-primary-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                    >
                      重置为默认值
                    </button>
                  </div>
                )}
              </div>

              <div className="card p-6">
                <h3 className="font-display font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary-500" />
                  下载选项
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">文件格式</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['png', 'pdf', 'svg'] as const).map((format) => (
                        <button
                          key={format}
                          onClick={() => setDownloadFormat(format)}
                          className={`py-2 rounded-xl text-sm font-medium transition-all uppercase ${
                            downloadFormat === format
                              ? 'bg-primary-100 text-primary-600'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">包含A4拼版图</span>
                      <button
                        onClick={() => setIncludeA4Layout(!includeA4Layout)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${
                          includeA4Layout ? 'bg-primary-400' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            includeA4Layout ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </label>
                  </div>

                  {!layoutFit.canFitAll && selectedStickers.length > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">
                        当前设置下只能容纳 {layoutFit.fitted} 张，还有{' '}
                        {layoutFit.total - layoutFit.fitted} 张无法放下，建议减少贴纸或调整参数
                      </p>
                    </div>
                  )}

                  {layoutFit.canFitAll && selectedStickers.length > 0 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-green-700">
                        所有 {layoutFit.total} 张贴纸都可以完美放入A4纸张
                      </p>
                    </div>
                  )}

                  {downloadSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <p className="text-sm text-green-700 font-medium">下载已开始！</p>
                    </div>
                  )}

                  <button
                    onClick={handleDownload}
                    disabled={selectedStickers.length === 0 || downloading}
                    className={`w-full btn-primary flex items-center justify-center gap-2 ${
                      selectedStickers.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {downloading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        正在生成...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        下载贴纸包
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-6">
              <h1 className="font-display font-bold text-3xl text-gray-800 mb-2">
                A4 拼版预览
              </h1>
              <p className="text-gray-500">
                调整贴纸在A4纸上的排列，确认尺寸无误后下载打印
              </p>
            </div>

            {loading ? (
              <div className="card p-12">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="w-96 h-[500px] bg-gray-200 rounded-2xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-48" />
                </div>
              </div>
            ) : selectedStickers.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                  <FileText className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="font-display font-bold text-xl text-gray-800 mb-2">
                  还没有选择贴纸
                </h3>
                <p className="text-gray-500 mb-6">
                  在浏览页面点击贴纸右上角的 + 按钮将贴纸添加到下载包
                </p>
                <a href="/browse" className="btn-primary inline-flex items-center gap-2">
                  去浏览贴纸
                  <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                </a>
              </div>
            ) : (
              <A4Preview
                stickers={selectedStickers}
                layoutParams={params}
                onLayoutChange={handleLayoutChange}
              />
            )}

            {selectedStickers.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card p-4 text-center">
                  <p className="text-2xl font-bold text-gray-800">{selectedStickers.length}</p>
                  <p className="text-sm text-gray-500">已选贴纸</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-2xl font-bold text-gray-800">{A4_WIDTH_MM}×{A4_HEIGHT_MM}</p>
                  <p className="text-sm text-gray-500">纸张尺寸 (mm)</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-2xl font-bold text-gray-800">{params.dpi}</p>
                  <p className="text-sm text-gray-500">输出分辨率 (DPI)</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-2xl font-bold text-gray-800">{layoutFit.fitted}</p>
                  <p className="text-sm text-gray-500">可容纳数量</p>
                </div>
              </div>
            )}

            {selectedStickers.length > 0 && (
              <div className="mt-6 card p-6">
                <h3 className="font-display font-bold text-lg text-gray-800 mb-4">
                  打印提示
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary-600">1</span>
                    </div>
                    <p>打印时请选择「实际尺寸」或「100%」，不要勾选「适应页面」</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary-600">2</span>
                    </div>
                    <p>建议使用不干胶打印纸或哑光照片纸，效果最佳</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary-600">3</span>
                    </div>
                    <p>CMYK模式贴纸建议使用专业印刷，家用打印机请选择RGB模式</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary-600">4</span>
                    </div>
                    <p>打印前先打印测试页，确认尺寸符合预期后再批量打印</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
