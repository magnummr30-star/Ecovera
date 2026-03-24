import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import API_BASE_URL, { SiteName } from "../Constant.js";
import WebSiteLogo from "../WebsiteLogo/WebsiteLogo.jsx";
import { useI18n } from "../i18n/I18nContext";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { mergeGuestCartToUserCart } from "../utils";

export default function Login() {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { path } = location.state || "/";
  const { t } = useI18n();

  const handleLogin = async ({
    email = null,
    password = null,
    token = null,
    authProvider,
  }) => {
    try {
      const res = await fetch(`${API_BASE_URL}Users/Login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          token: token,
          authProvider: authProvider,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const token = data.token;
        sessionStorage.setItem("token", token);
        
        // دمج السلة المؤقتة مع سلة المستخدم بعد تسجيل الدخول
        const sessionId = localStorage.getItem("guestSessionId");
        if (sessionId) {
          try {
            await mergeGuestCartToUserCart(sessionId, token);
          } catch (error) {
            console.error("Error merging guest cart:", error);
          }
        }
        
        path ? navigate(`${path}`) : navigate("/");
        setMessage(t("loginPage.success", "تم تسجيل الدخول بنجاح!"));
        OpenSignalConnection();
        setMessageType("success");
      } else {
        setMessage(data.message || t("loginPage.failed", "فشل تسجيل الدخول. الرجاء المحاولة مجدداً."));
        setMessageType("error");
      }
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    }
  };

  const handleOnlineStoreLogin = (e) => {
    e.preventDefault();
    handleLogin({
      email: Email,
      password: Password,
      authProvider: "Online Store",
    });
  };

  // ✅ تسجيل الدخول باستخدام Google
  const handleGoogleLoginSuccess = (response) => {
    const token = response.credential;
    handleLogin({ token, authProvider: "Google" });
  };

  const handleGoogleLoginFailure = () => {
    setMessage(t("loginPage.googleFailed", "فشل تسجيل الدخول باستخدام Google."));
    setMessageType("error");
  };

  return (
    <div className="min-h-screen bg-[#eef2f9] py-4 sm:py-6 md:py-10 px-3 sm:px-4 flex items-center justify-center safe-area-pb">
      <Helmet>
        <title>{t("loginPage.metaTitle", "تسجيل الدخول")} | {SiteName}</title>
        <meta
          name="description"
          content={t("loginPage.metaDesc", "سجل دخولك الان لكي تتمكن من تجربه كامله للتسوق من منزلك من خلال متجرنا الاكتروني")}
        />
      </Helmet>

      <div className="w-full bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border border-[#92278f]/10 mx-auto" style={{ maxWidth: 'min(100%, 420px)' }}>
        {/* الشعار */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <WebSiteLogo width={160} height={80} className="sm:w-[200px] sm:h-[100px] max-w-full h-auto" />
        </div>

        {/* رسالة التنبيه */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center ${
            messageType === "success" 
              ? "bg-green-100 text-green-800 border border-green-200" 
              : "bg-red-100 text-red-800 border border-red-200"
          }`}>
            {message}
          </div>
        )}

        {/* نموذج تسجيل الدخول */}
        <form onSubmit={handleOnlineStoreLogin} className="space-y-6">
          {/* حقل البريد الإلكتروني */}
          <div>
            <label htmlFor="email" className="block text-[#92278f] font-semibold mb-2 text-right text-sm sm:text-base">
              {t("loginPage.email", "البريد الإلكتروني")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("loginPage.emailPlaceholder", "أدخل بريدك الإلكتروني")}
              required
              autoComplete="email"
              className="w-full p-3 sm:p-3.5 bg-[#eef2f9] border-2 border-[#92278f]/20 rounded-lg focus:border-[#92278f] focus:ring-2 focus:ring-[#92278f]/30 transition duration-200 text-right placeholder-gray-400 text-base min-h-[44px] sm:min-h-[48px]"
            />
          </div>

          {/* حقل كلمة المرور */}
          <div>
            <label htmlFor="password" className="block text-[#92278f] font-semibold mb-2 text-right text-sm sm:text-base">
              {t("loginPage.password", "كلمة المرور")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("loginPage.passwordPlaceholder", "أدخل كلمة المرور")}
                required
                autoComplete="current-password"
                className="w-full p-3 sm:p-3.5 pr-12 bg-[#eef2f9] border-2 border-[#92278f]/20 rounded-lg focus:border-[#92278f] focus:ring-2 focus:ring-[#92278f]/30 transition duration-200 text-right placeholder-gray-400 text-base min-h-[44px] sm:min-h-[48px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#92278f] transition-colors duration-200 focus:outline-none p-1 touch-manipulation"
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            <div className="text-left mt-2">
              <Link 
                to="/forgot-password" 
                className="text-[#92278f] hover:text-[#7a1f75] text-sm font-medium transition duration-200"
              >
                {t("loginPage.forgotPassword", "هل نسيت كلمة المرور؟")}
              </Link>
            </div>
          </div>

          {/* زر تسجيل الدخول - ألوان الشعار */}
          <button 
            type="submit" 
            className="w-full text-white font-semibold py-3 sm:py-3.5 px-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg min-h-[48px] sm:min-h-[52px] text-base touch-manipulation"
            style={{ backgroundColor: '#92278f' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#7a1f75'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#92278f'; }}
          >
            {t("loginPage.submit", "تسجيل الدخول")}
          </button>

          {/* فاصل */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#92278f]/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#92278f] font-semibold">
                {t("loginPage.orLoginWith", "أو سجل الدخول باستخدام")}
              </span>
            </div>
          </div>

          {/* أزرار التسجيل الاجتماعي */}
          <div className="space-y-4">
            {/* زر جوجل */}
            <div className="text-center mb-2">
              <span className="text-[#92278f] font-semibold text-sm">
                {t("loginPage.googleHint", "👇 سجل دخول لدينا بنقرة واحدة عن طريق جوجل 👇")}
              </span>
            </div>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={handleGoogleLoginFailure}
                useOneTap
              />
            </div>

          </div>

          {/* رابط التسجيل */}
          <div className="text-center mt-6 pt-4 border-t border-[#92278f]/20">
            <p className="text-[#92278f] text-sm sm:text-base">
              {t("loginPage.noAccount", "ليس لديك حساب؟")}{" "}
              <Link 
                to="/register" 
                className="text-[#92278f] hover:text-[#7a1f75] font-bold transition duration-200 underline-offset-2 hover:underline"
              >
                {t("loginPage.signUpNow", "سجل الآن")}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}