import React, { useState, useEffect, useRef, useMemo } from "react";
import { Helmet } from "react-helmet";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import StoreLayout from "../Home/StoreLayout";
import API_BASE_URL, { SiteName, ServerPath } from "../Constant.js";
import { getRoleFromToken } from "../utils.js";
import { useI18n } from "../i18n/I18nContext";
import ProductItem from "./ProductItem.jsx";
import BackButton from "../Common/BackButton";
import { fetchProductsByName } from "../../store/productsSlice.js";

const ITEMS_PER_PAGE = 10;

export default function FindProducts() {
  const location = useLocation();
  const { query: pathQuery } = useParams();
  const searchParams = new URLSearchParams(location.search);
  const rawQueryFromQ = searchParams.get("q") ?? "";
  const rawQueryFromPath = pathQuery ? decodeURIComponent(pathQuery) : "";
  const rawQuery = rawQueryFromPath || rawQueryFromQ || "";
  const stateDisplayQuery = typeof location.state?.searchQuery === "string" ? location.state.searchQuery : null;
  const stateApiQuery = typeof location.state?.apiQuery === "string" ? location.state.apiQuery : null;
  const stateCategoryId = location.state?.categoryId != null ? location.state.categoryId : null;
  const displayQuery = (stateDisplayQuery ?? rawQuery ?? "").trim();
  const apiQuery = (stateApiQuery ?? rawQuery ?? "").trim();
  const [page, setPage] = useState(1);
  const [hiddenProductIds, setHiddenProductIds] = useState(new Set());
  const [categoryBannerIdx, setCategoryBannerIdx] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, lang } = useI18n();
  const observerTarget = React.useRef(null);
  const pendingScrollYRef = React.useRef(null);
  const savedPageRef = React.useRef(null);
  const productIdToScrollRef = React.useRef(null);
  const categoryBannerVideoRefs = useRef({});

  const { searchResults, searchQuery, searchLang, searchCache, searchLoading } = useSelector((state) => state.products);
  const cacheKey = apiQuery.trim() ? `${apiQuery.trim()}:${lang}` : "";
  const hasCached = cacheKey && searchCache[cacheKey];

  const allProducts = useMemo(() => {
    if (hasCached) return searchCache[cacheKey];
    if (apiQuery.trim() !== searchQuery || lang !== searchLang) return [];
    return searchResults;
  }, [hasCached, cacheKey, searchCache, searchResults, searchQuery, searchLang, apiQuery, lang]);

  useEffect(() => {
    if (!apiQuery.trim()) return;
    if (hasCached) return;
    dispatch(fetchProductsByName({ name: apiQuery, lang }));
  }, [apiQuery, lang, dispatch, hasCached]);

  // استبدال الرابط إلى /FindProducts/الاسم لتحسين SEO (الكلمة المفتاحية في المسار أفضل لمحركات البحث)
  useEffect(() => {
    if (!apiQuery.trim() || rawQueryFromPath === apiQuery) return;
    const safeForPath = /^[\w\u0600-\u06FF\-]+$/.test(apiQuery) && !apiQuery.includes(" ");
    if (safeForPath && typeof window.history?.replaceState === "function") {
      const newPath = `/FindProducts/${encodeURIComponent(apiQuery)}`;
      if (location.pathname !== newPath) window.history.replaceState(null, "", newPath);
    }
  }, [apiQuery, rawQueryFromPath, location.pathname]);

  const loading = !hasCached && searchLoading;
  const isFetching = !hasCached && searchLoading;

  const categoryIdForBanner = stateCategoryId ?? (allProducts[0]?.categoryId ?? allProducts[0]?.CategoryId);
  const hasValidCategoryId = typeof categoryIdForBanner === "number" && categoryIdForBanner > 0;
  const { data: categoryBannersRaw = [] } = useQuery({
    queryKey: ["banners", "category", categoryIdForBanner, lang],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}Banners/active?lang=${lang}&categoryId=${categoryIdForBanner}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: hasValidCategoryId,
    staleTime: 5 * 60 * 1000,
  });

  const categoryBanners = useMemo(
    () =>
      categoryBannersRaw.filter(
        (b) => (b.imageUrl ?? b.ImageUrl) || (b.videoUrl ?? b.VideoUrl)
      ),
    [categoryBannersRaw]
  );

  useEffect(() => {
    if (!categoryBanners.length) return;
    const interval = setInterval(() => setCategoryBannerIdx((p) => (p + 1) % categoryBanners.length), 4000);
    return () => clearInterval(interval);
  }, [categoryBanners.length]);

  // تشغيل فيديو البانر النشط فقط وإيقاف الباقي (صفحة البحث/الأقسام)
  useEffect(() => {
    categoryBanners.forEach((_, i) => {
      const el = categoryBannerVideoRefs.current[i];
      if (!el) return;
      if (i === categoryBannerIdx) el.play().catch(() => {});
      else el.pause();
    });
  }, [categoryBannerIdx, categoryBanners.length]);

  const products = useMemo(() => {
    const end = page * ITEMS_PER_PAGE;
    const slice = allProducts.slice(0, end);
    if (hiddenProductIds.size === 0) return slice;
    return slice.filter((p) => !hiddenProductIds.has(p.productId));
  }, [allProducts, page, hiddenProductIds]);

  const hasMore = products.length < allProducts.length;
  const loadingMore = isFetching && allProducts.length > 0;

  useEffect(() => {
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("findProductsScroll")) return;
    window.scrollTo(0, 0);
    setPage(1);
  }, [apiQuery, lang]);

  useEffect(() => {
    let raw = null;
    try {
      raw = sessionStorage.getItem("findProductsScroll");
    } catch (_) {}
    if (!raw) return;
    try {
      const { scrollY: savedScrollY, page: savedPage, productId: savedProductId } = JSON.parse(raw);
      try {
        sessionStorage.removeItem("findProductsScroll");
      } catch (_) {}
      if (typeof savedPage === "number" && savedPage >= 1) {
        savedPageRef.current = savedPage;
        setPage(savedPage);
      }
      if (savedProductId != null) productIdToScrollRef.current = savedProductId;
      const scrollY = typeof savedScrollY === "number" ? savedScrollY : 0;
      pendingScrollYRef.current = scrollY;
    } catch (_) {
      try {
        sessionStorage.removeItem("findProductsScroll");
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    if (savedPageRef.current != null && page !== savedPageRef.current) return;
    const productId = productIdToScrollRef.current;
    const y = pendingScrollYRef.current;
    if (productId != null) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const el = document.querySelector(`[data-product-id="${productId}"]`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            productIdToScrollRef.current = null;
            pendingScrollYRef.current = null;
            savedPageRef.current = null;
          } else if (typeof y === "number" && y >= 0) {
            window.scrollTo(0, y);
            productIdToScrollRef.current = null;
            pendingScrollYRef.current = null;
            savedPageRef.current = null;
          }
        });
      });
      return () => cancelAnimationFrame(id);
    }
    if (y == null) return;
    pendingScrollYRef.current = null;
    savedPageRef.current = null;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, y);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [page, products.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [hasMore, loadingMore, loading]);

  const handleProductClick = (product) => {
    try {
      sessionStorage.setItem(
        "findProductsScroll",
        JSON.stringify({
          scrollY: window.scrollY,
          page,
          productId: product?.productId ?? product?.id,
        })
      );
    } catch (_) {}
    navigate(`/ProductDetails/${product.productId}`, { state: { product } });
  };

  const CurrentRole = getRoleFromToken(sessionStorage.getItem("token"));

  return (
    <StoreLayout>
      <div className="bg-blue-50">
        <Helmet>
          <title>
            {t("findProducts.metaTitle", "نتائج البحث")}{" "}
            {displayQuery ? `'${displayQuery}'` : ""} | {SiteName}
          </title>
          <meta
            name="description"
            content={t(
              "findProducts.metaDesc",
              "استكشف نتائج البحث لكلمة '{query}' والعروض الحصرية في موقعنا."
            ).replace("{query}", displayQuery || "")}
          />
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        
        {/* العنوان الرئيسي - بدون مسافات */}
        <div className="bg-white shadow-sm border-b border-blue-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2">
            <div className="flex items-center gap-4 mb-2">
              <BackButton />
            </div>
          </div>
        </div>

        {/* بانر القسم فقط عند وجود قسم محدد (لا نعرض بانرات الهوم هنا) */}
        {hasValidCategoryId && categoryBanners.length > 0 && (
          <div className="w-full px-2 sm:px-4 md:container md:mx-auto md:px-4 mb-4">
            <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl md:rounded-[20px] border border-gray-200/80 shadow-sm aspect-[1940/920] max-h-[340px] bg-gray-100 flex items-center justify-center">
              {categoryBanners.map((banner, i) => {
                const rawImage = banner.imageUrl ?? banner.ImageUrl;
                const imageSrc = rawImage ? (rawImage.startsWith("http") ? rawImage : `${ServerPath}${rawImage}`) : null;
                const videoUrlRaw = banner.videoUrl ?? banner.VideoUrl;
                const videoSrc = videoUrlRaw ? (videoUrlRaw.startsWith("http") ? videoUrlRaw : `${ServerPath}${videoUrlRaw}`) : null;
                const hasVideo = Boolean(videoSrc);
                const hasImage = Boolean(imageSrc);
                const clickUrl = (banner.linkUrl || banner.clickUrl)?.trim();
                const isActive = i === categoryBannerIdx;
                const content = hasVideo ? (
                  <video
                    ref={(el) => { categoryBannerVideoRefs.current[i] = el; }}
                    src={videoSrc}
                    poster={imageSrc || undefined}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    autoPlay={false}
                    controls={false}
                  />
                ) : hasImage ? (
                  <img alt={banner.title || "banner"} className="absolute inset-0 w-full h-full object-cover object-center" src={imageSrc} />
                ) : null;
                return (
                  <div key={banner.id ?? i} className="absolute inset-0 transition-opacity duration-500" style={{ opacity: isActive ? 1 : 0 }} aria-hidden={!isActive}>
                    {clickUrl ? <a href={clickUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">{content}</a> : content}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* محتوى النتائج - يبدأ مباشرة بدون مسافات */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 pt-1 pb-4 w-full min-w-0 overflow-x-hidden">
        {loading && products.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
            <span className="mr-3 text-blue-700 font-semibold text-sm">
              {t("findProducts.loading", "جارٍ التحميل...")}
            </span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 w-full min-w-0">
              {products.map((product) => (
                <div key={product.productId} data-product-id={product.productId} className="min-w-0 w-full overflow-hidden">
                  <ProductItem
                    product={product}
                    CurrentRole={CurrentRole}
                    layout="grid"
                    onClick={() => handleProductClick(product)}
                  onDeleted={(deletedId) =>
                    setHiddenProductIds((prev) => {
                      const next = new Set(prev);
                      next.add(deletedId ?? product.productId);
                      return next;
                    })
                  }
                  />
                </div>
              ))}
            </div>
            
            {/* Infinite scroll trigger */}
            {hasMore && (
              <div ref={observerTarget} className="flex justify-center items-center py-8">
                {loadingMore && (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                )}
              </div>
            )}
          </>
        )}

        {/* حالة عدم وجود نتائج */}
        {!loading && apiQuery && allProducts.length === 0 && (
          <div className="text-center py-6">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto border border-blue-200">
              <div className="text-5xl mb-3">🔍</div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                {lang === "ar" ? "لم يتم العثور على نتائج البحث" : "No search results found"}
              </h3>
              <button
                onClick={() => navigate("/")}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-full transition duration-300 transform hover:-translate-y-1"
              >
                {t("findProducts.backToHome", "العودة للرئيسية")}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </StoreLayout>
  );
}