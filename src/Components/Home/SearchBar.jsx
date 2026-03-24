import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FiSearch } from "react-icons/fi";
import API_BASE_URL from "../Constant";
import { useI18n } from "../i18n/I18nContext";

const SUGGESTIONS_DEBOUNCE_MS = 320;
const MAX_PRODUCT_SUGGESTIONS = 8;
const MAX_CATEGORY_SUGGESTIONS = 5;

export default function SearchBar({ onSearch, searchType = "products" }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [categoriesCache, setCategoriesCache] = useState({ list: [], lang: null });
  const [dropdownRect, setDropdownRect] = useState(null);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const { t, lang } = useI18n();
  const brandPurple = "#92278f";
  const brandPink = "#ee207b";
  const brandYellow = "#f49e24";

  const showProductSuggestions = searchType === "products";

  // تحميل الأقسام مرة واحدة عند الحاجة (بدون Redux)
  useEffect(() => {
    if (!showProductSuggestions || (categoriesCache.list.length > 0 && categoriesCache.lang === lang)) return;
    let cancelled = false;
    fetch(`${API_BASE_URL}categories?lang=${lang || "ar"}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data)
          ? data.filter((item) => item && (item.name || item.categoryNameAr || item.categoryNameEn))
          : [];
        setCategoriesCache({ list, lang: lang || "ar" });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [showProductSuggestions, lang, categoriesCache.list.length, categoriesCache.lang]);

  // جلب اقتراحات المنتجات والأقسام (مع debounce)
  useEffect(() => {
    if (!showProductSuggestions) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const q = (searchQuery || "").trim();
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      debounceRef.current = null;
      setLoadingSuggestions(true);
      const list = [];
      const categories = categoriesCache.list || [];

      const catName = (c) => (c && (c.name ?? c.categoryNameAr ?? c.categoryNameEn ?? "")) || "";
      const filteredCats = categories
        .filter((c) => {
          const name = catName(c).toLowerCase();
          const qLower = q.toLowerCase();
          return name.includes(qLower) || (c.categoryNameEn && c.categoryNameEn.toLowerCase().includes(qLower));
        })
        .slice(0, MAX_CATEGORY_SUGGESTIONS);
      filteredCats.forEach((c) => {
        const label = catName(c);
        const value = c.categoryNameEn || c.categoryNameAr || label;
        if (label && !list.some((x) => x.type === "category" && x.value === value))
          list.push({ type: "category", label, value });
      });

      try {
        const res = await fetch(
          `${API_BASE_URL}Product/GetProductsByName?Name=${encodeURIComponent(q)}&lang=${lang || "ar"}`
        );
        if (res.ok) {
          const data = await res.json();
          const arr = Array.isArray(data) ? data : [];
          const names = new Set();
          arr.slice(0, MAX_PRODUCT_SUGGESTIONS).forEach((p) => {
            const name = p.productName ?? p.ProductName ?? "";
            if (name && !names.has(name)) {
              names.add(name);
              list.push({ type: "product", label: name, value: name });
            }
          });
        }
      } catch (err) {
        console.error("Search suggestions error:", err);
      }

      setSuggestions(list);
      setShowSuggestions(list.length > 0);
      setLoadingSuggestions(false);
    }, SUGGESTIONS_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, showProductSuggestions, lang, categoriesCache]);

  // تحديث موقع القائمة عند الفتح أو التمرير/التكبير
  const updateDropdownRect = () => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setDropdownRect({
      top: rect.bottom,
      left: rect.left,
      width: rect.width,
    });
  };
  useEffect(() => {
    if (showProductSuggestions && (showSuggestions || loadingSuggestions)) {
      updateDropdownRect();
      const onScrollOrResize = () => updateDropdownRect();
      window.addEventListener("scroll", onScrollOrResize, true);
      window.addEventListener("resize", onScrollOrResize);
      return () => {
        window.removeEventListener("scroll", onScrollOrResize, true);
        window.removeEventListener("resize", onScrollOrResize);
      };
    } else {
      setDropdownRect(null);
    }
  }, [showSuggestions, loadingSuggestions, showProductSuggestions]);

  // إغلاق القائمة عند النقر خارجها أو Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      const inWrapper = wrapperRef.current && wrapperRef.current.contains(e.target);
      const inDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!inWrapper && !inDropdown) setShowSuggestions(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearch = async (value) => {
    const term = ((value ?? searchQuery) || "").trim();
    if (!term) return;

    setIsLoading(true);
    const token = sessionStorage.getItem("token");
    try {
      await fetch(`${API_BASE_URL}searchlogs/add?searchTerm=${encodeURIComponent(term)}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {
      console.error("فشل تسجيل البحث:", err);
    } finally {
      setIsLoading(false);
      setShowSuggestions(false);
      onSearch(term, term);
    }
  };

  const handleSelectSuggestion = (item) => {
    setSearchQuery(item.value);
    handleSearch(item.value);
  };

  const isRTL = lang === "ar";

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={wrapperRef}>
      <div className="relative flex items-center group">
        <input
          type="text"
          placeholder={
            searchType === "products"
              ? t("searchProducts", "ابحث في المنتجات...")
              : t("searchOrder", "ابحث برقم الطلب...")
          }
          className="w-full py-3 pl-14 pr-4 text-right text-sm sm:text-base rounded-xl border-2 border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-[#eef2f9] backdrop-blur-sm text-gray-800 placeholder-gray-500 transition-all duration-300 shadow-lg group-hover:shadow-xl"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (showProductSuggestions && suggestions.length > 0) setShowSuggestions(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls="search-suggestions-list"
          id="search-input"
        />

        <button
          onClick={() => handleSearch()}
          disabled={isLoading}
          className="absolute left-2 flex items-center justify-center w-12 h-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92278f]/30 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-md transform group-hover:scale-105 gap-1.5"
          style={{
            background: `linear-gradient(to right, ${brandPurple}, ${brandPink})`,
            color: "#ffffff",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `linear-gradient(to right, ${brandPink}, ${brandPurple})`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = `linear-gradient(to right, ${brandPurple}, ${brandPink})`;
          }}
        >
          {isLoading ? (
            <div
              className="w-4 h-4 border-2 rounded-full animate-spin"
              style={{ borderColor: "#ffffff", borderTopColor: "transparent" }}
            />
          ) : (
            <>
              <span className="sr-only">{t("searchAction", "ابحث")}</span>
              <FiSearch size={18} style={{ color: "#f49e24", stroke: "#f49e24" }} />
            </>
          )}
        </button>

        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute left-12 flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 transition-colors duration-200 hidden sm:flex"
          >
            ✕
          </button>
        )}
      </div>

      {/* قائمة الاقتراحات: أقسام + منتجات */}
      {showProductSuggestions && (showSuggestions || loadingSuggestions) && dropdownRect &&
        createPortal(
          <div
            ref={dropdownRef}
            id="search-suggestions-list"
            role="listbox"
            className={`fixed z-[9999] py-1 rounded-xl border border-gray-200 bg-white shadow-xl max-h-[min(70vh,320px)] overflow-y-auto ${isRTL ? "text-right" : "text-left"}`}
            style={{
              top: dropdownRect.top + 4,
              left: dropdownRect.left,
              width: dropdownRect.width,
            }}
          >
            {loadingSuggestions && suggestions.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-sm">
                {t("loading", "جاري التحميل...")}
              </div>
            ) : (
              <>
                {suggestions.filter((s) => s.type === "category").length > 0 && (
                  <div className="px-3 pt-2 pb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t("searchSuggestions.categories", "أقسام")}
                    </span>
                  </div>
                )}
                {suggestions
                  .filter((s) => s.type === "category")
                  .map((item, i) => (
                    <button
                      key={`cat-${i}-${item.value}`}
                      type="button"
                      role="option"
                      className="w-full px-4 py-2.5 text-sm text-gray-800 hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none"
                      onClick={() => handleSelectSuggestion(item)}
                    >
                      {item.label}
                    </button>
                  ))}
                {suggestions.filter((s) => s.type === "product").length > 0 && (
                  <div className="px-3 pt-2 pb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {t("searchSuggestions.products", "منتجات")}
                    </span>
                  </div>
                )}
                {suggestions
                  .filter((s) => s.type === "product")
                  .map((item, i) => (
                    <button
                      key={`prod-${i}-${item.value}`}
                      type="button"
                      role="option"
                      className="w-full px-4 py-2.5 text-sm text-gray-800 hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none"
                      onClick={() => handleSelectSuggestion(item)}
                    >
                      {item.label}
                    </button>
                  ))}
              </>
            )}
          </div>,
          document.body
        )}

      <div className="flex justify-between items-center mt-2 px-2">
        {searchQuery && (
          <span className="text-xs text-indigo-600 font-medium">{searchQuery.length}/50</span>
        )}
      </div>
    </div>
  );
}
