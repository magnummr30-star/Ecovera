import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useI18n } from "../i18n/I18nContext";
import { ServerPath } from "../Constant";
import { fetchCategories } from "../../store/categoriesSlice.js";

export default function HomePromoBlocks() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: categories, lang: categoriesLang } = useSelector((state) => state.categories);
  const { lang } = useI18n();

  useEffect(() => {
    const L = lang || "ar";
    if (categories.length > 0 && categoriesLang === L) return;
    dispatch(fetchCategories(L));
  }, [lang, dispatch, categories.length, categoriesLang]);

  const displayCategories = categories.slice(0, 4);
  if (displayCategories.length === 0) return null;

  const handleClick = (query, label) => {
    const q = (query || "").trim();
    if (!q) return;
    navigate(`/FindProducts?q=${encodeURIComponent(q)}`, {
      state: { searchQuery: label || q, apiQuery: q },
    });
  };

  const renderCard = (item, hiddenOnMobile = false) => {
    const searchValue =
      item.categoryNameEn ||
      item.nameEn ||
      item.name ||
      item.categoryNameAr ||
      "";
    const displayLabel =
      lang === "ar"
        ? item.name || item.categoryNameAr || searchValue
        : item.name || searchValue;
    const imageSrc =
      item.imagePath && item.imagePath !== "."
        ? item.imagePath.startsWith("http")
          ? item.imagePath
          : `${ServerPath}${item.imagePath}`
        : null;

    return (
      <button
        key={item.categoryId}
        type="button"
        onClick={() => handleClick(searchValue, displayLabel)}
        className={`group relative w-full overflow-hidden rounded-2xl border border-gray-200/90 bg-gray-50 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[#0A2C52]/30 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#0A2C52]/40 focus:ring-offset-2 aspect-[4/3] min-h-[120px] sm:min-h-[140px] md:aspect-[2/1] md:min-h-0 md:max-h-[140px] lg:max-h-[160px] ${hiddenOnMobile ? "hidden md:block" : ""}`}
      >
        {imageSrc ? (
          <>
            <span className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
              <img
                alt={displayLabel}
                loading="lazy"
                decoding="async"
                className="max-w-full max-h-full w-auto h-auto object-contain object-center transition-transform duration-300 group-hover:scale-105"
                src={imageSrc}
              />
            </span>
            <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent rounded-b-2xl" aria-hidden />
            <span className="absolute inset-x-0 bottom-0 py-2.5 px-3 text-white text-sm font-semibold text-center line-clamp-2 rounded-b-2xl">
              {displayLabel}
            </span>
          </>
        ) : (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#0A2C52] to-[#13345d] flex flex-col items-center justify-center p-3">
            <span className="text-white font-semibold text-sm sm:text-base text-center">
              {displayLabel}
            </span>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="w-full mt-6 md:mt-8 px-4 sm:px-6 md:px-8 lg:px-0">
      <div className="w-full max-w-full md:container md:mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
          {displayCategories.slice(0, 2).map((item) => renderCard(item, false))}
          {displayCategories.slice(2, 4).map((item) => renderCard(item, true))}
        </div>
      </div>
    </div>
  );
}
