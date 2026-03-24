import { useEffect, useState } from "react";
import API_BASE_URL, { ServerPath } from "../../Constant";
import { useI18n } from "../../i18n/I18nContext";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function CategoriesAdmin() {
  const { t, lang } = useI18n();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    categoryNameAr: "",
    categoryNameEn: "",
    imagePath: "",
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}categories`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });
      if (!response.ok) throw new Error("failed");
      const data = await response.json();
      setCategories(data);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setForm({
      categoryNameAr: "",
      categoryNameEn: "",
      imagePath: "",
    });
    setEditingId(null);
  };

  const handleImageUpload = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    const token = sessionStorage.getItem("token");
    if (!token) {
      setMessage("يجب تسجيل الدخول لرفع الصورة.");
      return;
    }
    setImageUploading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("imageFile", file);
      const response = await fetch(`${API_BASE_URL}categories/upload-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "فشل رفع الصورة");
      }
      const data = await response.json();
      const imageUrl = data?.imageUrl ?? data?.ImageUrl ?? "";
      if (imageUrl) setForm((f) => ({ ...f, imagePath: imageUrl }));
    } catch (err) {
      setMessage(err.message);
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    const token = sessionStorage.getItem("token");
    if (!token) {
      setMessage("يجب تسجيل الدخول كأدمن.");
      return;
    }
    const payload = {
      categoryNameAr: form.categoryNameAr,
      categoryNameEn: form.categoryNameEn,
      imagePath: form.imagePath || null,
    };
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${API_BASE_URL}categories/${editingId}`
      : `${API_BASE_URL}categories`;
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "فشل حفظ التصنيف");
      }
      setMessage(
        editingId
          ? t("categoriesAdmin.updated", "تم تحديث التصنيف بنجاح")
          : t("categoriesAdmin.created", "تمت إضافة التصنيف بنجاح")
      );
      resetForm();
      fetchCategories();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.categoryId);
    setForm({
      categoryNameAr: category.categoryNameAr,
      categoryNameEn: category.categoryNameEn,
      imagePath: category.imagePath || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("categoriesAdmin.confirmDelete", "هل أنت متأكد من حذف التصنيف؟"))) {
      return;
    }
    const token = sessionStorage.getItem("token");
    try {
      const response = await fetch(`${API_BASE_URL}categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "تعذر حذف التصنيف");
      }
      setMessage(t("categoriesAdmin.deleted", "تم حذف التصنيف بنجاح"));
      fetchCategories();
    } catch (err) {
      setMessage(err.message);
    }
  };


  return (
    <div className="min-h-screen bg-[#F9F6EF] py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-200">
          <h1 className="text-2xl font-bold text-orange-600 mb-4">
            {t("categoriesAdmin.title", "إدارة التصنيفات")}
          </h1>
          {message && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                {t("categoriesAdmin.nameAr", "اسم التصنيف (عربي)")}
              </label>
              <input
                type="text"
                value={form.categoryNameAr}
                onChange={(e) =>
                  setForm({ ...form, categoryNameAr: e.target.value })
                }
                required
                className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                {t("categoriesAdmin.nameEn", "اسم التصنيف (إنجليزي)")}
              </label>
              <input
                type="text"
                value={form.categoryNameEn}
                onChange={(e) =>
                  setForm({ ...form, categoryNameEn: e.target.value })
                }
                required
                className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                {t("categoriesAdmin.image", "صورة التصنيف")}
              </label>
              <p className="text-xs text-gray-600 mb-1.5">
                {t("categoriesAdmin.imageDimensions", "المقاس الموصى به للوضوح وعدم القص على جميع الشاشات: 400×400 أو 512×512 بكسل (صورة مربعة).")}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={imageUploading}
                className="w-full border border-blue-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              {imageUploading && (
                <p className="text-sm text-gray-500 mt-1">
                  {t("uploading", "جاري الرفع...")}
                </p>
              )}
              {form.imagePath && (
                <div className="mt-2 flex items-center justify-center bg-gray-50 rounded-lg p-2 w-20 h-20 overflow-hidden">
                  <img
                    src={form.imagePath.startsWith("http") ? form.imagePath : `${ServerPath}${form.imagePath}`}
                    alt="Category"
                    className="max-w-full max-h-full object-contain rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition"
              >
                {editingId
                  ? t("saveChanges", "حفظ التعديلات")
                  : t("add", "إضافة")}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                >
                  {t("cancel", "إلغاء")}
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
          <h2 className="text-xl font-bold text-blue-900 mb-4">
            {t("categoriesAdmin.list", "قائمة التصنيفات")}
          </h2>
          {loading ? (
            <p className="text-center text-gray-600">
              {t("loadingCategories", "جارٍ التحميل...")}
            </p>
          ) : categories.length === 0 ? (
            <p className="text-center text-gray-600">
              {t("noCategories", "لا توجد أقسام متاحة حالياً.")}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category.categoryId}
                  className="border border-blue-100 rounded-xl p-4 bg-blue-50/50 shadow-sm flex flex-col"
                >
                  {category.imagePath && (
                    <div className="h-16 w-full rounded-lg mb-3 overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img
                        src={category.imagePath.startsWith("http") ? category.imagePath : `${ServerPath}${category.imagePath}`}
                        alt={category.categoryNameAr}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    {category.categoryNameAr}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {category.categoryNameEn}
                  </p>
                  <div className="mt-auto flex items-center gap-2 pt-4">
                    <button
                      onClick={() => handleEdit(category)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      <FaEdit />
                      {t("edit", "تعديل")}
                    </button>
                    <button
                      onClick={() => handleDelete(category.categoryId)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                    >
                      <FaTrash />
                      {t("delete", "حذف")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

