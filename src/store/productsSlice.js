import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API_BASE_URL from "../Components/Constant.js";

export const fetchProductsByName = createAsyncThunk(
  "products/fetchProductsByName",
  async ({ name, lang = "ar" }, { getState, rejectWithValue }) => {
    const query = (name && name.trim()) || "";
    if (!query) return { list: [], query: "", lang };

    const cacheKey = `${query}:${lang}`;
    const cached = getState().products.searchCache[cacheKey];
    if (cached) return { list: cached, query, lang };

    try {
      const response = await fetch(
        `${API_BASE_URL}Product/GetProductsByName?Name=${encodeURIComponent(query)}&lang=${lang}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const list = Array.isArray(data)
        ? data.map((p) => ({
            ...p,
            shortName: p.shortName || p.productName,
            productName: p.productName || p.productNameAr || p.productNameEn || "",
          }))
        : [];
      return { list, query, lang };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const FEATURED_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export const fetchFeaturedProducts = createAsyncThunk(
  "products/fetchFeaturedProducts",
  async ({ page = 1, limit = 10, lang = "ar" }, { getState, rejectWithValue }) => {
    const L = lang || "ar";
    const state = getState().products;
    const cached = state.featuredByLang?.[L];
    const expiry = state.featuredCacheExpiryByLang?.[L];
    const cacheValid = page === 1 && cached && cached.length > 0 && expiry && Date.now() < expiry;
    if (cacheValid) {
      return { list: cached, page: 1, limit, lang: L, fromCache: true };
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}Product/GetFeaturedProducts?Page=${page}&Limit=${limit}&lang=${L}`
      );
      if (!response.ok) throw new Error("Network error");
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      const expiryAt = Date.now() + FEATURED_CACHE_TTL_MS;
      return { list, page, limit, lang: L, expiry: expiryAt };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    searchResults: [],
    searchQuery: "",
    searchLang: "ar",
    searchCache: {},
    searchLoading: false,
    searchError: null,
    featured: [],
    featuredPage: 1,
    featuredByLang: {},
    featuredCacheExpiryByLang: {},
    featuredLoading: false,
    featuredError: null,
    hasMoreFeatured: true,
  },
  reducers: {
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = "";
      state.searchError = null;
    },
    setFeaturedPage: (state, action) => {
      state.featuredPage = action.payload;
    },
    removeFeaturedProduct: (state, action) => {
      const { productId, lang } = action.payload;
      const L = lang || "ar";
      if (state.featuredByLang[L]) {
        state.featuredByLang[L] = state.featuredByLang[L].filter((p) => p.productId !== productId);
        state.featured = state.featuredByLang[L];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsByName.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(fetchProductsByName.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.list;
        state.searchQuery = action.payload.query;
        state.searchLang = action.payload.lang;
        if (action.payload.query) {
          state.searchCache[`${action.payload.query}:${action.payload.lang}`] = action.payload.list;
        }
        state.searchError = null;
      })
      .addCase(fetchProductsByName.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload || "Search failed";
        state.searchResults = [];
      })
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.featuredLoading = true;
        state.featuredError = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredLoading = false;
        const { list, page, lang, fromCache, expiry } = action.payload;
        const L = lang || "ar";
        if (fromCache) {
          state.featuredError = null;
          return;
        }
        if (expiry != null) state.featuredCacheExpiryByLang[L] = expiry;
        if (list.length === 0) state.hasMoreFeatured = false;
        if (!state.featuredByLang[L]) state.featuredByLang[L] = [];
        if (page === 1) {
          state.featuredByLang[L] = list;
          state.featured = list;
          state.hasMoreFeatured = true;
        } else {
          const current = state.featuredByLang[L];
          const ids = new Set(current.map((p) => p.productId));
          const added = list.filter((p) => !ids.has(p.productId));
          state.featuredByLang[L] = [...current, ...added];
          state.featured = state.featuredByLang[L];
        }
        state.featuredPage = page;
        state.featuredError = null;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.featuredLoading = false;
        state.featuredError = action.payload || "Failed to load featured";
      });
  },
});

export const { clearSearchResults, setFeaturedPage, removeFeaturedProduct } = productsSlice.actions;
export default productsSlice.reducer;
