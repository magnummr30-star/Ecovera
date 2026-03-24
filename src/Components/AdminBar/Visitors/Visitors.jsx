import React, { useState, useEffect } from "react";
import API_BASE_URL from "../../Constant";
import { Link } from "react-router-dom";
import { FiHome, FiRefreshCw, FiEye, FiMapPin, FiGlobe, FiClock } from "react-icons/fi";

export default function Visitors() {
  const [analytics, setAnalytics] = useState(null);
  const [currentVisitors, setCurrentVisitors] = useState([]);
  const [allVisitors, setAllVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("analytics"); // "analytics", "current", or "all"
  const [allVisitorsPage, setAllVisitorsPage] = useState(1);
  const [allVisitorsTotalPages, setAllVisitorsTotalPages] = useState(1);
  const [allVisitorsTotalCount, setAllVisitorsTotalCount] = useState(0);

  useEffect(() => {
    fetchAnalytics();
    fetchCurrentVisitors();
    // تحديث كل 30 ثانية
    const interval = setInterval(() => {
      fetchCurrentVisitors();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      fetchAllVisitors(allVisitorsPage);
    }
  }, [activeTab, allVisitorsPage]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}Visitors/GetAnalytics`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("فشل تحميل البيانات");
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentVisitors = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}Visitors/GetCurrentVisitors`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("فشل تحميل الزوار الحاليين");
      }

      const data = await response.json();
      setCurrentVisitors(data);
    } catch (err) {
      console.error("Error fetching current visitors:", err);
    }
  };

  const fetchAllVisitors = async (pageNum = 1) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}Visitors/GetAllVisitors?pageNumber=${pageNum}&pageSize=20`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("فشل تحميل جميع الزوار");
      }

      const data = await response.json();
      setAllVisitors(data.visitors || []);
      setAllVisitorsTotalPages(data.totalPages || 1);
      setAllVisitorsTotalCount(data.totalCount || 0);
    } catch (err) {
      console.error("Error fetching all visitors:", err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-4 md:p-6 mb-5 shadow-lg border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="bg-gray-100 hover:bg-gray-200 transition-all duration-300 p-3 rounded-full text-gray-700"
              >
                <FiHome size={20} />
              </Link>
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-3 rounded-full">
                  <FiEye className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-wide">
                    تحليلات الزوار
                  </h1>
                  <p className="text-gray-600 mt-1">عرض إحصائيات الزوار والزيارات</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  fetchAnalytics();
                  fetchCurrentVisitors();
                }}
                className="bg-gray-100 hover:bg-gray-200 transition-all duration-300 p-3 rounded-full text-gray-700"
                title="تحديث"
              >
                <FiRefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === "analytics"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-600 hover:text-orange-600"
              }`}
            >
              التحليلات الشاملة
            </button>
            <button
              onClick={() => setActiveTab("current")}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === "current"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-600 hover:text-orange-600"
              }`}
            >
              الزوار الحاليون ({currentVisitors.length})
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 font-semibold transition-all ${
                activeTab === "all"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-600 hover:text-orange-600"
              }`}
            >
              جميع الزوار ({allVisitorsTotalCount})
            </button>
          </div>
        </div>

        {/* Analytics Tab */}
        {activeTab === "analytics" && analytics && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">إجمالي الزيارات</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      {analytics.totalVisits.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FiEye className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">الزوار النشطون حالياً</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">
                      {analytics.currentActiveVisitors}
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <FiClock className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Geographic Distribution */}
            {analytics.geographicDistribution && analytics.geographicDistribution.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FiGlobe className="text-orange-600" size={24} />
                  التوزيع الجغرافي
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-right py-3 px-4 text-gray-700 font-semibold">البلد</th>
                        <th className="text-right py-3 px-4 text-gray-700 font-semibold">المدينة</th>
                        <th className="text-right py-3 px-4 text-gray-700 font-semibold">عدد الزيارات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.geographicDistribution.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{item.countryFlagIcon}</span>
                              <span className="font-medium">{item.country}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{item.city || "-"}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-orange-600">{item.visitCount}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Daily Visits Chart */}
            {analytics.dailyVisits && analytics.dailyVisits.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">الزيارات اليومية (آخر 30 يوم)</h2>
                <div className="space-y-2">
                  {analytics.dailyVisits.slice(-7).map((day, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-24 text-sm text-gray-600">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                        <div
                          className="bg-orange-500 h-6 rounded-full flex items-center justify-end pr-2"
                          style={{
                            width: `${(day.visitCount / Math.max(...analytics.dailyVisits.map(d => d.visitCount))) * 100}%`,
                          }}
                        >
                          <span className="text-white text-xs font-bold">{day.visitCount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Current Visitors Tab */}
        {activeTab === "current" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiClock className="text-orange-600" size={24} />
              الزوار النشطون حالياً
            </h2>
            {currentVisitors.length === 0 ? (
              <div className="text-center py-12">
                <FiEye className="mx-auto text-gray-400" size={48} />
                <p className="text-gray-600 mt-4">لا يوجد زوار نشطون حالياً</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-right py-3 px-4 text-gray-700 font-semibold">البلد</th>
                      <th className="text-right py-3 px-4 text-gray-700 font-semibold">المدينة</th>
                      <th className="text-right py-3 px-4 text-gray-700 font-semibold">IP</th>
                      <th className="text-right py-3 px-4 text-gray-700 font-semibold">العميل</th>
                      <th className="text-right py-3 px-4 text-gray-700 font-semibold">وقت الزيارة</th>
                      <th className="text-right py-3 px-4 text-gray-700 font-semibold">آخر نشاط</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentVisitors.map((visitor) => (
                      <tr key={visitor.visitorId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{visitor.countryFlagIcon}</span>
                            <span className="font-medium">{visitor.country || "-"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{visitor.city || "-"}</td>
                        <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                          {visitor.ipAddress || "-"}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {visitor.clientName || "زائر"}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {formatDate(visitor.visitTime)}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {visitor.lastActivityTime
                            ? formatDate(visitor.lastActivityTime)
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* All Visitors Tab */}
        {activeTab === "all" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiGlobe className="text-orange-600" size={24} />
              جميع الزوار ({allVisitorsTotalCount})
            </h2>
            {allVisitors.length === 0 ? (
              <div className="text-center py-12">
                <FiEye className="mx-auto text-gray-400" size={48} />
                <p className="text-gray-600 mt-4">لا يوجد زوار</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-right py-3 px-4 text-gray-700 font-semibold">البلد</th>
                        <th className="text-right py-3 px-4 text-gray-700 font-semibold">المدينة</th>
                        <th className="text-right py-3 px-4 text-gray-700 font-semibold">IP</th>
                        <th className="text-right py-3 px-4 text-gray-700 font-semibold">العميل</th>
                        <th className="text-right py-3 px-4 text-gray-700 font-semibold">وقت الزيارة</th>
                        <th className="text-right py-3 px-4 text-gray-700 font-semibold">آخر نشاط</th>
                        <th className="text-right py-3 px-4 text-gray-700 font-semibold">الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allVisitors.map((visitor) => (
                        <tr key={visitor.visitorId} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{visitor.countryFlagIcon}</span>
                              <span className="font-medium">{visitor.country || "-"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{visitor.city || "-"}</td>
                          <td className="py-3 px-4 text-gray-600 font-mono text-sm">
                            {visitor.ipAddress || "-"}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {visitor.clientName || "زائر"}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {formatDate(visitor.visitTime)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-sm">
                            {visitor.lastActivityTime
                              ? formatDate(visitor.lastActivityTime)
                              : "-"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                visitor.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {visitor.isActive ? "نشط" : "غير نشط"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                {allVisitorsTotalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <button
                      onClick={() => setAllVisitorsPage((prev) => Math.max(prev - 1, 1))}
                      disabled={allVisitorsPage === 1}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-1 disabled:transform-none shadow-lg disabled:cursor-not-allowed"
                    >
                      السابق
                    </button>
                    <span className="bg-white px-4 py-2 rounded-lg shadow-lg text-blue-900 font-bold">
                      الصفحة {allVisitorsPage} من {allVisitorsTotalPages}
                    </span>
                    <button
                      onClick={() => setAllVisitorsPage((prev) => Math.min(prev + 1, allVisitorsTotalPages))}
                      disabled={allVisitorsPage === allVisitorsTotalPages}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-1 disabled:transform-none shadow-lg disabled:cursor-not-allowed"
                    >
                      التالي
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

