import { create } from 'zustand';
import type { Sticker, A4LayoutParams, ThemeWithStickers } from '../../shared/types';

interface DownloadCart {
  stickers: string[];
  addSticker: (id: string) => void;
  removeSticker: (id: string) => void;
  toggleSticker: (id: string) => void;
  clearCart: () => void;
  hasSticker: (id: string) => boolean;
  count: number;
}

interface FilterState {
  category: string | null;
  printSize: string | null;
  colorMode: string | null;
  licenseType: string | null;
  search: string;
  setCategory: (c: string | null) => void;
  setPrintSize: (s: string | null) => void;
  setColorMode: (c: string | null) => void;
  setLicenseType: (l: string | null) => void;
  setSearch: (s: string) => void;
  clearFilters: () => void;
}

interface LayoutState {
  params: A4LayoutParams;
  setMarginMm: (v: number) => void;
  setSpacingMm: (v: number) => void;
  setAutoArrange: (v: boolean) => void;
  setShowCutLines: (v: boolean) => void;
  setDpi: (v: number) => void;
  updateStickerPosition: (id: string, x: number, y: number) => void;
  resetParams: () => void;
}

interface DataState {
  stickers: Sticker[];
  popularStickers: Sticker[];
  latestStickers: Sticker[];
  themes: ThemeWithStickers[];
  loading: boolean;
  error: string | null;
  setStickers: (s: Sticker[]) => void;
  setPopularStickers: (s: Sticker[]) => void;
  setLatestStickers: (s: Sticker[]) => void;
  setThemes: (t: ThemeWithStickers[]) => void;
  setLoading: (l: boolean) => void;
  setError: (e: string | null) => void;
}

const defaultLayoutParams: A4LayoutParams = {
  stickers: [],
  marginMm: 10,
  spacingMm: 5,
  autoArrange: true,
  showCutLines: true,
  dpi: 300,
};

export const useDownloadCart = create<DownloadCart>((set, get) => ({
  stickers: [],
  count: 0,
  addSticker: (id) => {
    if (!get().stickers.includes(id)) {
      set((state) => ({
        stickers: [...state.stickers, id],
        count: state.count + 1,
      }));
    }
  },
  removeSticker: (id) => {
    set((state) => ({
      stickers: state.stickers.filter((s) => s !== id),
      count: state.count - 1,
    }));
  },
  toggleSticker: (id) => {
    if (get().stickers.includes(id)) {
      get().removeSticker(id);
    } else {
      get().addSticker(id);
    }
  },
  clearCart: () => set({ stickers: [], count: 0 }),
  hasSticker: (id) => get().stickers.includes(id),
}));

export const useFilterStore = create<FilterState>((set) => ({
  category: null,
  printSize: null,
  colorMode: null,
  licenseType: null,
  search: '',
  setCategory: (c) => set({ category: c }),
  setPrintSize: (s) => set({ printSize: s }),
  setColorMode: (c) => set({ colorMode: c }),
  setLicenseType: (l) => set({ licenseType: l }),
  setSearch: (s) => set({ search: s }),
  clearFilters: () =>
    set({
      category: null,
      printSize: null,
      colorMode: null,
      licenseType: null,
      search: '',
    }),
}));

export const useLayoutStore = create<LayoutState>((set) => ({
  params: { ...defaultLayoutParams },
  setMarginMm: (v) =>
    set((state) => ({ params: { ...state.params, marginMm: v } })),
  setSpacingMm: (v) =>
    set((state) => ({ params: { ...state.params, spacingMm: v } })),
  setAutoArrange: (v) =>
    set((state) => ({ params: { ...state.params, autoArrange: v } })),
  setShowCutLines: (v) =>
    set((state) => ({ params: { ...state.params, showCutLines: v } })),
  setDpi: (v) =>
    set((state) => ({ params: { ...state.params, dpi: v } })),
  updateStickerPosition: (id, x, y) =>
    set((state) => ({
      params: {
        ...state.params,
        stickers: state.params.stickers.map((s) =>
          s.id === id ? { ...s, x, y } : s
        ),
      },
    })),
  resetParams: () => set({ params: { ...defaultLayoutParams } }),
}));

export const useDataStore = create<DataState>((set) => ({
  stickers: [],
  popularStickers: [],
  latestStickers: [],
  themes: [],
  loading: false,
  error: null,
  setStickers: (s) => set({ stickers: s }),
  setPopularStickers: (s) => set({ popularStickers: s }),
  setLatestStickers: (s) => set({ latestStickers: s }),
  setThemes: (t) => set({ themes: t }),
  setLoading: (l) => set({ loading: l }),
  setError: (e) => set({ error: e }),
}));
