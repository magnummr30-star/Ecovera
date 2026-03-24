import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useI18n } from "../i18n/I18nContext";
import { ServerPath, CATEGORY_COLORS } from "../Constant";
import { useHoverColor } from "./HoverColorContext";
import { fetchCategories } from "../../store/categoriesSlice.js";

export default function HomeCategoriesCircles({ onCategoryHover, onCategoryLeave }) {
  const { setHoverColor } = useHoverColor();
  const onHover = onCategoryHover ?? setHoverColor;
  const onLeave = onCategoryLeave ?? (() => setHoverColor(null));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: categories, lang: categoriesLang, loading } = useSelector((state) => state.categories);
  const { lang } = useI18n();

  useEffect(() => {
    const L = lang || "ar";
    if (categories.length > 0 && categoriesLang === L) return;
    dispatch(fetchCategories(L));
  }, [lang, dispatch, categories.length, categoriesLang]);

  const handleClick = (e, query, displayLabel, categoryId) => {
    e.preventDefault();
    const searchValue = (query || "").trim();
    if (!searchValue) return;
    const label = (displayLabel || query || "").trim() || searchValue;
    navigate(`/FindProducts?q=${encodeURIComponent(searchValue)}`, {
      state: { searchQuery: label, apiQuery: searchValue, categoryId: categoryId ?? undefined },
    });
  };

  if (loading || categories.length === 0) return null;

  return (
    <div className="w-full flex justify-center px-4 sm:px-6 md:px-8 lg:px-0">
      <div className="w-full max-w-[1400px] mx-auto flex justify-center">
        <div className="flex flex-wrap justify-center items-start gap-y-3 gap-x-[11px] md:gap-5">
          {categories.map((item, index) => {
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
            const imageSrc =
              item.imagePath && item.imagePath !== "."
                ? item.imagePath.startsWith("http")
                  ? item.imagePath
                  : `${ServerPath}${item.imagePath}`
                : null;
            const categoryColor = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
            return (
              <a
                key={item.categoryId}
                href="#"
                onClick={(e) => handleClick(e, searchValue, displayLabel, item.categoryId)}
                className="flex flex-col items-center gap-y-3 group"
                onMouseEnter={() => onHover(categoryColor)}
                onMouseLeave={() => onLeave()}
              >
                <div
                  style={{ border: `2px solid ${categoryColor}`, background: categoryColor }}
                  className="rounded-full relative w-16 h-16 md:w-[112px] md:h-[112px] overflow-hidden flex items-center justify-center"
                >
                  {imageSrc ? (
                    <img
                      alt={displayLabel}
                      loading="lazy"
                      decoding="async"
                      src={imageSrc}
                      className="h-full w-auto max-w-[140%] scale-[1.1] absolute top-[-12px] group-hover:scale-110 transform transition duration-500 object-contain"
                    />
                  ) : (
                    <span className="text-white text-2xl md:text-3xl font-bold">
                      {(displayLabel || "?")[0]}
                    </span>
                  )}
                </div>
                <div
                  className="text-ellipsis text-xs md:font-semibold md:text-sm text-center line-clamp-2 max-w-full px-0.5"
                  style={{ color: categoryColor }}
                >
                  {displayLabel}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
