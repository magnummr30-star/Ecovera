import { egyptianGovernorates as emirates } from "../../Components/utils";
import { handleAddAddress } from "./api.js";
import { useState } from "react";
import { useI18n } from "../i18n/I18nContext";

export default function AddressSelector({
  addresses,
  selectedAddressId,
  setSelectedAddressId,
  setShowAddAddressModal,
  showAddAddressModal,
  newAddress,
  setNewAddress,
  setAddresses,
  shippingAreas = [],
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { t, lang } = useI18n();
  const isRTL = lang === "ar";
  const availableAreas =
    shippingAreas.length > 0
      ? shippingAreas.map(
          (a) =>
            a?.governorate ||
            a?.governorateName ||
            a?.Governorate ||
            a?.GovernorateName ||
            a
        )
      : emirates;

  const HandleSaveClick = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert(t("addressSelector.tokenNotFound", "لم يتم العثور على التوكن، الرجاء تسجيل الدخول."));
      return;
    }

    setIsLoading(true);

    try {
      const addressId = await handleAddAddress(token, {
        governorate: newAddress.governorate,
        city: newAddress.city,
        street: newAddress.street,
      });

      if (!addressId)
        throw new Error(t("addressSelector.failedToGetId", "❌ فشل في الحصول على ID العنوان الجديد!"));

      const translatedGovernorate = t(`emirates.${newAddress.governorate}`, newAddress.governorate);
      const addressFormat = isRTL 
        ? `${translatedGovernorate}- مدينه ${newAddress.city} شارع ${newAddress.street}`
        : `${translatedGovernorate}- City ${newAddress.city} Street ${newAddress.street}`;
      
      setAddresses((prevAddresses) => ({
        ...prevAddresses,
        [addressId]: addressFormat,
      }));

      setSelectedAddressId(addressId);
      setShowAddAddressModal(false);
      setNewAddress({ governorate: "", city: "", street: "" });
    } catch (error) {
      console.error(t("addressSelector.errorAdding", "❌ خطأ أثناء إضافة العنوان:"), error.message);
      alert(`⚠️ ${t("addressSelector.error", "خطأ")}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 rtl">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-blue-900 rounded-full animate-spin"></div>
            <p className="text-blue-900 font-semibold">{t("addressSelector.saving", "جاري حفظ العنوان...")}</p>
          </div>
        </div>
      )}

      <h4 className="text-lg font-semibold text-blue-900">{t("addressSelector.selectedAddress", "العنوان المختار")}</h4>

      {Object.keys(addresses).length > 0 ? (
        <select
          className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-right focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-colors bg-white"
          value={selectedAddressId}
          onChange={(e) => setSelectedAddressId(e.target.value)}
        >
          {Object.entries(addresses).map(([id, address]) => (
            <option key={id} value={id}>
              {address}
            </option>
          ))}
        </select>
      ) : (
        <button className="text-orange-600 text-sm font-medium bg-orange-50 px-4 py-2 rounded-lg border border-orange-200 w-full">
          {t("addressSelector.noAddresses", "👇 لا توجد عناوين متاحة، قم بإضافة عنوان الآن 👇")}
        </button>
      )}

      <div className="text-center">
        <button
          onClick={(e) => {
            e.preventDefault();
            setShowAddAddressModal(true);
          }}
          className="text-blue-900 font-semibold hover:text-orange-600 transition-colors text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-orange-50 border border-blue-200 hover:border-orange-200"
        >
          + {t("addressSelector.addNewAddress", "أضف عنوانًا جديدًا")}
        </button>
      </div>

      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 space-y-6 border-2 border-orange-500" dir={isRTL ? "rtl" : "ltr"}>
            <h3 className="text-xl font-bold text-blue-900 text-center">
              {t("addressSelector.addNewAddressTitle", "إضافة عنوان جديد")}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  {t("addressSelector.governorate", "المحافظة")}:
                </label>
                <select
                  value={newAddress.governorate}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      governorate: e.target.value,
                    })
                  }
                  className={`w-full rounded-lg border-2 border-gray-300 px-4 py-3 ${isRTL ? "text-right" : "text-left"} focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-colors`}
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <option value="">{t("addressSelector.selectEmirate", "اختر إمارة")}</option>
                  {availableAreas.map((governorate, index) => (
                    <option key={index} value={governorate}>
                      {t(`emirates.${governorate}`, governorate)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  {t("addressSelector.city", "المدينة")}:
                </label>
                <input
                  type="text"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                  className={`w-full rounded-lg border-2 border-gray-300 px-4 py-3 ${isRTL ? "text-right" : "text-left"} focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-colors`}
                  placeholder={t("addressSelector.enterCity", "أدخل اسم المدينة")}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  {t("addressSelector.streetDetails", "الشارع + الشقة + الدور + تفاصيل إضافية")}
                </label>
                <input
                  type="text"
                  value={newAddress.street}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, street: e.target.value })
                  }
                  className={`w-full rounded-lg border-2 border-gray-300 px-4 py-3 ${isRTL ? "text-right" : "text-left"} focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-colors`}
                  placeholder={t("addressSelector.enterAddressDetails", "أدخل تفاصيل العنوان")}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                className="flex-1 bg-orange-500 text-white rounded-xl py-3 font-semibold hover:bg-orange-600 transition-colors shadow-md hover:shadow-lg"
                onClick={HandleSaveClick}
                disabled={isLoading}
              >
                {isLoading ? t("addressSelector.saving", "جاري الحفظ...") : t("addressSelector.saveAddress", "حفظ العنوان")}
              </button>
              <button
                className="flex-1 bg-blue-900 text-white rounded-xl py-3 font-semibold hover:bg-blue-800 transition-colors shadow-md hover:shadow-lg"
                onClick={() => setShowAddAddressModal(false)}
                disabled={isLoading}
              >
                {t("general.cancel", "إلغاء")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}