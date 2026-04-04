import React, { useState, useEffect, useRef, useCallback, useMemo, forwardRef } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import StoreLayout from "./StoreLayout";
import ProductItem from "../Products/ProductItem.jsx";
import API_BASE_URL, { SiteName } from "../Constant.js";
import { getRoleFromToken } from "../utils.js";
import { fetchFeaturedProducts, removeFeaturedProduct } from "../../store/productsSlice.js";
import WebSiteLogo from "../WebsiteLogo/WebsiteLogo.jsx";
import BannerCarousel from "./BannerCarousel";
import AnnouncementBar from "./AnnouncementBar";
import HomeCategoriesGrid from "./HomeCategoriesGrid";
import HomeCategoriesCircles from "./HomeCategoriesCircles";
import HomeFragranceHighlights from "./HomeFragranceHighlights";
import HomeProductGallery from "./HomeProductGallery";
import { useI18n } from "../i18n/I18nContext";
import { FiMail, FiPhone } from "react-icons/fi";
import { FaWhatsapp, FaTiktok, FaFacebookF, FaInstagram } from "react-icons/fa";

const HOME_PRODUCTS_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const homeProductsCache = {
  discount: {},
  grid: {},
};

const SectionHeader = ({ title, eyebrow, description }) => (
  <div className="px-4 sm:px-6 md:px-8 lg:px-16 text-center space-y-2 md:space-y-3">
    {eyebrow && (
      <span className="inline-block rounded-full bg-orange-100 text-brand-orange px-3 py-1 text-xs sm:text-sm font-semibold">
        {eyebrow}
      </span>
    )}
    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
      {title}
    </h2>
    {description && (
      <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed max-w-3xl mx-auto px-2">
        {description}
      </p>
    )}
  </div>
);

const LazySectionPlaceholder = ({ message, helper }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-gray-500">
    <div className="h-10 w-10 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
    <p className="text-sm font-semibold">{message}</p>
    {helper && <p className="text-xs text-gray-400 max-w-sm">{helper}</p>}
  </div>
);

const QuickWhatsAppCta = ({ whatsAppNumber, callNumber, lang, t }) => {
  const normalizedWhatsAppNumber = String(whatsAppNumber || "").replace(/[^0-9]/g, "");
  const normalizedCallNumber = String(callNumber || "").replace(/[^0-9]/g, "");

  if (!normalizedWhatsAppNumber) return null;

  const whatsAppHref = `https://wa.me/${normalizedWhatsAppNumber}?text=${encodeURIComponent(
    t(
      "homePage.quickWhatsAppMessage",
      "مرحباً، أحتاج مساعدة سريعة في اختيار المنتج المناسب."
    )
  )}`;
  const isArabic = lang === "ar";
  const textAlignClass = isArabic ? "text-center lg:text-right" : "text-center lg:text-left";
  const actionsAlignClass = isArabic ? "justify-center lg:justify-end" : "justify-center lg:justify-start";

  return (
    <section className="py-3 md:py-4">
      <div className="relative overflow-hidden rounded-[24px] border border-emerald-200/80 bg-[linear-gradient(135deg,#f4fff7_0%,#dcfce7_45%,#bbf7d0_100%)] shadow-[0_18px_45px_rgba(22,163,74,0.12)]">
        <div className="pointer-events-none absolute -top-12 -right-10 h-36 w-36 rounded-full bg-white/35 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-6 h-40 w-40 rounded-full bg-emerald-300/30 blur-3xl" />

        <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] items-center gap-6 px-5 py-5 sm:px-7 sm:py-6 md:px-10 md:py-8">
          <div className={`space-y-3 ${textAlignClass}`}>
            <span className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm">
              {t("homePage.quickWhatsAppEyebrow", "واتساب سريع")}
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-emerald-950">
              {t("homePage.quickWhatsAppTitle", "ما لقيت طلبك؟ راسلنا مباشرة")}
            </h2>
            <p className="max-w-2xl text-sm sm:text-base leading-7 text-emerald-900/80">
              {t(
                "homePage.quickWhatsAppDesc",
                "إذا كنت تبحث عن منتج معين أو تحتاج مساعدة سريعة، فريقنا جاهز للرد عليك عبر واتساب."
              )}
            </p>

            <div className={`flex flex-wrap gap-3 ${actionsAlignClass}`}>
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#16a34a] px-5 py-3 text-sm sm:text-base font-bold text-white shadow-lg shadow-emerald-700/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#15803d]"
                aria-label={t("contact.whatsappCta", "اضغط هنا لإرسال رسالة عبر واتساب")}
              >
                <FaWhatsapp className="h-5 w-5 flex-shrink-0" />
                <span>{t("homePage.quickWhatsAppButton", "اطلب عبر واتساب")}</span>
              </a>

              {normalizedCallNumber && (
                <a
                  href={`tel:${normalizedCallNumber}`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-emerald-700/20 bg-white/85 px-5 py-3 text-sm sm:text-base font-semibold text-emerald-900 transition-all duration-200 hover:border-emerald-700/40 hover:bg-white"
                  aria-label={t("contact.phoneCta", "اضغط هنا للاتصال بنا الآن")}
                >
                  <FiPhone className="h-5 w-5 flex-shrink-0" />
                  <span>{t("homePage.quickCallButton", "اتصل بنا")}</span>
                </a>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/80 bg-white/80 shadow-xl">
              <FaWhatsapp className="h-12 w-12 text-[#16a34a]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ProductsRail = forwardRef(({ items, emptyMessage, isLoadingMore, onRemove, handleProductClick, t, getRoleFromToken }, ref) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = useCallback(() => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    const isRtl = getComputedStyle(ref.current).direction === "rtl";
    
    if (isRtl) {
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    } else {
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, [ref]);

  useEffect(() => {
    const scrollContainer = ref.current;
    if (!scrollContainer) return;
    
    checkScrollability();
    scrollContainer.addEventListener('scroll', checkScrollability);
    window.addEventListener('resize', checkScrollability);
    
    return () => {
      scrollContainer.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [ref, checkScrollability, items.length]);

  const scrollLeft = () => {
    if (!ref.current) return;
    const isRtl = getComputedStyle(ref.current).direction === "rtl";
    const scrollAmount = 400;
    if (isRtl) {
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    } else {
      ref.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (!ref.current) return;
    const isRtl = getComputedStyle(ref.current).direction === "rtl";
    const scrollAmount = 400;
    if (isRtl) {
      ref.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 relative overflow-x-hidden min-w-0">
      {items.length === 0 && isLoadingMore ? (
        <p className="text-center text-sm text-gray-600 py-6 sm:py-8">{t("loadingProducts", "جارٍ التحميل...")}</p>
      ) : items.length === 0 ? (
        <p className="text-center text-sm text-gray-600 py-6 sm:py-8">{emptyMessage}</p>
      ) : (
        <div className="relative">
          {/* Left Arrow - Desktop Only */}
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 items-center justify-center border border-gray-200 ${
              !canScrollLeft ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Right Arrow - Desktop Only */}
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 items-center justify-center border border-gray-200 ${
              !canScrollRight ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div
            className="flex gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden pb-3 md:pb-4 snap-x snap-mandatory scrollbar-hide min-w-0"
            ref={ref}
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {items.map((product) => (
                <div
                  key={product.productId}
                  data-product-id={product.productId}
                  onClick={() => handleProductClick(product)}
                  className="snap-start flex-shrink-0 w-[85vw] min-w-[280px] max-w-[320px] sm:w-80 md:w-64 lg:w-72 rounded-xl overflow-hidden"
                >
                  <ProductItem
                    product={product}
                    CurrentRole={getRoleFromToken(sessionStorage.getItem("token"))}
                    onDeleted={(deletedId) => {
                      if (typeof onRemove === "function") {
                        onRemove(deletedId ?? product.productId);
                      }
                    }}
                  />
                </div>
            ))}
            {isLoadingMore && (
              <div className="flex-shrink-0 w-[85vw] min-w-[280px] max-w-[320px] sm:w-80 md:w-64 lg:w-72 flex items-center justify-center">
                <div className="h-6 w-6 sm:h-8 sm:w-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default function Home() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const dispatch = useDispatch();
  const featuredProducts = useSelector((s) => s.products.featuredByLang?.[lang] ?? []);
  const featuredPage = useSelector((s) => s.products.featuredPage);
  const loadingFeatured = useSelector((s) => s.products.featuredLoading);
  const hasMoreFeatured = useSelector((s) => s.products.hasMoreFeatured);
  const [Discountproducts, setDiscountProducts] = useState([]);
  const [DiscountProductsPage, setDiscountProductsPage] = useState(1);
  const [hasMoreDisCountProducts, setHasMoreDiscountProducts] = useState(true);
  const [loadingDiscountProducts, setloadingDiscountProducts] = useState(false);
  const [gridProducts, setGridProducts] = useState([]);
  const [gridPage, setGridPage] = useState(1);
  const [hasMoreGrid, setHasMoreGrid] = useState(true);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminInfo, setAdminInfo] = useState([]);
  const [sectionsReady, setSectionsReady] = useState({
    discounts: false,
    grid: false,
  });
  const featuredLoadingRef = useRef(false);
  const discountLoadingRef = useRef(false);
  const gridLoadingRef = useRef(false);
  const gridObserverTarget = useRef(null);
  const fetchedPagesRef = useRef({
    featured: new Set(),
    discount: new Set(),
    grid: new Set(),
  });
  
  // استخدام useRef لمنع استدعاء useEffect مرتين
  const hasInitializedFeatured = useRef(false);
  const hasInitializedDiscount = useRef(false);
  const hasInitializedGrid = useRef(false);
  const lastLangRef = useRef(null);

  const scrollToSection = useCallback((sectionId) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const footerLinks = useMemo(
    () => [
      { key: "home", label: t("footer.home", "المتجر"), path: "/" },
      { key: "contact", label: t("footer.contact", "اتصل بنا"), path: "/Contact" },
      { key: "about", label: t("footer.about", "معلومات عنا"), path: "/about-us" },
      { key: "terms", label: t("footer.terms", "الشروط والخصوصية"), path: "/terms" },
      { key: "categories", label: t("footer.categories", "الأقسام"), sectionId: "home-categories" },
    ],
    [t]
  );

  const homeContactInfo = useMemo(() => {
    const info = adminInfo[0];
    return {
      whatsAppNumber: info?.whatsAppNumber ?? info?.whatsappNumber ?? "",
      callNumber: info?.callNumber ?? info?.phoneNumber ?? "",
    };
  }, [adminInfo]);

  useEffect(() => {
    async function fetchAdminInfo() {
      try {
        const response = await fetch(`${API_BASE_URL}AdminInfo/get-admin-info`);
        if (!response.ok) return;
        const data = await response.json();
        setAdminInfo(Array.isArray(data) ? data : []);
      } catch {
        // ignore: footer works without contact info
      }
    }
    fetchAdminInfo();
  }, []);

  const getPageKey = (page) => `${lang || "default"}-${page}`;

  const mergeUniqueProducts = (prev, next) => {
    const existing = new Set(prev.map((item) => item.productId));
    return [...prev, ...next.filter((item) => !existing.has(item.productId))];
  };

  useEffect(() => {
    const observers = [];
    const createObserver = (ref, key) => {
      if (!ref.current) return;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setSectionsReady((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
            observer.disconnect();
          }
        },
        { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
      );

      observer.observe(ref.current);
      observers.push(observer);
    };

    createObserver(discountSectionRef, "discounts");
    createObserver(gridSectionRef, "grid");

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const resetFetchedPages = () => {
    fetchedPagesRef.current = {
      featured: new Set(),
      discount: new Set(),
      grid: new Set(),
    };
  };

  const fetchDiscountProducts = useCallback(async (page, reset = false) => {
    if (discountLoadingRef.current) return;
    const pageKey = getPageKey(page);
    if (!reset && fetchedPagesRef.current.discount.has(pageKey)) return;

    if (reset && page === 1) {
      const entry = homeProductsCache.discount[lang];
      if (entry && entry.expiry > Date.now() && Array.isArray(entry.data)) {
        fetchedPagesRef.current.discount.clear();
        setDiscountProducts(entry.data);
        setDiscountProductsPage(2);
        setHasMoreDiscountProducts(entry.data.length >= 10);
        fetchedPagesRef.current.discount.add(pageKey);
        return;
      }
    }

    discountLoadingRef.current = true;
    setloadingDiscountProducts(true);
    try {
      const url = `${API_BASE_URL}Product/GetDiscountProducts?page=${page}&limit=10&lang=${lang}`;
      if (import.meta.env.DEV) {
        console.log('Fetching discount products with lang:', lang, 'page:', page);
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network error");

      const data = await response.json();
      if (import.meta.env.DEV) {
        console.log('Discount products received:', data.length);
      }
      if (reset && page === 1) {
        homeProductsCache.discount[lang] = {
          data: Array.isArray(data) ? data : [],
          expiry: Date.now() + HOME_PRODUCTS_CACHE_TTL_MS,
        };
      }
      if (data.length === 0) {
        setHasMoreDiscountProducts(false);
      } else {
        if (reset) {
          fetchedPagesRef.current.discount.clear();
          setDiscountProducts(data);
          setDiscountProductsPage(2);
        } else {
          setDiscountProducts((prev) => mergeUniqueProducts(prev, data));
          setDiscountProductsPage((prev) => prev + 1);
        }
        fetchedPagesRef.current.discount.add(pageKey);
      }
    } catch (error) {
      console.error("Error fetching discount products:", error);
    } finally {
      discountLoadingRef.current = false;
      setloadingDiscountProducts(false);
    }
  }, [lang]);

  const fetchGridProducts = useCallback(async (page, reset = false) => {
    if (gridLoadingRef.current) return;
    const pageKey = getPageKey(page);
    if (!reset && fetchedPagesRef.current.grid.has(pageKey)) return;
    gridLoadingRef.current = true;
    setLoadingGrid(true);
    try {
      const url = `${API_BASE_URL}Product/GetAllProductsWithLimit?page=${page}&limit=9&lang=${lang}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network error");
      const data = await response.json();
      if (data.length === 0) {
        setHasMoreGrid(false);
      } else {
        if (reset) {
          fetchedPagesRef.current.grid.clear();
          setGridProducts(data);
          setGridPage(2);
        } else {
          setGridProducts((prev) => mergeUniqueProducts(prev, data));
          setGridPage((prev) => prev + 1);
        }
        fetchedPagesRef.current.grid.add(pageKey);
      }
      if (data.length === 0 && !reset) {
        setHasMoreGrid(false);
      }
    } catch (error) {
      console.error("Error fetching grid products:", error);
    } finally {
      gridLoadingRef.current = false;
      setLoadingGrid(false);
    }
  }, [lang]);

  const handleScroll = useCallback((ref, fetchMore, hasMore, isLoading) => {
    if (!ref.current || !hasMore || isLoading) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    const isRtl = getComputedStyle(ref.current).direction === "rtl";

    // زيادة الحساسية للأجهزة المحمولة
    const threshold = window.innerWidth < 768 ? 100 : 150;
    
    const isAtEnd = isRtl
      ? scrollLeft <= threshold
      : scrollLeft + clientWidth >= scrollWidth - threshold;

    if (isAtEnd) {
      fetchMore();
    }
  }, []);

  useEffect(() => {
    if (!lang) return;
    
    // منع الاستدعاء المكرر لنفس اللغة
    if (lastLangRef.current === lang && hasInitializedFeatured.current) return;
    lastLangRef.current = lang;
    hasInitializedFeatured.current = true;
    
    resetFetchedPages();
    setDiscountProducts([]);
    setGridProducts([]);
    setDiscountProductsPage(1);
    setGridPage(1);
    setHasMoreDiscountProducts(true);
    setHasMoreGrid(true);

    dispatch(fetchFeaturedProducts({ page: 1, limit: 10, lang: lang || "ar" }));
    
    return () => {
      if (lastLangRef.current !== lang) {
        hasInitializedFeatured.current = false;
        hasInitializedDiscount.current = false;
        hasInitializedGrid.current = false;
      }
    };
  }, [lang, dispatch]);

  useEffect(() => {
    let raw = null;
    try {
      raw = sessionStorage.getItem("homeScroll");
    } catch (_) {}
    if (!raw) return;
    try {
      const { scrollY, productId } = JSON.parse(raw);
      try {
        sessionStorage.removeItem("homeScroll");
      } catch (_) {}
      const doRestore = () => {
        if (productId != null) {
          const el = document.querySelector(`[data-product-id="${productId}"]`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
          }
        }
        if (typeof scrollY === "number" && scrollY >= 0) {
          window.scrollTo(0, scrollY);
        }
      };
      const t = setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(doRestore);
        });
      }, 200);
      return () => clearTimeout(t);
    } catch (_) {
      try {
        sessionStorage.removeItem("homeScroll");
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    if (!lang || !sectionsReady.discounts) return;
    
    // منع الاستدعاء المكرر
    const key = `${lang}-${sectionsReady.discounts}`;
    if (hasInitializedDiscount.current === key) return;
    hasInitializedDiscount.current = key;
    
    fetchDiscountProducts(1, true);
  }, [lang, sectionsReady.discounts, fetchDiscountProducts]);

  useEffect(() => {
    if (!lang || !sectionsReady.grid) return;
    
    // منع الاستدعاء المكرر
    const key = `${lang}-${sectionsReady.grid}`;
    if (hasInitializedGrid.current === key) return;
    hasInitializedGrid.current = key;
    
    fetchGridProducts(1, true);
  }, [lang, sectionsReady.grid, fetchGridProducts]);

  const DiscountProductsRef = useRef(null);
  const ProductsRef = useRef(null);
  const discountSectionRef = useRef(null);
  const gridSectionRef = useRef(null);
  
  const discountPageRef = useRef(DiscountProductsPage);
  
  useEffect(() => {
    discountPageRef.current = DiscountProductsPage;
  }, [DiscountProductsPage]);

  useEffect(() => {
    const DiscountProductsDiv = DiscountProductsRef.current;
    const productsDiv = ProductsRef.current;

    const DiscountProductsScrollHandler = () => {
      handleScroll(
        DiscountProductsRef, 
        () => {
          const currentPage = discountPageRef.current;
          if (hasMoreDisCountProducts && !loadingDiscountProducts) {
            fetchDiscountProducts(currentPage, false);
          }
        },
        hasMoreDisCountProducts,
        loadingDiscountProducts
      );
    };
    const productsScrollHandler = () => {
      handleScroll(
        ProductsRef, 
        () => {
          if (hasMoreFeatured && !loadingFeatured) {
            dispatch(fetchFeaturedProducts({ page: featuredPage + 1, limit: 10, lang: lang || "ar" }));
          }
        },
        hasMoreFeatured,
        loadingFeatured
      );
    };

    if (sectionsReady.discounts && DiscountProductsDiv)
      DiscountProductsDiv.addEventListener(
        "scroll",
        DiscountProductsScrollHandler
      );
    if (productsDiv)
      productsDiv.addEventListener("scroll", productsScrollHandler);

    return () => {
      if (sectionsReady.discounts && DiscountProductsDiv)
        DiscountProductsDiv.removeEventListener(
          "scroll",
          DiscountProductsScrollHandler
        );
      if (productsDiv)
        productsDiv.removeEventListener("scroll", productsScrollHandler);
    };
  }, [
    handleScroll,
    dispatch,
    fetchDiscountProducts,
    hasMoreDisCountProducts,
    hasMoreFeatured,
    loadingDiscountProducts,
    loadingFeatured,
    featuredPage,
    lang,
    sectionsReady.discounts,
  ]);

  // Infinite scroll for grid products
  useEffect(() => {
    if (!sectionsReady.grid) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreGrid && !loadingGrid && gridPage > 1) {
          fetchGridProducts(gridPage, false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = gridObserverTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMoreGrid, loadingGrid, gridPage, fetchGridProducts, sectionsReady.grid]);

  function handleProductClick(product) {
    try {
      sessionStorage.setItem(
        "homeScroll",
        JSON.stringify({
          scrollY: window.scrollY,
          productId: product?.productId ?? product?.id,
        })
      );
    } catch (_) {}
    navigate(`/productDetails/${product.productId}`, {
      state: { product },
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#eef2f9] flex flex-col items-center justify-center gap-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-700 text-center px-4">
          {t("welcomeMessage", "إيكوفيرا ترحب بكم")}
        </h2>
        <div className="w-32 sm:w-40 md:w-48">
          <WebSiteLogo width={200} height={100} />
        </div>
        <div className="h-10 w-10 sm:h-12 sm:w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleRemoveFromDiscount = (id) =>
    setDiscountProducts((prev) => prev.filter((item) => item.productId !== id));
  const handleRemoveFromFeatured = (id) =>
    dispatch(removeFeaturedProduct({ productId: id, lang }));
  const handleRemoveFromGrid = (id) =>
    setGridProducts((prev) => prev.filter((item) => item.productId !== id));

  return (
    <>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        <title>{t("homePage.metaTitle", `تسوق الآن من ${SiteName} | خصومات على أفضل المنتجات`)}</title>
        <meta
          name="description"
          content={t("homePage.metaDesc", `تصفح مجموعة ضخمة من المنتجات الأصلية في إيكوفيرا. احصل على أفضل العروض والخصومات حتى 50%. شحن سريع ودعم ممتاز.`)}
        />
        <meta
          name="keywords"
          content={t("homePage.metaKeywords", "تسوق, خصومات, عروض, ماركات, منتجات أصلية, متجر إلكتروني, إيكوفيرا")}
        />
        <link rel="canonical" href={window.location.href} />

        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content={t("homePage.ogTitle", `تسوق الآن من ${SiteName} | عروض وخصومات مذهلة`)}
        />
        <meta
          property="og:description"
          content={t("homePage.ogDescription", "أفضل المنتجات الأصلية مع خصومات تصل إلى 50%. اكتشف العروض الآن!")}
        />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:site_name" content={SiteName} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={t("homePage.twitterTitle", `تسوق من ${SiteName} | أفضل الأسعار والعروض`)}
        />
        <meta
          name="twitter:description"
          content={t("homePage.twitterDescription", "منتجات أصلية وماركات عالمية مع خصومات تصل إلى 50%. سارع بالشراء!")}
        />
      </Helmet>

      <StoreLayout>
        <div className="w-full">
          {/* Announcement Bar */}
          <div className="relative z-10">
            <AnnouncementBar />
          </div>

          {/* محتوى الصفحة الرئيسية + البانر — كل شيء في نفس الحاوية المتوسّطة */}
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 overflow-x-hidden min-w-0">
            {/* Banner — نفس تصميم بانر الأقسام (FindProducts) */}
            <section className="relative w-full py-4 md:py-4">
              <BannerCarousel />
            </section>

            <QuickWhatsAppCta
              whatsAppNumber={homeContactInfo.whatsAppNumber}
              callNumber={homeContactInfo.callNumber}
              lang={lang}
              t={t}
            />

            <HomeFragranceHighlights />

            <HomeProductGallery />

            {/* Categories grid */}
            <HomeCategoriesGrid />

            {/* Featured Products Section */}
          <section className="py-6 sm:py-8 md:py-12 space-y-6 sm:space-y-8 bg-[#eef2f9]">
            <SectionHeader
              eyebrow={t("homePage.gomangoPicks", "مختارات إيكوفيرا")}
              title={t("homePage.featuredProducts", "المنتجات المميزة")}
              description={t("homePage.productsDesc", "منتجات أصلية معروضة بأسعار تنافسية، يتم تحديثها باستمرار لتلبية طلبات العملاء.")}
            />
            <ProductsRail
              ref={ProductsRef}
              items={featuredProducts}
              emptyMessage={t("noFeaturedProducts", "لا توجد منتجات مميزة حالياً.")}
              isLoadingMore={loadingFeatured}
              onRemove={handleRemoveFromFeatured}
              handleProductClick={handleProductClick}
              t={t}
              getRoleFromToken={getRoleFromToken}
            />

            {/* أقسام دائرية تحت المنتجات المميزة */}
            <div className="mt-8 md:mt-10">
              <HomeCategoriesCircles />
            </div>
          </section>

          {/* Discount Products Section */}
          <section
            ref={discountSectionRef}
            className="py-6 sm:py-8 md:py-12 space-y-6 sm:space-y-8 bg-[#eef2f9]"
          >
            <SectionHeader
              eyebrow={t("homePage.newThisWeek", "جديد هذا الأسبوع")}
              title={t("homePage.discountsUpTo", "خصومات تصل إلى 60%")}
              description={t("homePage.discountsDesc", "عروض مختارة بعناية لتلبية احتياجات الأسرة  مع جودة عالية وأسعار منافسة.")}
            />
            {sectionsReady.discounts ? (
              <ProductsRail
                ref={DiscountProductsRef}
                items={Discountproducts}
                emptyMessage={t("noDiscountProducts", "لا توجد منتجات عليها خصومات حالياً.")}
                isLoadingMore={loadingDiscountProducts}
                onRemove={handleRemoveFromDiscount}
                handleProductClick={handleProductClick}
                t={t}
                getRoleFromToken={getRoleFromToken}
              />
            ) : (
              <LazySectionPlaceholder
                message={t("homePage.scrollForDiscounts", "تابع التمرير لعرض أحدث الخصومات")}
                helper={t("homePage.lazySectionHint", "نقوم بتحميل هذا القسم فقط عند ظهوره لضمان أفضل أداء.")}
              />
            )}
          </section>

          {/* Grid Products Section */}
          <section
            ref={gridSectionRef}
            className="py-6 sm:py-8 md:py-12 bg-[#eef2f9]"
          >
            <SectionHeader
              eyebrow={t("homePage.allProductsEyebrow", "تصفح الكل")}
              title={t("homePage.allProductsTitle", "كل المنتجات في مكان واحد")}
            />
            <div className="px-4 sm:px-6 md:px-8 lg:px-16">
              {!sectionsReady.grid ? (
                <LazySectionPlaceholder
                  message={t("homePage.scrollForCatalog", "تابع التمرير للوصول إلى كل المنتجات")}
                  helper={t("homePage.lazySectionHint", "نعرض المنتجات عند الحاجة فقط للحفاظ على سرعة التصفح.")}
                />
              ) : gridProducts.length === 0 && loadingGrid ? (
                <p className="text-center text-sm text-gray-600 py-6 sm:py-8">
                  {t("loadingProducts", "جارٍ التحميل...")}
                </p>
              ) : gridProducts.length === 0 ? (
                <p className="text-center text-sm text-gray-600 py-6 sm:py-8">
                  {t("homePage.noProducts", "لا توجد منتجات متاحة حالياً.")}
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 w-full min-w-0">
                    {gridProducts.map((product) => (
                      <div key={product.productId} data-product-id={product.productId} className="min-w-0 w-full overflow-hidden">
                        <ProductItem
                          product={product}
                          CurrentRole={getRoleFromToken(sessionStorage.getItem("token"))}
                          onDeleted={(deletedId) => {
                            handleRemoveFromGrid(deletedId ?? product.productId);
                          }}
                          layout="grid"
                          onClick={() => handleProductClick(product)}
                        />
                      </div>
                    ))}
                  </div>
                  {hasMoreGrid && (
                    <div ref={gridObserverTarget} className="flex justify-center mt-6">
                      {loadingGrid && (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          </div>
          {/* نهاية المحتوى المتسنتر */}

          <footer className="relative mt-12 overflow-hidden" aria-label={t("footer.heading", "روابط صفحاتنا")}>
            {/* Orange accent strip */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#92278f] via-[#ee207b] to-[#f49e24]" />
            {/* Main footer: navy gradient */}
            <div className="bg-gradient-to-b from-[#92278f] via-[#7a1f75] to-[#5a1855] text-white">
              <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 py-12 md:py-14">
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 ${lang === "ar" ? "text-right" : "text-left"}`}>
                  {/* Brand column */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="inline-flex items-center justify-center rounded-2xl bg-white/95 px-5 py-3 shadow-lg">
                      <WebSiteLogo
                        width={lang === "ar" ? 130 : 145}
                        height={44}
                        className="object-contain"
                      />
                    </div>
                    <p className="text-white/85 text-sm leading-relaxed max-w-xs">
                      {t("footer.description", "تصفح كل صفحات متجرنا بسهولة، وتابع جديد الأقسام والعروض أولاً بأول.")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F55A00]/20 text-[#ff9d5c] text-xs font-semibold">
                        {t("footer.securePayment", "دفع آمن")}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F55A00]/20 text-[#ff9d5c] text-xs font-semibold">
                        {t("footer.fastDelivery", "توصيل سريع")}
                      </span>
                    </div>
                  </div>
                  {/* Quick links */}
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white border-b border-[#F55A00] pb-2 inline-block">
                      {t("footer.quickLinks", "روابط سريعة")}
                    </h3>
                    <ul className="space-y-2.5">
                      {footerLinks.map((link) => (
                        <li key={link.key}>
                          <button
                            type="button"
                            onClick={() => {
                              if (link.sectionId) scrollToSection(link.sectionId);
                              else if (link.path) navigate(link.path);
                            }}
                            className="text-white/85 hover:text-[#F55A00] hover:underline transition-colors duration-200 text-sm font-medium"
                          >
                            {link.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* Contact */}
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white border-b border-[#F55A00] pb-2 inline-block">
                      {t("footer.contactUs", "تواصل معنا")}
                    </h3>
                    <Link
                      to="/Contact"
                      className="flex items-center gap-2.5 text-white/85 hover:text-[#F55A00] transition-colors text-sm font-medium"
                    >
                      <FiMail className="flex-shrink-0 w-4 h-4" />
                      <span>{t("footer.contactPage", "صفحة اتصل بنا")}</span>
                    </Link>
                    {(() => {
                      const info = adminInfo[0];
                      if (!info) return null;
                      const whatsAppNumber = info.whatsAppNumber ?? info.whatsappNumber;
                      const callNumber = info.callNumber ?? info.phoneNumber;
                      const email = info.email;
                      return (
                        <>
                          {whatsAppNumber && (
                            <a
                              href={`https://wa.me/${String(whatsAppNumber).replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2.5 text-white/85 hover:text-[#F55A00] transition-colors text-sm font-medium"
                              aria-label={t("contact.whatsappCta", "واتساب")}
                            >
                              <FaWhatsapp className="flex-shrink-0 w-4 h-4" />
                              <span>{whatsAppNumber}</span>
                            </a>
                          )}
                          {callNumber && (
                            <a
                              href={`tel:${String(callNumber).replace(/[^0-9]/g, "")}`}
                              className="flex items-center gap-2.5 text-white/85 hover:text-[#F55A00] transition-colors text-sm font-medium"
                              aria-label={t("contact.phoneCta", "اتصل بنا")}
                            >
                              <FiPhone className="flex-shrink-0 w-4 h-4" />
                              <span>{callNumber}</span>
                            </a>
                          )}
                          {email && (
                            <a
                              href={`mailto:${email}`}
                              className="flex items-center gap-2.5 text-white/85 hover:text-[#F55A00] transition-colors text-sm font-medium"
                              aria-label={t("contact.email", "البريد الإلكتروني")}
                            >
                              <FiMail className="flex-shrink-0 w-4 h-4" />
                              <span>{email}</span>
                            </a>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  {/* Follow us */}
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-white border-b border-[#F55A00] pb-2 inline-block">
                      {t("footer.followUs", "تابعنا")}
                    </h3>
                    <div className="flex gap-3">
                      {(() => {
                        const info = adminInfo[0];
                        const facebookUrl = info?.facebookUrl ?? info?.facebookURL ?? info?.facebook;
                        const instagramUrl = info?.instagramUrl ?? info?.instagramURL ?? info?.instagram;
                        const tikTokUrl = info?.tikTokUrl ?? info?.tiktokUrl ?? info?.tikTok;
                        const iconBtn = "flex items-center justify-center w-10 h-10 rounded-xl text-white transition-all duration-200 hover:scale-110 hover:shadow-lg";
                        return (
                          <>
                            {facebookUrl ? (
                              <a
                                href={facebookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${iconBtn} bg-[#1877F2] hover:bg-[#0f5bd8]`}
                                aria-label="Facebook"
                              >
                                <FaFacebookF className="w-5 h-5" />
                              </a>
                            ) : null}
                            {instagramUrl ? (
                              <a
                                href={instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={iconBtn}
                                style={{
                                  backgroundImage: "linear-gradient(45deg, #F09433 0%, #E6683C 25%, #DC2743 50%, #CC2366 75%, #BC1888 100%)",
                                }}
                                aria-label="Instagram"
                              >
                                <FaInstagram className="w-5 h-5" />
                              </a>
                            ) : null}
                            {tikTokUrl ? (
                              <a
                                href={tikTokUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${iconBtn} bg-black hover:bg-gray-900`}
                                aria-label="TikTok"
                              >
                                <FaTiktok className="w-5 h-5" />
                              </a>
                            ) : null}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              {/* Bottom bar */}
              <div className="border-t border-white/10 py-4">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-white/75 text-sm">
                    {lang === "ar"
                      ? `© ${new Date().getFullYear()} إيكوفيرا. ${t("footer.allRightsReserved", "جميع الحقوق محفوظة.")}`
                      : `© ${new Date().getFullYear()} Ecovera. ${t("footer.allRightsReserved", "All rights reserved.")}`}
                  </p>
                  <p className="text-white/60 text-xs">
                    {t("footer.secureAndFast", "دفع آمن · توصيل لجميع المحافظات")}
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </StoreLayout>
    </>
  );
}
