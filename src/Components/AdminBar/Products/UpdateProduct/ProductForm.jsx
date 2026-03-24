import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import API_BASE_URL, { ServerPath } from "../../../Constant";
import { colors, sizes } from "../../../utils";
import { FiPackage, FiImage, FiPlus, FiSave, FiLoader, FiArrowLeft, FiTag, FiDollarSign, FiPercent, FiEdit, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import { useI18n } from "../../../i18n/I18nContext";
import WebSiteLogo from "../../../WebsiteLogo/WebsiteLogo.jsx";
import { addCompanyLogoToProductImage } from "../../../../utils/productWatermark";

export default function ProductForm() {
  const [product, setProduct] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [imageLoading, setImageLoading] = useState(null);
  const [productDetailImages, setProductDetailImages] = useState({}); // { productDetailId: [images] }
  const [uploadingImages, setUploadingImages] = useState({}); // { productDetailId: true/false }
  const [resultDialog, setResultDialog] = useState(null); // { status: 'success' | 'error', message: string }
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const productId = location.state?.productId ?? searchParams.get("productId");
  const { t, lang } = useI18n();
  const primaryButtonClasses =
    "bg-[#0A2C52] hover:bg-[#13345d] text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:text-white/80 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2";

  const getLocalizedValue = (arValue, enValue) =>
    lang === "ar" ? arValue ?? enValue : enValue ?? arValue;
  
  // Function to translate color names (from Arabic to English or vice versa)
  const translateColor = (colorName) => {
    if (!colorName) return colorName;
    
    // Map Arabic color names to English keys
    const colorMap = {
      "أحمر": "red",
      "أزرق": "blue",
      "أخضر": "green",
      "أصفر": "yellow",
      "أسود": "black",
      "أبيض": "white",
      "وردي": "pink",
      "بنفسجي": "purple",
      "برتقالي": "orange",
      "بني": "brown",
      "رمادي": "gray",
      "كحلي": "navy",
      "بيج": "beige",
      "كاكي": "khaki",
      "كستنائي": "maroon",
      "سماوي": "cyan",
      "أرجواني": "magenta",
      "ليموني": "lime",
      "زيتوني": "olive",
      "تركواز": "teal",
      "فضي": "silver",
      "ذهبي": "gold",
      "نيلي": "navy",
      "عنابي": "maroon",
      "خردلي": "yellow",
      "فيروزي": "cyan",
      "زهري": "pink",
      "لافندر": "purple",
      "موف": "purple",
      "أخضر زيتي": "olive",
      "أخضر فاتح": "green",
      "أزرق سماوي": "cyan",
      "أزرق ملكي": "blue",
      "قرمزي": "red",
    };
    
    // Check if the color name is in Arabic
    const colorKey = colorMap[colorName] || colorName.toLowerCase().trim();
    return t(`colors.${colorKey}`, colorName);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      setProduct(null);
      setLoadError(
        t(
          "productForm.missingProductId",
          "لم يتم تحديد المنتج المراد تعديله. افتح المنتج من قائمة المنتجات ثم حاول مرة أخرى."
        )
      );
      return;
    }

    fetchProduct();
  }, [productId]);

  const scrollToTopSmooth = () => {
    if (typeof window === "undefined") return;
    const scrollElement =
      document?.scrollingElement || document?.documentElement || document?.body;
    try {
      (scrollElement || window).scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch {
      window.scrollTo(0, 0);
      if (scrollElement) scrollElement.scrollTop = 0;
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [message]);

  const fetchProduct = async () => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      setLoadError(
        t(
          "productForm.missingProductId",
          "لم يتم تحديد المنتج المراد تعديله. افتح المنتج من قائمة المنتجات ثم حاول مرة أخرى."
        )
      );
      return;
    }

    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}Product/GetFullProduct?ProductId=${productId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            t(
              "productForm.authRequired",
              "يجب تسجيل الدخول بحساب admin أو manager في نفس التبويب لعرض بيانات المنتج."
            )
          );
        }

        if (response.status === 404) {
          throw new Error(t("productForm.notAvailable", "المنتج غير متوفر"));
        }

        throw new Error(
          t("productForm.loadError", "حدث خطأ أثناء تحميل بيانات المنتج.")
        );
      }
      const data = await response.json();
      const normalizedProduct = data?.productId
        ? {
            ...data,
            productDetails: Array.isArray(data.productDetails) ? data.productDetails : [],
          }
        : null;
      setProduct(normalizedProduct);
      setLoadError(
        normalizedProduct
          ? ""
          : t("productForm.notAvailable", "المنتج غير متوفر")
      );
      
      // Fetch images for each product detail
      if (normalizedProduct?.productDetails?.length) {
        const imagesMap = {};
        for (const detail of normalizedProduct.productDetails) {
          try {
            const imagesResponse = await fetch(
              `${API_BASE_URL}Product/GetProductDetailImages/${detail.productDetailId}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
              }
            );
            if (imagesResponse.ok) {
              const imagesData = await imagesResponse.json();
              imagesMap[detail.productDetailId] = imagesData || [];
            } else {
              imagesMap[detail.productDetailId] = [];
            }
          } catch (error) {
            console.error(`Error fetching images for detail ${detail.productDetailId}:`, error);
            imagesMap[detail.productDetailId] = [];
          }
        }
        setProductDetailImages(imagesMap);
      }
    } catch (error) {
      setMessage("❌ " + t("productForm.loadError", "خطأ في تحميل المنتج."));
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}Product/GetCategoriesNames`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("❌ خطأ في تحميل التصنيفات.");
    }
  };

  const handleUpdate = async () => {
    if (!productId || !product) {
      const missingProductMsg = t(
        "productForm.missingProductId",
        "لم يتم تحديد المنتج المراد تعديله. افتح المنتج من قائمة المنتجات ثم حاول مرة أخرى."
      );
      setMessage("⚠️ " + missingProductMsg);
      setResultDialog({ status: "error", message: missingProductMsg });
      scrollToTopSmooth();
      return;
    }

    scrollToTopSmooth();
    setIsSaving(true);
    setMessage("⏳ " + t("productForm.updating", "جاري التحديث... يمكن أن يأخذ هذا بعض الوقت."));
    try {
      const response = await fetch(
        `${API_BASE_URL}Product/UpdateProduct?id=${productId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        }
      );
      if (response.ok) {
        const successMsg = t("productForm.updateSuccess", "تم تحديث المنتج بنجاح!");
        setMessage("✅ " + successMsg);
        setResultDialog({ status: "success", message: successMsg });
        await fetchProduct();
      } else {
        const errorMsg = t("productForm.updateError", "حدث خطأ أثناء التحديث.");
        setMessage("❌ " + errorMsg);
        setResultDialog({ status: "error", message: errorMsg });
      }
    } catch (error) {
      const exceptionMsg = t("productForm.updateError", "حدث خطأ أثناء التحديث.");
      setMessage("❌ " + exceptionMsg);
      setResultDialog({ status: "error", message: exceptionMsg });
    }
    setIsSaving(false);
  };

  const handleImageUpdate = async (productDetailId) => {
    scrollToTopSmooth();
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      setImageLoading(productDetailId);

      try {
        // إضافة اللوجو على الصورة قبل الرفع
        const stampedFile = await addCompanyLogoToProductImage(file);
        
        const formData = new FormData();
        formData.append("imageFile", stampedFile);

        const response = await fetch(
          `${API_BASE_URL}Product/UpdateProductImage?ProductDetailsId=${productDetailId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          setProduct((prevProduct) => ({
            ...prevProduct,
            productDetails: prevProduct.productDetails.map((detail) =>
              detail.productDetailId === productDetailId
                ? { ...detail, productImage: data.fileUrl }
                : detail
            ),
          }));
          setMessage("✅ " + t("productForm.imageUpdateSuccess", "تم تحديث الصورة بنجاح! تم إضافة شعار المتجر تلقائياً."));
        } else {
          setMessage("❌ " + t("productForm.imageUpdateError", "حدث خطأ أثناء تحديث الصورة."));
        }
      } catch (error) {
        console.error("Watermark error:", error);
        setMessage("❌ " + (error.message || t("productForm.imageUpdateError", "حدث خطأ أثناء تحديث الصورة.")));
      } finally {
        setImageLoading(null);
      }
    };

    fileInput.click();
  };

  // Handle adding multiple images to a product detail
  const handleAddMultipleImages = async (productDetailId) => {
    scrollToTopSmooth();
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.multiple = true;

    fileInput.onchange = async (event) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      setUploadingImages(prev => ({ ...prev, [productDetailId]: true }));
      const token = sessionStorage.getItem("token");
      let successCount = 0;

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          try {
            // إضافة اللوجو على الصورة قبل الرفع
            const stampedFile = await addCompanyLogoToProductImage(file);
            
            const formData = new FormData();
            formData.append("imageFile", stampedFile);

            // Upload image
            const uploadResponse = await fetch(
              `${API_BASE_URL}Product/UploadProductImage`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formData,
              }
            );

            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              
              // Add to product detail images
              const addResponse = await fetch(
                `${API_BASE_URL}Product/AddProductDetailImage`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    productDetailsId: productDetailId,
                    imageUrl: uploadData.imageUrl,
                    displayOrder: (productDetailImages[productDetailId]?.length || 0) + i + 1,
                  }),
                }
              );

              if (addResponse.ok) {
                successCount++;
              }
            }
          } catch (watermarkError) {
            console.error(`Error processing image ${i + 1}:`, watermarkError);
            // Continue with next image
          }
        }

        // Refresh images list
        const imagesResponse = await fetch(
          `${API_BASE_URL}Product/GetProductDetailImages/${productDetailId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          setProductDetailImages(prev => ({
            ...prev,
            [productDetailId]: imagesData || [],
          }));
        }

        if (successCount > 0) {
          setMessage(`✅ تم إضافة ${successCount} من ${files.length} صورة بنجاح! تم إضافة شعار المتجر تلقائياً على جميع الصور.`);
        } else {
          setMessage("❌ فشل إضافة الصور. الرجاء المحاولة مرة أخرى.");
        }
      } catch (error) {
        setMessage("❌ حدث خطأ أثناء إضافة الصور.");
      } finally {
        setUploadingImages(prev => ({ ...prev, [productDetailId]: false }));
      }
    };

    fileInput.click();
  };

  // Handle deleting a product detail image
  const handleDeleteImage = async (productDetailId, imageId) => {
    if (!window.confirm(t("productForm.confirmDeleteImage", "هل أنت متأكد من حذف هذه الصورة؟"))) {
      return;
    }
    scrollToTopSmooth();

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}Product/DeleteProductDetailImage/${imageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Remove from local state
        setProductDetailImages(prev => ({
          ...prev,
          [productDetailId]: (prev[productDetailId] || []).filter(img => img.productDetailImageId !== imageId),
        }));
        setMessage("✅ " + t("productForm.imageDeleted", "تم حذف الصورة بنجاح!"));
      } else {
        setMessage("❌ " + t("productForm.imageDeleteError", "حدث خطأ أثناء حذف الصورة."));
      }
    } catch (error) {
      setMessage("❌ حدث خطأ أثناء حذف الصورة.");
    }
  };

  const handleAddDetails = () => {
    scrollToTopSmooth();
    navigate("/admins/AddProductDetails", {
      state: { productId: product.productId },
    });
  };

  const handleRemoveDetail = (productDetailId) => {
    if (!productDetailId) return;
    const confirmDelete = window.confirm(
      t(
        "productForm.confirmDeleteDetail",
        "هل أنت متأكد من حذف هذه التفاصيل؟ سيتم اعتماد الحذف بعد حفظ التعديلات."
      )
    );
    if (!confirmDelete) return;
    scrollToTopSmooth();
    setProduct((prevProduct) => {
      if (!prevProduct) return prevProduct;
      return {
        ...prevProduct,
        productDetails: prevProduct.productDetails.filter(
          (detail) => detail.productDetailId !== productDetailId
        ),
      };
    });
    setProductDetailImages((prevImages) => {
      const updatedImages = { ...prevImages };
      delete updatedImages[productDetailId];
      return updatedImages;
    });
    setMessage("⚠️ " + t("productForm.detailMarkedForDeletion", "تم حذف التفاصيل من النموذج. اضغط حفظ لتأكيد الحذف من قاعدة البيانات."));
  };

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-4">
          <FiLoader className="animate-spin text-4xl text-orange-500" />
          <p className="text-gray-600 text-lg">{t("productForm.loading", "جاري تحميل بيانات المنتج...")}</p>
        </div>
      </div>
    );
  }

  if (!product) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-lg mx-4">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-gray-700 text-lg">
          {!productId
            ? t(
                "productForm.missingProductId",
                "لم يتم تحديد المنتج المراد تعديله. افتح المنتج من قائمة المنتجات ثم حاول مرة أخرى."
              )
            : t("productForm.notAvailable", "المنتج غير متوفر")}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/FindProducts")}
            className={`px-6 py-3 min-w-[220px] ${primaryButtonClasses}`}
          >
            <FiPackage />
            {t("productForm.goToProducts", "الذهاب إلى المنتجات")}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 min-w-[220px] rounded-xl border border-blue-200 text-blue-700 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <FiArrowLeft />
            {t("productForm.goBack", "الرجوع")}
          </button>
        </div>
      </div>
    </div>
  );

  const localizedProductName = getLocalizedValue(product.productNameAr, product.productNameEn) || "";

  return (
    <div className="min-h-screen bg-[#F9F6EF] py-8 px-4">
      {resultDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-center border">
            <div
              className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl ${
                resultDialog.status === "success"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {resultDialog.status === "success" ? "✅" : "❌"}
            </div>
            <h3 className="text-2xl font-bold text-[#0A2C52]">
              {resultDialog.status === "success"
                ? t("productForm.successTitle", "تم الحفظ بنجاح")
                : t("productForm.errorTitle", "لم يتم الحفظ")}
            </h3>
            <p className="text-gray-600">{resultDialog.message}</p>
            <button
              onClick={() => setResultDialog(null)}
              className="w-full py-3 rounded-xl bg-[#0A2C52] text-white font-semibold hover:bg-[#13345d] transition shadow-lg"
            >
              {t("productForm.closeDialog", "حسناً")}
            </button>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-[#F9F6EF] rounded-2xl shadow-lg p-6 mb-6 border border-[#0A2C52]/20">
          <div className="flex flex-col items-center mb-4">
            <WebSiteLogo width={300} height={100} className="mb-4" />
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <FiArrowLeft className="text-xl" />
              </button>
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                <FiPackage className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#0A2C52]">{t("productForm.updateProduct", "تحديث المنتج")}</h1>
                <p className="text-gray-600 mt-1">{t("productForm.editData", "تعديل بيانات")} {localizedProductName}</p>
              </div>
            </div>
            
            <button
              onClick={handleAddDetails}
              className={`px-6 py-3 ${primaryButtonClasses} transform hover:-translate-y-1`}
            >
              <FiPlus className="text-lg" />
              <span>{t("productForm.addDetails", "إضافة تفاصيل إضافية")}</span>
            </button>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`rounded-2xl p-4 mb-6 shadow-lg ${
            message.includes("✅") 
              ? "bg-green-100 text-green-700 border border-green-200" 
              : message.includes("⏳")
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : "bg-red-100 text-red-700 border border-red-200"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`text-xl ${
                message.includes("✅") ? "text-green-600" : 
                message.includes("⏳") ? "text-blue-600" : "text-red-600"
              }`}>
                {message.includes("✅") ? "✅" : message.includes("⏳") ? "⏳" : "❌"}
              </div>
              <span>{message.replace(/[✅❌⏳]/g, '').trim()}</span>
            </div>
          </div>
        )}

        {/* Product Form */}
        <div className="bg-[#F9F6EF] rounded-2xl shadow-lg p-6 mb-6 border border-[#0A2C52]/20">
          <h2 className="text-xl font-bold text-[#0A2C52] mb-6 flex items-center gap-2">
            <FiEdit />
            {t("productForm.basicInfo", "المعلومات الأساسية")}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name Arabic */}
            <div>
              <label className="block text-sm font-medium text-[#0A2C52] mb-2 flex items-center gap-2">
                <FiTag className="text-[#F55A00]" />
                {t("productForm.productName", "اسم المنتج")} (عربي) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-[#0A2C52]/30 rounded-xl focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-300 bg-[#F9F6EF]"
                value={product.productNameAr || ""}
                onChange={(e) =>
                  setProduct({ ...product, productNameAr: e.target.value })
                }
                required
              />
            </div>

            {/* Product Name English */}
            <div>
              <label className="block text-sm font-medium text-[#0A2C52] mb-2 flex items-center gap-2">
                <FiTag className="text-[#F55A00]" />
                {t("productForm.productName", "اسم المنتج")} (إنجليزي) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-[#0A2C52]/30 rounded-xl focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-300 bg-[#F9F6EF]"
                value={product.productNameEn || ""}
                onChange={(e) =>
                  setProduct({ ...product, productNameEn: e.target.value })
                }
                required
              />
            </div>

              {/* Short Name Arabic */}
              <div>
                <label className="block text-sm font-medium text-[#0A2C52] mb-2 flex items-center gap-2">
                  <FiTag className="text-[#F55A00]" />
                  {t("productForm.shortNameAr", "الاسم المختصر")} (عربي) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-[#0A2C52]/30 rounded-xl focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-300 bg-[#F9F6EF]"
                  value={product.shortNameAr || ""}
                  onChange={(e) =>
                    setProduct({ ...product, shortNameAr: e.target.value })
                  }
                  required
                />
              </div>

              {/* Short Name English */}
              <div>
                <label className="block text-sm font-medium text-[#0A2C52] mb-2 flex items-center gap-2">
                  <FiTag className="text-[#F55A00]" />
                  {t("productForm.shortNameEn", "Short name")} (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-[#0A2C52]/30 rounded-xl focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-300 bg-[#F9F6EF]"
                  value={product.shortNameEn || ""}
                  onChange={(e) =>
                    setProduct({ ...product, shortNameEn: e.target.value })
                  }
                  required
                />
              </div>

            {/* Product Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiDollarSign className="text-orange-500" />
                {t("productForm.price", "السعر")}
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50"
                value={product.productPrice || ""}
                onChange={(e) =>
                  setProduct({ ...product, productPrice: e.target.value })
                }
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiPackage className="text-orange-500" />
                {t("productForm.category", "التصنيف")}
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50"
                value={product.categoryName || ""}
                onChange={(e) =>
                  setProduct({ ...product, categoryName: e.target.value })
                }
              >
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryNameAr}>
                    {`${cat.categoryNameAr} / ${cat.categoryNameEn}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {t("productForm.featured", "عرض المنتج في الصفحة الرئيسية")}
              </span>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={product.isFeatured || false}
                  onChange={(e) =>
                    setProduct({ ...product, isFeatured: e.target.checked })
                  }
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-orange-300 transition after:content-[''] after:absolute after:h-5 after:w-5 after:bg-white after:rounded-full after:transition-all peer-checked:bg-orange-500 relative"></div>
                <span className="ms-3 text-sm font-medium text-gray-700">
                  {product.isFeatured ? t("yes", "نعم") : t("no", "لا")}
                </span>
              </label>
            </div>

            {/* Discount Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FiPercent className="text-orange-500" />
                {t("productForm.discount", "نسبة الخصم")}
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50"
                value={product.discountPercentage || ""}
                onChange={(e) =>
                  setProduct({ ...product, discountPercentage: e.target.value })
                }
              />
            </div>

            {/* فيديو المنتج */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#0A2C52] mb-2 flex items-center gap-2">
                {t("productForm.productVideo", "فيديو المنتج")} ({t("optional", "اختياري")})
              </label>
              <input
                type="url"
                placeholder="https://... أو مسار الفيديو بعد الرفع"
                className="w-full px-4 py-3 border border-[#0A2C52]/30 rounded-xl focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-300 bg-[#F9F6EF]"
                value={product.productVideoUrl ?? product.ProductVideoUrl ?? ""}
                onChange={(e) =>
                  setProduct({ ...product, productVideoUrl: e.target.value })
                }
              />
            </div>
          </div>

          {/* More Details Arabic */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-[#0A2C52] mb-2">
              {t("productForm.moreDetails", "التفاصيل الإضافية")} (عربي) <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-4 py-3 border border-[#0A2C52]/30 rounded-xl focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-300 bg-[#F9F6EF] min-h-[120px]"
              value={product.moreDetailsAr || ""}
              onChange={(e) =>
                setProduct({ ...product, moreDetailsAr: e.target.value })
              }
              required
            />
          </div>

          {/* More Details English */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-[#0A2C52] mb-2">
              {t("productForm.moreDetails", "التفاصيل الإضافية")} (إنجليزي) <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-4 py-3 border border-[#0A2C52]/30 rounded-xl focus:ring-2 focus:ring-[#F55A00] focus:border-[#F55A00] transition-all duration-300 bg-[#F9F6EF] min-h-[120px]"
              value={product.moreDetailsEn || ""}
              onChange={(e) =>
                setProduct({ ...product, moreDetailsEn: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-[#F9F6EF] rounded-2xl shadow-lg p-6 border border-[#0A2C52]/20">
          <h3 className="text-xl font-bold text-[#0A2C52] mb-6 flex items-center gap-2">
            <FiImage />
            {t("productForm.productDetails", "تفاصيل المنتج")}
          </h3>

          <div className="space-y-6">
            {product.productDetails.length === 0 && (
              <div className="border border-dashed border-[#0A2C52]/25 rounded-2xl p-6 bg-white text-center">
                <p className="text-[#0A2C52] font-medium">
                  {t("productForm.noDetailsYet", "لا توجد تفاصيل لهذا المنتج بعد. يمكنك الآن إضافة الألوان أو المقاسات والكميات.")}
                </p>
                <button
                  type="button"
                  onClick={handleAddDetails}
                  className={`mt-4 px-6 py-3 mx-auto ${primaryButtonClasses}`}
                >
                  <FiPlus />
                  {t("productForm.addDetailsNow", "إضافة تفاصيل الآن")}
                </button>
              </div>
            )}
            {product.productDetails.map((detail, index) => (
              <div key={detail.productDetailId} className="border border-[#0A2C52]/20 rounded-2xl p-6 hover:border-[#F55A00] transition-all duration-300 bg-white">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-4">
                  <div className="bg-[#F9F6EF] rounded-xl p-4 border border-[#0A2C52]/10 flex-1">
                    <p className="text-[#0A2C52] font-medium text-center">
                      {t("productForm.youHave", "لديك")} {detail.quantity} {t("productForm.pieces", "قطعة")} {t("productForm.of", "من")} {localizedProductName} {t("productForm.withColor", "بلون")}{" "}
                      {translateColor(detail.colorName)}
                      {detail.sizeName !== "غير محدد" && ` ${t("productForm.withSize", "بمقاس")} ${detail.sizeName}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDetail(detail.productDetailId)}
                    className="self-center lg:self-start px-4 py-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center gap-2"
                  >
                    <FiTrash2 />
                    {t("productForm.deleteDetail", "حذف التفاصيل")}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Image Section */}
                  <div className="flex flex-col items-center">
                    <p className="text-xs text-gray-600 mb-2 w-full max-w-xs text-center">
                      {t("productForm.imageDimensions", "المقاس الموصى به للوضوح وعدم القص: 800×800 أو 1000×1000 بكسل (صورة مربعة).")}
                    </p>
                    <div className="relative bg-gray-100 rounded-2xl p-4 w-full max-w-xs">
                      {detail.productImage ? (
                        <img
                          src={ServerPath + detail.productImage}
                          alt={localizedProductName || "product image"}
                          className="w-full h-48 object-cover rounded-xl shadow-md"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-xl flex items-center justify-center">
                          <p className="text-gray-500">🚫 لا توجد صورة متاحة</p>
                        </div>
                      )}
                      <button
                        onClick={() => handleImageUpdate(detail.productDetailId)}
                        disabled={imageLoading === detail.productDetailId}
                        className={`w-full mt-4 py-2 px-4 ${primaryButtonClasses} transform hover:-translate-y-1 ${imageLoading === detail.productDetailId ? "opacity-80 cursor-wait" : ""}`}
                      >
                        {imageLoading === detail.productDetailId ? (
                          <FiLoader className="animate-spin" />
                        ) : (
                          <FiImage />
                        )}
                        {t("productForm.updateImage", "تحديث الصورة الرئيسية")}
                      </button>
                    </div>

                    {/* Additional Images Section */}
                    <div className="w-full max-w-xs mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">
                          {t("productForm.additionalImages", "صور إضافية")}
                        </h4>
                        <button
                          onClick={() => handleAddMultipleImages(detail.productDetailId)}
                          disabled={uploadingImages[detail.productDetailId]}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          {uploadingImages[detail.productDetailId] ? (
                            <FiLoader className="animate-spin" />
                          ) : (
                            <FiPlus />
                          )}
                          {t("productForm.addImages", "إضافة")}
                        </button>
                      </div>
                      
                      {/* Images Grid */}
                      {productDetailImages[detail.productDetailId] && productDetailImages[detail.productDetailId].length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {productDetailImages[detail.productDetailId].map((img) => (
                            <div key={img.productDetailImageId} className="relative group">
                              <img
                                src={ServerPath + img.imageUrl}
                                alt={`Additional ${img.productDetailImageId}`}
                                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                              />
                              <button
                                onClick={() => handleDeleteImage(detail.productDetailId, img.productDetailImageId)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                title={t("productForm.deleteImage", "حذف الصورة")}
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 text-center py-2">
                          {t("productForm.noAdditionalImages", "لا توجد صور إضافية")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Details Form */}
                  <div className="space-y-4">
                    {/* Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("productForm.color", "اللون")}
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50"
                        value={detail.colorName || ""}
                        onChange={(e) =>
                          setProduct({
                            ...product,
                            productDetails: product.productDetails.map((d, i) =>
                              i === index ? { ...d, colorName: e.target.value } : d
                            ),
                          })
                        }
                      >
                        {colors.map((color) => (
                          <option key={color.ColorId} value={color.ColorName}>
                            {translateColor(color.ColorName)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Size */}
                    {detail.sizeName !== "غير محدد" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("productForm.size", "المقاس")}
                        </label>
                        <select
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50"
                          value={detail.sizeName || ""}
                          onChange={(e) =>
                            setProduct({
                              ...product,
                              productDetails: product.productDetails.map((d, i) =>
                                i === index ? { ...d, sizeName: e.target.value } : d
                              ),
                            })
                          }
                        >
                          {sizes.map((size) => (
                            <option key={size.SizeId} value={size.SizeName}>
                              {size.SizeName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("productForm.quantity", "الكمية")}
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50"
                        value={detail.quantity || ""}
                        onChange={(e) =>
                          setProduct({
                            ...product,
                            productDetails: product.productDetails.map((d, i) =>
                              i === index ? { ...d, quantity: e.target.value } : d
                            ),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isSaving}
            className={`min-w-[200px] px-8 py-4 text-lg font-medium ${primaryButtonClasses} transform hover:-translate-y-1 ${isSaving ? "opacity-80 cursor-wait" : ""}`}
          >
            {isSaving ? (
              <FiLoader className="animate-spin" />
            ) : (
              <FiSave />
            )}
            {isSaving ? t("productForm.updating", "جاري التحديث...") : t("productForm.saveChanges", "حفظ التعديلات")}
          </button>
        </div>
      </div>
    </div>
  );
}
