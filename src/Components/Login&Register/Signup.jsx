import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_BASE_URL, { SiteName } from "../Constant";
import { Helmet } from "react-helmet";
import WebSiteLogo from "../WebsiteLogo/WebsiteLogo.jsx";
import { useI18n } from "../i18n/I18nContext";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [message]);

  const isPasswordStrong = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setMessage(t("signup.passwordMismatch", "كلمات المرور غير متطابقة"));
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    if (!isPasswordStrong(formData.password)) {
      setMessage(
        t("signup.passwordRequirements", "كلمة المرور يجب أن تحتوي على: 8 أحرف على الأقل، حرف كبير، رقم، ورمز خاص")
      );
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}Clients/PostClient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          secondName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phone,
          password: formData.password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(t("signup.success", "تم التسجيل بنجاح!"));
        setMessageType("success");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        setMessage(data.message);
        setMessageType("error");
      }
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef2f9] py-4 sm:py-6 md:py-10 px-3 sm:px-4 rtl flex items-center justify-center safe-area-pb">
      <Helmet>
        <title>{t("signup.metaTitle", "انشاء حساب")} | {SiteName}</title>
        <meta name="description" content={t("signup.metaDesc", "انشاء حساب في متجرنا الالكتروني")} />
      </Helmet>

      <div className="w-full mx-auto flex justify-center" style={{ maxWidth: 'min(100%, 420px)' }}>
        <div className="w-full bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 border-2 border-[#92278f]/10">
          {/* الشعار */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4">
              <WebSiteLogo width={160} height={80} className="sm:w-[200px] sm:h-[100px] max-w-full h-auto" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#92278f]">{t("signup.title", "إنشاء حساب جديد")}</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">{t("signup.subtitle", "انضم إلى عائلة")} {SiteName}</p>
          </div>

          {/* رسالة التنبيه */}
          {message && (
            <div
              className={`p-4 rounded-xl mb-6 text-center font-semibold ${
                messageType === "success"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* النموذج */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#92278f] mb-2">
                  {t("signup.firstName", "الاسم الأول")}
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 min-h-[44px] sm:min-h-[48px] border-2 border-[#92278f]/20 rounded-lg focus:border-[#92278f] focus:outline-none focus:ring-2 focus:ring-[#92278f]/30 transition-colors text-base"
                  placeholder={t("signup.firstNamePlaceholder", "أدخل الاسم الأول")}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#92278f] mb-2">
                  {t("signup.lastName", "الاسم الأخير")}
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 min-h-[44px] sm:min-h-[48px] border-2 border-[#92278f]/20 rounded-lg focus:border-[#92278f] focus:outline-none focus:ring-2 focus:ring-[#92278f]/30 transition-colors text-base"
                  placeholder={t("signup.lastNamePlaceholder", "أدخل الاسم الأخير")}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#92278f] mb-2">
                {t("signup.email", "البريد الإلكتروني")}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 min-h-[44px] sm:min-h-[48px] border-2 border-[#92278f]/20 rounded-lg focus:border-[#92278f] focus:outline-none focus:ring-2 focus:ring-[#92278f]/30 transition-colors text-base"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#92278f] mb-2">
                {t("signup.phone", "رقم الهاتف")}
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 min-h-[44px] sm:min-h-[48px] border-2 border-[#92278f]/20 rounded-lg focus:border-[#92278f] focus:outline-none focus:ring-2 focus:ring-[#92278f]/30 transition-colors text-base"
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#92278f] mb-2">
                {t("signup.password", "كلمة المرور")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 border-2 border-[#92278f]/20 rounded-lg focus:border-[#92278f] focus:outline-none focus:ring-2 focus:ring-[#92278f]/30 transition-colors"
                  placeholder={t("signup.passwordPlaceholder", "أدخل كلمة المرور")}
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
              <p className="text-xs text-gray-600 mt-2">
                {t("signup.passwordRequirements", "يجب أن تحتوي على: 8 أحرف على الأقل، حرف كبير، رقم، ورمز خاص")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#92278f] mb-2">
                {t("signup.confirmPassword", "تأكيد كلمة المرور")}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 border-2 border-[#92278f]/20 rounded-lg focus:border-[#92278f] focus:outline-none focus:ring-2 focus:ring-[#92278f]/30 transition-colors"
                  placeholder={t("signup.confirmPasswordPlaceholder", "أعد إدخال كلمة المرور")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#92278f] transition-colors duration-200 focus:outline-none p-1 touch-manipulation"
                  aria-label={showConfirmPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white py-3 sm:py-3.5 rounded-xl font-semibold text-base sm:text-lg min-h-[48px] sm:min-h-[52px] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              style={{ backgroundColor: '#92278f' }}
              onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#7a1f75'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#92278f'; }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin ml-2"></div>
                  {t("signup.registering", "جاري التسجيل...")}
                </div>
              ) : (
                t("signup.submit", "تسجيل الحساب")
              )}
            </button>
          </form>

          {/* رابط تسجيل الدخول */}
          <div className="text-center mt-6 pt-6 border-t border-[#92278f]/20">
            <p className="text-[#92278f] text-sm sm:text-base">
              {t("signup.haveAccount", "لديك حساب بالفعل؟")}{" "}
              <Link
                to="/Login"
                className="text-[#92278f] hover:text-[#7a1f75] font-semibold transition-colors underline-offset-2 hover:underline"
              >
                {t("signup.loginHere", "سجل الدخول هنا")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
