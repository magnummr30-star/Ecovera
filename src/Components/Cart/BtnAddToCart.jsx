import API_BASE_URL from "../Constant";
import { FaShoppingCart, FaCheck } from "react-icons/fa";
import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";
import { getOrCreateSessionId } from "../utils";

export default function AddToCart({ productDetailsId, Quantity, className = "", product = null }) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const { t, lang } = useI18n();

  const handleCartClick = async () => {
    const token = sessionStorage.getItem("token");
    setIsLoading(true);
    setMessage("");
    
    try {
      let response;
      
      if (token) {
        // المستخدم مسجل دخول - استخدام السلة العادية
        response = await fetch(`${API_BASE_URL}Carts/PostCartDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productDetailsId: Number(productDetailsId),
          quantity: Number(Quantity),
        }),
      });
      } else {
        // المستخدم غير مسجل - استخدام السلة المؤقتة
        const sessionId = getOrCreateSessionId();
        response = await fetch(`${API_BASE_URL}Carts/PostGuestCartDetails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            sessionId: sessionId,
          },
          body: JSON.stringify({
            productDetailsId: Number(productDetailsId),
            quantity: Number(Quantity),
          }),
        });
      }

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      
      // عرض رسالة النجاح بدون الانتقال للسلة
      setShowSuccess(true);
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("cartUpdated"));
      setTimeout(() => setShowSuccess(false), 2000);
      
    } catch (error) {
      console.error("Error adding product to cart:", error.message);
      setMessage(t("addToCart.error", "حدث خطأ أثناء إضافة المنتج للسلة"));
      
      // إخفاء رسالة الخطأ بعد 3 ثواني
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* نافذة التحميل */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-900/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
            <p className="text-blue-800 font-medium">{t("addToCart.adding", "جاري إضافة المنتج إلى السلة...")}</p>
          </div>
        </div>
      )}

      {/* رسالة الخطأ */}
      {message && (
        <div className="fixed top-6 left-1/2 z-50 w-80 -translate-x-1/2 transform">
          <div className="rounded-lg bg-red-500 px-6 py-4 text-white shadow-lg flex items-center gap-3 animate-fade-in">
            <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-sm">!</span>
            </div>
            <span>{message}</span>
          </div>
        </div>
      )}

      {/* رسالة النجاح */}
      {showSuccess && (
        <div className="fixed top-6 left-1/2 z-50 w-80 -translate-x-1/2 transform">
          <div className="rounded-lg bg-green-500 px-6 py-4 text-white shadow-lg flex items-center gap-3 animate-fade-in">
            <FaCheck className="text-white" />
            <span>{t("addToCart.success", "تمت الإضافة بنجاح!")}</span>
          </div>
        </div>
      )}

      {/* زر إضافة إلى السلة - أيقونة السلة فقط */}
      <button
        onClick={handleCartClick}
        disabled={isLoading}
        title={t("addToCart.button", "أضف إلى السلة")}
        aria-label={t("addToCart.button", "أضف إلى السلة")}
        className={`
          inline-flex items-center justify-center rounded-xl p-3 sm:p-4 text-white
          transition-all duration-300 transform hover:scale-105 active:scale-95
          shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
          ${showSuccess 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-gradient-to-l from-[#92278f] to-[#ee207b] hover:from-[#ee207b] hover:to-[#92278f]'
          }
          border-2 border-transparent hover:border-[#92278f]/30
          ${className || ''}
        `}
        style={{ color: 'white' }}
      >
        {showSuccess ? (
          <FaCheck className="animate-bounce" size={22} style={{ color: 'white' }} />
        ) : (
          <FaShoppingCart className={isLoading ? 'animate-pulse' : ''} size={22} style={{ color: 'white' }} />
        )}
      </button>
    </>
  );
}