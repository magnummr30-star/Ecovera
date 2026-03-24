import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API_BASE_URL from "../Components/Constant.js";

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (lang = "ar", { getState, rejectWithValue }) => {
    const current = getState().categories;
    if (current.items.length > 0 && current.lang === (lang || "ar")) {
      return { list: current.items, lang: current.lang };
    }
    try {
      const response = await fetch(`${API_BASE_URL}categories?lang=${lang || "ar"}`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      const list = Array.isArray(data)
        ? data.filter((item) => item && (item.name || item.categoryNameAr || item.categoryNameEn))
        : [];
      return { list, lang: lang || "ar" };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState: {
    items: [],
    lang: "ar",
    loading: false,
    error: null,
  },
  reducers: {
    clearCategories: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.list;
        state.lang = action.payload.lang;
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load categories";
        state.items = [];
      });
  },
});

export const { clearCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;
