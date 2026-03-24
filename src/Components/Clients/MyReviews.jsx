import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { FiTrash2, FiStar, FiPackage } from "react-icons/fi";
import API_BASE_URL, { SiteName } from "../Constant";
import NavBar from "../Home/Nav";
import { useI18n } from "../i18n/I18nContext";

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const { t, lang } = useI18n();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}products/0/reviews/my-reviews`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(t("myReviews.fetchError", "فشل في جلب التعليقات"));
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
  }, [token, navigate]);

  const handleDelete = async (reviewId) => {
    if (!confirm(t("myReviews.confirmDelete", "هل أنت متأكد من حذف هذا التعليق؟"))) return;

    try {
      const response = await fetch(`${API_BASE_URL}products/0/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(t("myReviews.deleteError", "فشل في حذف التعليق"));
      }

      setReviews(reviews.filter((r) => r.id !== reviewId));
      alert(t("myReviews.deleteSuccess", "تم حذف التعليق بنجاح"));
    } catch (err) {
      alert(t("myReviews.deleteFailed", "حدث خطأ أثناء حذف التعليق: ") + err.message);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/productDetails/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50" dir="rtl">
      <Helmet>
        <title>{t("myReviews.metaTitle", "تعليقاتي")} | {SiteName}</title>
      </Helmet>
      <NavBar />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-[#0a2540] mb-6 text-center">{t("myReviews.title", "تعليقاتي")}</h1>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-[#ff7a00] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">{t("myReviews.loading", "جاري التحميل...")}</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
              {error}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <FiPackage size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-xl text-gray-600">{t("myReviews.noReviews", "لا توجد تعليقات بعد")}</p>
              <button
                onClick={() => navigate("/")}
                className="mt-4 bg-[#ff7a00] hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                {t("myReviews.browseProducts", "تصفح المنتجات")}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
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
                          {t("myReviews.product", "المنتج")}: {review.productName || `${t("myReviews.id", "ID")}: ${review.productId}`}
                        </span>
                        <button
                          onClick={() => handleProductClick(review.productId)}
                          className="text-[#0a2540] hover:text-[#ff7a00] font-semibold text-sm transition-colors flex items-center gap-2"
                        >
                          <FiPackage size={16} />
                          {t("myReviews.viewProduct", "عرض المنتج")}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shadow-md flex-shrink-0"
                      title={t("myReviews.deleteComment", "حذف التعليق")}
                    >
                      <FiTrash2 size={20} />
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

