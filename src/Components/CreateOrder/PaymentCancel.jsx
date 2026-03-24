import { Link, useLocation } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import { Helmet } from "react-helmet";

export default function PaymentCancel() {
  const { t, lang } = useI18n();
  const location = useLocation();

  return (
    <>
      <Helmet>
        <title>
          {lang === "ar" 
            ? "تم إلغاء عملية الدفع - إيكوفيرا" 
            : "Payment Cancelled - Ecovera"}
        </title>
        <meta
          name="description"
          content={
            lang === "ar"
              ? "تم إلغاء عملية الدفع. يمكنك المحاولة مرة أخرى أو اختيار الدفع عند الاستلام."
              : "Payment was cancelled. You can try again or choose cash on delivery."
          }
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center bg-red-500 text-white text-4xl animate-bounce">
            ✕
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("payments.cancelTitle", "تم إلغاء عملية الدفع")}
          </h1>
          <p className="text-gray-600 text-lg">
            {t("payments.cancelBody", "يمكنك المحاولة مرة أخرى أو اختيار الدفع عند الاستلام.")}
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg text-right">
            <p className="text-blue-800 text-sm">
              {lang === "ar"
                ? "💡 نصيحة: يمكنك اختيار الدفع عند الاستلام لتجنب أي مشاكل في الدفع الإلكتروني"
                : "💡 Tip: You can choose cash on delivery to avoid any payment issues"}
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Link
              to="/PurchaseDetails"
              className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl transition shadow-lg hover:shadow-xl"
            >
              {t("payments.retryCheckout", "إعادة المحاولة")}
            </Link>
            <Link
              to="/Cart"
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl transition shadow-lg hover:shadow-xl"
            >
              {lang === "ar" ? "العودة إلى السلة" : "Back to Cart"}
            </Link>
            <Link
              to="/"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition"
            >
              {t("payments.backHome", "العودة للرئيسية")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

