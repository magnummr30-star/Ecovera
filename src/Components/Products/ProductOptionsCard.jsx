import React, { useState } from "react";
import BtnAddToCart from "../Cart/BtnAddToCart.jsx";
import { FiShoppingBag } from "react-icons/fi";

// دالة لتحويل اسم اللون إلى لون hex
const getColorHex = (colorName) => {
  const colorMap = {
    "أحمر": "#FF0000",
    "أزرق": "#0000FF",
    "أخضر": "#008000",
    "أصفر": "#FFFF00",
    "أسود": "#000000",
    "أبيض": "#FFFFFF",
    "رمادي": "#808080",
    "برتقالي": "#FFA500",
    "بنفسجي": "#800080",
    "وردي": "#FFC0CB",
    "بني": "#A52A2A",
    "ذهبي": "#FFD700",
    "فضي": "#C0C0C0",
    "تركواز": "#40E0D0",
    "نيلي": "#4B0082",
    "كحلي": "#000080",
    "عنابي": "#800000",
    "بيج": "#F5F5DC",
    "خردلي": "#FFDB58",
    "فيروزي": "#30D5C8",
    "زهري": "#FF69B4",
    "أرجواني": "#FF00FF",
    "لافندر": "#E6E6FA",
    "موف": "#E0B0FF",
    "ليموني": "#32CD32",
    "أخضر زيتي": "#808000",
    "أخضر فاتح": "#90EE90",
    "أزرق سماوي": "#00CED1",
    "أزرق ملكي": "#4169E1",
    "قرمزي": "#DC143C",
    "اوف وايت": "#FAF9F6",
    "red": "#FF0000",
    "blue": "#0000FF",
    "green": "#008000",
    "yellow": "#FFFF00",
    "black": "#000000",
    "white": "#FFFFFF",
    "gray": "#808080",
    "orange": "#FFA500",
    "purple": "#800080",
    "pink": "#FFC0CB",
    "brown": "#A52A2A",
    "gold": "#FFD700",
    "silver": "#C0C0C0",
    "teal": "#40E0D0",
    "navy": "#000080",
    "maroon": "#800000",
    "beige": "#F5F5DC",
    "khaki": "#FFDB58",
    "cyan": "#30D5C8",
    "magenta": "#FF00FF",
    "lime": "#32CD32",
    "olive": "#808000",
    "off white": "#FAF9F6",
  };
  return colorMap[colorName] || "#CCCCCC";
};

export default function ProductOptionsCard({
  t,
  Colors,
  CurrentColor,
  setCurrentColor,
  Sizes,
  CurrentSize,
  setCurrentSize,
  Quantity,
  setQuantity,
  availableQuantity,
  handlBuyClick,
  DetailsId,
  translateColor,
  translateSize,
  isRTL,
  showBanner,
  productId,
  onColorChange,
  onSizeChange,
  availableColorsForSize,
  product = null,
}) {
  const [banner, setBanner] = useState(null);

  const handleColorClick = async (color) => {
    // التحقق من أن اللون متوفر مع المقاس الحالي
    if (CurrentSize && availableColorsForSize && !availableColorsForSize.includes(color)) {
      const message = t("productDetails.colorNotAvailableForSize", "هذا اللون غير متوفر مع المقاس المحدد");
      if (showBanner) {
        showBanner(message, "error");
      } else {
        setBanner({ text: message, tone: "error" });
        setTimeout(() => setBanner(null), 4000);
      }
      return;
    }
    setCurrentColor(color);
    if (onColorChange) {
      onColorChange(color);
    }
  };

  const handleSizeClick = (size) => {
    setCurrentSize(size);
    if (onSizeChange) {
      onSizeChange(size);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6 relative">
      {banner && (
        <div
          className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 text-white ${
            banner.tone === "error" ? "bg-red-500" : "bg-emerald-600"
          }`}
        >
          {banner.text}
        </div>
      )}
      
      {/* الألوان */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t("productDetails.color", "اللون")}
        </label>
        {Colors.length === 1 ? (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <div
              className="w-8 h-8 rounded border-2 border-gray-300"
              style={{ backgroundColor: getColorHex(CurrentColor) }}
            />
            <span className="text-gray-900">{translateColor(CurrentColor)}</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {Colors.map((color, index) => {
              const isSelected = CurrentColor === color;
              const isAvailable = !CurrentSize || !availableColorsForSize || availableColorsForSize.length === 0 || availableColorsForSize.includes(color);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleColorClick(color)}
                  disabled={!isAvailable}
                  className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-lg border-2 transition-all duration-200 ${
                    !isAvailable
                      ? "border-gray-200 opacity-40 cursor-not-allowed"
                      : isSelected
                      ? "border-[#92278f] shadow-lg scale-105"
                      : "border-gray-300 hover:border-[#92278f] hover:shadow-md"
                  }`}
                  title={!isAvailable ? `${translateColor(color)} - ${t("productDetails.notAvailableForSize", "غير متوفر مع هذا المقاس")}` : translateColor(color)}
                >
                  <div
                    className={`w-10 h-10 rounded border border-gray-200 ${!isAvailable ? "opacity-50" : ""}`}
                    style={{ backgroundColor: getColorHex(color) }}
                  />
                  <span className={`text-xs mt-1 font-medium w-full text-center px-1 leading-tight ${!isAvailable ? "text-gray-400" : "text-gray-700"}`}>
                    {translateColor(color)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* المقاسات */}
      {Sizes.length > 0 && Sizes[0] !== null && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t("productDetails.size", "المقاس")}
          </label>
          {Sizes.length === 1 ? (
            <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
              {translateSize ? translateSize(CurrentSize) : CurrentSize}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Sizes.map((size, index) => {
                const isSelected = CurrentSize === size;
                const translatedSize = translateSize ? translateSize(size) : size;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSizeClick(size)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 font-medium ${
                      isSelected
                        ? "border-[#92278f] bg-[#92278f] text-white shadow-lg scale-105"
                        : "product-size-btn-unselected border-gray-300 hover:border-brand-purple hover:bg-brand-purple hover:shadow-md"
                    }`}
                    style={!isSelected ? { backgroundColor: "#FFFFFF" } : undefined}
                    title={translatedSize}
                  >
                    <span>{translatedSize}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* الكمية */}
      {availableQuantity > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t("productDetails.quantity", "الكمية")}
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, Quantity - 1))}
              className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
            >
              <span className="text-xl font-bold">-</span>
            </button>
            <input
              type="number"
              min="1"
              max={availableQuantity}
              value={Quantity}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                if (newValue > availableQuantity) {
                  const message = t("productDetails.maxQuantityReached", "لا توجد كمية أخرى متاحة");
                  if (showBanner) {
                    showBanner(message, "error");
                  } else {
                    setBanner({ text: message, tone: "error" });
                    setTimeout(() => setBanner(null), 4000);
                  }
                  setQuantity(availableQuantity);
                  return;
                }
                setQuantity(
                  Math.min(
                    Math.max(1, newValue),
                    availableQuantity
                  )
                );
              }}
              className="w-20 p-3 border border-gray-300 rounded-lg text-center text-black focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
            />
            <button
              onClick={() => {
                if (Quantity >= availableQuantity) {
                  const message = t("productDetails.maxQuantityReached", "لا توجد كمية أخرى متاحة");
                  if (showBanner) {
                    showBanner(message, "error");
                  } else {
                    setBanner({ text: message, tone: "error" });
                    setTimeout(() => setBanner(null), 4000);
                  }
                  return;
                }
                setQuantity(Math.min(availableQuantity, Quantity + 1));
              }}
              className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
            >
              <span className="text-xl font-bold">+</span>
            </button>
          </div>
        </div>
      )}
      
      {/* رسالة عدم التوفر */}
      {availableQuantity === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 font-medium">
            {t("productDetails.outOfStock", "هذا المنتج غير متوفر حالياً")}
          </p>
        </div>
      )}

      {/* الأزرار */}
      {availableQuantity > 0 && (
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="flex-1 flex items-center justify-center bg-[#92278f] hover:bg-[#7a1f75] text-white font-bold py-4 px-6 rounded-lg transition duration-300 shadow-lg"
            onClick={handlBuyClick}
          >
            <FiShoppingBag className={isRTL ? "ml-2" : "mr-2"} />
            {t("productDetails.buyNow", "شراء الآن")}
          </button>

          <BtnAddToCart
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-lg transition duration-300 shadow-lg flex items-center justify-center"
            productDetailsId={DetailsId}
            Quantity={Quantity}
            product={product}
          />
        </div>
      )}
    </div>
  );
}
