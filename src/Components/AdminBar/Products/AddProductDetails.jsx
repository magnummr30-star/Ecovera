import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API_BASE_URL, { ServerPath } from "../../Constant";
import { colors, sizes } from "../../utils";
import { FiPlus, FiImage, FiCheck, FiArrowRight, FiUpload, FiInfo } from "react-icons/fi";
import WebSiteLogo from "../../WebsiteLogo/WebsiteLogo.jsx";
import { useI18n } from "../../i18n/I18nContext";
import { addCompanyLogoToProductImage } from "../../../utils/productWatermark";

export default function AddProductDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  // استلام productId من الصفحة السابقة
  const { productId } = location.state || {};
  if (!productId) {
    return (
      <div className="min-h-screen bg-[#F9F6EF] flex items-center justify-center">
        <div className="bg-[#F9F6EF] rounded-2xl shadow-xl p-8 text-center max-w-md border border-[#0A2C52]/20">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPlus className="text-red-600" size={24} />
          </div>
          <h3 className="text-xl font-bold text-[#0A2C52] mb-2">
            {t("addProductDetails.noProductTitle", "خطأ في البيانات")}
          </h3>
          <p className="text-[#0A2C52]/80 mb-6">
            {t("addProductDetails.noProductDesc", "لا يوجد معرف للمنتج. الرجاء العودة والمحاولة مرة أخرى.")}
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-[#0A2C52] to-[#0A2C52] hover:from-[#13345d] hover:to-[#0A2C52] text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
          >
            {t("general.back", "العودة")}
          </button>
        </div>
      </div>
    );
  }

  // حالات النموذج
  const [colorId, setColorId] = useState("");
  const [sizeId, setSizeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [productImage, setProductImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [localPreviewUrls, setLocalPreviewUrls] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [detailsAdded, setDetailsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usePreviousImage, setUsePreviousImage] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");

  const fileInputRef = useRef(null);
  const multipleFilesInputRef = useRef(null);
  const baseButtonClasses =
    "bg-[#0A2C52] hover:bg-[#13345d] text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:text-white/80 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2";
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [message]);

  // دالة رفع الصورة إلى الخادم
  const handleImageUpload = async (file) => {
    const token = sessionStorage.getItem("token");
    const formData = new FormData();
    formData.append("imageFile", file);
    try {
      const response = await fetch(
        `${API_BASE_URL}Product/UploadProductImage`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("فشل رفع الصورة");
      }
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return "";
    }
  };

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
      localPreviewUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [localPreviewUrl, localPreviewUrls]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const stampedFile = await addCompanyLogoToProductImage(file);
      setSelectedFile(stampedFile);
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
      const preview = URL.createObjectURL(stampedFile);
      setLocalPreviewUrl(preview);
      setMessage(t("addProductDetails.messages.watermarkAdded", "تم إضافة شعار المتجر إلى الصورة تلقائياً قبل رفعها."));
      setMessageType("info");
    } catch (error) {
      console.error("Watermark error:", error);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      setMessage(error.message || t("addProductDetails.messages.watermarkFailed", "تعذر تجهيز الصورة. الرجاء المحاولة مرة أخرى."));
      setMessageType("error");
    }
  };

  // دالة معالجة رفع صور متعددة
  const handleMultipleFilesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const stampedFiles = [];
      const previewUrls = [];

      for (const file of files) {
        const stampedFile = await addCompanyLogoToProductImage(file);
        stampedFiles.push(stampedFile);
        previewUrls.push(URL.createObjectURL(stampedFile));
      }

      setSelectedFiles([...selectedFiles, ...stampedFiles]);
      setLocalPreviewUrls([...localPreviewUrls, ...previewUrls]);
      setMessage(t("addProductDetails.messages.multipleImagesAdded", `تم إضافة ${files.length} صورة مع شعار المتجر.`).replace("{count}", files.length));
      setMessageType("info");
    } catch (error) {
      console.error("Watermark error:", error);
      setMessage(error.message || t("addProductDetails.messages.watermarkFailed", "تعذر تجهيز الصورة. الرجاء المحاولة مرة أخرى."));
      setMessageType("error");
    }
  };

  // دالة حذف صورة من القائمة
  const removeImage = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = localPreviewUrls.filter((_, i) => i !== index);
    
    if (localPreviewUrls[index]) {
      URL.revokeObjectURL(localPreviewUrls[index]);
    }
    
    setSelectedFiles(newFiles);
    setLocalPreviewUrls(newUrls);
  };

  // دالة إرسال تفاصيل المنتج
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    let uploadedImageUrl = productImage;
    if (selectedFile) {
      uploadedImageUrl = await handleImageUpload(selectedFile);
      if (!uploadedImageUrl) {
        setMessage(t("addProductDetails.messages.uploadFailed", "فشل رفع الصورة. الرجاء المحاولة مرة أخرى."));
        setMessageType("error");
        setIsLoading(false);
        return;
      }
      setProductImage(uploadedImageUrl);
    }
    
    const productDetails = {
      productDetailsId: 0,
      productId: productId,
      colorId: Number(colorId),
      sizeId: Number(sizeId),
      quantity: Number(quantity),
      productImage: uploadedImageUrl,
    };

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}Product/PostProductDetails`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(productDetails),
        }
      );

      if (!response.ok) {
        throw new Error("فشل إضافة تفاصيل المنتج");
      }

      const data = await response.json();
      const productDetailsId = data.id || data.Id;

      // رفع الصور الإضافية
      if (selectedFiles.length > 0 && productDetailsId) {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const imageUrl = await handleImageUpload(file);
          if (imageUrl) {
            await fetch(`${API_BASE_URL}Product/AddProductDetailImage`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                productDetailsId: productDetailsId,
                imageUrl: imageUrl,
                displayOrder: i + 1,
              }),
            });
          }
        }
      }

      setMessage(t("addProductDetails.messages.addSuccess", "تمت الإضافة بنجاح ✓"));
      setMessageType("success");
      setDetailsAdded(true);
      
      // إعادة ضبط الحقول بعد الإضافة
      setColorId("");
      setSizeId("");
      setQuantity(1);
      setSelectedFile(null);
      setSelectedFiles([]);
      localPreviewUrls.forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
      setLocalPreviewUrls([]);
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
        setLocalPreviewUrl("");
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      if (multipleFilesInputRef.current) {
        multipleFilesInputRef.current.value = null;
      }
    } catch (error) {
      setMessage(`${t("addProductDetails.messages.errorPrefix", "خطأ")}: ${error.message}`);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  // زر "أضف تفاصيل أخرى" يعيد المستخدم إلى نفس النموذج
  const handleAddMore = () => {
    setDetailsAdded(false);
    setMessage("");
    setMessageType("");
    setSelectedFile(null);
    setSelectedFiles([]);
    localPreviewUrls.forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
    setLocalPreviewUrls([]);
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl("");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    if (multipleFilesInputRef.current) {
      multipleFilesInputRef.current.value = null;
    }
  };

  // زر "إنهاء" ينقل المستخدم إلى صفحة أخرى
  const handleFinish = () => {
    navigate(`/productDetails/${productId}`);
  };

  return (
    <div className="min-h-screen bg-[#F9F6EF] py-4 sm:py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header - Compact */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border border-[#0A2C52]/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#F55A00] p-2.5 rounded-xl">
                <FiPlus className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#0A2C52]">
                  {t("addProductDetails.headerTitle", "إضافة تفاصيل المنتج")}
                </h1>
                <p className="text-[#0A2C52]/70 text-xs sm:text-sm mt-0.5">
                  {t("addProductDetails.headerSubtitle", "أضف الألوان والمقاسات والصور للمنتج")}
                </p>
              </div>
            </div>
            <WebSiteLogo width={120} height={40} className="hidden sm:block" />
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`rounded-2xl p-4 mb-6 shadow-lg ${
              messageType === "success"
                ? "bg-green-100 border border-green-200 text-green-800"
                : messageType === "info"
                ? "bg-blue-100 border border-blue-200 text-blue-800"
                : "bg-red-100 border border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {messageType === "success" ? (
                <FiCheck className="text-green-600" size={20} />
              ) : messageType === "info" ? (
                <FiInfo className="text-blue-600" size={20} />
              ) : (
                <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
              )}
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="bg-[#F9F6EF] rounded-2xl shadow-lg p-8 text-center mb-6 border border-[#0A2C52]/20">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-[#F55A00] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[#0A2C52] font-semibold">
                {t("addProductDetails.loading", "جاري إضافة تفاصيل المنتج...")}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        {!isLoading && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border border-[#0A2C52]/10">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Color Selection */}
              <div>
                <label htmlFor="colorId" className="block text-base sm:text-lg font-semibold text-[#0A2C52] mb-2">
                  {t("addProductDetails.fields.color", "اختر اللون")} <span className="text-red-500">*</span>
                </label>
                <select
                  id="colorId"
                  name="colorId"
                  value={colorId}
                  onChange={(e) => setColorId(e.target.value)}
                  required
                  className="w-full p-3 sm:p-4 border-2 border-[#0A2C52]/30 rounded-lg focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-200 bg-white text-sm sm:text-base"
                >
                  <option value="">{t("addProductDetails.placeholders.color", "اختر اللون من القائمة")}</option>
                  {colors.map((color) => (
                    <option key={color.ColorId} value={color.ColorId}>
                      {color.ColorName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size Selection */}
              <div>
                <label htmlFor="sizeId" className="block text-base sm:text-lg font-semibold text-[#0A2C52] mb-2">
                  {t("addProductDetails.fields.size", "اختر المقاس")}{" "}
                  <span className="text-gray-500 text-xs">{t("general.optional", "(اختياري)")}</span>
                </label>
                <select
                  id="sizeId"
                  name="sizeId"
                  value={sizeId}
                  onChange={(e) => setSizeId(e.target.value)}
                  className="w-full p-3 sm:p-4 border-2 border-[#0A2C52]/30 rounded-lg focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-200 bg-white text-sm sm:text-base"
                >
                  <option value="">{t("addProductDetails.placeholders.size", "اختر المقاس من القائمة")}</option>
                  {sizes.map((size) => (
                    <option key={size.SizeId} value={size.SizeId}>
                      {size.SizeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Input */}
              <div>
                <label htmlFor="quantity" className="block text-base sm:text-lg font-semibold text-[#0A2C52] mb-2">
                  {t("addProductDetails.fields.quantity", "الكمية المتاحة")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  min="1"
                  className="w-full p-3 sm:p-4 border-2 border-[#0A2C52]/30 rounded-lg focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-200 bg-white text-sm sm:text-base"
                  placeholder={t("addProductDetails.placeholders.quantity", "أدخل الكمية المتاحة")}
                />
              </div>

              {/* Main Image Upload */}
              <div>
                <label htmlFor="productImage" className="block text-base sm:text-lg font-semibold text-[#0A2C52] mb-2">
                  {t("addProductDetails.fields.image", "صورة المنتج الرئيسية")} <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-600 mb-1.5">
                  {t("addProductDetails.imageDimensions", "المقاس الموصى به للوضوح وعدم القص: 800×800 أو 1000×1000 بكسل (صورة مربعة).")}
                </p>
                <div className="border-2 border-dashed border-[#0A2C52]/30 rounded-xl p-4 sm:p-6 text-center bg-gray-50 hover:bg-gray-100 transition-all duration-200">
                  <FiImage className="text-[#F55A00] mx-auto mb-2 sm:mb-3" size={28} />
                  <input
                    type="file"
                    id="productImage"
                    name="productImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <label 
                    htmlFor="productImage"
                    className={`cursor-pointer inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base ${baseButtonClasses}`}
                  >
                    <FiUpload size={16} />
                    {t("addProductDetails.buttons.chooseImage", "اختر صورة رئيسية")}
                  </label>
                  {selectedFile && (
                    <p className="text-green-600 font-medium mt-2 text-sm">
                      ✓ {selectedFile.name.length > 30 ? selectedFile.name.substring(0, 30) + "..." : selectedFile.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Multiple Images Upload */}
              <div>
                <label htmlFor="multipleProductImages" className="block text-base sm:text-lg font-semibold text-[#0A2C52] mb-2">
                  {t("addProductDetails.fields.multipleImages", "صور إضافية للمنتج")} <span className="text-gray-500 text-xs">{t("general.optional", "(اختياري)")}</span>
                </label>
                <p className="text-xs text-gray-600 mb-1.5">
                  {t("addProductDetails.imageDimensions", "المقاس الموصى به للوضوح وعدم القص: 800×800 أو 1000×1000 بكسل (صورة مربعة).")}
                </p>
                <div className="border-2 border-dashed border-[#0A2C52]/30 rounded-xl p-4 sm:p-6 text-center bg-gray-50 hover:bg-gray-100 transition-all duration-200">
                  <FiImage className="text-[#F55A00] mx-auto mb-2 sm:mb-3" size={28} />
                  <input
                    type="file"
                    id="multipleProductImages"
                    name="multipleProductImages"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleFilesChange}
                    ref={multipleFilesInputRef}
                    className="hidden"
                  />
                  <label 
                    htmlFor="multipleProductImages"
                    className={`cursor-pointer inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base ${baseButtonClasses}`}
                  >
                    <FiUpload size={16} />
                    {t("addProductDetails.buttons.chooseMultipleImages", "اختر صور إضافية")}
                  </label>
                  {selectedFiles.length > 0 && (
                    <p className="text-green-600 font-medium mt-2 text-sm">
                      ✓ {selectedFiles.length} {t("addProductDetails.messages.imagesSelected", "صورة محددة")}
                    </p>
                  )}
                </div>
                
                {/* Preview of multiple images */}
                {localPreviewUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {localPreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 sm:h-32 object-cover rounded-lg border-2 border-[#0A2C52]/20"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-xs sm:text-sm"
                          title={t("addProductDetails.buttons.deleteImage", "حذف")}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Image Preview */}
              {localPreviewUrl && (
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-[#0A2C52] mb-2">
                    {t("addProductDetails.preview.watermarkedTitle", "معاينة بعد إضافة شعار المتجر")}
                  </label>
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border-2 border-[#0A2C52]/20">
                    <img
                      src={localPreviewUrl}
                      alt={t("addProductDetails.preview.watermarkedTitle", "معاينة بعد إضافة شعار المتجر")}
                      className="w-full max-h-64 sm:max-h-96 object-contain rounded-lg border border-[#0A2C52]/10"
                    />
                    <p className="text-xs sm:text-sm text-[#0A2C52]/70 mt-2 text-center">
                      {t("addProductDetails.preview.watermarkedHint", "يتم حفظ الصورة مع شعار إيكوفيرا في أعلى اليمين لحماية حقوقك عند تنزيلها.")}
                    </p>
                  </div>
                </div>
              )}

              {/* Previous Image Preview */}
              {productImage && !localPreviewUrl && (
                <div>
                  <label className="block text-sm sm:text-base font-semibold text-[#0A2C52] mb-2">
                    {t("addProductDetails.preview.currentTitle", "معاينة الصورة الحالية")}
                  </label>
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border-2 border-[#0A2C52]/20 flex justify-center">
                    <img
                      src={ServerPath + productImage}
                      alt={t("addProductDetails.preview.currentTitle", "معاينة الصورة الحالية")}
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border-2 border-[#0A2C52]/30"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {!detailsAdded && (
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || !colorId || !quantity || (!selectedFile && !productImage)}
                    className={`w-full py-3 sm:py-4 px-6 text-sm sm:text-base transform hover:-translate-y-1 ${baseButtonClasses} ${isLoading ? "opacity-80 cursor-wait" : ""} ${!colorId || !quantity || (!selectedFile && !productImage) ? "opacity-50" : ""}`}
                  >
                    <FiPlus size={18} />
                    {t("addProductDetails.buttons.submit", "إضافة تفاصيل المنتج")}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Success Actions */}
        {detailsAdded && (
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-[#0A2C52]/10">
            <div className="text-center mb-5">
              <div className="bg-green-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiCheck className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-1">
                {t("addProductDetails.successTitle", "تمت الإضافة بنجاح!")}
              </h3>
              <p className="text-sm sm:text-base text-[#0A2C52]/80">
                {t("addProductDetails.successSubtitle", "يمكنك إضافة المزيد من التفاصيل أو إنهاء العملية")}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddMore}
                className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base transform hover:-translate-y-1 ${baseButtonClasses}`}
              >
                <FiPlus size={18} />
                {t("addProductDetails.buttons.addMore", "أضف تفاصيل أخرى")}
              </button>
              <button
                onClick={handleFinish}
                className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 text-sm sm:text-base transform hover:-translate-y-1 ${baseButtonClasses}`}
              >
                <FiArrowRight size={18} />
                {t("addProductDetails.buttons.finish", "إنهاء والعرض")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}