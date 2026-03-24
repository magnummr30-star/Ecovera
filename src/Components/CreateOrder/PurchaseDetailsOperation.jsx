import React, { useState, useEffect, useMemo, useRef } from "react";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate } from "react-router-dom";
import getDeliveryDate, {
  playNotificationSound,
  SendSignalMessageForOrders,
  startConnection,
  getOrCreateSessionId,
  egyptianGovernorates,
} from "../utils.js";
import AddressSelector from "./AddressSelector.jsx";
import PhoneNumberModal from "./PhoneModel.jsx";
import OrderSummary from "./PurchaseSummray.jsx";
import {
  fetchAddresses,
  fetchShipOrderInfo,
  fetchShippingAreas,
  fetchClientPhone,
  postOrder,
  postOrderDetails,
  PostListOfOrdersDetails,
  postGuestOrder,
} from "./api.js";
import SuccessForm from "./SuccessForm.jsx";
import API_BASE_URL, { SiteName } from "../Constant.js";
import { useCurrency } from "../Currency/CurrencyContext";
import CurrencySelector from "../Currency/CurrencySelector";
import { useI18n } from "../i18n/I18nContext";
import WebSiteLogo from "../WebsiteLogo/WebsiteLogo.jsx";

// تتبع InitiateCheckout لفيسبوك بيكسل (آمن إذا لم يكن fbq متوفر)
const trackInitiateCheckout = (products, value) => {
  try {
    if (typeof window === "undefined" || typeof window.fbq !== "function") {
      return;
    }

    const contents =
      Array.isArray(products) &&
      products.map((p) => ({
        id: p.productId || p.productDetailsId || p.sku || "",
        quantity: p.quantity || 1,
        item_price: typeof p.unitPrice === "number" ? p.unitPrice : Number(p.unitPrice) || 0,
      }));

    window.fbq("track", "InitiateCheckout", {
      contents,
      value: typeof value === "number" ? value : Number(value) || 0,
      currency: "AED",
      num_items: Array.isArray(products) ? products.length : 0,
    });
  } catch (e) {
    console.error("trackInitiateCheckout error", e);
  }
};

// دالة للتحقق من أن العنوان داخل الإمارات
const isAddressInUAE = (address) => {
  if (!address) return false;
  const uaeEmirates = egyptianGovernorates; // قائمة الإمارات السبع
  return uaeEmirates.some(emirate => address.includes(emirate));
};

// دالة لتحويل النص المترجم إلى النص العربي الأصلي
const getArabicGovernorateName = (translatedName) => {
  if (!translatedName) return translatedName;
  
  // تنظيف النص من المسافات الزائدة
  const cleanName = translatedName.trim();
  
  // خريطة النصوص المترجمة إلى النصوص العربية
  const translationMap = {
    // الإمارات - النصوص الإنجليزية
    "Abu Dhabi - UAE": "أبوظبي",
    "Abu Dhabi": "أبوظبي",
    "Dubai - UAE": "دبي",
    "Dubai": "دبي",
    "Sharjah - UAE": "الشارقة",
    "Sharjah": "الشارقة",
    "Ajman - UAE": "عجمان",
    "Ajman": "عجمان",
    "Umm Al Quwain - UAE": "أم القيوين",
    "Umm Al Quwain": "أم القيوين",
    "Ras Al Khaimah - UAE": "رأس الخيمة",
    "Ras Al Khaimah": "رأس الخيمة",
    "Fujairah - UAE": "الفجيرة",
    "Fujairah": "الفجيرة",
    // الإمارات - النصوص العربية المترجمة
    "أبوظبي - الإمارات العربية المتحدة": "أبوظبي",
    "دبي - الإمارات العربية المتحدة": "دبي",
    "الشارقة - الإمارات العربية المتحدة": "الشارقة",
    "عجمان - الإمارات العربية المتحدة": "عجمان",
    "أم القيوين - الإمارات العربية المتحدة": "أم القيوين",
    "رأس الخيمة - الإمارات العربية المتحدة": "رأس الخيمة",
    "الفجيرة - الإمارات العربية المتحدة": "الفجيرة",
  };
  
  // البحث في الخريطة أولاً
  if (translationMap[cleanName]) {
    return translationMap[cleanName];
  }
  
  // إذا كان النص يحتوي على "-" نأخذ الجزء الأول فقط
  const parts = cleanName.split("-");
  const firstPart = parts[0]?.trim();
  
  // التحقق من أن النص العربي موجود في قائمة الإمارات
  if (firstPart && egyptianGovernorates.includes(firstPart)) {
    return firstPart;
  }
  
  // البحث في الخريطة مرة أخرى بالجزء الأول
  if (firstPart && translationMap[firstPart]) {
    return translationMap[firstPart];
  }
  
  // إذا لم نجد تطابق، نعيد النص كما هو (قد يكون بالفعل عربي)
  return firstPart || cleanName;
};

export default function PurchaseOperationDetails() {
  const [ShipPrice, SetShiPrice] = useState(0);
  const [addresses, setAddresses] = useState({});
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [clientPhone, setClientPhone] = useState("");
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [newAddress, setNewAddress] = useState({
    governorate: "",
    city: "",
    street: "",
  });
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccessForm, setShowSuccessForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [shippingAreas, setShippingAreas] = useState([]);
  const [guestInfo, setGuestInfo] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
  });
  const [guestGovernorate, setGuestGovernorate] = useState("");
  const [guestAddressDetails, setGuestAddressDetails] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { format, convertFromAED } = useCurrency();
  const { t, lang } = useI18n();
  const token = sessionStorage.getItem("token");
  const isLoggedIn = Boolean(token);
  
  // استخدام useRef لمنع الطلبات المكررة
  const hasFetchedAddresses = useRef(false);
  const hasFetchedShippingAreas = useRef(false);
  const hasFetchedShipInfo = useRef(null); // سيحتوي على آخر governorate تم جلب معلوماته
  const hasFetchedClientPhone = useRef(false);

  const fromCart = Boolean(location.state?.fromCart);
  const Products = location.state?.Product;
  const normalizeGovernorate = (area) =>
    (area &&
      (area.governorate ||
        area.governorateName ||
        area.Governorate ||
        area.GovernorateName)) ||
    area ||
    "";
  const governorateOptions = useMemo(() => {
    if (shippingAreas.length) {
      return shippingAreas.map(normalizeGovernorate).filter(Boolean);
    }
    return egyptianGovernorates;
  }, [shippingAreas]);
  const normalizedProducts = useMemo(() => {
    if (!Products) return [];
    return Array.isArray(Products) ? Products : [Products];
  }, [Products]);
  const productPrice = useMemo(() => {
    return Array.isArray(Products)
    ? Products.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0)
    : Products.unitPrice * Products.quantity;
  }, [Products]);

  const bilingual = (ar, en) => `${ar} / ${en}`;

  const addressToUse = useMemo(() => {
    if (isLoggedIn) {
      return selectedAddressId ? addresses[selectedAddressId] : "";
    }
    if (!guestGovernorate && !guestAddressDetails) return "";
    return `${guestGovernorate} - ${guestAddressDetails}`.trim();
  }, [addresses, guestAddressDetails, guestGovernorate, isLoggedIn, selectedAddressId]);

  // إذا كان سعر المنتج أعلى من أو يساوي 200 درهم والعنوان داخل الإمارات، الشحن مجاني
  const actualShipPrice = useMemo(() => {
    const isInUAE = isAddressInUAE(addressToUse);
    // الشحن مجاني فقط إذا كان العنوان داخل الإمارات والسعر >= 200
    if (isInUAE && productPrice >= 200) {
      return 0;
    }
    return ShipPrice;
  }, [productPrice, ShipPrice, addressToUse]);
  
  // ضريبة الدفع عند الاستلام
  const codTax = 0;

  // Discount code states - must be defined before finalPrice useMemo
  const [showDiscountSection, setShowDiscountSection] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountMessage, setDiscountMessage] = useState("");
  const [isDiscountValid, setIsDiscountValid] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0); // 15% discount
  const [shipPriceBeforeDiscount, setShipPriceBeforeDiscount] = useState(ShipPrice);
  const [deliveryTimeDays, setDeliveryTimeDays] = useState(null);

  const finalPrice = useMemo(() => {
    const basePrice = productPrice + actualShipPrice + (paymentMethod === "cod" ? codTax : 0);
    // Apply 15% discount if discount code is applied
    if (discountApplied && discountPercentage > 0) {
      return basePrice * (1 - discountPercentage / 100);
    }
    return basePrice;
  }, [productPrice, actualShipPrice, codTax, paymentMethod, discountApplied, discountPercentage]);

  useEffect(() => {
    // منع الطلبات المكررة
    if (hasFetchedAddresses.current) return;
    hasFetchedAddresses.current = true;
    
    const _fetchAddresses = async () => {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }
      try {
        const Jsonresponse = await fetchAddresses(token);
        const fetchedAddresses = Jsonresponse.addresses;
        if (Object.keys(fetchedAddresses).length > 0) {
          setAddresses(fetchedAddresses);
          setSelectedAddressId(Object.keys(fetchedAddresses)[0]);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error.message);
      }
    };
    _fetchAddresses();
    
    return () => {
      hasFetchedAddresses.current = false;
    };
  }, [isLoggedIn, token]);

  useEffect(() => {
    // منع الطلبات المكررة
    if (hasFetchedShippingAreas.current) return;
    hasFetchedShippingAreas.current = true;
    
    const loadShippingAreas = async () => {
      try {
        const areas = await fetchShippingAreas();
        if (Array.isArray(areas) && areas.length > 0) {
          setShippingAreas(areas);
          const firstArea = normalizeGovernorate(areas[0]);
          if (!isLoggedIn && !guestGovernorate && firstArea) {
            setGuestGovernorate(firstArea);
          }
          if (isLoggedIn && !newAddress.governorate && firstArea) {
            setNewAddress((prev) => ({ ...prev, governorate: firstArea }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch shipping areas:", error.message);
      }
    };
    loadShippingAreas();
    
    return () => {
      hasFetchedShippingAreas.current = false;
    };
  }, [isLoggedIn, guestGovernorate, newAddress.governorate]);

  // Ref للتمرير إلى رسالة الخطأ
  const messageRef = useRef(null);

  useEffect(() => {
    if (message) {
      // التمرير للأعلى عند ظهور رسالة (نجاح أو خطأ)
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // إذا كان هناك ref للرسالة، التمرير إليه
      if (messageRef.current) {
        setTimeout(() => {
          messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [message]);

  useEffect(() => {
    const _fetchShipOrderInfo = async () => {
      try {
        let governorateToUse = isLoggedIn
          ? addresses[selectedAddressId]?.split("-")[0]?.trim()
          : guestGovernorate;

        if (!governorateToUse) return;

        // تحويل النص المترجم إلى النص العربي الأصلي قبل الإرسال
        const arabicGovernorate = getArabicGovernorateName(governorateToUse);
        
        // منع الطلبات المكررة لنفس المحافظة
        if (hasFetchedShipInfo.current === arabicGovernorate) return;
        hasFetchedShipInfo.current = arabicGovernorate;

        const JsonResponse = await fetchShipOrderInfo(token, arabicGovernorate);
        SetShiPrice(JsonResponse.shipPrice);
        setShipPriceBeforeDiscount(JsonResponse.shipPrice);
        setDeliveryTimeDays(JsonResponse.deliveryTimeDays || null);
      } catch (error) {
        console.error(error.message);
        hasFetchedShipInfo.current = null;
      }
    };
    _fetchShipOrderInfo();
  }, [selectedAddressId, addresses, guestGovernorate, isLoggedIn, token]);

  useEffect(() => {
    // منع الطلبات المكررة
    if (hasFetchedClientPhone.current) return;
    hasFetchedClientPhone.current = true;
    
    const _fetchClientPhone = async () => {
      try {
        if (!isLoggedIn) {
          setLoading(false);
          return;
        }
        const JsonResponse = await fetchClientPhone(token);
        setClientPhone(JsonResponse.phoneNumber);
      } catch (error) {
        setShowPhoneModal(true);
      } finally {
        setLoading(false);
      }
    };
    _fetchClientPhone();
    
    return () => {
      hasFetchedClientPhone.current = false;
    };
  }, [isLoggedIn, token]);

  function CreateOrderDetails(OrderId) {
    return {
      productDetailsId: Products.productDetailsId,
      quantity: Products.quantity,
      unitPrice: Products.unitPrice,
      orderId: OrderId,
    };
  }

  const handleStripeCheckout = async () => {
    if (!selectedAddressId || !addresses[selectedAddressId]) {
      setMessage(t("orderSummary.selectAddressForFinal", "يرجى اختيار العنوان لحساب السعر النهائي"));
      return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
      setMessage(t("productDetails.loginRequired", "يجب تسجيل الدخول لمتابعة عملية الشراء."));
      navigate("/Login", { state: { path: "/PurchaseDetails" } });
      return;
    }

    if (!normalizedProducts.length) {
      setMessage(t("payments.notFound", "لم يتم العثور على الطلب، يرجى التواصل مع الدعم."));
      return;
    }

    // تتبع InitiateCheckout لـ Facebook Pixel عند الضغط على زر الشراء
    if (normalizedProducts && normalizedProducts.length > 0) {
      trackInitiateCheckout(normalizedProducts, finalPrice);
    }

    setPurchaseLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}Payments/CreateStripeCheckout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address: addresses[selectedAddressId],
          totalPrice: Number((discountApplied && discountPercentage > 0 
            ? (productPrice + actualShipPrice) * (1 - discountPercentage / 100)
            : productPrice + actualShipPrice).toFixed(2)),
          ShippingCoast: actualShipPrice,
          paymentMethodId: 1,
          currency: "aed",
          fromCart,
          discountCode: discountApplied && discountCode ? discountCode : null,
          products: normalizedProducts.map((item) => ({
            productDetailsId: item.productDetailsId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "فشل تجهيز جلسة الدفع الإلكتروني");
      }

      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("رابط الدفع غير متاح حالياً.");
      }
    } catch (error) {
      setMessage(
        `${t("purchaseDetails.errorMessage", "❌ حدث خطأ أثناء إتمام الطلب. الرجاء المحاولة مرة أخرى.")} ${error.message || ""}`
      );
    } finally {
      setPurchaseLoading(false);
    }
  };

  async function HandleBuyClick() {
    if (paymentMethod === "online") {
      if (!isLoggedIn) {
        setMessage(t("purchaseDetails.loginRequiredForOnline", "يجب تسجيل الدخول لاستخدام الدفع الإلكتروني، أو اختر الدفع عند الاستلام."));
        return;
      }
      await handleStripeCheckout();
      return;
    }

    // COD flow
    const orderAddress = addressToUse;

    if (isLoggedIn && (!selectedAddressId || !addresses[selectedAddressId])) {
      setMessage(t("orderSummary.selectAddressForFinal", "يرجى اختيار العنوان لحساب السعر النهائي"));
      return;
    }

    if (!isLoggedIn) {
      if (!guestInfo.fullName.trim() || !guestInfo.phoneNumber.trim() || !guestAddressDetails.trim()) {
        setMessage(t("purchaseDetails.guestDataRequired", "يرجى إدخال الاسم ورقم الهاتف والعنوان لإتمام الطلب."));
        return;
      }
    }

    setPurchaseLoading(true);

    try {
      if (isLoggedIn) {
        const orderData = {
          address: orderAddress,
          totalPrice: finalPrice,
          ShippingCoast: actualShipPrice,
          paymentMethodId: 2,
          transactionNumber: "",
        };
        const OrderId = await postOrder(token, orderData);
        await startConnection();
        await SendSignalMessageForOrders("new Order" + OrderId);

        if (Array.isArray(Products) && Products.length > 1) {
          await PostListOfOrdersDetails(OrderId, token, Products);
        } else {
          const orderDetails = CreateOrderDetails(OrderId);
          if (orderDetails) {
            await postOrderDetails(token, OrderId, orderDetails);
          }
        }
      } else {
        const productsPayload = normalizedProducts.map((item) => ({
          productDetailsId: item.productDetailsId,
          quantity: item.quantity,
          unitPrice: item.unitPrice ?? item.unitPriceAfterDiscount ?? item.unitPriceBeforeDiscount ?? 0,
        }));

        const guestOrderData = {
          fullName: guestInfo.fullName.trim(),
          phoneNumber: guestInfo.phoneNumber.trim(),
          email: guestInfo.email?.trim() || null,
          address: orderAddress,
          totalPrice: finalPrice,
          shippingCoast: actualShipPrice,
          paymentMethodId: 2,
          transactionNumber: "",
          sessionId: getOrCreateSessionId(),
          products: productsPayload,
        };

        const orderId = await postGuestOrder(guestOrderData);
        await startConnection();
        await SendSignalMessageForOrders("new Order" + orderId);
        playNotificationSound();
      }

      setMessage(
        t("purchaseDetails.successMessage", "✅ تم الطلب بنجاح! يمكنك متابعة طلبك في قسم طلباتي، ولأي خدمة أخرى يمكنك التواصل مع الدعم الفني من خلال قسم تواصل معنا")
      );

      setTimeout(() => {
        setShowSuccessForm(true);
      }, 100);
    } catch (error) {
      console.error("❌ خطأ أثناء إتمام الطلب:", error);
      setMessage(t("purchaseDetails.errorMessage", "❌ حدث خطأ أثناء إتمام الطلب. الرجاء المحاولة مرة أخرى."));
    } finally {
      setPurchaseLoading(false);
    }
  }

  const handleCheckDiscountCode = async () => {
    if (!discountCode.trim()) {
      setDiscountMessage(t("purchaseDetails.enterDiscount", "يرجى إدخال كود الخصم"));
      setIsDiscountValid(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}ShippingDiscountsCodes/verify-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(discountCode.trim()),
        }
      );

      if (response.ok) {
        setIsDiscountValid(true);
        setDiscountMessage(t("purchaseDetails.discountActivated", "تم تفعيل الكود بنجاح! ستحصل على خصم 15% على الفاتورة النهائية."));
        setDiscountApplied(true);
        setDiscountPercentage(15); // Apply 15% discount on final invoice
        alert(t("purchaseDetails.discountActivatedAlert", "تم تفعيل كود الخصم بنجاح. ستحصل على خصم 15% على الفاتورة النهائية."));
      } else {
        const errorData = await response.json();
        setIsDiscountValid(false);
        setDiscountMessage(errorData.message);
        setDiscountApplied(false);
        setDiscountPercentage(0);
      }
    } catch (error) {
      setIsDiscountValid(false);
      setDiscountMessage(error.message);
      setDiscountApplied(false);
      setDiscountPercentage(0);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 text-blue-900 font-semibold">{t("purchaseDetails.loading", "جاري التحميل...")}</div>;

  const brandNavy = "#92278f";
  const brandDeepNavy = "#7a1f75";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-8 px-4" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Helmet>
        <title>{t("purchaseDetails.metaTitle", "تفاصيل الطلب")} | {SiteName} </title>
        <meta
          name="description"
          content={t("purchaseDetails.metaDesc", "تفاصيل الطلب في موقع تابع طلبك وتواصل مع الدعم الفني.")}
        />
      </Helmet>

      {showSuccessForm && (
        <SuccessForm
          message={message}
          onClose={() => {
            setShowSuccessForm(false);
          }}
          discountCode={null}
          showDiscountCode={false}
        />
      )}

      {message && !showSuccessForm && (
        <div
          ref={messageRef}
          className={`max-w-4xl mx-auto mb-6 p-4 rounded-lg text-white text-center font-bold ${
            message.startsWith("✅") ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {message}
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div
          className="py-6 px-6 flex items-center justify-center gap-4 flex-wrap"
          style={{ background: `linear-gradient(120deg, ${brandNavy}, ${brandDeepNavy})` }}
        >
          <WebSiteLogo
            width={lang === "ar" ? 130 : 150}
            height={48}
            className="object-contain drop-shadow-lg"
          />
          <h1 className="text-2xl font-bold text-white text-center">{t("purchaseDetails.title", "تفاصيل الطلب")}</h1>
        </div>

        <div className="p-6 space-y-6">
          {!isLoggedIn && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 space-y-4">
              <h3 className="text-xl font-bold text-blue-900">
                {t("purchaseDetails.guestInfo", "بيانات الزائر")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-blue-900 font-semibold">
                    {t("purchaseDetails.fullName", "الاسم بالكامل")}
                  </label>
                  <input
                    type="text"
                    value={guestInfo.fullName}
                    onChange={(e) => setGuestInfo({ ...guestInfo, fullName: e.target.value })}
                    className="w-full p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder={t("purchaseDetails.fullNamePlaceholder", "اكتب اسمك كما سيظهر في الطلب")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-blue-900 font-semibold">
                    {t("purchaseDetails.phoneNumber", "رقم الهاتف")}
                  </label>
                  <input
                    type="tel"
                    value={guestInfo.phoneNumber}
                    onChange={(e) => setGuestInfo({ ...guestInfo, phoneNumber: e.target.value })}
                    className="w-full p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder={t("purchaseDetails.phonePlaceholder", "مثال: 05XXXXXXXX")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-blue-900 font-semibold">
                    {t("purchaseDetails.email", "البريد الإلكتروني (اختياري)")}
                  </label>
                  <input
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                    className="w-full p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder={t("purchaseDetails.emailPlaceholder", "example@email.com")}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-blue-900 font-semibold">
                    {t("purchaseDetails.governorate", "المحافظة / الإمارة")}
                  </label>
                  <select
                    value={guestGovernorate}
                    onChange={(e) => setGuestGovernorate(e.target.value)}
                    className="w-full p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {governorateOptions.map((gov) => (
                      <option key={gov} value={gov}>
                        {t(`emirates.${gov}`, gov)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-blue-900 font-semibold">
                  {t("purchaseDetails.fullAddress", "العنوان بالتفصيل")}
                </label>
                <textarea
                  value={guestAddressDetails}
                  onChange={(e) => setGuestAddressDetails(e.target.value)}
                  className="w-full p-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 min-h-[90px]"
                  placeholder={t("purchaseDetails.addressPlaceholder", "المدينة - الشارع - تفاصيل إضافية")}
                />
                <p className="text-sm text-blue-700">
                  {t("purchaseDetails.guestHint", "سنستخدم هذه البيانات لشحن الطلب وعرضه في لوحة الطلبات للمشرفين.")}
                </p>
              </div>
            </div>
          )}

          {isLoggedIn && (
            <AddressSelector
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              setSelectedAddressId={setSelectedAddressId}
              setShowAddAddressModal={setShowAddAddressModal}
              showAddAddressModal={showAddAddressModal}
              newAddress={newAddress}
              setNewAddress={setNewAddress}
              setAddresses={setAddresses}
              shippingAreas={shippingAreas}
            />
          )}

          {isLoggedIn && (
            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-200">
              <span className="text-blue-900 font-semibold">{t("purchaseDetails.yourPhone", "هاتفك للاتصال")}:</span>
              <button
                onClick={() => setShowPhoneModal(true)}
                className="text-orange-600 hover:text-orange-700 font-medium underline"
              >
                {clientPhone}
              </button>
            </div>
          )}

          <div className="bg-blue-900 py-3 px-4 rounded-lg flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">{t("purchaseDetails.shippingDetails", "تفاصيل الشحنة")}</h3>
            <CurrencySelector />
          </div>
          
          <OrderSummary 
            Products={Products} 
            ShipPrice={actualShipPrice} 
            isFreeShipping={isAddressInUAE(addressToUse) && productPrice >= 200 && actualShipPrice === 0}
            guestName={!isLoggedIn ? guestInfo.fullName : undefined}
          />

          <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-200">
            <span className="text-blue-900 font-semibold">{t("purchaseDetails.shipTo", "شحن إلى")}:</span>
            <span className="text-blue-800 font-medium">
              {addressToUse || t("orderSummary.selectAddress", "يرجى اختيار العنوان أولاً")}
            </span>
          </div>



          <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-blue-900 font-semibold">
                {t("purchaseDetails.deliveryDeadline", "الموعد النهائي للاستلام")}:
              </span>
              <span className="text-blue-800 font-medium">
                {deliveryTimeDays !== null ? (
                  <span>
                    {deliveryTimeDays} {t("purchaseDetails.days", "يوم")}
                  </span>
                ) : (
                  getDeliveryDate(lang === "en" ? "en" : "ar")
                )}
              </span>
            </div>
            <p className="text-sm text-blue-700">
              {deliveryTimeDays !== null ? (
                `${t("purchaseDetails.estimatedDeliveryTime", "الوقت المتوقع للوصول حسب المنطقة المحددة")}: ${deliveryTimeDays} ${t("purchaseDetails.days", "يوم")}`
              ) : (
                t(
                  "purchaseDetails.deliveryTimeDescription",
                  "سيصل الطلب خلال ساعات قليلة أو ربما دقائق حسب وزن الشحنة"
                )
              )}
            </p>
          </div>

          {/* Checkbox لإظهار قسم الخصم */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <label className={`flex items-center cursor-pointer ${lang === "ar" ? "space-x-3 space-x-reverse" : "space-x-3"}`}>
              <input
                type="checkbox"
                checked={showDiscountSection}
                onChange={(e) => setShowDiscountSection(e.target.checked)}
                className="w-5 h-5 text-orange-500 focus:ring-orange-500 rounded"
              />
              <span className="text-blue-900 font-semibold">
                {lang === "ar" ? "لدي خصم" : "I have discount code"}
              </span>
            </label>
          </div>

          {/* قسم الخصم - يظهر فقط عند تفعيل checkbox */}
          {showDiscountSection && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg space-y-3">
              <label htmlFor="discountCode" className="block text-orange-800 font-semibold">
                {t("purchaseDetails.discountCode", "كود الخصم")}:
              </label>
              <input
                type="text"
                id="discountCode"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder={t("purchaseDetails.enterDiscountCode", "أدخل كود الخصم هنا")}
                className="w-full p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-red-500 text-sm">
                {t("purchaseDetails.discountWarning", "لا تضغط علي تحقق ان كنت لن تشتري لانه سيتم تفعيل الخصم والغاء صلاحيه الكود")}
              </p>
              {!discountApplied && (
                <button 
                  onClick={handleCheckDiscountCode}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                >
                  {t("purchaseDetails.verify", "تحقق")}
                </button>
              )}
              {discountMessage && (
                <div
                  className={`p-3 rounded-lg font-medium ${
                    isDiscountValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {discountMessage}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-blue-900 py-3 px-4 rounded-lg">
              <h3 className="text-xl font-bold text-white">{t("purchaseDetails.paymentMethods", "طرق الدفع")}</h3>
            </div>
            
            <div className="space-y-3">
              <label className={`flex items-center p-3 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer ${lang === "ar" ? "space-x-3 space-x-reverse" : "space-x-3"}`}>
                <input
                  type="radio"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <span className="text-blue-900 font-medium">{t("purchaseDetails.onlinePayment", "الدفع الإلكتروني")}</span>
              </label>
              {paymentMethod === "online" && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                  {discountApplied && discountPercentage > 0 && (
                    <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg border border-green-200">
                      <span className="text-green-800 font-semibold">{lang === "ar" ? "خصم 15%" : "15% Discount"}:</span>
                      <strong className="text-green-700 text-lg">-{format((productPrice + actualShipPrice) * (discountPercentage / 100))}</strong>
                    </div>
                  )}
                  <div className="flex justify-between items-center bg-white p-3 rounded-lg">
                    <span className="text-blue-900 font-semibold">{t("purchaseDetails.finalPrice", "السعر النهائي")}:</span>
                    <strong className="text-orange-600 text-lg">{format(finalPrice)}</strong>
                  </div>
            
                </div>
              )}

              <label className={`flex items-center p-3 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer ${lang === "ar" ? "space-x-3 space-x-reverse" : "space-x-3"}`}>
                <input
                  type="radio"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="text-orange-500 focus:ring-orange-500"
                />
                <span className="text-blue-900 font-medium">{t("purchaseDetails.codPayment", "الدفع عند الاستلام")}</span>
              </label>
              {paymentMethod === "cod" && (
                <div className={`bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3 ${lang === "ar" ? "space-x-3 space-x-reverse" : "space-x-3"}`}>
                  <div className="flex items-center gap-3">
                    <img
                      src="/Icons/الدفع-عند-الاستلام.ico"
                      alt="Cash on Delivery"
                      title="Cash on Delivery"
                      className="w-12 h-12"
                    />
                    <div className="flex justify-between items-center bg-white p-3 rounded-lg flex-1">
                      <span className="text-blue-900 font-semibold">{t("purchaseDetails.codTax", "ضريبة الدفع عند الاستلام")}:</span>
                      <strong className="text-orange-600">{format(codTax)}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {discountApplied && discountPercentage > 0 && (
            <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 border-2 border-green-300 mb-3">
              <span className="text-green-800 font-bold text-lg">{lang === "ar" ? "🎉 خصم 15% على الفاتورة النهائية" : "🎉 15% Discount on Final Invoice"}:</span>
              <strong className="text-green-700 text-xl">-{format((productPrice + actualShipPrice + (paymentMethod === "cod" ? codTax : 0)) * (discountPercentage / 100))}</strong>
            </div>
          )}
          <div className="flex justify-between items-center p-4 rounded-lg text-white" style={{ background: 'linear-gradient(to right, #f97316, #ea580c)' }}>
            <span className="text-lg font-bold" style={{ color: 'white' }}>{t("purchaseDetails.finalPrice", "السعر النهائي")}:</span>
            <strong className="text-2xl" style={{ color: 'white' }}>{format(finalPrice)}</strong>
          </div>

          {showPhoneModal && (
            <PhoneNumberModal
              setShowPhoneModal={setShowPhoneModal}
              setClientPhone={setClientPhone}
              newPhoneNumber={newPhoneNumber}
              setNewPhoneNumber={setNewPhoneNumber}
            />
          )}

          <button
            className={`w-full text-white font-bold py-4 px-6 rounded-lg text-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              paymentMethod === "online"
                ? "bg-[#92278f] hover:bg-[#7a1f75]"
                : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            }`}
            onClick={HandleBuyClick}
            disabled={purchaseLoading}
            style={{ color: 'white' }}
            type="button"
          >
            <span className="text-white" style={{ color: 'white' }}>
              {purchaseLoading
                ? t("purchaseDetails.processing", "جاري المعالجة...")
                : paymentMethod === "online"
                ? t("purchaseDetails.buyNow", "شراء")
                : t("purchaseDetails.completePurchase", "اتمام الشراء")}
            </span>
          </button>

          {purchaseLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className={`bg-white p-6 rounded-lg flex items-center ${lang === "ar" ? "space-x-3 space-x-reverse" : "space-x-3"}`}>
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-900 font-medium">{t("purchaseDetails.processingOrder", "جاري معالجة طلبك...")}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}