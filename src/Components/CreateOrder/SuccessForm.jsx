import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../i18n/I18nContext";
import API_BASE_URL from "../Constant";
import { Howl } from "howler";

const SuccessForm = ({ message, onClose, discountCode, showDiscountCode }) => {
  const navigate = useNavigate();
  const { lang, t } = useI18n();

  const playWinSound = () => {
    try {
      const sound = new Howl({
        src: ["/Sounds/win.mp3"],
        volume: 0.8,
        html5: true,
        onplayerror: function () {
          // إذا فشل تحميل الصوت، لا نفعل شيئاً
          console.log("Sound file not found, skipping sound");
        },
      });
      sound.play();
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  };

  useEffect(() => {
    console.log("SuccessForm - showDiscountCode:", showDiscountCode, "discountCode:", discountCode);
    // تشغيل صوت الفوز عند ظهور كود الخصم
    if (showDiscountCode && discountCode) {
      console.log("Playing win sound for discount code");
      setTimeout(() => {
        playWinSound();
      }, 100);
    }
  }, [showDiscountCode, discountCode]);

  const goToOrders = () => {
    navigate("/MyPurchases");
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const copyCode = () => {
    if (discountCode) {
      navigator.clipboard.writeText(discountCode);
      alert(lang === "ar" ? "تم نسخ الكود!" : "Code copied!");
    }
  };

  return (
    <>
      <style>{`
        @keyframes spinAndAppear {
          0% {
            transform: rotate(1440deg) scale(0.2);
            opacity: 0;
          }
          70% {
            transform: rotate(0deg) scale(1.05);
            opacity: 0.9;
          }
          100% {
            transform: rotate(0deg) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes discountCardSpin {
          0% {
            transform: rotate(1800deg) scale(0.1);
            opacity: 0;
          }
          75% {
            transform: rotate(0deg) scale(1.1);
            opacity: 0.95;
          }
          100% {
            transform: rotate(0deg) scale(1);
            opacity: 1;
          }
        }
        
        .success-modal {
          animation: spinAndAppear 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .discount-card-animated {
          animation: discountCardSpin 3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
        <div className="bg-[#FAF9F6] rounded-3xl shadow-2xl border-2 border-orange-400 p-8 w-full max-w-md success-modal">
        <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg 
                className="w-10 h-10 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                  strokeWidth={3} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-2">
              {lang === "ar" ? "تم بنجاح!" : "Success!"}
            </h3>
        </div>
        
          <p className="text-gray-700 text-lg text-center mb-8 leading-relaxed font-medium">
          {message}
        </p>

        {/* Discount Code Card */}
        {(showDiscountCode && discountCode) && (
          <div className="mb-6 discount-card-animated">
            <div className="bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 rounded-2xl p-6 shadow-2xl border-4 border-orange-300 transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
              {/* Decorative background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
              </div>
              
              <div className="text-center relative z-10">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 mr-3">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2m0 0V5a2 2 0 10-2 2h2zm-6 0a2 2 0 10-2 2h2m0 0h2m-2 0H6m6 0h2" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-black text-white drop-shadow-lg">
                    {lang === "ar" ? "🎉 مبروك! حصلت على كود خصم 15%" : "🎉 Congratulations! You got a 15% discount code"}
                  </h4>
                </div>
                
                <div className="bg-white rounded-xl p-6 mb-4 mt-4 shadow-2xl border-4 border-orange-300">
                  <p className="text-gray-800 text-base mb-4 font-bold uppercase tracking-wide text-center">
                    {lang === "ar" ? "كود الخصم" : "Discount Code"}
                  </p>
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 w-full border-2 border-orange-200">
                      <span className="text-3xl font-black text-orange-600 tracking-wider drop-shadow-sm block text-center">
                        {discountCode}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm font-semibold text-center">
                      {lang === "ar" 
                        ? "💡 هذا الكود يتم استخدامه في المرة القادمة للحصول على خصم 15% على الفاتورة النهائية" 
                        : "💡 Use this code in your next purchase to get 15% off your final invoice"}
                    </p>
                    <button
                      onClick={copyCode}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl text-base font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 w-full"
                      title={lang === "ar" ? "نسخ الكود" : "Copy code"}
                    >
                      📋 {lang === "ar" ? "نسخ الكود" : "Copy Code"}
                    </button>
                  </div>
                </div>

                <p className="text-white text-sm font-bold mb-3 drop-shadow-md">
                  {lang === "ar" 
                    ? "✨ استخدم هذا الكود في المرة القادمة للحصول على خصم 15% على الفاتورة النهائية!" 
                    : "✨ Use this code next time to get 15% off your final invoice!"}
                </p>
                
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-3 mt-3 shadow-lg border-2 border-yellow-300">
                  <p className="text-yellow-900 text-xs font-extrabold flex items-center justify-center gap-2">
                    <span className="text-lg">📸</span>
                    <span>
                      {lang === "ar" 
                        ? "نصيحة: خذ لقطة شاشة لهذا الكود لحفظه!" 
                        : "Tip: Take a screenshot to save this code!"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={goToOrders}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 shadow-lg hover:shadow-xl"
          >
            {lang === "ar" ? "الذهاب إلى طلباتي" : "Go to My Orders"}
          </button>
          
          {onClose && (
            <button 
              onClick={onClose}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-400 shadow-md hover:shadow-lg"
            >
              {lang === "ar" ? "البقاء هنا" : "Stay Here"}
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default SuccessForm;