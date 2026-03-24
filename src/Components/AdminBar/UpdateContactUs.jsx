import React, { useState, useEffect } from "react";
import API_BASE_URL from "../Constant";
import { useNavigate } from "react-router-dom";

export default function UpdateAdminInfo() {
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAdminInfo() {
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}AdminInfo/get-admin-info`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("فشل في جلب بيانات الإدارة");
        }
        const data = await response.json();
        setAdminInfo(data[0]);
      } catch (err) {
        setMessage(`خطأ: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("⏳ جاري التحديث...");
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}AdminInfo/UpdateAdminInfo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adminInfo),
      });
      if (response.ok) {
        setMessage("✅ تم تحديث معلومات الإدارة بنجاح!");
      } else {
        setMessage("❌ فشل تحديث معلومات الإدارة.");
      }
    } catch (err) {
      setMessage(`❌ حدث خطأ: ${err.message}`);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="text-white text-xl font-semibold">⏳ جاري التحميل...</div>
      </div>
    );
  }

  if (!adminInfo) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="text-white text-xl font-semibold">⚠ معلومات الإدارة غير متوفرة.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-500 to-orange-600 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl p-6 border border-orange-300">
        <h2 className="text-3xl font-bold text-center text-orange-500 mb-8 border-b-2 border-orange-500 pb-4">
          تحديث معلومات الإدارة
        </h2>
        
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-center font-semibold ${
            message.includes("✅") 
              ? "bg-green-100 text-green-800 border border-green-300" 
              : message.includes("❌") || message.includes("خطأ")
              ? "bg-red-100 text-red-800 border border-red-300"
              : "bg-blue-100 text-blue-800 border border-blue-300"
          }`}>
            {message}
          </div>
        )}

        <form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          dir="rtl"
        >
          <div className="space-y-2">
            <label className="block text-orange-400 font-semibold text-lg">
              {`محتوى "من نحن" (عربي):`}
            </label>
            <textarea
              rows={4}
              value={adminInfo.aboutUsAr || ""}
              onChange={(e) =>
                setAdminInfo({ ...adminInfo, aboutUsAr: e.target.value })
              }
              className="w-full px-4 py-3 bg-blue-700 border-2 border-orange-500 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
              placeholder="نص صفحة من نحن باللغة العربية"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-orange-400 font-semibold text-lg">
              About Us (English):
            </label>
            <textarea
              rows={4}
              value={adminInfo.aboutUsEn || ""}
              onChange={(e) =>
                setAdminInfo({ ...adminInfo, aboutUsEn: e.target.value })
              }
              className="w-full px-4 py-3 bg-blue-700 border-2 border-orange-500 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
              placeholder="About page content in English"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-orange-400 font-semibold text-lg">
              رقم التحويل:
            </label>
            <input
              type="text"
              value={adminInfo.transactionNumber}
              onChange={(e) =>
                setAdminInfo({ ...adminInfo, transactionNumber: e.target.value })
              }
              required
              className="w-full px-4 py-3 bg-blue-700 border-2 border-orange-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-orange-400 font-semibold text-lg">
              رقم الواتساب:
            </label>
            <input
              type="text"
              value={adminInfo.whatsAppNumber || ""}
              onChange={(e) =>
                setAdminInfo({ ...adminInfo, whatsAppNumber: e.target.value })
              }
              className="w-full px-4 py-3 bg-blue-700 border-2 border-orange-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-orange-400 font-semibold text-lg">
              رقم الاتصال:
            </label>
            <input
              type="text"
              value={adminInfo.callNumber || ""}
              onChange={(e) =>
                setAdminInfo({ ...adminInfo, callNumber: e.target.value })
              }
              className="w-full px-4 py-3 bg-blue-700 border-2 border-orange-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-orange-400 font-semibold text-lg">
              البريد الإلكتروني:
            </label>
            <input
              type="email"
              value={adminInfo.email || ""}
              onChange={(e) =>
                setAdminInfo({ ...adminInfo, email: e.target.value })
              }
              className="w-full px-4 py-3 bg-blue-700 border-2 border-orange-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-orange-400 font-semibold text-lg">
                رابط فيسبوك:
              </label>
              <input
                type="url"
                value={adminInfo.facebookUrl || ""}
                onChange={(e) =>
                  setAdminInfo({ ...adminInfo, facebookUrl: e.target.value })
                }
                className="w-full px-4 py-3 bg-blue-700 border-2 border-orange-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-orange-400 font-semibold text-lg">
                رابط إنستجرام:
              </label>
              <input
                type="url"
                value={adminInfo.instagramUrl || ""}
                onChange={(e) =>
                  setAdminInfo({ ...adminInfo, instagramUrl: e.target.value })
                }
                className="w-full px-4 py-3 bg-blue-700 border-2 border-orange-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-orange-400 font-semibold text-lg">
                رابط تيك توك:
              </label>
              <input
                type="url"
                value={adminInfo.tikTokUrl || ""}
                onChange={(e) =>
                  setAdminInfo({ ...adminInfo, tikTokUrl: e.target.value })
                }
                className="w-full px-4 py-3 bg-blue-700 border-2 border-orange-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                placeholder="https://tiktok.com/@..."
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 shadow-lg"
            disabled={loading}
          >
            {loading ? "⏳ جاري التحديث..." : "تحديث المعلومات"}
          </button>
        </form>
      </div>
    </div>
  );
}