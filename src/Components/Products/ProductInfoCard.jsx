import React from "react";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiTruck,
  FiShield,
  FiInfo,
  FiShare2,
} from "react-icons/fi";

export default function ProductInfoCard({
  productName,
  priceFormatted,
  originalPriceFormatted,
  discountPercentage,
  availableQuantity,
  isRTL,
  t,
  deliveryText,
  returnPolicyText,
  CurrencySelectorComponent,
  onShare,
}) {
  return (
    <div className="bg-[#FAFAFA] rounded-2xl shadow-xl p-6 space-y-6">
      {/* العنوان */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight flex-1">
          {productName}
        </h1>
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-[#92278f] hover:bg-[#7a1f75] transition-colors"
          >
            <FiShare2 className="w-4 h-4" />
            {t("productDetails.share", "مشاركة")}
          </button>
        )}
      </div>

      {/* السعر والخصم */}
      <div className="flex items-center gap-4">
        <span className="text-3xl font-bold text-orange-600">
          {priceFormatted}
        </span>
        {discountPercentage > 0 && (
          <>
            <span className="text-lg text-gray-400 line-through">
              {originalPriceFormatted}
            </span>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
              {t("productDetails.discount", "خصم")} {discountPercentage}%
            </span>
          </>
        )}
      </div>

      {/* حالة التوفر */}
      <div
        className={`flex items-center text-sm font-semibold ${
          availableQuantity === 0 ? "text-red-600" : "text-green-600"
        }`}
      >
        {availableQuantity === 0 ? (
          <>
            <FiAlertCircle className={isRTL ? "ml-2" : "mr-2"} />
            {t("productDetails.notAvailable", "غير متوفر حالياً")}
          </>
        ) : (
          <>
            <FiCheckCircle className={isRTL ? "ml-2" : "mr-2"} />
            {t("productDetails.inStock", "متوفر في المخزون")}
            <span
              className={`mx-2 ${
                availableQuantity < 10 ? "text-red-600" : "text-green-600"
              }`}
            >
              ({availableQuantity})
            </span>
          </>
        )}
      </div>

      {/* معلومات التوصيل والإرجاع */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 bg-blue-50 text-blue-700 rounded-xl px-4 py-3">
          <FiTruck className="w-5 h-5" />
          <span className="text-sm font-semibold">{deliveryText}</span>
        </div>
        <div className="flex items-center gap-3 bg-green-50 text-green-700 rounded-xl px-4 py-3">
          <FiShield className="w-5 h-5" />
          <span className="text-sm font-semibold">{returnPolicyText}</span>
        </div>
      </div>

      {/* محول العملة */}
      <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 flex items-center gap-4">
        <span className="text-sm font-semibold text-gray-700">
          {t("productDetails.chooseCurrency", "اختر العملة:")}
        </span>
        <CurrencySelectorComponent />
      </div>

      {/* تنبيه الاختيار */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
        <FiInfo className="text-yellow-500 w-5 h-5 mt-1" />
        <p className="text-yellow-800 text-sm leading-relaxed">
          {t(
            "productDetails.noteSelectOptions",
            "قم بتحديد الكمية والمقاس (إن وجد) قبل اتمام الشراء أو الإضافة إلى السلة"
          )}
        </p>
      </div>
    </div>
  );
}

