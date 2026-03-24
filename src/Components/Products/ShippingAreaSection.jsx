import React from "react";

export default function ShippingAreaSection({
  selectedShippingArea,
  onShippingAreaChange,
  shippingAreas = [],
  deliveryTimeDays,
  translateGovernorate,
  t,
}) {
  return (
    <div className="bg-blue-50 rounded-2xl shadow-xl p-6 border border-blue-200">
      <div className="flex flex-col space-y-4">
        <label className="text-lg font-semibold text-blue-900">
          {t("productDetails.shipTo", "شحن إلى")}:
        </label>
        <select
          value={selectedShippingArea}
          onChange={(e) => onShippingAreaChange(e.target.value)}
          className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900"
        >
          <option value="">{t("productDetails.selectShippingArea", "اختر منطقة الشحن")}</option>
          {shippingAreas.map((area) => (
            <option key={area.id} value={area.governorate}>
              {translateGovernorate(area.governorate)}
            </option>
          ))}
        </select>
        {deliveryTimeDays !== null && (
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800 font-medium">
              {t("productDetails.estimatedDelivery", "الوقت المتوقع للوصول")}:{" "}
              <span className="font-bold text-orange-600">
                {deliveryTimeDays} {t("productDetails.days", "يوم")}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
