import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import { useI18n } from '../i18n/I18nContext';
import WebSiteLogo from '../WebsiteLogo/WebsiteLogo';
import { getRoleFromToken, getOrCreateSessionId } from '../utils';
import API_BASE_URL from '../Constant';

function MobileHeader({ onMenuClick }) {
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const currentRole = getRoleFromToken(token);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]);

  const fetchCartDetails = useCallback(async () => {
    try {
      const t = sessionStorage.getItem("token");
      const role = getRoleFromToken(t);
      if (t && role === "User") {
        const response = await fetch(`${API_BASE_URL}Carts/GetCartCount`, {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        });
        if (response.ok) {
          const data = await response.json();
          setCartCount(data != null ? data : 0);
        } else setCartCount(0);
      } else {
        const sessionId = getOrCreateSessionId();
        const cartResponse = await fetch(`${API_BASE_URL}Carts/GetGuestCartDetails`, {
          method: "GET",
          headers: { "Content-Type": "application/json", sessionId },
        });
        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          setCartCount(Array.isArray(cartData) ? cartData.length : 0);
        } else setCartCount(0);
      }
    } catch (error) {
      console.error("Error fetching cart details:", error.message);
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    fetchCartDetails();
  }, [token, currentRole, fetchCartDetails]);

  useEffect(() => {
    const onCartUpdated = () => fetchCartDetails();
    window.addEventListener("cartUpdated", onCartUpdated);
    return () => window.removeEventListener("cartUpdated", onCartUpdated);
  }, [fetchCartDetails]);

  const handleLoginLogout = () => {
    if (isLoggedIn) {
      sessionStorage.removeItem("token");
      setIsLoggedIn(false);
      window.location.reload();
    } else {
      navigate("/login");
    }
  };

  const handleCartClick = () => {
    navigate("/Cart");
  };

  const isRTL = lang === "ar";
  const logoSize = lang === "ar" ? 72 : 110;
  const logoClass =
    lang === "ar"
      ? "object-contain drop-shadow-sm w-[60px] h-[80px] sm:w-[90px] sm:h-[90px]"
      : "object-contain drop-shadow-sm w-[90px] h-[90px] sm:w-[115px] sm:h-[115px]";

  return (
    <header className="lg:hidden bg-[#eef2f9] shadow-sm border-b border-[#d1d9e8] sticky top-0 z-30 w-full">
      <div className="relative flex items-center justify-between px-4 py-3 w-full">
      
      {/* الجانب الأيسر - القائمة */}
      <div className="flex items-center gap-4 flex-shrink-0 z-10">
        <button
          onClick={onMenuClick}
          className="text-gray-700 hover:text-gray-900 p-2.5 rounded-xl hover:bg-white transition-all duration-200 shadow-sm border border-gray-200 bg-white/80"
          aria-label={t("menu", "القائمة")}
        >
          <FiMenu size={20} />
        </button>
      </div>

      {/* اللوجو في المنتصف - مطلق التمركز في منتصف الشاشة */}
      <div className="absolute left-1/2 transform -translate-x-1/2 z-0 flex items-center justify-center">
        <button
          onClick={() => navigate("/")}
          className="flex items-center justify-center hover:scale-105 transition-transform duration-200"
          aria-label={t("home", "الرئيسية")}
        >
          <WebSiteLogo width={logoSize} height={logoSize} className={logoClass} />
        </button>
      </div>

      {/* الجانب الأيمن - السلة والترجمة */}
      <div className={`flex items-center gap-3 flex-shrink-0 z-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <button 
          onClick={handleCartClick}
          className="relative flex items-center justify-center p-2.5 rounded-xl transition-all duration-200 shadow-sm border-2 border-[#92278f]/30 text-[#92278f] hover:bg-[#92278f] hover:text-white hover:border-[#92278f] bg-white/90"
          title={t("cart.title", "السلة")}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#ee207b] text-white text-[11px] rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-bold border-2 border-white shadow-sm">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </button>
        
        <button
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-[#92278f] hover:bg-gray-50 font-semibold text-sm shadow-sm transition-all duration-200 min-w-[65px] hover:shadow-md"
          title={lang === "ar" ? t("switchToEnglish", "التبديل إلى الإنجليزية") : "عربي"}
        >
          {lang === "ar" ? "EN" : "عربي"}
        </button>
      </div>
    </div>
  </header>
);
}
export default MobileHeader;