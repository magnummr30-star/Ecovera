import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useI18n } from "../i18n/I18nContext";
import { ServerPath, CATEGORY_COLORS } from "../Constant";
import { useHoverColor } from "./HoverColorContext";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { fetchCategories } from "../../store/categoriesSlice.js";

const MOBILE_BREAKPOINT = 1024;
const SCROLL_THRESHOLD = 60;

function normalizeForMatch(str) {
  return (str || "").toString().trim().toLowerCase();
}

export default function CategoriesBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { items: categories, lang: categoriesLang, loading } = useSelector((state) => state.categories);
  const { setHoverColor } = useHoverColor();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef(null);
  const { t, lang } = useI18n();

  const [isMobile, setIsMobile] = useState(false);
  const [showBar, setShowBar] = useState(true);
  const lastScrollY = useRef(0);

  const isFindProductsPage = location.pathname === "/FindProducts";
  const urlQuery = React.useMemo(() => {
    if (!isFindProductsPage) return "";
    const params = new URLSearchParams(location.search);
    return normalizeForMatch(params.get("q") ?? "");
  }, [isFindProductsPage, location.search]);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const isRtl = document.documentElement.dir === "rtl";
    if (isRtl) {
      setCanScrollLeft(scrollLeft < scrollWidth - clientWidth - 2);
      setCanScrollRight(scrollLeft > 2);
    } else {
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, categories.length]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const onScroll = () => {
      const y = window.scrollY ?? window.pageYOffset ?? document.documentElement.scrollTop;
      if (y <= SCROLL_THRESHOLD) {
        setShowBar(true);
      } else if (y > lastScrollY.current) {
        setShowBar(false);
      } else {
        setShowBar(true);
      }
      lastScrollY.current = y;
    };
    lastScrollY.current = window.scrollY ?? window.pageYOffset ?? document.documentElement.scrollTop;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobile]);

  // When on FindProducts with a query, scroll the matching category into view
  useEffect(() => {
    if (!urlQuery || categories.length === 0 || !scrollRef.current) return;
    const index = categories.findIndex((item) => {
      const searchValue = normalizeForMatch(
        item.categoryNameEn || item.nameEn || item.slug || item.name || item.categoryNameAr || ""
      );
      const nameNorm = normalizeForMatch(item.name || item.categoryNameAr || item.categoryNameEn || "");
      return searchValue === urlQuery || nameNorm === urlQuery;
    });
    if (index < 0) return;
    const container = scrollRef.current;
    const child = container.children[index];
    if (child) {
      requestAnimationFrame(() => {
        child.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      });
    }
  }, [urlQuery, categories]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const step = 280;
    el.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  const handleSearch = (query, displayLabel, categoryId) => {
    const searchValue = (query || "").trim();
    if (!searchValue) return;
    const label = (displayLabel || query || "").trim() || searchValue;
    const path = `/FindProducts?q=${encodeURIComponent(searchValue)}`;
    navigate(path, { state: { searchQuery: label, apiQuery: searchValue, categoryId: categoryId ?? undefined } });
  };

  useEffect(() => {
    const L = lang || "ar";
    if (categories.length > 0 && categoriesLang === L) return;
    dispatch(fetchCategories(L));
  }, [lang, dispatch, categories.length, categoriesLang]);

  if (loading || categories.length === 0) {
    return null;
  }

  const barVisible = !isMobile || showBar;
  const wrapperClass = `overflow-hidden transition-all duration-300 ${
    isMobile ? (barVisible ? "max-h-20" : "max-h-0") : ""
  } lg:!max-h-none`;

  return (
    <div className={wrapperClass}>
    <div className="w-full bg-gradient-to-r from-[#92278f] via-[#7a1f75] to-[#ee207b] border-b border-[#92278f]/60 shadow-md sticky top-0 z-40">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-1.5 sm:py-2">
        {/* على الديسكتوب: الأقسام + الأسهم في المنتصف بين مساحتين متساويتين */}
        <div className="flex items-center justify-center w-full gap-0.5 sm:gap-1">
          <div className="hidden sm:block flex-1 min-w-0" aria-hidden />
          <div className="flex items-center justify-center gap-0.5 sm:gap-1 shrink-0">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label={lang === "ar" ? "السابق" : "Previous"}
              className="hidden sm:flex flex-shrink-0 p-1.5 sm:p-2 rounded-md text-white hover:bg-[#f49e24]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation"
            >
              <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div
              ref={scrollRef}
              className="flex items-center justify-center overflow-x-auto scrollbar-hide min-w-0 max-w-full sm:max-w-[min(70vw,900px)] py-0.5 -mx-1 px-1 snap-x snap-mandatory overscroll-x-contain"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div className="flex items-center justify-center gap-1 shrink-0 w-max">
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
            const searchNorm = normalizeForMatch(searchValue);
            const nameNorm = normalizeForMatch(item.name || item.categoryNameAr || item.categoryNameEn || "");
            const isActive =
              isFindProductsPage &&
              urlQuery &&
              (searchNorm === urlQuery || nameNorm === urlQuery);
            const categoryColor = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
            return (
              <button
                key={item.categoryId}
                data-category-index={index}
                onClick={() => handleSearch(searchValue, displayLabel, item.categoryId)}
                onMouseEnter={() => setHoverColor(categoryColor)}
                onMouseLeave={() => setHoverColor(null)}
                className={`snap-start px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 sm:gap-2 min-h-[36px] sm:min-h-0 touch-manipulation ${
                  isActive
                    ? "bg-[#f49e24]/90 text-white ring-1 ring-[#f49e24] shadow-sm"
                    : "text-white hover:bg-white/20"
                }`}
                style={
                  isActive
                    ? undefined
                    : {
                        backgroundColor: `${categoryColor}99`,
                        borderColor: `${categoryColor}dd`,
                        borderWidth: "1px",
                        borderStyle: "solid",
                      }
                }
              >
                {imageSrc && (
                  <img
                    src={imageSrc}
                    alt=""
                    className="h-5 w-5 sm:h-6 sm:w-6 rounded object-contain flex-shrink-0 bg-white/10"
                  />
                )}
                <span className={isActive ? "text-white font-semibold" : ""}>{item.name}</span>
              </button>
            );
          })}
              </div>
            </div>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label={lang === "ar" ? "التالي" : "Next"}
              className="hidden sm:flex flex-shrink-0 p-1.5 sm:p-2 rounded-md text-white hover:bg-[#f49e24]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation"
            >
              <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          <div className="hidden sm:block flex-1 min-w-0" aria-hidden />
        </div>
      </div>
    </div>
    </div>
  );
}


