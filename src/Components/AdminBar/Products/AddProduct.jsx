import { useState, useEffect } from "react";
import API_BASE_URL from "../../Constant";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiPackage, FiTag, FiDollarSign, FiPercent, FiInfo, FiArrowRight } from "react-icons/fi";
import WebSiteLogo from "../../WebsiteLogo/WebsiteLogo.jsx";
import { useI18n } from "../../i18n/I18nContext";

export default function AddProduct() {
  const { t } = useI18n();
  const [productNameAr, setProductNameAr] = useState("");
  const [productNameEn, setProductNameEn] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [discountType, setDiscountType] = useState("percentage"); // "percentage" or "amount"
  const [categoryName, setCategoryName] = useState("");
  const [moreDetailsAr, setMoreDetailsAr] = useState("");
  const [moreDetailsEn, setMoreDetailsEn] = useState("");
  const [shortNameAr, setShortNameAr] = useState("");
  const [shortNameEn, setShortNameEn] = useState("");
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [productVideoUrl, setProductVideoUrl] = useState("");
  const [productVideoFile, setProductVideoFile] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [message]);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    fetch(`${API_BASE_URL}Product/GetCategoriesNames`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(t("addProduct.errors.fetchCategories", "فشل جلب أسماء التصنيفات"));
        }
        return res.json();
      })
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // حساب نسبة الخصم النهائية
    let finalDiscountPercentage = 0;
    if (discountType === "percentage") {
      finalDiscountPercentage = Number(discountPercentage);
    } else {
      const price = parseFloat(productPrice);
      const discountAmount = parseFloat(discountPercentage);
      if (price > 0) {
        finalDiscountPercentage = (discountAmount / price) * 100;
      }
    }

    let finalVideoUrl = (productVideoUrl || "").trim();
    if (productVideoFile && !uploadingVideo) {
      setUploadingVideo(true);
      try {
        const fd = new FormData();
        fd.append("videoFile", productVideoFile);
        const token = sessionStorage.getItem("token");
        const uploadRes = await fetch(`${API_BASE_URL}Product/UploadProductVideo`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: fd,
        });
        if (uploadRes.ok) {
          const up = await uploadRes.json();
          if (up.videoUrl) finalVideoUrl = up.videoUrl;
        }
      } catch (_) {}
      setUploadingVideo(false);
    }

    const newProduct = {
      productId: 0,
      productNameAr,
      productNameEn,
      shortNameAr,
      shortNameEn,
      productPrice: Number(productPrice),
      discountPercentage: finalDiscountPercentage,
      categoryName,
      moreDetailsAr,
      moreDetailsEn,
      isFeatured,
      productVideoUrl: finalVideoUrl || undefined,
    };

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}Product/PostProduct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) {
        throw new Error("فشل في إضافة المنتج");
      }

      const data = await response.json();
      setMessage(t("addProduct.successMessage", "تمت إضافة المنتج بنجاح. رقم المنتج: {{id}}").replace("{{id}}", data.id ?? data.productId ?? ""));
      setMessageType("success");
      navigate("/admins/AddProductDetails", { state: { productId: data.id } });
    } catch (error) {
      setMessage(`${t("addProduct.errorPrefix", "خطأ")}: ${error.message}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscountChange = (e) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value)) {
      setDiscountPercentage("");
      return;
    }
    if (discountType === "percentage") {
      setDiscountPercentage(Math.max(0, Math.min(100, value)));
    } else {
      const price = parseFloat(productPrice);
      if (!isNaN(price) && price > 0) {
        setDiscountPercentage(Math.max(0, Math.min(price, value)));
      } else {
        setDiscountPercentage(value >= 0 ? value : "");
      }
    }
  };

  // حساب السعر بعد الخصم
  const calculatePriceAfterDiscount = () => {
    if (!productPrice || !discountPercentage) return null;
    const price = parseFloat(productPrice);
    const discount = parseFloat(discountPercentage);
    if (isNaN(price) || isNaN(discount)) return null;
    
    let priceAfterDiscount;
    if (discountType === "percentage") {
      priceAfterDiscount = price - (price * (discount / 100));
    } else {
      priceAfterDiscount = price - discount;
    }
    
    return priceAfterDiscount > 0 ? priceAfterDiscount.toFixed(2) : 0;
  };

  // حساب نسبة الخصم للعرض
  const calculateDiscountPercentage = () => {
    if (!productPrice || !discountPercentage) return null;
    const price = parseFloat(productPrice);
    const discount = parseFloat(discountPercentage);
    if (isNaN(price) || isNaN(discount) || price === 0) return null;
    
    if (discountType === "percentage") {
      return discount.toFixed(2);
    } else {
      return ((discount / price) * 100).toFixed(2);
    }
  };

  const priceAfterDiscount = calculatePriceAfterDiscount();

  const primaryButtonClasses =
    "w-full bg-[#0A2C52] hover:bg-[#13345d] disabled:bg-gray-400 disabled:hover:bg-gray-400 disabled:text-white/70 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-1 disabled:transform-none shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2 disabled:cursor-not-allowed";

  return (
    <div className="min-h-screen bg-[#F9F6EF] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-[#F9F6EF] rounded-2xl p-4 md:p-6 mb-5 shadow-lg border border-[#0A2C52]/20">
          <div className="flex flex-col items-center mb-4">
            <WebSiteLogo width={300} height={100} className="mb-4" />
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="bg-[#F55A00] p-3 rounded-full">
              <FiPlus className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2C52] tracking-wide text-center">
                {t("addProduct.formTitle", "إضافة منتج جديد")}
              </h1>
              <p className="text-[#0A2C52]/80 mt-1 text-center">
                {t("addProduct.formSubtitle", "أضف منتج جديد إلى المتجر")}
              </p>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`rounded-2xl p-4 mb-6 shadow-lg ${
              messageType === "success"
                ? "bg-green-100 border border-green-200 text-green-800"
                : "bg-red-100 border border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {messageType === "success" ? (
                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                  <FiPlus className="text-white" size={14} />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                  <span className="text-white text-sm">!</span>
                </div>
              )}
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-6">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-blue-900 font-semibold">{t("addProduct.loadingTitle", "جاري إضافة المنتج...")}</p>
              <p className="text-gray-600 text-sm mt-2">{t("addProduct.loadingHint", "يرجى الانتظار")}</p>
            </div>
          </div>
        )}

        {/* Form */}
        {!loading && (
          <div className="bg-[#F9F6EF] rounded-2xl shadow-lg p-6 border border-[#0A2C52]/20">
            <form onSubmit={handleSubmit}>
              {/* Product Name Arabic */}
              <div className="mb-6">
                <label htmlFor="productNameAr" className="block text-lg font-bold text-[#0A2C52] mb-3 flex items-center gap-2">
                  <FiPackage className="text-[#F55A00]" size={20} />
                  {t("addProduct.fields.productNameAr", "اسم المنتج (عربي)")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="productNameAr"
                  name="productNameAr"
                  value={productNameAr}
                  onChange={(e) => setProductNameAr(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full p-4 border-2 border-[#0A2C52]/30 rounded-xl focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-200 bg-white placeholder-gray-500"
                  placeholder={t("addProduct.placeholders.productNameAr", "أدخل اسم المنتج بالعربية")}
                />
              </div>

              {/* Product Name English */}
              <div className="mb-6">
                <label htmlFor="productNameEn" className="block text-lg font-bold text-[#0A2C52] mb-3 flex items-center gap-2">
                  <FiPackage className="text-[#F55A00]" size={20} />
                  {t("addProduct.fields.productNameEn", "اسم المنتج (إنجليزي)")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="productNameEn"
                  name="productNameEn"
                  value={productNameEn}
                  onChange={(e) => setProductNameEn(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full p-4 border-2 border-[#0A2C52]/30 rounded-xl focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-200 bg-white placeholder-gray-500"
                  placeholder={t("addProduct.placeholders.productNameEn", "Enter product name in English")}
                />
              </div>

              {/* Short Name Arabic */}
              <div className="mb-6">
                <label htmlFor="shortNameAr" className="block text-lg font-bold text-[#0A2C52] mb-3 flex items-center gap-2">
                  <FiPackage className="text-[#F55A00]" size={20} />
                  {t("addProduct.fields.shortNameAr", "الاسم المختصر (عربي)")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="shortNameAr"
                  name="shortNameAr"
                  value={shortNameAr}
                  onChange={(e) => setShortNameAr(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full p-4 border-2 border-[#0A2C52]/30 rounded-xl focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-200 bg-white placeholder-gray-500"
                  placeholder={t("addProduct.placeholders.shortNameAr", "مثال: تيشيرت رجالي")}
                />
              </div>

              {/* Short Name English */}
              <div className="mb-6">
                <label htmlFor="shortNameEn" className="block text-lg font-bold text-[#0A2C52] mb-3 flex items-center gap-2">
                  <FiPackage className="text-[#F55A00]" size={20} />
                  {t("addProduct.fields.shortNameEn", "Short Name (English)")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="shortNameEn"
                  name="shortNameEn"
                  value={shortNameEn}
                  onChange={(e) => setShortNameEn(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full p-4 border-2 border-[#0A2C52]/30 rounded-xl focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-200 bg-white placeholder-gray-500"
                  placeholder={t("addProduct.placeholders.shortNameEn", "e.g. Men's Tee")}
                />
              </div>

              {/* Product Price */}
              <div className="mb-6">
                <label htmlFor="productPrice" className="block text-lg font-bold text-[#0A2C52] mb-3 flex items-center gap-2">
                  <FiDollarSign className="text-[#F55A00]" size={20} />
                  {t("addProduct.fields.productPrice", "سعر المنتج")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="productPrice"
                  name="productPrice"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  required
                  disabled={loading}
                  min="0"
                  step="0.01"
                  className="w-full p-4 border-2 border-[#0A2C52]/30 rounded-xl focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-200 bg-white placeholder-gray-500"
                  placeholder={t("addProduct.placeholders.productPrice", "أدخل سعر المنتج")}
                />
              </div>

              {/* Discount */}
              <div className="mb-6">
                <label htmlFor="discountPercentage" className="block text-lg font-bold text-[#0A2C52] mb-3 flex items-center gap-2">
                  <FiPercent className="text-[#F55A00]" size={20} />
                  {t("addProduct.fields.discountPercentage", "الخصم")} <span className="text-red-500">*</span>
                </label>
                
                {/* Discount Type Selector */}
                <div className="mb-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountType("percentage");
                      setDiscountPercentage("");
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      discountType === "percentage"
                        ? "bg-[#0A2C52] text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {t("addProduct.discountType.percentage", "نسبة مئوية")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountType("amount");
                      setDiscountPercentage("");
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      discountType === "amount"
                        ? "bg-[#0A2C52] text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {t("addProduct.discountType.amount", "مبلغ ثابت")}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    id="discountPercentage"
                    name="discountPercentage"
                    min="0"
                    step={discountType === "percentage" ? "0.01" : "0.01"}
                    max={discountType === "percentage" ? "100" : undefined}
                    value={discountPercentage}
                    onChange={handleDiscountChange}
                    required
                    disabled={loading}
                    className="w-full p-4 border-2 border-[#0A2C52]/30 rounded-xl focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-200 bg-white placeholder-gray-500 pr-12"
                    placeholder={discountType === "percentage" ? t("addProduct.placeholders.discountPercentage", "0 - 100") : t("addProduct.placeholders.discountAmount", "أدخل مبلغ الخصم")}
                  />
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#0A2C52] font-semibold">
                    {discountType === "percentage" ? "%" : "د.إ"}
                  </span>
                </div>
                
                {/* عرض تفاصيل الخصم */}
                {productPrice && discountPercentage && parseFloat(discountPercentage) > 0 && (
                  <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-blue-800 font-semibold text-sm">
                          {t("addProduct.discountDetails.originalPrice", "السعر الأصلي:")}
                        </span>
                        <span className="text-blue-900 font-bold">
                          {parseFloat(productPrice).toFixed(2)} د.إ
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-blue-800 font-semibold text-sm">
                          {discountType === "percentage" 
                            ? t("addProduct.discountDetails.discountPercentage", "نسبة الخصم:")
                            : t("addProduct.discountDetails.discountAmount", "مبلغ الخصم:")}
                        </span>
                        <span className="text-blue-900 font-bold">
                          {discountType === "percentage" 
                            ? `${parseFloat(discountPercentage).toFixed(2)}%`
                            : `${parseFloat(discountPercentage).toFixed(2)} د.إ`}
                        </span>
                      </div>
                      {discountType === "amount" && (
                        <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                          <span className="text-blue-800 font-semibold text-sm">
                            {t("addProduct.discountDetails.equivalentPercentage", "ما يعادل:")}
                          </span>
                          <span className="text-blue-900 font-bold">
                            {calculateDiscountPercentage()}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* عرض السعر بعد الخصم */}
                {priceAfterDiscount && parseFloat(discountPercentage) > 0 && (
                  <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="text-green-600" size={20} />
                        <span className="text-green-800 font-semibold">
                          {t("addProduct.discountSummary.afterLabel", "السعر بعد الخصم:")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 line-through text-sm">
                          {parseFloat(productPrice).toFixed(2)} د.إ
                        </span>
                        <span className="text-2xl font-bold text-green-700">
                          {priceAfterDiscount} د.إ
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-green-200">
                      <span className="text-sm text-green-700">
                        {t("addProduct.discountSummary.savingLabel", "توفير")}:{" "}
                        {(parseFloat(productPrice) - parseFloat(priceAfterDiscount)).toFixed(2)} د.إ
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Category Selection */}
              <div className="mb-6">
                <label htmlFor="categoryName" className="block text-lg font-bold text-[#0A2C52] mb-3 flex items-center gap-2">
                  <FiTag className="text-[#F55A00]" size={20} />
                  {t("addProduct.fields.category", "التصنيف")} <span className="text-red-500">*</span>
                </label>
                <select
                  id="categoryName"
                  name="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full p-4 border-2 border-[#0A2C52]/30 rounded-xl focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-200 bg-white"
                >
                  <option value="">{t("addProduct.placeholders.category", "اختر تصنيف المنتج")}</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryNameAr}>
                      {`${cat.categoryNameAr} / ${cat.categoryNameEn}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6 flex items-center justify-between">
                <span className="text-lg font-bold text-[#0A2C52]">
                  {t("addProduct.fields.featured", "عرض المنتج في الصفحة الرئيسية:")}
                </span>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-orange-300 transition after:content-[''] after:absolute after:h-5 after:w-5 after:bg-white after:rounded-full after:transition-all peer-checked:bg-orange-500 relative"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700">
                    {isFeatured ? t("general.yes", "نعم") : t("general.no", "لا")}
                  </span>
                </label>
              </div>

              {/* More Details Arabic */}
              <div className="mb-6">
                <label htmlFor="moreDetailsAr" className="block text-lg font-bold text-[#0A2C52] mb-3 flex items-center gap-2">
                  <FiInfo className="text-[#F55A00]" size={20} />
                  {t("addProduct.fields.moreDetailsAr", "التفاصيل الإضافية (عربي)")} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="moreDetailsAr"
                  name="moreDetailsAr"
                  value={moreDetailsAr}
                  onChange={(e) => setMoreDetailsAr(e.target.value)}
                  required
                  disabled={loading}
                  rows="4"
                  className="w-full p-4 border-2 border-[#0A2C52]/30 rounded-xl focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-200 bg-white placeholder-gray-500 resize-none"
                  placeholder={t("addProduct.placeholders.moreDetailsAr", "أدخل تفاصيل إضافية عن المنتج بالعربية...")}
                ></textarea>
              </div>

              {/* More Details English */}
              <div className="mb-8">
                <label htmlFor="moreDetailsEn" className="block text-lg font-bold text-[#0A2C52] mb-3 flex items-center gap-2">
                  <FiInfo className="text-[#F55A00]" size={20} />
                  {t("addProduct.fields.moreDetailsEn", "التفاصيل الإضافية (إنجليزي)")} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="moreDetailsEn"
                  name="moreDetailsEn"
                  value={moreDetailsEn}
                  onChange={(e) => setMoreDetailsEn(e.target.value)}
                  required
                  disabled={loading}
                  rows="4"
                  className="w-full p-4 border-2 border-[#0A2C52]/30 rounded-xl focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-200 bg-white placeholder-gray-500 resize-none"
                  placeholder={t("addProduct.placeholders.moreDetailsEn", "Enter additional product details in English...")}
                ></textarea>
              </div>

              {/* Product Video (optional) */}
              <div className="mb-6">
                <label htmlFor="productVideoUrl" className="block text-lg font-bold text-[#0A2C52] mb-3 flex items-center gap-2">
                  <FiInfo className="text-[#F55A00]" size={20} />
                  {t("addProduct.fields.productVideoUrl", "رابط فيديو المنتج (اختياري)")}
                </label>
                <input
                  type="url"
                  id="productVideoUrl"
                  value={productVideoUrl}
                  onChange={(e) => setProductVideoUrl(e.target.value)}
                  disabled={loading}
                  className="w-full p-4 border-2 border-[#0A2C52]/30 rounded-xl focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-200 bg-white placeholder-gray-500 mb-2"
                  placeholder="https://..."
                />
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  className="w-full p-3 border-2 border-[#0A2C52]/30 rounded-xl bg-white text-sm text-[#0A2C52]"
                  onChange={(e) => setProductVideoFile(e.target.files?.[0] || null)}
                />
                {productVideoFile && <p className="text-sm text-gray-600 mt-1">{t("addProduct.videoFileSelected", "سيتم رفع الفيديو عند الحفظ")}: {productVideoFile.name}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || uploadingVideo}
                className={`${primaryButtonClasses} ${loading || uploadingVideo ? "opacity-80 cursor-wait" : ""}`}
              >
                {(loading || uploadingVideo) ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {uploadingVideo ? t("addProduct.button.uploadingVideo", "جاري رفع الفيديو...") : t("addProduct.button.loading", "جاري الإضافة...")}
                  </>
                ) : (
                  <>
                    <FiPlus size={20} />
                    {t("addProduct.button.submit", "إضافة المنتج")}
                    <FiArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-[#F9F6EF] rounded-2xl p-6 mt-6 border border-[#0A2C52]/20">
          <div className="flex items-start gap-3">
            <div className="bg-[#0A2C52] p-2 rounded-full mt-1">
              <FiInfo className="text-white" size={16} />
            </div>
            <div>
              <h3 className="font-bold text-[#0A2C52] mb-2">
                {t("addProduct.infoCard.title", "معلومات مهمة")}
              </h3>
              <ul className="text-[#0A2C52] text-sm space-y-1">
                <li>• {t("addProduct.infoCard.line1", "سيتم نقلك تلقائياً لإضافة تفاصيل المنتج بعد الإضافة")}</li>
                <li>• {t("addProduct.infoCard.line2", "يمكنك إضافة الألوان والمقاسات والصور في الخطوة التالية")}</li>
                <li>• {t("addProduct.infoCard.line3", "تأكد من صحة البيانات قبل الإرسال")}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}