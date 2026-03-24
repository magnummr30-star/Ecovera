import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { FiTrash2, FiStar, FiPackage, FiUser } from "react-icons/fi";
import API_BASE_URL, { SiteName } from "../../Constant";
import { getRoleFromToken } from "../../utils";
import NavBar from "../../Home/Nav";
import { useI18n } from "../../i18n/I18nContext";

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const role = useMemo(() => getRoleFromToken(token), [token]);
  const { t, lang } = useI18n();

  useEffect(() => {
    if (role !== "Admin" && role !== "Manager") {
      navigate("/");
      return;
    }

    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}products/0/reviews/all?page=${page}&pageSize=${pageSize}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(t("reviewsAdmin.fetchError", "فشل في جلب التعليقات"));
        }

        const data = await response.json();
        setReviews(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [token, role, navigate, page, pageSize]);

  const handleDelete = async (reviewId) => {
    if (!confirm(t("reviewsAdmin.confirmDelete", "هل أنت متأكد من حذف هذا التعليق؟"))) return;

    try {
      const response = await fetch(`${API_BASE_URL}products/0/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(t("reviewsAdmin.deleteError", "فشل في حذف التعليق"));
      }

      setReviews(reviews.filter((r) => r.id !== reviewId));
      alert(t("reviewsAdmin.deleteSuccess", "تم حذف التعليق بنجاح"));
    } catch (err) {
      alert(t("reviewsAdmin.deleteFailed", "حدث خطأ أثناء حذف التعليق: ") + err.message);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/productDetails/${productId}`);
  };

  if (role !== "Admin" && role !== "Manager") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50" dir="rtl">
      <Helmet>
        <title>{t("reviewsAdmin.title", "إدارة التعليقات")} | {SiteName}</title>
      </Helmet>
      <NavBar />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-orange-700 rounded-2xl p-4 md:p-6 mb-5 shadow-lg border border-orange-600">
  <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide text-center">
    {t("reviewsAdmin.title", "إدارة التعليقات")}
  </h1>
  <p className="text-white mt-1 text-center">
    {t("reviewsAdmin.subtitle", "عرض وإدارة جميع تعليقات المنتجات")}
  </p>
</div>

        
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-[#ff7a00] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">{t("reviewsAdmin.loading", "جاري التحميل...")}</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
              {error}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <FiPackage size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-xl text-gray-600">{t("reviewsAdmin.noReviews", "لا توجد تعليقات")}</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <FiUser size={18} className="text-[#0a2540]" />
                            <span className="font-semibold text-[#0a2540]">{review.userName || t("reviewsAdmin.anonymousUser", "مستخدم مجهول")}</span>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`text-lg ${
                                  i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-gray-600">
                            {review.rating} / 5
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                          </span>
                        </div>

                        <p className="text-gray-700 mb-4 whitespace-pre-wrap leading-relaxed">
                          {review.comment}
                        </p>

                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600 font-medium">
                            {t("reviewsAdmin.product", "المنتج")}: {review.productName || `${t("reviewsAdmin.id", "ID")}: ${review.productId}`}
                          </span>
                          <button
                            onClick={() => handleProductClick(review.productId)}
                            className="text-[#0a2540] hover:text-[#ff7a00] font-semibold text-sm transition-colors flex items-center gap-2"
                          >
                            <FiPackage size={16} />
                            {t("reviewsAdmin.viewProduct", "عرض المنتج")}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shadow-md flex-shrink-0"
                        title={t("reviewsAdmin.deleteComment", "حذف التعليق")}
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-[#0a2540] hover:bg-[#13345d] text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {t("reviewsAdmin.previous", "السابق")}
                </button>
                <span className="text-sm font-semibold text-gray-700">{t("reviewsAdmin.page", "صفحة")} {page}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={reviews.length < pageSize}
                  className="px-4 py-2 bg-[#0a2540] hover:bg-[#13345d] text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {t("reviewsAdmin.next", "التالي")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

