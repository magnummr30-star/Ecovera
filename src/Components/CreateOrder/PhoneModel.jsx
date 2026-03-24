import { postClientPhone } from "./api.js";
import { useI18n } from "../i18n/I18nContext";

export default function PhoneModal({
  newPhoneNumber,
  setNewPhoneNumber,
  setShowPhoneModal,
  setClientPhone,
}) {
  const { t, lang } = useI18n();
  const isRTL = lang === "ar";
  const handleSavePhoneNumber = async () => {
    setClientPhone(newPhoneNumber);
    setShowPhoneModal(false);
    const Token = sessionStorage.getItem("token");
    await postClientPhone(Token, newPhoneNumber);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowPhoneModal(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-blue-900 bg-opacity-75 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-blue-800 rounded-2xl shadow-2xl border-2 border-orange-500 p-6 w-full max-w-md transform transition-all duration-300 scale-100 hover:scale-105" dir={isRTL ? "rtl" : "ltr"}>
        <h3 className="text-2xl font-bold text-orange-500 text-center mb-6 border-b-2 border-orange-500 pb-3">
          {t("phoneModal.enterPhone", "إدخال رقم الهاتف")}
        </h3>
        
        <input
          type="text"
          placeholder={t("phoneModal.enterPhonePlaceholder", "أدخل رقم هاتفك")}
          value={newPhoneNumber}
          onChange={(e) => setNewPhoneNumber(e.target.value)}
          className={`w-full px-4 py-3 bg-blue-700 border-2 border-orange-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 mb-6 ${isRTL ? "text-right" : "text-left"}`}
          dir={isRTL ? "rtl" : "ltr"}
        />
        
        <div className="flex gap-3">
          <button 
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400"
            onClick={() => setShowPhoneModal(false)}
          >
            {t("general.cancel", "إلغاء")}
          </button>
          <button 
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            onClick={handleSavePhoneNumber}
          >
            {t("phoneModal.saveNumber", "حفظ الرقم")}
          </button>
        </div>
      </div>
    </div>
  );
}