import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../Constant";
import { Helmet } from "react-helmet";
import WebSiteLogo from "../WebsiteLogo/WebsiteLogo";
import { useI18n } from "../i18n/I18nContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [message]);

  const RecetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}Users/ForgotPassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userProviderIdentifier: email,
          authProvider: "Gmail",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || t("forgotPassword.success", "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"));
        setMessageType("success");
        setEmail("");
      } else {
        setMessage(data.message || t("forgotPassword.error", "حدث خطأ أثناء إرسال الطلب"));
        setMessageType("error");
      }
    } catch (error) {
      setMessage(t("forgotPassword.serverError", "حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى."));
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f9] py-4 sm:py-6 md:py-10 px-3 sm:px-4 flex items-center justify-center safe-area-pb">
      <Helmet>
        <title>{t("forgotPassword.metaTitle", "استرجاع كلمة السر")} | إيكوفيرا</title>
        <meta
          name="description"
          content={t("forgotPassword.metaDesc", "استعادة كلمة المرور في إيكوفيرا للتمتع بتجربة تسوق مميزة.")}
        />
      </Helmet>

      <div className="w-full max-w-[380px] sm:max-w-[400px] bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-[#0A2C52]/10" style={{ maxWidth: "min(100%, 420px)" }}>
        <div className="flex justify-center mb-6">
          <WebSiteLogo width={160} height={80} className="sm:w-[200px] sm:h-[100px] max-w-full h-auto" />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0A2C52] mb-2">
            {t("forgotPassword.title", "استعادة كلمة المرور")}
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            {t("forgotPassword.description", "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور")}
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-center ${
              messageType === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            <p className="text-sm md:text-base font-medium">{message}</p>
          </div>
        )}

        <form onSubmit={RecetPassword} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-[#0A2C52] mb-2"
            >
              {t("forgotPassword.email", "البريد الإلكتروني")}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("forgotPassword.emailPlaceholder", "أدخل بريدك الإلكتروني")}
              required
              className="w-full px-4 py-3 min-h-[48px] bg-[#eef2f9] border-2 border-[#0A2C52]/20 rounded-xl focus:border-[#0A2C52] focus:outline-none focus:ring-2 focus:ring-[#0A2C52]/30 transition text-gray-800 placeholder-gray-400"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-semibold py-3 sm:py-3.5 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px] touch-manipulation"
            style={{ backgroundColor: "#0A2C52" }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "#13345d";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#0A2C52";
            }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t("forgotPassword.sending", "جاري الإرسال...")}</span>
              </>
            ) : (
              t("forgotPassword.submit", "إرسال رابط إعادة تعيين كلمة المرور")
            )}
          </button>
        </form>

        <div className="mt-6 text-center pt-4 border-t border-[#0A2C52]/20">
          <Link
            to="/Login"
            className="text-[#0A2C52] hover:text-[#13345d] font-medium text-sm transition underline-offset-2 hover:underline"
          >
            {t("forgotPassword.backToLogin", "العودة إلى تسجيل الدخول")}
          </Link>
        </div>
      </div>
    </div>
  );
}
