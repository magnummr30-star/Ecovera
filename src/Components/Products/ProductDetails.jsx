import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import API_BASE_URL, {
  ServerPath,
  SiteName,
} from "../../Components/Constant.js";
import getDeliveryDate from "../utils.js";
import StoreLayout from "../Home/StoreLayout";
import Reviews from "./Reviews.jsx";
import RelatedProducts from "./RelatedProducts.jsx";
import { useCurrency } from "../Currency/CurrencyContext";
import CurrencySelector from "../Currency/CurrencySelector";
import { useI18n } from "../i18n/I18nContext";
import ProductMediaCard from "./ProductMediaCard.jsx";
import ProductInfoCard from "./ProductInfoCard.jsx";
import ProductOptionsCard from "./ProductOptionsCard.jsx";
import BackButton from "../Common/BackButton";
import { fetchShippingAreas } from "../CreateOrder/api.js";

export default function ProductDetails() {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(location.state?.product || null);
  const [Img, setImg] = useState("");
  const [productImages, setProductImages] = useState([]);
  const [Colors, setColors] = useState([]);
  const [DetailsId, setDetailsId] = useState(0);
  const [CurrentColor, setCurrentColor] = useState("");
  const [Sizes, setSizes] = useState([]);
  const [CurrentSize, setCurrentSize] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState(0);
  const [availableColorsForSize, setAvailableColorsForSize] = useState([]);
  const [Quantity, setQuantity] = useState(1);
  const [banner, setBanner] = useState(null);
  const [shippingAreas, setShippingAreas] = useState([]);
  const [selectedShippingArea, setSelectedShippingArea] = useState("");
  const [deliveryTimeDays, setDeliveryTimeDays] = useState(null);
  const [shippingPrice, setShippingPrice] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const [showRelatedProducts, setShowRelatedProducts] = useState(false);
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);
  const reviewsElementsRef = useRef([]);
  const relatedProductsElementsRef = useRef([]);
  const reviewsObserverRef = useRef(null);
  const relatedProductsObserverRef = useRef(null);
  const detailsRequestController = useRef(null);
  
  // استخدام useRef لمنع الطلبات المكررة
  const hasFetchedProduct = useRef(false);
  const hasFetchedInitialData = useRef(false);
  const hasFetchedShippingAreas = useRef(false);
  const lastFetchedProductId = useRef(null);
  const lastFetchedLang = useRef(null);
  const hasFetchedColorsForSize = useRef(null); // لتتبع آخر مقاس تم جلب ألوانه
  const hasFetchedDetails = useRef(null); // لتتبع آخر لون ومقاس تم جلب تفاصيلهما
  
  const { format } = useCurrency();
  const { t, lang } = useI18n();

  const stateProduct = location.state?.product;
  const productQuery = useQuery({
    queryKey: ["product", id, lang],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}Product/GetProductById?ID=${Number(id)}&lang=${lang}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      let productImagesList = [];
      const detailsId = data?.productDetailsId ?? data?.ProductDetailsId;
      if (detailsId) {
        try {
          const imagesRes = await fetch(
            `${API_BASE_URL}Product/GetProductDetailImages/${detailsId}`
          );
          if (imagesRes.ok) {
            const imagesData = await imagesRes.json();
            productImagesList = Array.isArray(imagesData)
              ? imagesData.map((img) => img.imageUrl ?? img)
              : [];
          }
        } catch {
          productImagesList = [];
        }
      }
      return { product: data, productImages: productImagesList };
    },
    enabled: !!id && Number(id) > 0,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    initialData: stateProduct && Number(stateProduct?.productId) === Number(id)
      ? { product: stateProduct, productImages: [] }
      : undefined,
    // إعادة جلب بيانات المنتج باللغة الحالية حتى تظهر الترجمة حتى مع وجود initialData
    refetchOnMount: true,
  });

  const queryProduct = productQuery.data?.product;
  const queryProductImages = productQuery.data?.productImages ?? [];

  useEffect(() => {
    if (!queryProduct) return;
    setProduct(queryProduct);
    setDetailsId(queryProduct.productDetailsId ?? queryProduct.ProductDetailsId ?? 0);
    setImg(queryProduct.productImage ?? "");
    const qty = queryProduct.quantity ?? 0;
    setAvailableQuantity(qty);
    setQuantity(qty > 0 ? 1 : 0);
    setProductImages(queryProductImages);
  }, [queryProduct, queryProductImages]);

  // بداية الصفحة من الأعلى عند الدخول لصفحة المنتج أو تغيير المنتج
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const loading = productQuery.isPending && !productQuery.data;

  const showBanner = (text, tone = "info") => {
    setBanner({ text, tone });
    setTimeout(() => setBanner(null), 4000);
  };
  
  // Function to translate color names
  const translateColor = (colorName) => {
    if (!colorName) return colorName;
    
    const colorMap = {
      "أحمر": "red",
      "أزرق": "blue",
      "أخضر": "green",
      "أصفر": "yellow",
      "أسود": "black",
      "أبيض": "white",
      "وردي": "pink",
      "بنفسجي": "purple",
      "برتقالي": "orange",
      "بني": "brown",
      "رمادي": "gray",
      "كحلي": "navy",
      "بيج": "beige",
      "كاكي": "khaki",
      "كستنائي": "maroon",
      "سماوي": "cyan",
      "أرجواني": "magenta",
      "ليموني": "lime",
      "زيتوني": "olive",
      "تركواز": "teal",
      "فضي": "silver",
      "ذهبي": "gold",
      "نيلي": "navy",
      "عنابي": "maroon",
      "خردلي": "yellow",
      "فيروزي": "cyan",
      "زهري": "pink",
      "لافندر": "purple",
      "موف": "purple",
      "أخضر زيتي": "olive",
      "أخضر فاتح": "green",
      "أزرق سماوي": "cyan",
      "أزرق ملكي": "blue",
      "قرمزي": "red",
      "اوف وايت": "off white",
    };
    
    const colorKey = colorMap[colorName] || colorName.toLowerCase().trim();
    return t(`colors.${colorKey}`, colorName);
  };

  // Function to translate size names
  const translateSize = (sizeName) => {
    if (!sizeName) return sizeName;
    
    const sizeMap = {
      "سنة": "1 year",
      "سنتين": "2 years",
      "ثلاث سنوات": "3 years",
      "أربع سنوات": "4 years",
      "خمس سنوات": "5 years",
      "ست سنوات": "6 years",
      "سبع سنوات": "7 years",
      "ثماني سنوات": "8 years",
      "تسع سنوات": "9 years",
      "عشر سنوات": "10 years",
      "إحدى عشرة سنة": "11 years",
      "اثنتا عشرة سنة": "12 years",
    };
    
    const sizeKey = sizeMap[sizeName] || sizeName.toLowerCase().trim();
    return t(`sizes.${sizeKey}`, sizeName);
  };

  // Function to translate governorate/region names
  const translateGovernorate = (governorate) => {
    if (!governorate) return governorate;
    return t(`emirates.${governorate}`, governorate);
  };

  useEffect(() => {
    if (productQuery.data && id && lang) {
      lastFetchedProductId.current = id;
      lastFetchedLang.current = lang;
    }
    return () => {
      if (lastFetchedProductId.current !== id || lastFetchedLang.current !== lang) {
        hasFetchedInitialData.current = false;
        hasFetchedColorsForSize.current = null;
        hasFetchedDetails.current = null;
      }
    };
  }, [id, lang, productQuery.data]);

  const GetDetailsOfCurrentSizeAndColor = async (
    color = CurrentColor,
    size = CurrentSize
  ) => {
    if (!product || !color || !size) return;
    const trimmedColor = color?.trim();
    const trimmedSize = size?.trim();
    if (!trimmedColor || !trimmedSize) return;
    detailsRequestController.current?.abort();
    const controller = new AbortController();
    detailsRequestController.current = controller;
    setIsUpdatingDetails(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}Product/GetDetailsBy?ProductId=${Number(
          product?.productId
        )}&ColorName=${encodeURIComponent(trimmedColor)}&SizeName=${encodeURIComponent(trimmedSize)}`,
        { signal: controller.signal }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const newQuantity = data.quantity;
      setAvailableQuantity(newQuantity);
      // ضبط الكمية تلقائياً عند تغيير اللون/المقاس
      if (newQuantity > 0) {
        setQuantity(1);
      } else {
        setQuantity(0);
      }
      setDetailsId(data.productDetailsId);
      setImg(data.image);
      // Fetch additional images for the product details
      if (data.productDetailsId) {
        try {
          const imagesResponse = await fetch(
            `${API_BASE_URL}Product/GetProductDetailImages/${data.productDetailsId}`
          );
          if (imagesResponse.ok) {
            const imagesData = await imagesResponse.json();
            if (imagesData && Array.isArray(imagesData) && imagesData.length > 0) {
              setProductImages(imagesData.map((img) => img.imageUrl || img));
            } else {
              setProductImages([]);
            }
          } else {
            setProductImages([]);
          }
        } catch (error) {
          console.error("Error fetching product images:", error);
          setProductImages([]);
        }
      } else {
        setProductImages([]);
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
      console.error(error.message);
    } finally {
      if (detailsRequestController.current === controller) {
        detailsRequestController.current = null;
        setIsUpdatingDetails(false);
      }
    }
  };

  const GetDetailsByColorOnly = async (color = CurrentColor) => {
    if (!product || !color) return;
    const trimmedColor = color?.trim();
    if (!trimmedColor) return;
    detailsRequestController.current?.abort();
    const controller = new AbortController();
    detailsRequestController.current = controller;
    setIsUpdatingDetails(true);
    try {
      // Try to fetch by color only with empty size name
      // Some APIs accept empty string for optional parameters
      let response = await fetch(
        `${API_BASE_URL}Product/GetDetailsBy?ProductId=${Number(
          product?.productId
        )}&ColorName=${encodeURIComponent(trimmedColor)}&SizeName=`,
        { signal: controller.signal }
      );
      
      // If that doesn't work, try with null or without SizeName parameter
      if (!response.ok) {
        response = await fetch(
          `${API_BASE_URL}Product/GetDetailsBy?ProductId=${Number(
            product?.productId
          )}&ColorName=${encodeURIComponent(trimmedColor)}&SizeName=null`,
          { signal: controller.signal }
        );
      }
      
      // If still doesn't work, try a different approach: fetch the initial product details
      // and check if we can get details by making a call that matches the color
      if (!response.ok) {
        // Fallback: Use GetProductDetailsById which returns the default detail
        // Then we'll need to find the matching color detail
        // For now, let's try one more time with a space or try to get all details
        const fallbackResponse = await fetch(
          `${API_BASE_URL}Product/GetProductDetailsById?Id=${product?.productId}`,
          { signal: controller.signal }
        );
        if (fallbackResponse.ok) {
          const defaultData = await fallbackResponse.json();
          // If the default detail matches our color, use it
          if (defaultData.color === trimmedColor || defaultData.colorName === trimmedColor) {
            const newQuantity = defaultData.quantity || 0;
            setAvailableQuantity(newQuantity);
            if (newQuantity > 0) {
              setQuantity(1);
            } else {
              setQuantity(0);
            }
            setDetailsId(defaultData.productDetailsId);
            setImg(defaultData.image || defaultData.productImage);
            // Fetch additional images
            if (defaultData.productDetailsId) {
              try {
                const imagesResponse = await fetch(
                  `${API_BASE_URL}Product/GetProductDetailImages/${defaultData.productDetailsId}`,
                  { signal: controller.signal }
                );
                if (imagesResponse.ok) {
                  const imagesData = await imagesResponse.json();
                  if (imagesData && Array.isArray(imagesData) && imagesData.length > 0) {
                    setProductImages(imagesData.map((img) => img.imageUrl || img));
                  } else {
                    setProductImages([]);
                  }
                } else {
                  setProductImages([]);
                }
              } catch (error) {
                console.error("Error fetching product images:", error);
                setProductImages([]);
              }
            } else {
              setProductImages([]);
            }
            return;
          }
        }
        // If we reach here, the API might not support color-only queries
        // In this case, we'll just update the color but keep the current images
        // This is a graceful degradation
        console.warn("Could not fetch product details by color only. API may require both color and size.");
        return;
      }
      
      const data = await response.json();
      const newQuantity = data.quantity;
      setAvailableQuantity(newQuantity);
      if (newQuantity > 0) {
        setQuantity(1);
      } else {
        setQuantity(0);
      }
      setDetailsId(data.productDetailsId);
      setImg(data.image);
      // Fetch additional images for the product details
      if (data.productDetailsId) {
        try {
          const imagesResponse = await fetch(
            `${API_BASE_URL}Product/GetProductDetailImages/${data.productDetailsId}`,
            { signal: controller.signal }
          );
          if (imagesResponse.ok) {
            const imagesData = await imagesResponse.json();
            if (imagesData && Array.isArray(imagesData) && imagesData.length > 0) {
              setProductImages(imagesData.map((img) => img.imageUrl || img));
            } else {
              setProductImages([]);
            }
          } else {
            setProductImages([]);
          }
        } catch (error) {
          console.error("Error fetching product images:", error);
          setProductImages([]);
        }
      } else {
        setProductImages([]);
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
      console.error(error.message);
    } finally {
      if (detailsRequestController.current === controller) {
        detailsRequestController.current = null;
        setIsUpdatingDetails(false);
      }
    }
  };

  function CurrentProduct() {
    const Price =
      product?.discountPercentage === 0
        ? product?.productPrice
        : product?.priceAfterDiscount;
    return {
      productDetailsId: DetailsId,
      quantity: Quantity,
      unitPrice: Price,
      totalPrice: Price * Quantity,
    };
  }

  const handlBuyClick = () => {
    const Product = CurrentProduct();
    navigate("/PurchaseDetails", { state: { Product, fromCart: false } });
  };

  const handleShareProduct = async () => {
    if (!product?.productId) return;
    const shareEndpoint = `${API_BASE_URL}Product/ShareProduct/${product.productId}?lang=${lang}`;
    const shareTitle = productName || SiteName;
    const shareText = moreDetails || shareTitle;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareEndpoint,
        });
        showBanner(t("productDetails.shareSuccess", "تمت مشاركة المنتج بنجاح."), "success");
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareEndpoint);
        showBanner(t("productDetails.shareCopied", "تم نسخ رابط المشاركة."), "success");
      } else {
        window.open(shareEndpoint, "_blank");
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
      showBanner(t("productDetails.shareError", "تعذر مشاركة المنتج حالياً."), "error");
    }
  };

  // دمج fetchProducts و fetchColorsAndSizes في useEffect واحد لتجنب التحميل المتعدد
  useEffect(() => {
    if (!product) return;
    
    // منع الطلبات المكررة لنفس المنتج واللغة
    const dataKey = `${product?.productId}-${lang}`;
    if (hasFetchedInitialData.current === dataKey) return;
    hasFetchedInitialData.current = dataKey;

    const fetchInitialData = async () => {
      try {
        // جلب البيانات بشكل متوازي
        const [detailsResponse, sizesResponse, colorsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}Product/GetProductDetailsById?Id=${product?.productId}`),
          fetch(`${API_BASE_URL}Product/GetSizesByProductId?productId=${product?.productId}`),
          fetch(`${API_BASE_URL}Product/GetColorsByProductId?productId=${product?.productId}`)
        ]);

        if (!detailsResponse.ok || !sizesResponse.ok || !colorsResponse.ok) {
          throw new Error("Network response was not ok");
        }

        const [detailsData, sizesData, colorsData] = await Promise.all([
          detailsResponse.json(),
          sizesResponse.json(),
          colorsResponse.json()
        ]);

        // تحديث البيانات
        setCurrentColor(detailsData.color);
        setDetailsId(detailsData.productDetailsId);
        const sizeValue = detailsData.size;
        setCurrentSize(sizeValue);
        const newQuantity = detailsData.quantity;
        setAvailableQuantity(newQuantity);
        
        // ضبط الكمية تلقائياً عند التحميل الأولي
        if (newQuantity > 0) {
          setQuantity(1);
        } else {
          setQuantity(0);
        }

        // تحديث المقاسات والألوان
        setSizes(sizesData);
        if (sizesData.length === 1) setCurrentSize(sizesData[0]);
        setColors(colorsData);
        if (colorsData.length === 1) setCurrentColor(colorsData[0]);

        // إذا كان هناك مقاس محدد، احصل على الألوان المتاحة له
        if (sizeValue) {
          // منع الطلبات المكررة لنفس المقاس في fetchInitialData
          const initialSizeKey = `${product?.productId}-${sizeValue}-initial`;
          if (hasFetchedColorsForSize.current !== initialSizeKey) {
            hasFetchedColorsForSize.current = initialSizeKey;
            try {
              const colorsForSizeResponse = await fetch(
                `${API_BASE_URL}Product/GetColorsBelongsToSpecificSize?ProductId=${product?.productId}&SizeName=${sizeValue}`
              );
              if (colorsForSizeResponse.ok) {
                const colorsForSizeData = await colorsForSizeResponse.json();
                setAvailableColorsForSize(colorsForSizeData);
              }
            } catch (error) {
              console.error("Error fetching colors for size:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchInitialData();
    
    return () => {
      // إعادة تعيين المرجع عند تغيير المنتج أو اللغة
      if (product?.productId) {
        const dataKey = `${product?.productId}-${lang}`;
        if (hasFetchedInitialData.current === dataKey) {
          hasFetchedInitialData.current = false;
        }
      }
    };
  }, [product?.productId, lang]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!CurrentSize || !product) return;
      
      // منع الطلبات المكررة لنفس المقاس
      const sizeKey = `${product?.productId}-${CurrentSize}`;
      if (hasFetchedColorsForSize.current === sizeKey) return;
      hasFetchedColorsForSize.current = sizeKey;
      
      setIsUpdatingDetails(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}Product/GetColorsBelongsToSpecificSize?ProductId=${product?.productId}&SizeName=${CurrentSize}`
        );
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setColors(data);
        setAvailableColorsForSize(data); // حفظ الألوان المتاحة للمقاس الحالي
        // التحقق من أن اللون الحالي متوفر مع المقاس الجديد
        if (CurrentColor && !data.includes(CurrentColor)) {
          // إذا كان اللون الحالي غير متوفر، اختر أول لون متاح
          if (data.length > 0) {
            setCurrentColor(data[0]);
          } else {
            setCurrentColor("");
          }
        } else if (data.length === 1) {
          setCurrentColor(data[0]);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        hasFetchedColorsForSize.current = null; // إعادة تعيين عند الخطأ
      } finally {
        setIsUpdatingDetails(false);
      }
    };

    fetchDetails();
  }, [CurrentSize, product?.productId, CurrentColor]);

  useEffect(() => {
    // إذا كان هناك مقاسات وكان كل من اللون والمقاس محددين
    const hasSizes = Sizes.length > 0 && Sizes[0] !== null;
    
    if (CurrentColor && CurrentSize && hasSizes && product) {
      // منع الطلبات المكررة لنفس اللون والمقاس
      const detailsKey = `${product?.productId}-${CurrentColor}-${CurrentSize}`;
      if (hasFetchedDetails.current === detailsKey) return;
      hasFetchedDetails.current = detailsKey;
      
      GetDetailsOfCurrentSizeAndColor(CurrentColor, CurrentSize);
    }
    // إذا لم يكن هناك مقاسات وكان اللون محدد فقط
    else if (CurrentColor && !hasSizes && product) {
      // منع الطلبات المكررة لنفس اللون
      const colorOnlyKey = `${product?.productId}-${CurrentColor}-no-size`;
      if (hasFetchedDetails.current === colorOnlyKey) return;
      hasFetchedDetails.current = colorOnlyKey;
      
      GetDetailsByColorOnly(CurrentColor);
    }
  }, [CurrentSize, CurrentColor, Sizes, product]);

  // ضبط الكمية تلقائياً عند تغيير المخزون المتاح (حل احتياطي)
  useEffect(() => {
    setQuantity((currentQuantity) => {
      if (availableQuantity > 0 && currentQuantity > availableQuantity) {
        return availableQuantity;
      } else if (availableQuantity === 0 && currentQuantity > 0) {
        return 0;
      }
      return currentQuantity;
    });
  }, [availableQuantity]);

  useEffect(() => {
    return () => {
      detailsRequestController.current?.abort();
    };
  }, []);

  useEffect(() => {
    // منع الطلبات المكررة
    if (hasFetchedShippingAreas.current) return;
    hasFetchedShippingAreas.current = true;
    
    const loadShippingAreas = async () => {
      try {
        const raw = await fetchShippingAreas();
        // دعم استجابة على شكل مصفوفة أو كائن يحتوي على مصفوفة
        const list = Array.isArray(raw) ? raw : (raw?.data ?? raw?.items ?? []);
        // توحيد أسماء الخصائص (دعم camelCase و PascalCase من الـ API)
        const areas = list.map((a) => ({
          id: a.id ?? a.Id,
          governorate: a.governorate ?? a.Governorate ?? a.governorateName ?? a.GovernorateName ?? "",
          price: a.price ?? a.Price,
          deliveryTimeDays: a.deliveryTimeDays ?? a.DeliveryTimeDays ?? a.deliveryTime ?? a.DeliveryTime ?? 0,
        })).filter((a) => a.governorate);
        setShippingAreas(areas);
      } catch (error) {
        console.error("Error loading shipping areas:", error);
        setShippingAreas([]);
      }
    };
    loadShippingAreas();
    
    return () => {
      hasFetchedShippingAreas.current = false;
    };
  }, []);

  // عند اختيار منطقة الشحن، عرض فترة التوصيل وسعر الشحن
  useEffect(() => {
    if (!selectedShippingArea) {
      setDeliveryTimeDays(null);
      setShippingPrice(null);
      return;
    }
    const area = shippingAreas.find(
      (a) => (a.governorate || "").trim() === (selectedShippingArea || "").trim()
    );
    if (area != null) {
      const days = area.deliveryTimeDays ?? area.deliveryTime ?? 0;
      setDeliveryTimeDays(typeof days === "number" ? days : parseInt(days, 10) || 0);
      const price = area.price ?? area.Price;
      setShippingPrice(price != null ? Number(price) : null);
    } else {
      setDeliveryTimeDays(null);
      setShippingPrice(null);
    }
  }, [selectedShippingArea, shippingAreas]);

  // Callback refs للتعليقات والمنتجات ذات الصلة
  const reviewsRefCallback = (node) => {
    if (node && !reviewsElementsRef.current.includes(node)) {
      reviewsElementsRef.current.push(node);
      if (reviewsObserverRef.current && !showReviews) {
        reviewsObserverRef.current.observe(node);
      }
    }
  };

  const relatedProductsRefCallback = (node) => {
    if (node && !relatedProductsElementsRef.current.includes(node)) {
      relatedProductsElementsRef.current.push(node);
      if (relatedProductsObserverRef.current && !showRelatedProducts) {
        relatedProductsObserverRef.current.observe(node);
      }
    }
  };

  // Intersection Observer للتحميل الكسول للتعليقات والمنتجات ذات الصلة
  useEffect(() => {
    if (!product) return;

    const observerOptions = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    };

    // إنشاء observers فقط مرة واحدة
    if (!reviewsObserverRef.current) {
      reviewsObserverRef.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !showReviews) {
            setShowReviews(true);
            if (reviewsObserverRef.current) {
              reviewsObserverRef.current.unobserve(entry.target);
            }
          }
        });
      }, observerOptions);
    }

    if (!relatedProductsObserverRef.current) {
      relatedProductsObserverRef.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !showRelatedProducts) {
            setShowRelatedProducts(true);
            if (relatedProductsObserverRef.current) {
              relatedProductsObserverRef.current.unobserve(entry.target);
            }
          }
        });
      }, observerOptions);
    }

    // مراقبة جميع العناصر الموجودة
    reviewsElementsRef.current.forEach(element => {
      if (element && !showReviews && reviewsObserverRef.current) {
        reviewsObserverRef.current.observe(element);
      }
    });

    relatedProductsElementsRef.current.forEach(element => {
      if (element && !showRelatedProducts && relatedProductsObserverRef.current) {
        relatedProductsObserverRef.current.observe(element);
      }
    });

    return () => {
      reviewsElementsRef.current.forEach(element => {
        if (element && reviewsObserverRef.current) {
          reviewsObserverRef.current.unobserve(element);
        }
      });
      relatedProductsElementsRef.current.forEach(element => {
        if (element && relatedProductsObserverRef.current) {
          relatedProductsObserverRef.current.unobserve(element);
        }
      });
    };
  }, [product, showReviews, showRelatedProducts]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );

  // Loading indicator عند تحديث التفاصيل فقط
  const DetailsLoadingOverlay = isUpdatingDetails && (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  );

  // دالة لمعالجة النص للحفاظ على الأسطر الفارغة
  const formatDescription = (text) => {
    if (!text)
      return <p className="text-black">{t("productDetails.noDetails", "لا توجد تفاصيل إضافية")}</p>;

    return text.split("\n").map((line, index) =>
      line.trim() === "" ? (
        <br key={index} />
      ) : (
        <p key={index} className="text-black">
          {line}
        </p>
      )
    );
  };

  const Price = product?.discountPercentage === 0 ? product?.productPrice : product?.priceAfterDiscount;
  const isRTL = lang === "ar";
  const deliveryText = `${t("productDetails.deliveryTime", "التوصيل خلال")} ${getDeliveryDate(lang === "en" ? "en" : "ar")}`;
  const returnPolicyText = t("productDetails.returnPolicy", "إرجاع خلال 7 أيام");

  // الاعتماد على نتيجة الـ API للغة الحالية (من الـ query) حتى تظهر الترجمة عند تغيير اللغة
  const source = queryProduct || product;
  const getLocalizedSourceValue = (camelBase, pascalBase) => {
    const localizedSuffix = lang === "en" ? "En" : "Ar";

    return (
      source?.[`${camelBase}${localizedSuffix}`] ||
      source?.[`${pascalBase}${localizedSuffix}`] ||
      source?.[camelBase] ||
      source?.[pascalBase] ||
      ""
    );
  };

  const productName = getLocalizedSourceValue("productName", "ProductName");
  const moreDetails = getLocalizedSourceValue("moreDetails", "MoreDetails");

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: productName,
            image: [`${ServerPath}${Img}`],
            description: moreDetails,
            sku: id,
            brand: {
              "@type": "Brand",
              name: SiteName,
            },
            offers: {
              "@type": "Offer",
              url: window.location.href,
              priceCurrency: "AED",
              price: Price,
              priceValidUntil: "2025-12-31",
              availability:
                availableQuantity > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              itemCondition: "https://schema.org/NewCondition",
            },
          })}
        </script>

        <title>
          {productName || t("productDetails.product", "منتج")} | {SiteName}
        </title>
        <meta
          name="description"
          content={`${productName} - ${moreDetails}. ${t("productDetails.availableNow", "متاح الآن على")} ${SiteName}. ${t("productDetails.discoverMore", "اكتشف المزيد من المنتجات المميزة بأفضل الأسعار.")}`}
        />
        <link rel="canonical" href={window.location.href} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={productName} />
        <meta property="og:description" content={moreDetails} />
        <meta property="og:image" content={`${ServerPath}${Img}`} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:site_name" content={SiteName} />
        <meta property="og:locale" content={isRTL ? "ar_AE" : "en_US"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={productName} />
        <meta name="twitter:description" content={moreDetails} />
        <meta name="twitter:image" content={`${ServerPath}${Img}`} />
        <meta name="twitter:url" content={window.location.href} />
      </Helmet>

      <StoreLayout>
        {banner && (
          <div
            className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 text-white ${
              banner.tone === "error" ? "bg-red-500" : "bg-emerald-600"
            }`}
          >
            {banner.text}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton />
        </div>
        
        {/* Mobile Layout: Vertical Stack */}
        <div className="flex flex-col lg:hidden space-y-6">
          {/* الصور */}
          <ProductMediaCard
            imageUrl={ServerPath + Img}
            productName={productName}
            additionalImages={productImages.map(img => ServerPath + img)}
            productVideoUrl={product?.productVideoUrl ?? product?.ProductVideoUrl ?? undefined}
          />

          {/* الكمية والألوان والمخزون */}
          <div className="space-y-6">
            <ProductInfoCard
              productName={productName || ""}
              priceFormatted={format(Price)}
              originalPriceFormatted={format(product?.productPrice)}
              discountPercentage={product?.discountPercentage || 0}
              availableQuantity={availableQuantity}
              isRTL={isRTL}
              t={t}
              deliveryText={deliveryText}
              returnPolicyText={returnPolicyText}
              CurrencySelectorComponent={CurrencySelector}
              onShare={handleShareProduct}
            />

            <div className="relative">
              {DetailsLoadingOverlay}
              <ProductOptionsCard
                t={t}
                Colors={Colors}
                CurrentColor={CurrentColor}
                setCurrentColor={setCurrentColor}
                Sizes={Sizes}
                CurrentSize={CurrentSize}
                setCurrentSize={setCurrentSize}
                Quantity={Quantity}
                setQuantity={setQuantity}
                availableQuantity={availableQuantity}
                handlBuyClick={handlBuyClick}
                DetailsId={DetailsId}
                translateColor={translateColor}
                translateSize={translateSize}
                isRTL={isRTL}
                showBanner={showBanner}
                productId={product?.productId}
                availableColorsForSize={availableColorsForSize}
                product={product ? {
                  productId: product.productId,
                  productName: productName || "",
                  priceAfterDiscount: product.priceAfterDiscount || product.productPrice || 0,
                  productPrice: product.productPrice || 0,
                  productImage: product.productImage || Img || "",
                  categoryName: product.categoryName || product.categoryNameAr || product.categoryNameEn || "",
                } : null}
                onColorChange={(color) => {
                  setCurrentColor(color);
                }}
                onSizeChange={(size) => {
                  setCurrentSize(size);
                }}
              />
            </div>

            {/* Shipping Area Selector */}
            <div className="bg-blue-50 rounded-2xl shadow-xl p-6 border border-blue-200">
              <div className="flex flex-col space-y-4">
                <label className="text-lg font-semibold text-blue-900">
                  {t("productDetails.shipTo", "شحن إلى")}:
                </label>
                <select
                  value={selectedShippingArea}
                  onChange={(e) => setSelectedShippingArea(e.target.value)}
                  className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900"
                >
                  <option value="">{t("productDetails.selectShippingArea", "اختر منطقة الشحن")}</option>
                  {shippingAreas.map((area) => (
                    <option key={area.id} value={area.governorate}>
                      {translateGovernorate(area.governorate)}
                    </option>
                  ))}
                </select>
                {(deliveryTimeDays !== null || shippingPrice != null) && (
                  <div className="bg-white p-4 rounded-lg border border-blue-200 space-y-2">
                    {deliveryTimeDays !== null && (
                      <p className="text-blue-800 font-medium">
                        {t("productDetails.estimatedDelivery", "الوقت المتوقع للوصول")}:{" "}
                        <span className="font-bold text-orange-600">
                          {deliveryTimeDays} {t("productDetails.days", "يوم")}
                        </span>
                      </p>
                    )}
                    {shippingPrice != null && (
                      <p className="text-blue-800 font-medium">
                        {t("productDetails.shippingPrice", "سعر الشحن")}:{" "}
                        <span className="font-bold text-orange-600">
                          {format(shippingPrice)}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout: Two Columns */}
        <div className={`hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-8 ${isRTL ? "" : "lg:flex-row-reverse"}`}>
          <ProductMediaCard
            imageUrl={ServerPath + Img}
            productName={productName}
            additionalImages={productImages.map(img => ServerPath + img)}
            productVideoUrl={product?.productVideoUrl ?? product?.ProductVideoUrl ?? undefined}
          />

          <div className="space-y-6">
            <ProductInfoCard
              productName={productName || ""}
              priceFormatted={format(Price)}
              originalPriceFormatted={format(product?.productPrice)}
              discountPercentage={product?.discountPercentage || 0}
              availableQuantity={availableQuantity}
              isRTL={isRTL}
              t={t}
              deliveryText={deliveryText}
              returnPolicyText={returnPolicyText}
              CurrencySelectorComponent={CurrencySelector}
              onShare={handleShareProduct}
            />

            <div className="relative">
              {DetailsLoadingOverlay}
              <ProductOptionsCard
                t={t}
                Colors={Colors}
                CurrentColor={CurrentColor}
                setCurrentColor={setCurrentColor}
                Sizes={Sizes}
                CurrentSize={CurrentSize}
                setCurrentSize={setCurrentSize}
                Quantity={Quantity}
                setQuantity={setQuantity}
                availableQuantity={availableQuantity}
                handlBuyClick={handlBuyClick}
                DetailsId={DetailsId}
                translateColor={translateColor}
                translateSize={translateSize}
                isRTL={isRTL}
                showBanner={showBanner}
                productId={product?.productId}
                availableColorsForSize={availableColorsForSize}
                product={product ? {
                  productId: product.productId,
                  productName: productName || "",
                  priceAfterDiscount: product.priceAfterDiscount || product.productPrice || 0,
                  productPrice: product.productPrice || 0,
                  productImage: product.productImage || Img || "",
                  categoryName: product.categoryName || product.categoryNameAr || product.categoryNameEn || "",
                } : null}
                onColorChange={(color) => {
                  setCurrentColor(color);
                }}
                onSizeChange={(size) => {
                  setCurrentSize(size);
                }}
              />
            </div>

            {/* Shipping Area Selector */}
            <div className="bg-blue-50 rounded-2xl shadow-xl p-6 border border-blue-200">
              <div className="flex flex-col space-y-4">
                <label className="text-lg font-semibold text-blue-900">
                  {t("productDetails.shipTo", "شحن إلى")}:
                </label>
                <select
                  value={selectedShippingArea}
                  onChange={(e) => setSelectedShippingArea(e.target.value)}
                  className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900"
                >
                  <option value="">{t("productDetails.selectShippingArea", "اختر منطقة الشحن")}</option>
                  {shippingAreas.map((area) => (
                    <option key={area.id} value={area.governorate}>
                      {translateGovernorate(area.governorate)}
                    </option>
                  ))}
                </select>
                {(deliveryTimeDays !== null || shippingPrice != null) && (
                  <div className="bg-white p-4 rounded-lg border border-blue-200 space-y-2">
                    {deliveryTimeDays !== null && (
                      <p className="text-blue-800 font-medium">
                        {t("productDetails.estimatedDelivery", "الوقت المتوقع للوصول")}:{" "}
                        <span className="font-bold text-orange-600">
                          {deliveryTimeDays} {t("productDetails.days", "يوم")}
                        </span>
                      </p>
                    )}
                    {shippingPrice != null && (
                      <p className="text-blue-800 font-medium">
                        {t("productDetails.shippingPrice", "سعر الشحن")}:{" "}
                        <span className="font-bold text-orange-600">
                          {format(shippingPrice)}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* التفاصيل والتعليقات والمنتجات ذات الصلة — تظهر على الموبايل والديسكتوب */}
        <div className="block space-y-10 mt-8 lg:mt-0">
          {/* قسم التفاصيل الإضافية */}
          <div className="bg-[#FAFAFA] rounded-2xl shadow-xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {t("productDetails.productDetails", "تفاصيل المنتج")}
            </h3>
            <div className="text-gray-700 leading-relaxed text-lg">
              {formatDescription(moreDetails)}
            </div>
          </div>

          {/* التعليقات - Lazy Loading */}
          <div ref={reviewsRefCallback} className="bg-[#FAFAFA] rounded-2xl shadow-xl p-6 min-h-[200px]">
            {showReviews ? (
              <Reviews productId={Number(product?.productId || id)} />
            ) : (
              <div className="flex justify-center items-center h-32">
                <div className="text-gray-400">{t("productDetails.loading", "جاري التحميل...")}</div>
              </div>
            )}
          </div>

          {/* المنتجات ذات الصلة - Lazy Loading */}
          <div ref={relatedProductsRefCallback} className="bg-[#FAFAFA] rounded-2xl shadow-xl p-6 min-h-[200px]">
            {showRelatedProducts ? (
              <RelatedProducts product={product} />
            ) : (
              <div className="flex justify-center items-center h-32">
                <div className="text-gray-400">{t("productDetails.loading", "جاري التحميل...")}</div>
              </div>
            )}
          </div>
        </div>
        </div>
      </StoreLayout>
    </div>
  );
}
