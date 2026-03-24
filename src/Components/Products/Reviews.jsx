import React, { useEffect, useState } from "react";
import API_BASE_URL from "../Constant";
import { useI18n } from "../i18n/I18nContext";

export default function Reviews({ productId }) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [replies, setReplies] = useState({}); // { reviewId: [replies] }
  const [newReplies, setNewReplies] = useState({}); // { reviewId: replyText }
  const [replyingTo, setReplyingTo] = useState(null); // reviewId
  const [submittingReply, setSubmittingReply] = useState({}); // { reviewId: boolean }
  const { t, lang } = useI18n();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}products/${productId}/reviews?page=${page}&pageSize=${pageSize}`);
        const data = await res.json();
        setItems(data.items || []);
        setTotal(data.total || 0);
        setAverage(data.averageRating || 0);
        
        // تحميل الردود لكل تعليق
        if (data.items && data.items.length > 0) {
          const repliesData = {};
          for (const review of data.items) {
            try {
              const repliesRes = await fetch(`${API_BASE_URL}reviews/${review.id}/replies`);
              if (repliesRes.ok) {
                const repliesList = await repliesRes.json();
                repliesData[review.id] = repliesList || [];
              }
            } catch (e) {
              console.error(`Failed to load replies for review ${review.id}`, e);
              repliesData[review.id] = [];
            }
          }
          setReplies(repliesData);
        }
      } catch (e) {
        console.error("Failed to load reviews", e);
      } finally {
        setLoading(false);
      }
    };
    if (productId) load();
  }, [productId, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg md:text-xl font-semibold">{t("reviews.title", "التقييمات")}</h3>
        <div className="text-sm md:text-base">
          {t("reviews.averageRating", "متوسط التقييم")}: {average.toFixed(1)} / 5
        </div>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
        {t(
          "reviews.onlyDeliveredInfo",
          "يمكنك إضافة تقييم بعد تسليم طلبك من خلال صفحة طلباتي > الطلبات التي تم توصيلها."
        )}
      </div>
      {loading ? (
        <div className="py-6 text-center">{t("reviews.loading", "جاري التحميل...")}</div>
      ) : items.length === 0 ? (
        <div className="py-6 text-center text-gray-600">{t("reviews.noReviews", "لا توجد تقييمات بعد.")}</div>
      ) : (
        <ul className="divide-y divide-gray-200 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {items.map((r) => (
            <li key={r.id} className="p-4 md:p-6 hover:bg-gray-50/50 transition-colors">
              {/* التعليق الرئيسي */}
              <div className="flex items-start gap-3 mb-3">
                {/* أيقونة المستخدم للمعلق */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#92278f] to-[#ee207b] flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {r.userName ? r.userName.charAt(0).toUpperCase() : "?"}
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* معلومات المعلق */}
                  <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-bold text-[#92278f]">
                          {r.userName || t("reviews.anonymous", "مستخدم مجهول")}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          {t("reviews.reviewer", "معلق")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-sm ${i < r.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                        </div>
                        <span className="text-xs font-semibold text-gray-600">{r.rating} / 5</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* نص التعليق */}
                  <div className="bg-gray-50 rounded-lg p-3 border-r-4 border-[#92278f] mb-3">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{r.comment}</p>
                  </div>
                  
                  {/* زر الرد */}
                  <div className="mb-3">
                    <button
                      onClick={() => {
                        const token = sessionStorage.getItem("token");
                        if (!token) {
                          alert(t("reviews.loginToReply", "يجب تسجيل الدخول للرد على التعليقات"));
                          return;
                        }
                        setReplyingTo(replyingTo === r.id ? null : r.id);
                        if (!newReplies[r.id]) {
                          setNewReplies({ ...newReplies, [r.id]: "" });
                        }
                      }}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#92278f] hover:bg-[#ee207b] px-3 py-1.5 rounded-lg shadow-sm transition-all"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      {replyingTo === r.id ? t("reviews.cancelReply", "إلغاء") : t("reviews.reply", "رد")}
                    </button>
                    
                    {/* نموذج الرد */}
                    {replyingTo === r.id && (
                      <div className="mt-3 space-y-2 bg-orange-50 rounded-lg p-3 border border-orange-200">
                        <textarea
                          value={newReplies[r.id] || ""}
                          onChange={(e) => setNewReplies({ ...newReplies, [r.id]: e.target.value })}
                          placeholder={t("reviews.replyPlaceholder", "اكتب ردك هنا...")}
                          className="w-full px-3 py-2 border-2 border-orange-300 rounded-lg focus:border-[#ff7a00] focus:outline-none focus:ring-2 focus:ring-[#ff7a00]/20 transition-colors resize-none text-sm bg-white"
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              const token = sessionStorage.getItem("token");
                              if (!token || !newReplies[r.id]?.trim()) return;
                              
                              setSubmittingReply({ ...submittingReply, [r.id]: true });
                              try {
                                const res = await fetch(`${API_BASE_URL}reviews/${r.id}/replies`, {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`
                                  },
                                  body: JSON.stringify({ reply: newReplies[r.id] })
                                });
                                
                                if (!res.ok) throw new Error("Failed to submit reply");
                                
                                const savedReply = await res.json();
                                
                                // تحديث الردود
                                setReplies({
                                  ...replies,
                                  [r.id]: [...(replies[r.id] || []), savedReply]
                                });
                                
                                setNewReplies({ ...newReplies, [r.id]: "" });
                                setReplyingTo(null);
                              } catch (e) {
                                console.error("Failed to submit reply", e);
                                alert(t("reviews.replyError", "فشل إرسال الرد. يرجى المحاولة مرة أخرى."));
                              } finally {
                                setSubmittingReply({ ...submittingReply, [r.id]: false });
                              }
                            }}
                            disabled={submittingReply[r.id] || !newReplies[r.id]?.trim()}
                            className="px-4 py-2 bg-[#ff7a00] hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submittingReply[r.id] ? t("reviews.submitting", "جاري الإرسال...") : t("reviews.sendReply", "إرسال الرد")}
                          </button>
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setNewReplies({ ...newReplies, [r.id]: "" });
                            }}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold rounded-lg transition-all"
                          >
                            {t("reviews.cancel", "إلغاء")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* عرض الردود */}
                  {replies[r.id] && replies[r.id].length > 0 && (
                    <div className="mt-4 space-y-3 pr-6 border-r-3 border-orange-300">
                      <div className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {t("reviews.replies", "الردود")} ({replies[r.id].length})
                      </div>
                      {replies[r.id].map((reply) => (
                        <div key={reply.id} className="flex items-start gap-3 bg-gradient-to-r from-orange-50 to-white rounded-lg p-3 border-r-4 border-orange-400 shadow-sm">
                          {/* أيقونة المستخدم للرد */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#ff7a00] to-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                            {reply.userName ? reply.userName.charAt(0).toUpperCase() : "R"}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-bold text-orange-700">
                                {reply.userName || t("reviews.anonymous", "مستخدم مجهول")}
                              </span>
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                                {t("reviews.replier", "رد")}
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{reply.reply}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            className="px-4 py-2 rounded-xl bg-[#92278f] hover:bg-[#7a1f75] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            {t("reviews.previous", "السابق")}
          </button>
          <span className="text-sm font-semibold text-gray-700">{t("reviews.page", "صفحة")} {page} {t("reviews.of", "من")} {totalPages}</span>
          <button
            className="px-4 py-2 rounded-xl bg-[#92278f] hover:bg-[#7a1f75] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            {t("reviews.next", "التالي")}
          </button>
        </div>
      )}
    </div>
  );
}


