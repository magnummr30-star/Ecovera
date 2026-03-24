import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useI18n } from "../i18n/I18nContext";
import { fetchCategories } from "../../store/categoriesSlice.js";

export default function Categories() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: categories, lang: categoriesLang, loading } = useSelector((state) => state.categories);
  const { t, lang } = useI18n();

  useEffect(() => {
    const L = lang || "ar";
    if (categories.length > 0 && categoriesLang === L) return;
    dispatch(fetchCategories(L));
  }, [lang, dispatch, categories.length, categoriesLang]);

  const handleSearch = (query, displayLabel) => {
    const searchValue = (query || "").trim();
    if (!searchValue) return;
    const label = (displayLabel || query || "").trim() || searchValue;
    const path = `/FindProducts?q=${encodeURIComponent(searchValue)}`;
    navigate(path, { state: { searchQuery: label, apiQuery: searchValue } });
  };

  return (
    <div className="w-full px-4 md:px-8 lg:px-16 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8 text-brand-navy">
        {t("whatAreYouLookingFor", "ماذا تبحث عنه؟")}
      </h1>

      {loading ? (
        <p className="text-center text-gray-600 py-6">
          {t("loadingCategories", "جارٍ تحميل الأقسام...")}
        </p>
      ) : categories.length === 0 ? (
        <p className="text-center text-gray-600 py-6">
          {t("noCategories", "لا توجد أقسام متاحة حالياً.")}
        </p>
      ) : (
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {categories.map((item) => {
            const searchValue =
              item.categoryNameEn ||
              item.nameEn ||
              item.slug ||
              item.name ||
              item.categoryNameAr ||
              "";
            const displayLabel =
              lang === "ar"
                ? item.name || item.categoryNameAr || searchValue
                : item.name || searchValue;
            return (
              <button
                key={item.categoryId}
                onClick={() => handleSearch(searchValue, displayLabel)}
                className="px-4 py-2 md:px-6 md:py-3 bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 hover:border-brand-orange text-gray-800 hover:text-brand-orange font-semibold text-sm md:text-base transition-all duration-200 hover:bg-orange-50"
              >
                {item.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
