import React, { useEffect, useMemo, useState } from "react";
import API_BASE_URL, { ServerPath } from "../../Constant";
import { getRoleFromToken } from "../../utils";
import { useI18n } from "../../i18n/I18nContext";
import WebSiteLogo from "../../WebsiteLogo/WebsiteLogo.jsx";

export default function BannersAdmin() {
  const token = sessionStorage.getItem("token");
  const role = useMemo(() => getRoleFromToken(token), [token]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    id: 0,
    titleAr: "",
    titleEn: "",
    subTitleAr: "",
    subTitleEn: "",
    imageUrl: "",
    linkUrl: "",
    videoUrl: "",
    bannerType: "home",
    categoryId: null,
    isActive: true,
    displayOrder: 0,
  });
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}Banners`);
        const data = await res.json().catch(() => null);
        const list = Array.isArray(data) ? data : [];
        setItems(list);
      } catch (e) {
        console.error(e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${API_BASE_URL}Product/GetCategoriesNames`, { headers });
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
        setCategories(list);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [token]);

  if (role !== "Admin" && role !== "Manager") {
    return <div className="p-6 text-center">غير مصرح لك بالدخول</div>;
  }

  const resetForm = () => {
    setForm({ id: 0, titleAr: "", titleEn: "", subTitleAr: "", subTitleEn: "", imageUrl: "", linkUrl: "", videoUrl: "", bannerType: "home", categoryId: null, isActive: true, displayOrder: 0 });
    setImageFile(null);
    setImagePreview("");
    setVideoFile(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return form.imageUrl;
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("imageFile", imageFile);
      
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}Banners/UploadBannerImage`, {
        method: "POST",
        headers: headers,
        body: formData,
      });
      if (!res.ok) throw new Error("فشل رفع الصورة");
      const data = await res.json();
      return data.imageUrl;
    } catch (e) {
      console.error(e);
      alert("فشل رفع الصورة");
      return form.imageUrl;
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadVideo = async () => {
    if (!videoFile) return form.videoUrl || "";
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append("videoFile", videoFile);
      const headers = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE_URL}Banners/UploadBannerVideo`, {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "فشل رفع الفيديو");
      }
      const data = await res.json();
      return data.videoUrl || "";
    } catch (e) {
      console.error(e);
      alert(e?.message || "فشل رفع الفيديو");
      return form.videoUrl || "";
    } finally {
      setUploadingVideo(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl = form.imageUrl || null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      let videoUrl = (form.videoUrl || "").trim();
      if (videoFile) {
        const uploaded = await uploadVideo();
        if (uploaded) videoUrl = uploaded;
      }
      if (!(imageUrl || videoUrl)) {
        alert(t("bannerImageOrVideoRequired", "يلزم إضافة صورة البانر أو فيديو واحد على الأقل."));
        setSubmitting(false);
        return;
      }
      const method = form.id ? "PUT" : "POST";
      const url = form.id ? `${API_BASE_URL}Banners/${form.id}` : `${API_BASE_URL}Banners`;
      const payload = { ...form, imageUrl: imageUrl || null, videoUrl: videoUrl || null, categoryId: form.bannerType === "category" && form.categoryId != null ? Number(form.categoryId) : null };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : undefined },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg = errBody?.error || errBody?.message || "فشل الحفظ";
        throw new Error(msg);
      }
      // reload
      const listRes = await fetch(`${API_BASE_URL}Banners`);
      const listData = await listRes.json().catch(() => null);
      setItems(Array.isArray(listData) ? listData : []);
      resetForm();
    } catch (e) {
      console.error(e);
      alert(e?.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSubmitting(false);
    }
  };

  const edit = (b) => {
    const hasCat = b.categoryId != null && b.categoryId !== undefined;
    setForm({
      id: b.id,
      titleAr: b.titleAr || "",
      titleEn: b.titleEn || "",
      subTitleAr: b.subTitleAr || "",
      subTitleEn: b.subTitleEn || "",
      imageUrl: b.imageUrl || "",
      linkUrl: b.linkUrl || "",
      videoUrl: b.videoUrl || "",
      bannerType: hasCat ? "category" : "home",
      categoryId: hasCat ? b.categoryId : null,
      isActive: !!b.isActive,
      displayOrder: b.displayOrder || 0,
    });
    setImageFile(null);
    setImagePreview(b.imageUrl ? `${ServerPath}${b.imageUrl}` : "");
    setVideoFile(null);
  };

  const remove = async (id) => {
    if (!confirm("حذف البانر؟")) return;
    try {
      const res = await fetch(`${API_BASE_URL}Banners/${id}`, { method: "DELETE", headers: { Authorization: token ? `Bearer ${token}` : undefined } });
      if (!res.ok) throw new Error("failed");
      setItems((prev) => (Array.isArray(prev) ? prev.filter((x) => x.id !== id) : []));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-3 md:p-6">
      <div className="rounded-2xl p-4 md:p-6 mb-5 shadow-lg border bg-[#F9F6EF]">
        <div className="flex flex-col items-center mb-4">
          <WebSiteLogo width={300} height={100} className="mb-4" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A2C52] tracking-wide text-center">{t("bannersAdmin", "إدارة البانرز")}</h1>
        <p className="text-[#0A2C52]/80 mt-1 text-center">{t("list", "القائمة")}</p>
      </div>

      <form onSubmit={submit} className="bg-[#F9F6EF] rounded-2xl shadow p-3 md:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 border border-[#0A2C52]/20">
        <div>
          <label className="block text-sm mb-1 font-semibold text-[#0A2C52]">العنوان (عربي) <span className="text-red-500">*</span></label>
          <input className="border border-[#0A2C52]/30 rounded w-full px-3 py-2 bg-white text-[#0A2C52]" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm mb-1 font-semibold text-[#0A2C52]">العنوان (إنجليزي) <span className="text-red-500">*</span></label>
          <input className="border border-[#0A2C52]/30 rounded w-full px-3 py-2 bg-white text-[#0A2C52]" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm mb-1 font-semibold text-[#0A2C52]">النص الفرعي (عربي)</label>
          <input className="border border-[#0A2C52]/30 rounded w-full px-3 py-2 bg-white text-[#0A2C52]" value={form.subTitleAr} onChange={(e) => setForm({ ...form, subTitleAr: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm mb-1 font-semibold text-[#0A2C52]">النص الفرعي (إنجليزي)</label>
          <input className="border border-[#0A2C52]/30 rounded w-full px-3 py-2 bg-white text-[#0A2C52]" value={form.subTitleEn} onChange={(e) => setForm({ ...form, subTitleEn: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1 font-semibold text-[#0A2C52]">{t("bannerType", "نوع البانر")}</label>
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="bannerType" checked={form.bannerType === "home"} onChange={() => setForm({ ...form, bannerType: "home", categoryId: null })} />
              <span className="text-[#0A2C52] font-medium">{t("bannerHome", "بانر رئيسي (الصفحة الرئيسية)")}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="bannerType" checked={form.bannerType === "category"} onChange={() => setForm({ ...form, bannerType: "category" })} />
              <span className="text-[#0A2C52] font-medium">{t("bannerCategory", "بانر لقسم معين")}</span>
            </label>
          </div>
          {form.bannerType === "category" && (
            <div className="mb-3">
              <label className="block text-sm mb-1 font-semibold text-[#0A2C52]">{t("category", "القسم")}</label>
              <select
                className="border border-[#0A2C52]/30 rounded w-full max-w-xs px-3 py-2 bg-white text-[#0A2C52]"
                value={form.categoryId ?? ""}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value === "" ? null : e.target.value })}
              >
                <option value="">— {t("selectCategory", "اختر القسم")} —</option>
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>{c.categoryNameAr ?? c.name ?? c.categoryNameEn ?? "قسم " + c.categoryId}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1 font-semibold text-[#0A2C52]">{t("bannerImage", "صورة البانر")} ({t("optional", "اختياري")})</label>
          <p className="text-xs text-gray-600 mb-1.5">
            {t("bannerImageDimensions", "المقاس الموصى به: 1200×400 أو 1920×640 بكسل (نسبة 3:1).")}
          </p>
          <input 
            type="file" 
            accept="image/*" 
            className="border border-[#0A2C52]/30 rounded w-full px-3 py-2 bg-white text-[#0A2C52]" 
            onChange={handleImageChange}
          />
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="max-w-full h-32 object-contain border rounded" />
            </div>
          )}
          {form.imageUrl && !imagePreview && (
            <div className="mt-2">
              <img src={`${ServerPath}${form.imageUrl}`} alt="Current" className="max-w-full h-32 object-contain border rounded" />
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1 font-semibold text-[#0A2C52]">{t("clickUrl", "رابط عند الضغط (اختياري)")}</label>
          <input className="border border-[#0A2C52]/30 rounded w-full px-3 py-2 bg-white text-[#0A2C52]" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm mb-1 font-semibold text-[#0A2C52]">{t("videoUrl", "رابط الفيديو أو رفع فيديو (اختياري)")}</label>
          <input className="border border-[#0A2C52]/30 rounded w-full px-3 py-2 bg-white text-[#0A2C52] mb-2" placeholder="https://..." value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
          <input type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime" className="border border-[#0A2C52]/30 rounded w-full px-3 py-2 bg-white text-[#0A2C52] text-sm" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
          {videoFile && <p className="text-xs text-gray-600 mt-1">{t("videoFileSelected", "سيتم رفع الملف عند الحفظ")}: {videoFile.name}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1 font-semibold text-[#0A2C52]">{t("displayOrder", "ترتيب العرض")}</label>
          <input type="number" className="border border-[#0A2C52]/30 rounded w-full px-3 py-2 bg-white text-[#0A2C52]" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
        </div>
        <div className="flex items-center gap-2">
          <input id="isActive" type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
          <label htmlFor="isActive" className="font-semibold text-[#0A2C52]">{t("active", "مفعل")}</label>
        </div>
        <div className="md:col-span-2 flex gap-2 justify-start">
          <button disabled={submitting || uploadingImage || uploadingVideo} className="bg-[#0A2C52] hover:bg-[#13345d] text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            {uploadingImage ? t("uploadingImage", "جاري رفع الصورة...") : uploadingVideo ? t("uploadingVideo", "جاري رفع الفيديو...") : submitting ? t("saving", "جاري الحفظ...") : (form.id ? t("edit", "تعديل") : t("add", "إضافة"))}
          </button>
          {form.id ? (
            <button type="button" className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold transition-all shadow-md" onClick={resetForm}>{t("cancel", "إلغاء")}</button>
          ) : null}
        </div>
      </form>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">{t("list", "القائمة")}</h2>
        {loading ? (
          <div className="p-4 text-center">{t("loading", "جاري التحميل...")}</div>
        ) : !Array.isArray(items) || items.length === 0 ? (
          <div className="p-4 text-center">{t("noBanners", "لا توجد بانرز")}</div>
        ) : (
          <table className="min-w-full bg-[#F9F6EF] rounded-2xl shadow overflow-hidden border border-[#0A2C52]/20">
      <thead className="bg-[#0A2C52] text-white">
  <tr>
    <th className="text-right p-3 font-bold">#</th>
    <th className="text-right p-3 font-bold">{t("title", "العنوان")}</th>
    <th className="text-right p-3 font-bold">{t("bannerType", "نوع البانر")}</th>
    <th className="text-right p-3 font-bold">{t("displayOrder", "ترتيب العرض")}</th>
    <th className="text-right p-3 font-bold">{t("status", "حالة")}</th>
    <th className="text-right p-3 font-bold">{t("actions", "إجراءات")}</th>
  </tr>
</thead>

            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-t border-[#0A2C52]/20 hover:bg-[#F9F6EF]">
                  <td className="p-3 text-[#0A2C52] font-medium">{b.id}</td>
                  <td className="p-3 text-[#0A2C52] font-medium">{b.titleAr || b.titleEn || "—"}</td>
                  <td className="p-3 text-[#0A2C52] font-medium">
                    {b.categoryId != null ? (() => { const cat = categories.find((c) => c.categoryId === b.categoryId); return cat?.categoryNameAr ?? cat?.name ?? cat?.categoryNameEn ?? t("bannerCategory", "قسم") + " #" + b.categoryId; })() : t("bannerHome", "رئيسي (هوم)")}
                  </td>
                  <td className="p-3 text-[#0A2C52] font-medium">{b.displayOrder}</td>
                  <td className="p-3 text-[#0A2C52] font-medium">{b.isActive ? t("active", "مفعل") : "—"}</td>
                  <td className="p-3 flex gap-2">
                    <button className="px-4 py-2 rounded-xl bg-[#0A2C52] hover:bg-[#13345d] text-white font-semibold transition-all shadow-md" onClick={() => edit(b)}>{t("edit", "تعديل")}</button>
                    <button className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all shadow-md" onClick={() => remove(b.id)}>{t("delete", "حذف")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


