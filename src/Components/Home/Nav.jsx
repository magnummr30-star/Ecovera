import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar.jsx";
import { getRoleFromToken, GetUserNameFromToken } from "../utils.js";
import API_BASE_URL from "../Constant.js";
import WebSiteLogo from "../WebsiteLogo/WebsiteLogo.jsx";
import CurrencySelector from "../Currency/CurrencySelector";
import { useI18n } from "../i18n/I18nContext";
import Sidebar from "./Sidebar.jsx";
import MobileHeader from "./MobileHeader.jsx";
import { FiUser, FiMenu, FiX } from "react-icons/fi";
import { getOrCreateSessionId } from "../utils";

export default function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const currentRole = getRoleFromToken(token);
  const { lang, setLang, t } = useI18n();
  
  // Language switcher text
  const languageButtonText = lang === "ar" ? "EN" : "عربي";

  const HandleSearhOn = (query, displayLabel) => {
    const searchValue = (query || "").trim();
    if (!searchValue) return;
    const label = (displayLabel || query || "").trim() || searchValue;
    const path = `/FindProducts?q=${encodeURIComponent(searchValue)}`;
    navigate(path, { state: { searchQuery: label, apiQuery: searchValue } });
  };

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
    setIsLoggedIn(!!token);
    fetchCartDetails();
  }, [token, currentRole, fetchCartDetails]);

  useEffect(() => {
    const onCartUpdated = () => fetchCartDetails();
    window.addEventListener("cartUpdated", onCartUpdated);
    return () => window.removeEventListener("cartUpdated", onCartUpdated);
  }, [fetchCartDetails]);

  // لا نغلق السايد بار تلقائياً - المستخدم يتحكم به

  const HandleCartClick = () => {
    // السماح بالوصول للسلة حتى بدون تسجيل دخول
      navigate("/Cart");
  };

  const handleLoginLogout = () => {
    if (isLoggedIn) {
      sessionStorage.removeItem("token");
      setIsLoggedIn(false);
      window.location.reload();
    } else {
      navigate("/login");
    }
  };

      return (
    <div className="relative w-full">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 relative ${
        isSidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-0'
      }`}>
        {/* Desktop Header */}
        <header className="hidden lg:flex overflow-visible bg-transparent/60 backdrop-blur border-b border-white/30 justify-between items-center px-6 py-4 flex-shrink-0 relative z-50">
          <div className="flex items-center gap-4 flex-1">
            {/* Menu Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-300 text-[#92278f] hover:bg-gray-50 font-bold shadow-sm transition-all duration-200"
              title={isSidebarOpen ? t("closeMenu", "إغلاق القائمة") : t("openMenu", "فتح القائمة")}
            >
              {isSidebarOpen ? (
                <FiX size={20} />
              ) : (
                <FiMenu size={20} />
              )}
            </button>
            
            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 focus:outline-none"
              aria-label={t("home", "الرئيسية")}
            >
              <WebSiteLogo width={180} height={58} className="object-contain" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4 overflow-visible min-w-0">
              <SearchBar onSearch={HandleSearhOn} searchType="products" />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="flex items-center justify-center px-3 py-2 rounded-xl bg-white border border-gray-300 text-[#92278f] hover:bg-gray-50 font-bold shadow-sm"
              title={lang === "ar" ? t("switchToEnglish", "التبديل إلى الإنجليزية") : "عربي"}
            >
              {languageButtonText}
            </button>

            {/* User Profile */}
            {isLoggedIn && (
              <Link 
                to="/MyProfile" 
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl transition duration-200 text-sm font-semibold shadow-md"
              >
                <FiUser size={16} />
                <span className="max-w-24 truncate">
                  {GetUserNameFromToken(token)}
                </span>
              </Link>
            )}
            
            {/* Cart - الهوية البصرية الجديدة */}
              <button 
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition duration-200 text-sm font-semibold border-2 border-[#92278f]/30 text-[#92278f] hover:bg-[#92278f] hover:text-white hover:border-[#92278f] shadow-sm"
                onClick={HandleCartClick}
              >
                <span>{t("cart.title", "السلة")}</span>
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#ee207b] text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center font-bold shadow-md">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            
            {/* Currency Selector */}
              <CurrencySelector />
            
            {/* Login/Logout Button - أصفر للتمييز */}
            <button
              onClick={handleLoginLogout}
              className={`min-h-[44px] px-3 sm:px-4 py-2.5 rounded-xl text-white font-semibold transition duration-200 text-xs sm:text-sm shadow-md whitespace-nowrap touch-manipulation ${
                isLoggedIn 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-[#f49e24] hover:bg-[#e08d1a] active:bg-[#f49e24]"
              }`}
            >
              {isLoggedIn ? t("logout", "تسجيل خروج") : t("login", "تسجيل دخول")}
            </button>
          </div>
        </header>

        {/* Mobile Header */}
        <MobileHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Mobile Search Bar */}
        <div className="lg:hidden overflow-visible px-2 sm:px-4 py-2 bg-white border-b" style={{ borderColor: '#e5e7eb' }}>
          <SearchBar onSearch={HandleSearhOn} searchType="products" />
        </div>
      </div>
    </div>
  );
}
