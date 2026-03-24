import React, { useEffect, useState } from "react";
import { FiFileText, FiSave } from "react-icons/fi";
import API_BASE_URL from "../../Constant";
import { useI18n } from "../../i18n/I18nContext";

export default function LegalContentEditor() {
  const { t } = useI18n();
  const [form, setForm] = useState({
    termsAr: "",
    termsEn: "",
    privacyAr: "",
    privacyEn: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}LegalContent`);
      if (!res.ok) {
        throw new Error("Failed to load legal content");
      }
      const data = await res.json();
      setForm({
        termsAr: data?.termsAr ?? "",
        termsEn: data?.termsEn ?? "",
        privacyAr: data?.privacyAr ?? "",
        privacyEn: data?.privacyEn ?? "",
      });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}LegalContent`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Failed to update legal content");
      }
      setMessage(t("legalContent.success", "تم حفظ المحتوى بنجاح"));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EA]">
        <div className="bg-white shadow-lg rounded-2xl px-8 py-6 text-lg font-semibold text-[#0A2C52]">
          ⏳ {t("legalContent.loading", "جارٍ تحميل المحتوى القانوني...")}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2EA] py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-[#F5CF9D]">
        <div className="px-8 py-6 border-b border-[#F5CF9D] flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#0A2C52] text-white flex items-center justify-center">
            <FiFileText size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0A2C52]">
              {t("legalContent.title", "تحرير الشروط وسياسة الخصوصية")}
            </h1>
            <p className="text-sm text-gray-500">
              {t("legalContent.subtitle", "قم بتحديث نصوص الشروط والخصوصية بكل سهولة")}
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`mx-8 mt-6 rounded-xl border px-4 py-3 text-sm font-semibold ${
              message.includes("تم")
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold text-[#0A2C52]">
                {t("legalContent.fields.termsAr", "الشروط والأحكام (عربي)")}
              </label>
              <textarea
                rows={6}
                className="w-full rounded-xl border border-[#F5CF9D] focus:ring-2 focus:ring-[#F55A00] px-4 py-3 text-sm bg-[#FFFCF7]"
                value={form.termsAr}
                onChange={handleChange("termsAr")}
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-[#0A2C52]">
                {t("legalContent.fields.termsEn", "Terms & Conditions (EN)")}
              </label>
              <textarea
                rows={6}
                className="w-full rounded-xl border border-[#F5CF9D] focus:ring-2 focus:ring-[#F55A00] px-4 py-3 text-sm bg-[#FFFCF7]"
                value={form.termsEn}
                onChange={handleChange("termsEn")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold text-[#0A2C52]">
                {t("legalContent.fields.privacyAr", "سياسة الخصوصية (عربي)")}
              </label>
              <textarea
                rows={6}
                className="w-full rounded-xl border border-[#F5CF9D] focus:ring-2 focus:ring-[#F55A00] px-4 py-3 text-sm bg-[#FFFCF7]"
                value={form.privacyAr}
                onChange={handleChange("privacyAr")}
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-[#0A2C52]">
                {t("legalContent.fields.privacyEn", "Privacy Policy (EN)")}
              </label>
              <textarea
                rows={6}
                className="w-full rounded-xl border border-[#F5CF9D] focus:ring-2 focus:ring-[#F55A00] px-4 py-3 text-sm bg-[#FFFCF7]"
                value={form.privacyEn}
                onChange={handleChange("privacyEn")}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#F55A00] hover:bg-[#E24F00] text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-60"
            >
              {saving ? (
                <span>{t("legalContent.saving", "جاري الحفظ...")}</span>
              ) : (
                <>
                  <FiSave />
                  <span>{t("legalContent.save", "حفظ التغييرات")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

