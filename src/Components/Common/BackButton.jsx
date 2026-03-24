import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { useI18n } from "../i18n/I18nContext";

export default function BackButton({ className = "", onClick }) {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const isRTL = lang === "ar";

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // التحقق من وجود تاريخ للعودة
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        // إذا لم يكن هناك تاريخ، العودة للصفحة الرئيسية
        navigate("/");
      }
    }
  };

  const backText = t("general.back", lang === "ar" ? "العودة" : "Back");

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200 ${className}`}
      title={backText}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {isRTL ? (
        <>
          <span>{backText}</span>
          <FiArrowRight size={18} />
        </>
      ) : (
        <>
          <FiArrowLeft size={18} />
          <span>{backText}</span>
        </>
      )}
    </button>
  );
}


