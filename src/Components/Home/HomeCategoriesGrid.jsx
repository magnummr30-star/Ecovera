import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useI18n } from "../i18n/I18nContext";
import { ServerPath, CATEGORY_COLORS } from "../Constant";
import { useHoverColor } from "./HoverColorContext";
import { fetchCategories } from "../../store/categoriesSlice.js";

export default function HomeCategoriesGrid({ onCategoryHover, onCategoryLeave }) {
  const { setHoverColor } = useHoverColor();
  const onHover = onCategoryHover ?? setHoverColor;
  const onLeave = onCategoryLeave ?? (() => setHoverColor(null));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: categories, lang: categoriesLang, loading } = useSelector((state) => state.categories);
  const { lang, t } = useI18n();

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
    <section className="mt-8 mb-8 w-full flex flex-col items-center">
      {/* Swiper-style wrapper: horizontal scroll — متسنتر في منتصف الصفحة */}
      <div className="w-full max-w-[1400px] mx-auto flex justify-center overflow-x-auto overflow-y-hidden pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <div className="flex gap-5 min-w-0 justify-center mx-auto" style={{ width: "max-content" }}>
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
              <div
                key={item.categoryId}
                className="flex-shrink-0 w-[235px]"
                style={{ marginRight: "20px" }}
                onMouseEnter={() => onHover(categoryColor)}
                onMouseLeave={() => onLeave()}
              >
                <a
                  href="#"
                  className="top-deals-card block rounded-xl overflow-hidden bg-gray-100 shadow-md hover:shadow-xl transition-all duration-300"
                  onClick={(e) => handleClick(e, searchValue, displayLabel, item.categoryId)}
                >
                  <div className="top-deals-card-img relative aspect-[4/3] overflow-hidden">
                    {imageSrc ? (
                      <img
                        alt={displayLabel}
                        src={imageSrc}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}dd)` }}
                      >
                        <span className="text-white text-4xl font-bold">
                          {(item.name || item.categoryNameAr || "?")[0]}
                        </span>
                      </div>
                    )}
                    <span className="top-deals-overlay absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold text-lg text-center px-3 transition-opacity hover:bg-black/50">
                      {displayLabel}
                    </span>
                  </div>
                  <div
                    className="top-deals-discount-bar text-white text-center py-2 px-3 text-sm font-semibold"
                    style={{ backgroundColor: categoryColor }}
                  >
                    {t("homePage.shopCategory", "تصفح العروض")}
                  </div>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
