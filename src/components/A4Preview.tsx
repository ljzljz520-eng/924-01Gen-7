import { useState, useRef, useEffect, useCallback } from 'react';
import type { Sticker, A4LayoutParams } from '../../shared/types';
import { A4_WIDTH_MM, A4_HEIGHT_MM, CATEGORY_COLORS } from '../../shared/types';
import { Move, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface A4PreviewProps {
  stickers: Sticker[];
  layoutParams: A4LayoutParams;
  onLayoutChange?: (stickers: A4LayoutParams['stickers']) => void;
}

const SCALE_FACTOR = 2.5;

export default function A4Preview({
  stickers,
  layoutParams,
  onLayoutChange,
}: A4PreviewProps) {
  const [zoom, setZoom] = useState(0.6);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const a4WidthPx = A4_WIDTH_MM * SCALE_FACTOR;
  const a4HeightPx = A4_HEIGHT_MM * SCALE_FACTOR;

  const mmToPx = (mm: number) => mm * SCALE_FACTOR;

  const getLayoutStickers = useCallback(() => {
    if (layoutParams.autoArrange || layoutParams.stickers.length === 0) {
      const result: A4LayoutParams['stickers'] = [];
      let currentX = layoutParams.marginMm;
      let currentY = layoutParams.marginMm;
      let rowMaxHeight = 0;

      for (const sticker of stickers) {
        if (currentX + sticker.widthMm + layoutParams.marginMm > A4_WIDTH_MM) {
          currentX = layoutParams.marginMm;
          currentY += rowMaxHeight + layoutParams.spacingMm;
          rowMaxHeight = 0;
        }

        if (currentY + sticker.heightMm + layoutParams.marginMm > A4_HEIGHT_MM) {
          break;
        }

        result.push({
          id: sticker.id,
          x: currentX,
          y: currentY,
          rotation: 0,
        });

        currentX += sticker.widthMm + layoutParams.spacingMm;
        rowMaxHeight = Math.max(rowMaxHeight, sticker.heightMm);
      }

      return result;
    }
    return layoutParams.stickers;
  }, [stickers, layoutParams]);

  const layoutStickers = getLayoutStickers();

  const handleMouseDown = (e: React.MouseEvent, stickerId: string) => {
    if (layoutParams.autoArrange) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const sticker = layoutStickers.find((s) => s.id === stickerId);
    if (!sticker) return;

    setDragging(stickerId);
    setDragOffset({
      x: e.clientX - rect.left - mmToPx(sticker.x) / zoom,
      y: e.clientY - rect.top - mmToPx(sticker.y) / zoom,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let newX = (e.clientX - rect.left - dragOffset.x) * zoom / SCALE_FACTOR;
    let newY = (e.clientY - rect.top - dragOffset.y) * zoom / SCALE_FACTOR;

    newX = Math.max(layoutParams.marginMm, Math.min(newX, A4_WIDTH_MM - layoutParams.marginMm - 10));
    newY = Math.max(layoutParams.marginMm, Math.min(newY, A4_HEIGHT_MM - layoutParams.marginMm - 10));

    const updatedStickers = layoutStickers.map((s) =>
      s.id === dragging ? { ...s, x: Math.round(newX), y: Math.round(newY) } : s
    );

    onLayoutChange?.(updatedStickers);
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
    }
  }, [dragging]);

  const stickerMap = new Map(stickers.map((s) => [s.id, s]));

  return (
    <div className="bg-gray-100 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
            className="w-10 h-10 bg-white rounded-full shadow-soft flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ZoomOut className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-600 w-16 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
            className="w-10 h-10 bg-white rounded-full shadow-soft flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ZoomIn className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setZoom(0.6)}
            className="w-10 h-10 bg-white rounded-full shadow-soft flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="text-sm text-gray-500">
          A4 ({A4_WIDTH_MM}×{A4_HEIGHT_MM}mm) · {stickers.length} 张贴纸
        </div>
      </div>

      <div
        ref={containerRef}
        className="overflow-auto rounded-2xl bg-gray-200 p-8"
        style={{ maxHeight: '600px' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative bg-white shadow-xl mx-auto transition-transform duration-300"
          style={{
            width: a4WidthPx,
            height: a4HeightPx,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          {layoutParams.showCutLines && (
            <div
              className="absolute border-2 border-dashed border-gray-300 rounded"
              style={{
                left: mmToPx(layoutParams.marginMm),
                top: mmToPx(layoutParams.marginMm),
                width: a4WidthPx - mmToPx(layoutParams.marginMm) * 2,
                height: a4HeightPx - mmToPx(layoutParams.marginMm) * 2,
              }}
            />
          )}

          {layoutStickers.map((ls, index) => {
            const sticker = stickerMap.get(ls.id);
            if (!sticker) return null;

            const color = CATEGORY_COLORS[sticker.category];
            const isDragging = dragging === ls.id;

            return (
              <div
                key={ls.id}
                className={`absolute rounded-lg transition-all duration-100 ${
                  layoutParams.autoArrange ? '' : 'cursor-move'
                } ${isDragging ? 'z-10 shadow-2xl' : 'shadow-md hover:shadow-lg'}`}
                style={{
                  left: mmToPx(ls.x),
                  top: mmToPx(ls.y),
                  width: mmToPx(sticker.widthMm),
                  height: mmToPx(sticker.heightMm),
                  backgroundColor: `${color}40`,
                  border: `2px solid ${color}`,
                  animationDelay: `${index * 0.05}s`,
                }}
                onMouseDown={(e) => handleMouseDown(e, ls.id)}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                  <p className="text-xs font-bold text-gray-700 text-center line-clamp-2">
                    {sticker.title}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    {sticker.widthMm}×{sticker.heightMm}mm
                  </p>
                </div>
                
                {!layoutParams.autoArrange && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                    <Move className="w-3 h-3 text-gray-500" />
                  </div>
                )}

                {layoutParams.showCutLines && (
                  <div
                    className="absolute border border-dashed border-red-400 rounded"
                    style={{
                      left: -1,
                      top: -1,
                      width: '100%',
                      height: '100%',
                    }}
                  />
                )}
              </div>
            );
          })}

          <div className="absolute bottom-2 right-2 text-[10px] text-gray-400">
            A4 拼版预览 · {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-red-400" /> 裁切线
          <span className="w-3 h-3 rounded border-2 border-dashed border-gray-300" /> 边距范围
        </div>
        {!layoutParams.autoArrange && (
          <span className="text-primary-500">提示：可拖拽调整贴纸位置</span>
        )}
      </div>
    </div>
  );
}
