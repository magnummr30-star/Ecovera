import React, { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../../Constant";
import { getRoleFromToken } from "../../utils";
import { useI18n } from "../../i18n/I18nContext";
import WebSiteLogo from "../../WebsiteLogo/WebsiteLogo.jsx";

export default function AnnouncementBarAdmin() {
  const token = sessionStorage.getItem("token");
  const role = useMemo(() => getRoleFromToken(token), [token]);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    id: 0,
    textAr: "",
    textEn: "",
    linkUrl: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const { t } = useI18n();
  const [statusBanner, setStatusBanner] = useState(null);
  const scrollToTopSmooth = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const hydrateForm = (data, shouldScroll = false) => {
    if (!data) return;
    setForm({
      id: data.id,
      textAr: data.textAr || "",
      textEn: data.textEn || "",
      linkUrl: data.linkUrl || "",
      isActive: data.isActive !== false,
    });
    if (shouldScroll) {
      scrollToTopSmooth();
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // استخدام endpoint الجديد للحصول على جميع التفاصيل
        const res = await fetch(`${API_BASE_URL}AnnouncementBar/active/details`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined }
        });
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setItem(data);
            hydrateForm(data);
          }
        } else if (res.status === 404) {
          // لا يوجد إعلان نشط
          setItem(null);
          resetForm();
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (role !== "Admin" && role !== "Manager") {
    return <div className="p-6 text-center">غير مصرح لك بالدخول</div>;
  }

  const resetForm = () => {
    setForm({ id: 0, textAr: "", textEn: "", linkUrl: "", isActive: true });
  };

  const showStatus = (text, tone = "info") => {
    setStatusBanner({ text, tone });
    setTimeout(() => setStatusBanner(null), 4000);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      scrollToTopSmooth();
      const method = form.id ? "PUT" : "POST";
      const url = form.id ? `${API_BASE_URL}AnnouncementBar/${form.id}` : `${API_BASE_URL}AnnouncementBar`;
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json", 
          Authorization: token ? `Bearer ${token}` : undefined 
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("failed");
      // reload
      const reloadRes = await fetch(`${API_BASE_URL}AnnouncementBar/active/details`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      if (reloadRes.ok) {
        const data = await reloadRes.json();
        if (data) {
          setItem(data);
          hydrateForm(data);
        } else {
          resetForm();
        }
      } else {
        resetForm();
      }
      showStatus("تم حفظ بيانات شريط الإعلان بنجاح", "success");
    } catch (e) {
      console.error(e);
      showStatus("حدث خطأ أثناء الحفظ، حاول مرة أخرى", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("حذف شريط الإعلان؟")) return;
    try {
      scrollToTopSmooth();
      const res = await fetch(`${API_BASE_URL}AnnouncementBar/${id}`, { 
        method: "DELETE", 
        headers: { Authorization: token ? `Bearer ${token}` : undefined } 
      });
      if (!res.ok) throw new Error("failed");
      setItem(null);
      resetForm();
      showStatus("تم حذف شريط الإعلان", "success");
    } catch (e) {
      console.error(e);
      showStatus("تعذر حذف الشريط، حاول مرة أخرى", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-3 md:p-6">
      <div className="rounded-2xl p-4 md:p-6 mb-5 shadow-lg border bg-[#F9F6EF]">
        <div className="flex flex-col items-center mb-4">
          <WebSiteLogo width={300} height={100} className="mb-4" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2C52] tracking-wide text-center">إدارة شريط الإعلان</h1>
        <p className="text-[#0A2C52]/80 mt-1 text-center">تعديل شريط الإعلان العلوي</p>
      </div>

      {statusBanner && (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${
            statusBanner.tone === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : statusBanner.tone === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-blue-50 border-blue-200 text-blue-700"
          }`}
        >
          {statusBanner.text}
        </div>
      )}

      <form onSubmit={submit} className="bg-[#F9F6EF] rounded-2xl shadow p-3 md:p-5 grid grid-cols-1 gap-4 border border-[#0A2C52]/20">
        <div>
          <label className="block text-sm mb-1 font-semibold text-[#0A2C52]">النص (عربي) <span className="text-red-500">*</span></label>
          <input 
            className="border border-[#0A2C52]/30 rounded w-full px-3 py-2 bg-white text-[#0A2C52]" 
            value={form.textAr} 
            onChange={(e) => setForm({ ...form, textAr: e.target.value })} 
            required 
            placeholder="أدخل نص الإعلان بالعربية"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 font-semibold text-[#0A2C52]">النص (إنجليزي) <span className="text-red-500">*</span></label>
          <input 
            className="border border-[#0A2C52]/30 rounded w-full px-3 py-2 bg-white text-[#0A2C52]" 
            value={form.textEn} 
            onChange={(e) => setForm({ ...form, textEn: e.target.value })} 
            required 
            placeholder="Enter announcement text in English"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 font-semibold text-[#0A2C52]">رابط عند الضغط (اختياري)</label>
          <input 
            className="border border-[#0A2C52]/30 rounded w-full px-3 py-2 bg-white text-[#0A2C52]" 
            value={form.linkUrl} 
            onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} 
            placeholder="https://example.com"
          />
        </div>
        <div className="flex items-center gap-2">
          <input 
            id="isActive" 
            type="checkbox" 
            checked={form.isActive} 
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })} 
          />
          <label htmlFor="isActive" className="font-semibold text-[#0A2C52]">مفعل</label>
        </div>
        <div className="flex gap-2 justify-start">
          <button 
            disabled={submitting} 
            className="bg-[#0A2C52] hover:bg-[#13345d] text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "جاري الحفظ..." : (form.id ? "تحديث" : "إضافة")}
          </button>
          {form.id ? (
            <button 
              type="button" 
              className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition-all shadow-md" 
              onClick={resetForm}
            >
              إلغاء
            </button>
          ) : null}
        </div>
      </form>

      {item && (
        <div className="mt-6 bg-[#F9F6EF] rounded-2xl shadow p-4 border border-[#0A2C52]/20">
          <h2 className="text-xl font-semibold mb-3 text-[#0A2C52]">الشريط الحالي</h2>
          <div className="space-y-2">
            <p className="text-[#0A2C52]"><strong>العربي:</strong> {item.textAr}</p>
            <p className="text-[#0A2C52]"><strong>English:</strong> {item.textEn}</p>
            {item.linkUrl && <p className="text-[#0A2C52]"><strong>الرابط:</strong> {item.linkUrl}</p>}
            <p className="text-[#0A2C52]"><strong>الحالة:</strong> {item.isActive ? "مفعل" : "معطل"}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <button 
                className="px-4 py-2 rounded-xl bg-[#0A2C52] hover:bg-[#13345d] text-white font-semibold transition-all shadow-md" 
                onClick={() => {
                  hydrateForm(item, true);
                }}
              >
                تعديل
              </button>
              <button 
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all shadow-md" 
                onClick={() => remove(item.id)}
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

