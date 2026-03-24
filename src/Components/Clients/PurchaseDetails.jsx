import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API_BASE_URL, { ServerPath, SiteName } from "../Constant";
import { Helmet } from "react-helmet";
import { useCurrency } from "../Currency/CurrencyContext";
import { useI18n } from "../i18n/I18nContext";
import OrderReviewForm from "./OrderReviewForm";
import BackButton from "../Common/BackButton";
import WebSiteLogo from "../WebsiteLogo/WebsiteLogo.jsx";

export default function OrderDetail() {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { format } = useCurrency();
  const { t, lang } = useI18n();

  const getTranslatedStatus = (status) => {
    const statusTranslationMap = {
      "قيد المعالجة": t("myPurchases.processing", "قيد المعالجة"),
      "تم التأكيد": t("myPurchases.confirmed", "تم التأكيد"),
      "قيد الشحن": t("myPurchases.shipping", "قيد الشحن"),
      "تم التوصيل": t("myPurchases.delivered", "تم التوصيل"),
      "تم الرفض": t("myPurchases.rejected", "تم الرفض"),
      "تم الإرجاع": t("myPurchases.returned", "تم الإرجاع"),
    };
    return statusTranslationMap[status] || status;
  };
  
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

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}Orders/GetOrderDetailsInSpecificOrder?OrderId=${orderId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(t("purchaseDetails.fetchError", "فشل في جلب تفاصيل الطلب"));
        }
        const data = await response.json();
        
        // جلب بيانات المنتجات باللغة الصحيحة
        const enrichedData = await Promise.all(
          data.map(async (detail) => {
            if (detail.productId) {
              try {
                const productResponse = await fetch(
                  `${API_BASE_URL}Product/GetProductById?ID=${detail.productId}&lang=${lang}`
                );
                if (productResponse.ok) {
                  const productData = await productResponse.json();
                  
                  // API قد يعيد productNameAr و productNameEn منفصلين
                  // أو قد يعيد productName باللغة الصحيحة مباشرة عند استخدام lang parameter
                  let productNameAr = productData.productNameAr;
                  let productNameEn = productData.productNameEn;
                  
                  // إذا لم يكن productNameAr موجود، استخدم productName إذا كانت اللغة عربية
                  if (!productNameAr && lang === "ar" && productData.productName) {
                    productNameAr = productData.productName;
                  }
                  
                  // إذا لم يكن productNameEn موجود، استخدم productName إذا كانت اللغة إنجليزية
                  if (!productNameEn && lang === "en" && productData.productName) {
                    productNameEn = productData.productName;
                  }
                  
                  // إذا لم يكن أي منهما موجود، استخدم productName أو الاسم الأصلي
                  if (!productNameAr) productNameAr = productData.productName || detail.productName;
                  if (!productNameEn) productNameEn = productData.productName || detail.productName;
                  
                  // اختر الاسم المناسب حسب اللغة
                  const selectedName = lang === "ar" ? productNameAr : productNameEn;
                  
                  return {
                    ...detail,
                    productNameAr: productNameAr,
                    productNameEn: productNameEn,
                    productName: selectedName
                  };
                }
              } catch (error) {
                console.error(`Error fetching product ${detail.productId}:`, error);
              }
            }
            return detail;
          })
        );
        
        setOrderDetails(enrichedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, lang, t]);

  function GetProductName(detail) {
    if (!detail) return "";
    
    // استخدم productName المحدث مباشرة (تم تحديثه في useEffect حسب اللغة)
    if (detail.productName) {
      const parts = detail.productName.split(" ");
      return parts.slice(0, 2).join(" ");
    }
    
    // إذا لم يكن productName موجود، استخدم productNameAr أو productNameEn حسب اللغة
    if (detail.productNameAr && detail.productNameEn) {
      const selectedName = lang === "ar" ? detail.productNameAr : detail.productNameEn;
      if (selectedName) {
        const parts = selectedName.split(" ");
        return parts.slice(0, 2).join(" ");
      }
    }
    
    // إذا كان هناك productNameAr فقط (في حالة اللغة العربية)
    if (detail.productNameAr && lang === "ar") {
      const parts = detail.productNameAr.split(" ");
      return parts.slice(0, 2).join(" ");
    }
    
    // إذا كان هناك productNameEn فقط (في حالة اللغة الإنجليزية)
    if (detail.productNameEn && lang === "en") {
      const parts = detail.productNameEn.split(" ");
      return parts.slice(0, 2).join(" ");
    }
    
    // الحل الاحتياطي الأخير
    const name = detail.name || "";
    if (!name) return "";
    
    if (name.includes(" ")) {
      const parts = name.split(" ");
      return parts.slice(0, 2).join(" ");
    }
    
    return name;
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-orange-600 text-lg font-semibold">{t("purchaseDetails.loadingDetails", "جارٍ تحميل تفاصيل الطلب...")}</p>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-red-600 text-lg font-semibold">{error}</p>
    </div>
  );
  
  const isDeliveredStatus = (status) => {
    if (!status) return false;
    const normalized = status.toLowerCase();
    return (
      normalized.includes("تم التوصيل") ||
      normalized.includes("delivered")
    );
  };

  if (orderDetails.length === 0) return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-blue-900 text-lg font-semibold">{t("purchaseDetails.noDetails", "لا توجد تفاصيل لهذا الطلب")}</p>
    </div>
  );

  const brandNavy = "#92278f";
  const brandDeepNavy = "#7a1f75";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8 px-4">
      <Helmet>
        <title>{t("purchaseDetails.orderDetailsTitle", "تفاصيل الطلب رقم")} {orderId} | {SiteName}</title>
        <meta
          name="description"
          content={t("purchaseDetails.orderDetailsDesc", "طلباتك التي قمت بشرائها وطلبها من متجرنا")}
        />
      </Helmet>
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <h2 className="text-2xl font-bold text-white">
                {t("purchaseDetails.orderDetailsTitle", "تفاصيل الطلب رقم")} #{orderId}
              </h2>
            </div>
            <div className="w-12" />
          </div>
        </div>
        
        {orderDetails[0]?.orderStatus && (
          <p className="text-center text-blue-800 font-semibold mb-6 w-full">
            {t("purchaseDetails.orderStatus", "حالة الطلب")}:{" "}
            {getTranslatedStatus(orderDetails[0].orderStatus)}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {orderDetails.map((detail, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 overflow-hidden w-full sm:w-[calc(50%-12px)] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(33.333%-16px)] 2xl:w-[calc(25%-18px)]"
              style={{ minWidth: '280px', maxWidth: '400px' }}
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-center p-4 bg-blue-50">
                  <img
                    src={ServerPath + detail.imagePath}
                    alt={detail.productName}
                    className="w-48 h-48 object-contain rounded-lg"
                  />
                </div>
                
                <div className="p-6 flex-1">
                  <h3 className="text-xl font-bold text-blue-900 mb-4 text-center border-b border-orange-200 pb-2">
                    {GetProductName(detail)}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-blue-50 rounded-lg px-3 py-2">
                      <strong className="text-blue-700">{t("purchaseDetails.unitPrice", "سعر الوحدة")}:</strong>
                      <span className="text-blue-900 font-semibold">{format(detail.unitPrice)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-orange-50 rounded-lg px-3 py-2">
                      <strong className="text-orange-700">{t("purchaseDetails.color", "اللون")}:</strong>
                      <span className="text-orange-900 font-semibold">{translateColor(detail.colorName)}</span>
                    </div>
                    
                    {detail.sizeName && (
                      <div className="flex justify-between items-center bg-blue-50 rounded-lg px-3 py-2">
                        <strong className="text-blue-700">{t("purchaseDetails.size", "المقاس")}:</strong>
                        <span className="text-blue-900 font-semibold">{detail.sizeName}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center bg-orange-50 rounded-lg px-3 py-2">
                      <strong className="text-orange-700">{t("purchaseDetails.quantity", "الكمية")}:</strong>
                      <span className="text-orange-900 font-semibold">{detail.quantity} {t("purchaseDetails.piece", "قطعة")}</span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-gradient-to-r from-blue-500 to-orange-500 rounded-lg px-3 py-3 mt-4">
                      <strong className="text-white text-lg">{t("purchaseDetails.total", "الإجمالي")}:</strong>
                      <span className="text-white text-lg font-bold">
                        {format(detail.totalAmount)}
                      </span>
                    </div>
                    {isDeliveredStatus(detail.orderStatus) && (
                      <div className="mt-4">
                        <OrderReviewForm
                          productId={detail.productId}
                          productName={GetProductName(detail)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <Link 
            to="/MyPurchases" 
            className="bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t("purchaseDetails.backToOrders", "العودة إلى طلباتي")}
          </Link>
        </div>
      </div>
    </div>
  );
}