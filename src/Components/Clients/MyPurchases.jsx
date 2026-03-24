import { useEffect, useState } from "react";
import API_BASE_URL, { SiteName, ServerPath } from "../Constant";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useCurrency } from "../Currency/CurrencyContext";
import { useI18n } from "../i18n/I18nContext";
import OrderReviewForm from "./OrderReviewForm";
import BackButton from "../Common/BackButton";
import WebSiteLogo from "../WebsiteLogo/WebsiteLogo.jsx";

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [orderDetailsMap, setOrderDetailsMap] = useState({});
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const { format } = useCurrency();
  const { t, lang } = useI18n();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}Orders/GetOrdersByClientId`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(t("myPurchases.fetchError", "فشل في جلب الطلبات"));
        }

        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const isDeliveredStatus = (status) => {
    if (!status) return false;
    const normalized = status.toLowerCase();
    return (
      normalized.includes("تم التوصيل") ||
      normalized.includes("delivered")
    );
  };

  const translateColor = (colorName) => {
    if (!colorName) return colorName;
    const map = {
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
    const key = map[colorName] || colorName.toLowerCase().trim();
    return t(`colors.${key}`, colorName);
  };

  const handleToggleReviews = async (orderId) => {
    if (activeOrderId === orderId) {
      setActiveOrderId(null);
      return;
    }

    setReviewsError("");
    if (!orderDetailsMap[orderId]) {
      try {
        setReviewsLoading(true);
        const token = sessionStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}Orders/GetOrderDetailsInSpecificOrder?OrderId=${orderId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(
            t(
              "purchaseDetails.fetchError",
              "فشل في جلب تفاصيل الطلب"
            )
          );
        }
        const details = await response.json();
        setOrderDetailsMap((prev) => ({ ...prev, [orderId]: details }));
      } catch (err) {
        setReviewsError(err.message);
      } finally {
        setReviewsLoading(false);
      }
    }

    setActiveOrderId(orderId);
  };

  function getStatusClass(status) {
    // Map backend status to translated status
    const statusTranslationMap = {
      "قيد المعالجة": t("myPurchases.processing", "قيد المعالجة"),
      "تم التأكيد": t("myPurchases.confirmed", "تم التأكيد"),
      "قيد الشحن": t("myPurchases.shipping", "قيد الشحن"),
      "تم التوصيل": t("myPurchases.delivered", "تم التوصيل"),
      "تم الرفض": t("myPurchases.rejected", "تم الرفض"),
      "تم الإرجاع": t("myPurchases.returned", "تم الإرجاع"),
    };
    
    const statusMap = {
      "قيد المعالجة": "bg-yellow-100 text-yellow-800 border-yellow-300",
      "تم التأكيد": "bg-blue-100 text-blue-800 border-blue-300",
      "قيد الشحن": "bg-orange-100 text-orange-800 border-orange-300",
      "تم التوصيل": "bg-green-100 text-green-800 border-green-300",
      "تم الرفض": "bg-red-100 text-red-800 border-red-300",
      "تم الإرجاع": "bg-purple-100 text-purple-800 border-purple-300",
    };
    
    return statusMap[status] || "bg-gray-100 text-gray-800 border-gray-300";
  }
  
  function getTranslatedStatus(status) {
    const statusTranslationMap = {
      "قيد المعالجة": t("myPurchases.processing", "قيد المعالجة"),
      "تم التأكيد": t("myPurchases.confirmed", "تم التأكيد"),
      "قيد الشحن": t("myPurchases.shipping", "قيد الشحن"),
      "تم التوصيل": t("myPurchases.delivered", "تم التوصيل"),
      "تم الرفض": t("myPurchases.rejected", "تم الرفض"),
      "تم الإرجاع": t("myPurchases.returned", "تم الإرجاع"),
    };
    return statusTranslationMap[status] || status;
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-orange-600 text-lg font-semibold">{t("myPurchases.loading", "جارٍ تحميل الطلبات...")}</p>
    </div>
  );
  
  if (error) return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-red-600 text-lg font-semibold">{error}</p>
    </div>
  );
  
  if (orders.length === 0) return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-red-600 text-center text-lg font-semibold">
        {t("myPurchases.noOrders", "لا يوجد طلبات حتى الآن")}
      </p>
    </div>
  );

  const brandNavy = "#92278f";
  const brandDeepNavy = "#7a1f75";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8 px-4">
      <Helmet>
        <title>{t("myPurchases.metaTitle", "طلباتي")} | {SiteName}</title>
        <meta
          name="description"
          content={t("myPurchases.metaDesc", "طلباتي التي قمت بشرائها وطلبها من موقع")}
        />
      </Helmet>
      
      <div className="max-w-4xl mx-auto">
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
                {t("myPurchases.title", "طلباتي")}
              </h2>
            </div>
            <div className="w-12" />
          </div>
        </div>
        
        <div className="space-y-6">
          {orders.map((order) => (
            <div 
              key={order.orderId}
              className="bg-white rounded-xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 p-6"
            >
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <h3 className="text-xl font-bold text-blue-900">
                  {t("myPurchases.orderNumber", "رقم الطلب")}: #{order.orderId}
                </h3>
                
                <div className="flex items-center gap-2">
                  <strong className="text-blue-800">{t("myPurchases.orderStatus", "حالة الطلب")}:</strong>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusClass(order.orderStatus)}`}>
                    {getTranslatedStatus(order.orderStatus)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <strong className="text-blue-700 block mb-1">{t("myPurchases.shippingPrice", "سعر الشحن")}:</strong>
                  <span className="text-blue-900 font-semibold">{format(order.shippingCoast)}</span>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <strong className="text-orange-700 block mb-1">{t("myPurchases.total", "الإجمالي")}:</strong>
                  <span className="text-orange-900 font-semibold">{format(order.totalAmount)}</span>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <strong className="text-blue-700 block mb-1">{t("myPurchases.orderDate", "تاريخ الطلب")}:</strong>
                  <span className="text-blue-900">
                    {new Date(order.orderDate).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {order.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <strong className="text-red-700 block mb-1">{t("myPurchases.rejectionReason", "سبب الرفض")}:</strong>
                  <p className="text-red-800">{order.rejectionReason}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Link
                  to={`/Purchase-Details/${order.orderId}`}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  {t("myPurchases.viewDetails", "عرض التفاصيل")}
                </Link>
              </div>
              {isDeliveredStatus(order.orderStatus) && (
                <div className="mt-4 border-t pt-4">
                  <button
                    onClick={() => handleToggleReviews(order.orderId)}
                    className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-2 rounded-lg font-semibold shadow hover:from-blue-700 hover:to-blue-900 transition"
                  >
                    {activeOrderId === order.orderId
                      ? t("myPurchases.hideReviews", "إخفاء التقييمات")
                      : t("myPurchases.reviewDelivered", "قيّم المنتجات التي تم توصيلها")}
                  </button>
                  {activeOrderId === order.orderId && (
                    <div className="mt-4 space-y-4">
                      {reviewsLoading && (
                        <p className="text-center text-blue-700">
                          {t("purchaseDetails.loadingDetails", "جارٍ تحميل تفاصيل الطلب...")}
                        </p>
                      )}
                      {reviewsError && (
                        <p className="text-center text-red-600">{reviewsError}</p>
                      )}
                      {!reviewsLoading && !reviewsError && (
                        orderDetailsMap[order.orderId]?.length ? (
                          orderDetailsMap[order.orderId].map((detail, idx) => (
                            <div key={idx} className="border border-blue-100 rounded-xl p-4 bg-blue-50/60">
                              <div className="flex flex-col md:flex-row items-start gap-4">
                                <img
                                  src={
                                    detail.imagePath?.startsWith("http")
                                      ? detail.imagePath
                                      : `${ServerPath}${detail.imagePath}`
                                  }
                                  alt={detail.productName}
                                  className="w-28 h-28 object-contain rounded-lg border border-white shadow"
                                />
                                <div className="flex-1 space-y-2">
                                  <h4 className="text-lg font-semibold text-blue-900">
                                    {detail.productName}
                                  </h4>
                                  <p className="text-sm text-gray-700">
                                    {t("purchaseDetails.color", "اللون")}:{" "}
                                    <span className="font-semibold">
                                      {translateColor(detail.colorName)}
                                    </span>
                                  </p>
                                  {detail.sizeName && (
                                    <p className="text-sm text-gray-700">
                                      {t("purchaseDetails.size", "المقاس")}:{" "}
                                      <span className="font-semibold">{detail.sizeName}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                              <OrderReviewForm
                                productId={detail.productId}
                                productName={detail.productName}
                              />
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-gray-600">
                            {t("purchaseDetails.noDetails", "لا توجد تفاصيل لهذا الطلب")}
                          </p>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}