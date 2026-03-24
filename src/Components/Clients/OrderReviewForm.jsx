import { useState } from "react";
import API_BASE_URL from "../Constant";
import { useI18n } from "../i18n/I18nContext";

export default function OrderReviewForm({
  productId,
  productName,
  onSubmitted,
}) {
  const { t } = useI18n();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError(t("reviews.loginRequired", "يجب تسجيل الدخول لإضافة تقييم"));
      return;
    }

    setLoading(true);
    setFeedback("");
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}products/${productId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating, comment }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "فشل إرسال التقييم");
      }

      setFeedback(t("reviews.thanks", "شكراً لمشاركتك رأيك!"));
      setComment("");
      setRating(5);
      if (typeof onSubmitted === "function") {
        onSubmitted(productId);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 bg-white rounded-xl border border-orange-200 shadow-sm p-4 space-y-3"
    >
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h4 className="text-base font-semibold text-blue-900">
          {t("purchaseDetails.reviewProduct", "قيّم المنتج")}: {productName}
        </h4>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-xl ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </button>
          ))}
          <span className="text-sm font-semibold text-gray-700">
            {rating}/5
          </span>
        </div>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="w-full border-2 border-blue-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
        placeholder={t(
          "reviews.commentPlaceholder",
          "اكتب تعليقك عن تجربتك مع المنتج..."
        )}
        required
      />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:from-orange-600 hover:to-orange-500 transition disabled:opacity-60"
        >
          {loading
            ? t("reviews.submitting", "جاري الإرسال...")
            : t("reviews.submit", "إرسال")}
        </button>
      </div>

      {feedback && (
        <p className="text-green-600 text-sm font-semibold">{feedback}</p>
      )}
      {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
    </form>
  );
}

