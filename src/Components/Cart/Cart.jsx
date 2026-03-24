import React, { useState, useEffect, useMemo, useRef } from "react";
import { FiTrash2, FiShoppingCart, FiPlus, FiMinus } from "react-icons/fi";
import API_BASE_URL, { ServerPath, SiteName } from "../Constant.js";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useCurrency } from "../Currency/CurrencyContext";
import CurrencySelector from "../Currency/CurrencySelector";
import { useI18n } from "../i18n/I18nContext";
import { getOrCreateSessionId, mergeGuestCartToUserCart, egyptianGovernorates } from "../utils";
import BackButton from "../Common/BackButton";
import WebSiteLogo from "../WebsiteLogo/WebsiteLogo.jsx";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
  const [productOptions, setProductOptions] = useState({});
  const [updatingCartDetailsId, setUpdatingCartDetailsId] = useState(null);
  const navigate = useNavigate();
  const { format } = useCurrency();
  const { t, lang } = useI18n();
  const brandNavy = "#92278f";
  const brandDeepNavy = "#7a1f75";
  
  // استخدام useRef لمنع الطلبات المكررة
  const hasFetchedCart = useRef(false);
  const hasFetchedAddress = useRef(false);
  
  // Function to translate color names (from Arabic to English or vice versa)
  const translateColor = (colorName) => {
    if (!colorName) return colorName;
    
    // Map Arabic color names to English keys
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
    };
    
    // Check if the color name is in Arabic
    const colorKey = colorMap[colorName] || colorName.toLowerCase().trim();
    return t(`colors.${colorKey}`, colorName);
  };

  const translateSize = (sizeName) => {
    if (!sizeName) return sizeName;
    const toWesternDigits = (str) =>
      str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
    const raw = toWesternDigits(sizeName).trim();
    const normalized = raw.toLowerCase();

    const arabicYearsMap = {
      "سنة": "1 year",
      "سنتين": "2 years",
      "سنتان": "2 years",
      "3 سنوات": "3 years",
      "4 سنوات": "4 years",
      "5 سنوات": "5 years",
      "6 سنوات": "6 years",
      "7 سنوات": "7 years",
      "8 سنوات": "8 years",
      "9 سنوات": "9 years",
      "10 سنوات": "10 years",
      "11 سنوات": "11 years",
      "12 سنوات": "12 years",
    };

    const mapped =
      arabicYearsMap[raw] ||
      (normalized.match(/^(\d+)\s*سن(?:ة|وات)$/) && `${normalized.match(/^(\d+)/)[1]} years`) ||
      raw;

    return t(`sizes.${mapped.toLowerCase()}`, mapped);
  };

  // دالة إنشاء كائن الطلب من عناصر السلة
  function CreateOrdersObj() {
    if (cartItems.length === 1) {
      const item = {
        productDetailsId: cartItems[0].productDetailsId,
        quantity: cartItems[0].quantity,
        unitPrice: cartItems[0].unitPriceAfterDiscount,
        orderId: 0,
      };
      return item;
    }
    const products = [];
    for (let i = 0; i < cartItems.length; i++) {
      products.push({
        productDetailsId: cartItems[i].productDetailsId,
        quantity: cartItems[i].quantity,
        unitPrice: cartItems[i].unitPriceAfterDiscount,
        orderId: 0,
      });
    }
    return products;
  }

  // دالة الانتقال إلى صفحة تفاصيل الشراء
  async function handleBuyAll() {
    setIsLoading(true);
    const Product = CreateOrdersObj();
    Product.totalPrice = totalCartPrice;
    navigate("/PurchaseDetails", { state: { Product, fromCart: true } });
    setIsLoading(false);
  }

  // دالة مساعدة للحصول على اسم المنتج حسب اللغة
  const getLocalizedProductName = (item) => {
    if (!item) return "";
    
    // إذا كان هناك productNameAr و productNameEn، استخدمهما حسب اللغة
    if (item.productNameAr && item.productNameEn) {
      return lang === "ar" ? item.productNameAr : item.productNameEn;
    }
    
    // إذا كان هناك productNameAr فقط واستخدمه للعربية
    if (item.productNameAr) {
      if (lang === "ar") {
        return item.productNameAr;
      }
      // إذا كانت اللغة إنجليزية وليس لدينا productNameEn، استخدم productNameAr كحل احتياطي
      return item.productNameEn || item.productNameAr;
    }
    
    // إذا كان هناك productNameEn فقط واستخدمه للإنجليزية
    if (item.productNameEn) {
      if (lang === "en") {
        return item.productNameEn;
      }
      // إذا كانت اللغة عربية وليس لدينا productNameAr، استخدم productNameEn كحل احتياطي
      return item.productNameAr || item.productNameEn;
    }
    
    // الحل الاحتياطي: استخدام productName
    return item.productName || "";
  };

  // جلب تفاصيل السلة عند تحميل المكون
  useEffect(() => {
    // منع الطلبات المكررة
    if (hasFetchedCart.current) return;
    hasFetchedCart.current = true;
    
    const token = sessionStorage.getItem("token");
    const fetchCartDetails = async () => {
      try {
        let response;
        
        if (token) {
          // المستخدم مسجل دخول - جلب السلة العادية
          response = await fetch(`${API_BASE_URL}Carts/GetCartDetails`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        } else {
          // المستخدم غير مسجل - جلب السلة المؤقتة
          const sessionId = getOrCreateSessionId();
          response = await fetch(`${API_BASE_URL}Carts/GetGuestCartDetails`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              sessionId: sessionId,
            },
          });
        }
        
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        
        // البيانات تأتي من الباك إند مع productNameAr و productNameEn و productId
        setCartItems(data || []);
      } catch (error) {
        console.error("Error fetching cart details:", error.message);
        setCartItems([]);
      }
    };
    
    fetchCartDetails();
    
    // إذا كان المستخدم مسجل دخول ولديه sessionId، قم بدمج السلة المؤقتة
    if (token) {
      const sessionId = localStorage.getItem("guestSessionId");
      if (sessionId) {
        mergeGuestCartToUserCart(sessionId, token).then((merged) => {
          if (merged) {
            // إعادة جلب السلة بعد الدمج
            fetchCartDetails();
          }
        });
      }
    }
    
    // Cleanup function لإعادة تعيين المرجع عند unmount
    return () => {
      hasFetchedCart.current = false;
    };
  }, []);

  // جلب عنوان المستخدم للتحقق من أنه داخل الإمارات
  useEffect(() => {
    // منع الطلبات المكررة
    if (hasFetchedAddress.current) return;
    hasFetchedAddress.current = true;
    
    const token = sessionStorage.getItem("token");
    if (!token) {
      // للمستخدم غير المسجل، نعتبر أنه في الإمارات (الافتراضي)
      setUserAddress(null);
      return;
    }

    const fetchUserAddress = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}Addresses/GetAddresses`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const addresses = data.addresses || {};
          // استخدام أول عنوان متاح
          const firstAddressId = Object.keys(addresses)[0];
          if (firstAddressId) {
            setUserAddress(addresses[firstAddressId]);
          }
        }
      } catch (error) {
        console.error("Error fetching user address:", error.message);
      }
    };

    fetchUserAddress();
    
    // Cleanup function لإعادة تعيين المرجع عند unmount
    return () => {
      hasFetchedAddress.current = false;
    };
  }, []);

  const cartProductIdsKey = useMemo(
    () => [...new Set(cartItems.map((i) => i.productId ?? i.ProductId).filter(Boolean))].sort((a, b) => a - b).join(","),
    [cartItems]
  );

  // جلب خيارات المقاس واللون لكل منتج في السلة
  useEffect(() => {
    const productIds = cartProductIdsKey ? cartProductIdsKey.split(",").map(Number) : [];
    if (productIds.length === 0) return;
    let cancelled = false;
    const load = async () => {
      const next = {};
      for (const pid of productIds) {
        try {
          const [sizesRes, colorsRes] = await Promise.all([
            fetch(`${API_BASE_URL}Product/GetSizesByProductId?productId=${pid}`),
            fetch(`${API_BASE_URL}Product/GetColorsByProductId?productId=${pid}`),
          ]);
          if (cancelled) return;
          const sizesData = sizesRes.ok ? await sizesRes.json() : null;
          const colorsData = colorsRes.ok ? await colorsRes.json() : null;
          const sizes = Array.isArray(sizesData) ? sizesData : (sizesData?.sizes ? [].concat(sizesData.sizes) : (sizesData?.Sizes && sizesData.Sizes !== "No Sizes" ? [].concat(sizesData.Sizes) : []));
          const colors = Array.isArray(colorsData) ? colorsData : (colorsData?.colors ? [].concat(colorsData.colors) : []);
          next[pid] = { sizes: sizes || [], colors: colors || [] };
        } catch {
          next[pid] = { sizes: [], colors: [] };
        }
      }
      if (!cancelled) setProductOptions((prev) => ({ ...prev, ...next }));
    };
    load();
    return () => { cancelled = true; };
  }, [cartProductIdsKey]);

  // تغيير المقاس أو اللون لعنصر سلة: استبدال العنصر بالصنف الجديد
  const handleChangeVariant = async (item, newColor, newSize) => {
    const pid = item.productId ?? item.ProductId;
    if (!pid) return;
    setUpdatingCartDetailsId(item.cartDetailsId);
    try {
      const sizeParam = newSize ? `&SizeName=${encodeURIComponent(newSize)}` : "";
      const res = await fetch(
        `${API_BASE_URL}Product/GetDetailsBy?ProductId=${pid}&ColorName=${encodeURIComponent(newColor || "")}${sizeParam}`
      );
      if (!res.ok) throw new Error("Failed to get variant");
      const detail = await res.json();
      const newProductDetailsId = detail?.productDetailsId ?? detail?.ProductDetailsId;
      const maxQty = detail?.quantity ?? detail?.Quantity ?? item.quantity;
      const qty = Math.min(item.quantity, maxQty);
      if (!newProductDetailsId) throw new Error("Variant not found");

      const token = sessionStorage.getItem("token");
      if (token) {
        await fetch(`${API_BASE_URL}Carts/RemoveProduct/${item.cartDetailsId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        });
        const postRes = await fetch(`${API_BASE_URL}Carts/PostCartDetails`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productDetailsId: Number(newProductDetailsId), quantity: qty }),
        });
        if (!postRes.ok) throw new Error("Failed to update cart");
      } else {
        const sessionId = getOrCreateSessionId();
        await fetch(`${API_BASE_URL}Carts/RemoveGuestProduct/${item.cartDetailsId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", sessionId },
        });
        const postRes = await fetch(`${API_BASE_URL}Carts/PostGuestCartDetails`, {
          method: "POST",
          headers: { "Content-Type": "application/json", sessionId },
          body: JSON.stringify({ productDetailsId: Number(newProductDetailsId), quantity: qty }),
        });
        if (!postRes.ok) throw new Error("Failed to update cart");
      }
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      const listRes = token
        ? await fetch(`${API_BASE_URL}Carts/GetCartDetails`, { headers: { Authorization: `Bearer ${token}` } })
        : await fetch(`${API_BASE_URL}Carts/GetGuestCartDetails`, { headers: { sessionId: getOrCreateSessionId() } });
      if (listRes.ok) setCartItems(await listRes.json() || []);
    } catch (err) {
      console.error("Error changing variant:", err);
    } finally {
      setUpdatingCartDetailsId(null);
    }
  };

  // دالة حذف منتج من السلة
  const handleDeleteProduct = async (cartDetailsId) => {
    const token = sessionStorage.getItem("token");
    try {
      let response;
      
      if (token) {
        // المستخدم مسجل دخول
        response = await fetch(
        `${API_BASE_URL}Carts/RemoveProduct/${cartDetailsId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      } else {
        // المستخدم غير مسجل - استخدام السلة المؤقتة
        const sessionId = getOrCreateSessionId();
        response = await fetch(
          `${API_BASE_URL}Carts/RemoveGuestProduct/${cartDetailsId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              sessionId: sessionId,
            },
          }
        );
      }
      
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
      // تحديث حالة السلة بعد الحذف
      setCartItems(
        cartItems.filter((item) => item.cartDetailsId !== cartDetailsId)
      );
    } catch (error) {
      console.error("Error deleting product:", error.message);
    }
  };

  // دالة حذف جميع المنتجات من السلة
  const handleDeleteAllCart = async () => {
    const token = sessionStorage.getItem("token");
    try {
      let response;
      
      if (token) {
        // المستخدم مسجل دخول - إرسال التوكن في Authorization header
        if (cartItems.length > 0 && cartItems[0].cartId) {
          response = await fetch(
            `${API_BASE_URL}Carts/RemoveCartDetails/${cartItems[0].cartId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } else {
          // إذا لم يكن هناك cartId، فقط امسح القائمة محلياً
          setCartItems([]);
          return;
        }
      } else {
        // المستخدم غير مسجل - حذف السلة المؤقتة
        const sessionId = getOrCreateSessionId();
        // نحتاج إلى cartId من السلة المؤقتة
        if (cartItems.length > 0 && cartItems[0].cartId) {
          response = await fetch(
            `${API_BASE_URL}Carts/RemoveCartDetails/${cartItems[0].cartId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                sessionId: sessionId,
              },
            }
          );
        } else {
          // إذا لم يكن هناك cartId، فقط امسح القائمة محلياً
          setCartItems([]);
          return;
        }
      }
      
      if (!response.ok) {
        throw new Error("Failed to delete all items in cart");
      }
      setCartItems([]);
    } catch (error) {
      console.error("Error deleting all items:", error.message);
    }
  };

  // حساب إجمالي سعر السلة
  const totalCartPrice = cartItems.reduce(
    (acc, item) => acc + item.totalPrice,
    0
  );

  // دالة للتحقق من أن العنوان داخل الإمارات
  const isAddressInUAE = (address) => {
    if (!address) return false;
    const uaeEmirates = egyptianGovernorates; // قائمة الإمارات السبع
    return uaeEmirates.some(emirate => address.includes(emirate));
  };

  // حساب المتبقي حتى 200 درهم
  const FREE_SHIPPING_THRESHOLD = 200;
  const remainingForFreeShipping = useMemo(() => {
    // الأسعار بالفعل بالدرهم الإماراتي
    if (totalCartPrice >= FREE_SHIPPING_THRESHOLD) return 0;
    return FREE_SHIPPING_THRESHOLD - totalCartPrice;
  }, [totalCartPrice]);

  // التحقق من أن المستخدم داخل الإمارات
  const isUserInUAE = useMemo(() => {
    if (userAddress) {
      return isAddressInUAE(userAddress);
    }
    // إذا لم يكن هناك عنوان، نعتبر أن المستخدم في الإمارات (الافتراضي)
    return true;
  }, [userAddress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8">
      <Helmet>
        <title>{t("cart.metaTitle", "سلة التسوق")} | {SiteName}</title>
        <meta
          name="description"
          content={t("cart.metaDesc", "عرض تفاصيل السلة وإجمالي السعر للمنتجات المُختارة في الملف الشخصي")}
        />
        <link rel="icon" href={lang === "en" ? "/ProjectImages/SouqLogoEn.png" : "/ProjectImages/SouqLogoAr.png"} />
      </Helmet>
      
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div
          className="rounded-2xl shadow-xl p-6 mb-8"
          style={{ background: `linear-gradient(120deg, ${brandNavy}, ${brandDeepNavy})` }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <BackButton className="bg-white/20 hover:bg-white/30 text-white border-white/30" />

            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <WebSiteLogo
                  width={lang === "ar" ? 130 : 150}
                  height={48}
                  className="object-contain drop-shadow-lg"
                />
              </div>
              <div className="p-3 rounded-full bg-white text-center shadow-lg border border-white/40">
                <FiShoppingCart className="text-[#92278f]" size={24} />
              </div>
              <h1 className="text-2xl font-bold" style={{ color: 'white' }}>{t("cart.title", "سلة التسوق")}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <CurrencySelector />
              {cartItems.length > 0 && (
                <div className="text-right">
                  <p className="text-sm" style={{ color: '#bfdbfe' }}>{t("cart.total", "الإجمالي")}</p>
                  <p className="text-2xl font-bold" style={{ color: '#fb923c' }}>
                    {format(totalCartPrice)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Free Shipping Message - Only for UAE users - Under Header */}
        {cartItems.length > 0 && isUserInUAE && remainingForFreeShipping > 0 && remainingForFreeShipping < FREE_SHIPPING_THRESHOLD && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-4 shadow-lg mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-500 rounded-full p-2">
                <FiShoppingCart className="text-white" size={20} />
              </div>
              <h4 className="text-lg font-bold text-green-800">
                {t("cart.freeShippingOffer", "الشحن المجاني قريب!")}
              </h4>
            </div>
            <p className="text-green-700 font-medium">
              {lang === "ar" 
                ? `قم بإضافة منتجات بقيمة ${format(remainingForFreeShipping)} لتحصل على الشحن المجاني`
                : `Add products worth ${format(remainingForFreeShipping)} to get free shipping`
              }
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              {t("cart.continueShopping", "متابعة التسوق")}
            </button>
          </div>
        )}

        {/* Empty State */}
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingCart className="text-blue-600" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{t("cart.empty", "سلة التسوق فارغة")}</h3>
            <p className="text-gray-600 mb-8">{t("cart.emptyDesc", "لم تقم بإضافة أي منتجات إلى سلة التسوق بعد")}</p>
            <button 
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              {t("cart.browseProducts", "تصفح المنتجات")}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Action Buttons */}
            {cartItems.length > 1 && (
              <div className="flex gap-4 justify-between items-center">
                <button 
                  onClick={handleDeleteAllCart}
                  className="px-6 py-3 font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center gap-2"
                  style={{ 
                    color: 'white',
                    background: 'linear-gradient(to right, #dc2626, #b91c1c)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(to right, #b91c1c, #991b1b)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(to right, #dc2626, #b91c1c)';
                  }}
                >
                  <FiTrash2 size={18} style={{ color: 'white' }} />
                  <span style={{ color: 'white' }}>{t("cart.deleteAll", "حذف الكل")}</span>
                </button>
              </div>
            )}

            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100 hover:shadow-xl transition-all duration-300">
                  <div className="p-6">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-blue-200">
                          <img
                            src={`${ServerPath + item.image}`}
                            alt={getLocalizedProductName(item)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4 gap-4">
                          <h3 className="text-lg font-bold text-blue-900 flex-1">{getLocalizedProductName(item)}</h3>
                          <button
                            onClick={() => handleDeleteProduct(item.cartDetailsId)}
                            className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg flex-shrink-0"
                            style={{ 
                              color: 'white',
                              backgroundColor: '#dc2626'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#b91c1c';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#dc2626';
                            }}
                            title={t("cart.deleteProduct", "حذف المنتج")}
                          >
                            <FiTrash2 size={18} style={{ color: 'white' }} />
                            <span className="text-sm font-semibold" style={{ color: 'white' }}>{t("cart.delete", "حذف")}</span>
                          </button>
                        </div>

                        {/* Attributes - تغيير اللون والمقاس */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-sm text-blue-600 font-medium mb-1">{t("cart.color", "اللون")}</p>
                            {(() => {
                              const opts = productOptions[item.productId ?? item.ProductId];
                              const colors = opts?.colors ?? [];
                              if (colors.length <= 1) {
                                return <p className="text-blue-900 font-semibold">{item.color ? translateColor(item.color) : t("cart.notAvailable", "غير متوفر")}</p>;
                              }
                              return (
                                <select
                                  value={item.color || ""}
                                  onChange={(e) => { const v = e.target.value; if (v) handleChangeVariant(item, v, item.size || ""); }}
                                  disabled={updatingCartDetailsId === item.cartDetailsId}
                                  className="w-full rounded-lg border border-blue-200 bg-white px-2 py-1.5 text-blue-900 font-semibold text-sm"
                                >
                                  {colors.map((c) => (
                                    <option key={c} value={c}>{translateColor(c)}</option>
                                  ))}
                                </select>
                              );
                            })()}
                          </div>
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-sm text-blue-600 font-medium mb-1">{t("cart.size", "المقاس")}</p>
                            {(() => {
                              const opts = productOptions[item.productId ?? item.ProductId];
                              const sizes = opts?.sizes ?? [];
                              if (sizes.length <= 1) {
                                return <p className="text-blue-900 font-semibold">{translateSize(item.size) || t("cart.notAvailable", "غير متوفر")}</p>;
                              }
                              return (
                                <select
                                  value={item.size || ""}
                                  onChange={(e) => { const v = e.target.value; if (v !== undefined) handleChangeVariant(item, item.color || "", v); }}
                                  disabled={updatingCartDetailsId === item.cartDetailsId}
                                  className="w-full rounded-lg border border-blue-200 bg-white px-2 py-1.5 text-blue-900 font-semibold text-sm"
                                >
                                  {sizes.map((s) => (
                                    <option key={s} value={s}>{translateSize(s)}</option>
                                  ))}
                                </select>
                              );
                            })()}
                          </div>
                        </div>
                        {updatingCartDetailsId === item.cartDetailsId && (
                          <p className="text-sm text-blue-600 mb-2">{t("cart.updating", "جاري التحديث...")}</p>
                        )}

                        {/* Price Details */}
                        <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl p-4 border border-blue-200">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-blue-600">{t("cart.originalPrice", "السعر الأصلي")}:</span>
                                <span className="text-blue-900 font-medium line-through">{format(item.unitPriceBeforeDiscount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-600">{t("cart.discount", "الخصم")}:</span>
                                <span className="text-green-600 font-medium">{item.discountPercentage}%</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-blue-600">{t("cart.priceAfterDiscount", "السعر بعد الخصم")}:</span>
                                <span className="text-orange-600 font-medium">{format(item.unitPriceAfterDiscount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-blue-600">{t("cart.quantity", "الكمية")}:</span>
                                <span className="text-blue-900 font-medium">{item.quantity}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Total Price */}
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <div className="flex justify-between items-center">
                              <span className="text-blue-800 font-semibold">{t("cart.total", "الإجمالي")}:</span>
                              <span className="text-xl font-bold text-orange-600">{format(item.totalPrice)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Card */}
            <div className="rounded-2xl shadow-xl p-6" style={{ background: 'linear-gradient(to right, #1e3a8a, #1e40af)' }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg" style={{ color: 'white' }}>{t("cart.cartTotal", "إجمالي السلة")}:</span>
                <span className="text-2xl font-bold" style={{ color: '#fb923c' }}>{format(totalCartPrice)}</span>
              </div>
              
              {/* Buy Button - Green and at the bottom */}
              {cartItems.length > 0 && (
                <button 
                  onClick={handleBuyAll}
                  className="w-full px-6 py-4 font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mt-4"
                  style={{ 
                    color: 'white',
                    background: 'linear-gradient(to right, #16a34a, #15803d)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(to right, #15803d, #166534)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(to right, #16a34a, #15803d)';
                  }}
                >
                  <span style={{ color: 'white' }}>{t("cart.buyAll", "شراء الكل")}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-900 font-semibold">{t("cart.loading", "جاري التحميل...")}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}