import React, { useEffect, useState } from "react";
import API_BASE_URL from "../../Constant";
import { useI18n } from "../../i18n/I18nContext";

const ShippingInfo = () => {
  const [shippingData, setShippingData] = useState([]);
  const [selectedGovernorate, setSelectedGovernorate] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDeliveryTime, setNewDeliveryTime] = useState("");
  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaPrice, setNewAreaPrice] = useState("");
  const [newAreaDeliveryTime, setNewAreaDeliveryTime] = useState("");
  const [showAddArea, setShowAddArea] = useState(false);
  const { t } = useI18n();
  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

  // Function to translate governorate/region names
  const translateGovernorate = (governorate) => {
    if (!governorate) return governorate;
    return t(`emirates.${governorate}`, governorate);
  };

  // جلب بيانات الشحن من API باستخدام fetch
  useEffect(() => {
    const fetchShippingData = async () => {
      try {
        const token = sessionStorage.getItem("token"); // جلب التوكن من التخزين المحلي

        const response = await fetch(
          `${API_BASE_URL}ShippingInfo/GetShippingInfo`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // ⬅️ إرسال التوكن هنا
            },
          }
        );

        if (!response.ok) throw new Error("فشل جلب البيانات");

        const data = await response.json();
        setShippingData(data);
      } catch (error) {
        console.error("حدث خطأ أثناء جلب البيانات:", error);
      }
    };

    fetchShippingData();
  }, []);

  // تحديث السعر باستخدام fetch
  const handleUpdatePrice = async () => {
    if (!selectedGovernorate || newPrice.trim() === "" || isNaN(newPrice)) {
      alert("يرجى اختيار المحافظة وإدخال سعر صالح!");
      return;
    }

    const priceValue = parseFloat(newPrice);

    if (priceValue <= 0) {
      alert("يجب أن يكون السعر أكبر من 0!");
      return;
    }

    const token = sessionStorage.getItem("token"); // جلب التوكن من التخزين المحلي

    try {
      const response = await fetch(
        `${API_BASE_URL}ShippingInfo/UpdateShippingPrice/?Governorate=${selectedGovernorate}&NewPrice=${Number(
          priceValue
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Bearer ${token}`, // ⬅️ إرسال التوكن هنا
          },
        }
      );

      const responseData = await response.json();
      console.log("✅ استجابة API:", responseData);

      if (!response.ok) throw new Error("فشل تحديث السعر");

      // تحديث البيانات بعد التعديل
      setShippingData((prevData) =>
        prevData.map((item) =>
          item.governorate === selectedGovernorate
            ? { ...item, price: priceValue }
            : item
        )
      );

      alert("تم تحديث السعر بنجاح!");
    } catch (error) {
      console.error("❌ خطأ أثناء تحديث السعر:", error);
      alert("فشل التحديث، حاول مرة أخرى!");
    }
  };

  const handleUpdateDeliveryTime = async () => {
    if (!selectedGovernorate || newDeliveryTime.trim() === "" || isNaN(newDeliveryTime)) {
      alert("يرجى اختيار المحافظة وإدخال فترة وصول صالحة!");
      return;
    }

    const deliveryTimeValue = parseInt(newDeliveryTime);

    if (deliveryTimeValue <= 0) {
      alert("يجب أن تكون فترة الوصول أكبر من 0!");
      return;
    }

    const token = sessionStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_BASE_URL}ShippingInfo/UpdateDeliveryTime?Governorate=${selectedGovernorate}&DeliveryTimeDays=${deliveryTimeValue}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();
      console.log("✅ استجابة API:", responseData);

      if (!response.ok) throw new Error("فشل تحديث فترة الوصول");

      // تحديث البيانات بعد التعديل
      setShippingData((prevData) =>
        prevData.map((item) =>
          item.governorate === selectedGovernorate
            ? { ...item, deliveryTimeDays: deliveryTimeValue }
            : item
        )
      );

      alert("تم تحديث فترة الوصول بنجاح!");
      setNewDeliveryTime("");
    } catch (error) {
      console.error("❌ خطأ أثناء تحديث فترة الوصول:", error);
      alert("فشل التحديث، حاول مرة أخرى!");
    }
  };

  const handleAddArea = async () => {
    if (!newAreaName.trim() || !newAreaPrice.trim() || !newAreaDeliveryTime.trim()) {
      alert("يرجى إدخال جميع البيانات!");
      return;
    }

    const priceValue = parseFloat(newAreaPrice);
    const deliveryTimeValue = parseInt(newAreaDeliveryTime);

    if (priceValue <= 0 || deliveryTimeValue <= 0) {
      alert("السعر وفترة الوصول يجب أن تكون أكبر من 0!");
      return;
    }

    const token = sessionStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_BASE_URL}ShippingInfo/AddShippingArea?Governorate=${encodeURIComponent(newAreaName.trim())}&Price=${priceValue}&DeliveryTimeDays=${deliveryTimeValue}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "فشل إضافة المنطقة");
      }

      // Reload list
      const listResponse = await fetch(`${API_BASE_URL}ShippingInfo/GetShippingInfo`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await listResponse.json();
      setShippingData(data);

      alert("تمت إضافة المنطقة بنجاح!");
      setNewAreaName("");
      setNewAreaPrice("");
      setNewAreaDeliveryTime("");
      setShowAddArea(false);
    } catch (error) {
      console.error("❌ خطأ أثناء إضافة المنطقة:", error);
      alert(error.message || "فشل إضافة المنطقة، حاول مرة أخرى!");
    }
  };

  const handleDeleteArea = async (governorate) => {
    if (!confirm(`هل أنت متأكد من حذف منطقة "${governorate}"؟`)) {
      return;
    }

    const token = sessionStorage.getItem("token");

    try {
      const response = await fetch(
        `${API_BASE_URL}ShippingInfo/DeleteShippingArea?Governorate=${encodeURIComponent(governorate)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "فشل حذف المنطقة");
      }

      // Reload list
      const listResponse = await fetch(`${API_BASE_URL}ShippingInfo/GetShippingInfo`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await listResponse.json();
      setShippingData(data);

      alert("تم حذف المنطقة بنجاح!");
    } catch (error) {
      console.error("❌ خطأ أثناء حذف المنطقة:", error);
      alert(error.message || "فشل حذف المنطقة، حاول مرة أخرى!");
    }
  };

  const handleResetToEmirates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}ShippingInfo/ResetToEmirates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      if (!res.ok) throw new Error("reset failed");
      // reload list
      const response = await fetch(`${API_BASE_URL}ShippingInfo/GetShippingInfo`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      const data = await response.json();
      setShippingData(data);
      alert("تم ضبط الإمارات السبع بنجاح");
    } catch {
      alert("فشل إعادة الضبط");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-3 md:p-6">
      <div className="rounded-2xl p-4 md:p-5 shadow-lg border mb-5" style={{ background: 'linear-gradient(to right, #ff7a00, #ea580c)' }}>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">🛒 {t("shippingPrices", "أسعار الشحن")}</h2>
      </div>
      
      <div className="bg-white rounded-2xl shadow p-4 md:p-6 border mb-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="text-lg font-semibold">➕ {t("addShippingArea", "إضافة منطقة شحن")}</h3>
          <button 
            onClick={() => setShowAddArea(!showAddArea)} 
            className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow"
          >
            {showAddArea ? t("cancel", "إلغاء") : t("addNew", "إضافة جديدة")}
          </button>
        </div>
        {showAddArea && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <input
              type="text"
              placeholder={t("enterAreaName", "أدخل اسم المنطقة")}
              value={newAreaName}
              onChange={(e) => setNewAreaName(e.target.value)}
              className="border rounded-xl px-3 py-2"
            />
            <input
              type="number"
              placeholder={t("enterNewPrice", "أدخل السعر")}
              value={newAreaPrice}
              onChange={(e) => setNewAreaPrice(e.target.value)}
              className="border rounded-xl px-3 py-2"
            />
            <input
              type="number"
              placeholder={t("enterDeliveryTime", "أدخل فترة الوصول (أيام)")}
              value={newAreaDeliveryTime}
              onChange={(e) => setNewAreaDeliveryTime(e.target.value)}
              className="border rounded-xl px-3 py-2"
            />
            <button 
              onClick={handleAddArea} 
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 font-semibold shadow"
            >
              {t("add", "إضافة")}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow p-4 md:p-6 border">
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <h3 className="text-lg font-semibold">✏️ {t("updatePrice", "تحديث السعر")}</h3>
          <button onClick={handleResetToEmirates} className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow">
            {t("resetToEmirates", "إعادة ضبط الإمارات السبع")}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <select
            value={selectedGovernorate}
            onChange={(e) => setSelectedGovernorate(e.target.value)}
            className="border rounded-xl px-3 py-2"
          >
            <option value="">{t("selectGovernorate", "اختر الإمارة")}</option>
            {shippingData.map((item) => (
              <option key={item.id} value={item.governorate}>
                {translateGovernorate(item.governorate)}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder={t("enterNewPrice", "أدخل السعر الجديد")}
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="border rounded-xl px-3 py-2"
          />
          <button onClick={handleUpdatePrice} className="bg-[#0a2540] hover:bg-[#13345d] text-white rounded-xl px-4 py-2 font-semibold shadow">
            {t("updatePrice", "تحديث السعر")}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={selectedGovernorate}
            onChange={(e) => setSelectedGovernorate(e.target.value)}
            className="border rounded-xl px-3 py-2"
          >
            <option value="">{t("selectGovernorate", "اختر الإمارة")}</option>
            {shippingData.map((item) => (
              <option key={item.id} value={item.governorate}>
                {translateGovernorate(item.governorate)}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder={t("enterDeliveryTime", "أدخل فترة الوصول (أيام)")}
            value={newDeliveryTime}
            onChange={(e) => setNewDeliveryTime(e.target.value)}
            className="border rounded-xl px-3 py-2"
          />
          <button onClick={handleUpdateDeliveryTime} className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 font-semibold shadow">
            {t("updateDeliveryTime", "تحديث فترة الوصول")}
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow overflow-hidden border">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-right p-3">{t("governorate", "الإمارة")}</th>
              <th className="text-right p-3">{t("price", "السعر")}</th>
              <th className="text-right p-3">{t("deliveryTime", "فترة الوصول (أيام)")}</th>
              <th className="text-right p-3">{t("actions", "الإجراءات")}</th>
            </tr>
          </thead>
          <tbody>
            {shippingData.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-50/60">
                <td className="p-3">{translateGovernorate(item.governorate)}</td>
                <td className="p-3">{item.price}</td>
                <td className="p-3">{item.deliveryTimeDays || "-"}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleDeleteArea(item.governorate)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-semibold"
                  >
                    {t("delete", "حذف")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShippingInfo;
