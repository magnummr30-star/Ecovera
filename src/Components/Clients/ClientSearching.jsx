import React, { useEffect, useState } from "react";
import API_BASE_URL from "../Constant";
import { FiSearch, FiFilter, FiTrendingUp, FiList, FiLoader } from "react-icons/fi";
import { useI18n } from "../i18n/I18nContext";

export default function ClientSearching() {
  const { t, lang } = useI18n();
  const [searchLogs, setSearchLogs] = useState([]);
  const [topSearches, setTopSearches] = useState([]);
  const [filterTerm, setFilterTerm] = useState("");
  const [filterTop, setFilterTop] = useState(false);
  const [loading, setLoading] = useState(false);
  const token = sessionStorage.getItem("token");

  const fetchAllSearches = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}SearchLogs/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(t("clientSearching.fetchError", "خطأ في جلب البيانات"));
      const data = await response.json();
      setSearchLogs(data);
    } catch (error) {
      alert(t("clientSearching.fetchAllError", "حدث خطأ أثناء جلب السجلات"));
    } finally {
      setLoading(false);
    }
  };

  const fetchTopSearches = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}SearchLogs/top`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(t("clientSearching.fetchError", "خطأ في جلب البيانات"));
      const data = await response.json();

      const transformed =
        data && typeof data === "object" && !Array.isArray(data)
          ? Object.entries(data).map(([key, value]) => ({
              searchKeyWord: key,
              searchCount: value,
            }))
          : Array.isArray(data)
          ? data
          : [];

      setTopSearches(transformed);
    } catch (error) {
      alert(t("clientSearching.fetchTopError", "حدث خطأ أثناء جلب أكثر الكلمات بحثاً"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filterTop) {
      fetchTopSearches();
    } else {
      fetchAllSearches();
    }
  }, [filterTop]);

  const filteredLogs = searchLogs.filter((log) => {
    const term = filterTerm.trim().toLowerCase();
    if (!term) return true;
    return (log.searchKeyWord || "").toLowerCase().includes(term);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                <FiSearch className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{t("clientSearching.title", "سجل عمليات البحث")}</h1>
                <p className="text-gray-600 mt-1">{t("clientSearching.subtitle", "إدارة وتتبع عمليات البحث في النظام")}</p>
              </div>
            </div>
            
            {/* Toggle Switch */}
            <div className="flex items-center gap-4 bg-gray-100 p-2 rounded-xl">
              <button
                onClick={() => setFilterTop(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  !filterTop 
                    ? 'bg-white text-orange-600 shadow-md' 
                    : 'text-gray-600 hover:text-orange-500'
                }`}
              >
                <FiList />
                <span>{t("clientSearching.allSearches", "جميع عمليات البحث")}</span>
              </button>
              
              <button
                onClick={() => setFilterTop(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  filterTop 
                    ? 'bg-white text-orange-600 shadow-md' 
                    : 'text-gray-600 hover:text-orange-500'
                }`}
              >
                <FiTrendingUp />
                <span>{t("clientSearching.topSearches", "الأكثر بحثاً")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        {!filterTop && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("clientSearching.searchPlaceholder", "ابحث في كلمات البحث...")}
                  value={filterTerm}
                  onChange={(e) => setFilterTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 bg-gray-50 text-gray-800"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-xl">
                <FiFilter />
                <span>{t("clientSearching.foundResults", "تم العثور على {count} عملية بحث").replace("{count}", filteredLogs.length)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl shadow-lg">
            <FiLoader className="animate-spin text-4xl text-orange-500 mb-4" />
            <p className="text-gray-600 text-lg">{t("clientSearching.loading", "جاري تحميل البيانات...")}</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100">
            {/* Top Searches Table */}
            {filterTop ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead>
  <tr className="bg-orange-500 text-white">
    <th className="py-4 px-6 text-right font-semibold text-lg">
      {t("clientSearching.searchKeyword", "كلمة البحث")}
    </th>
    <th className="py-4 px-6 text-center font-semibold text-lg">
      {t("clientSearching.searchCount", "عدد مرات البحث")}
    </th>
  </tr>
</thead>

                  <tbody>
                    {topSearches.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="py-8 text-center text-gray-500">
                          <FiSearch className="mx-auto text-4xl text-gray-300 mb-2" />
                          {t("clientSearching.noData", "لا توجد بيانات")}
                        </td>
                      </tr>
                    ) : (
                      topSearches.map((item, idx) => (
                        <tr 
                          key={idx} 
                          className="border-b border-gray-200 hover:bg-orange-50 transition-colors duration-200"
                        >
                          <td className="py-4 px-6 text-right font-medium text-gray-800">
                            {item.searchKeyWord}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                              <FiTrendingUp className="text-orange-600" />
                              {item.searchCount} {t("clientSearching.times", "مرة")}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              /* All Searches Table */
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead>
  <tr className="bg-orange-500 text-white">
    <th className="py-4 px-6 text-right font-semibold">
      {t("clientSearching.clientId", "رقم العميل")}
    </th>
    <th className="py-4 px-6 text-right font-semibold">
      {t("clientSearching.searchKeyword", "كلمة البحث")}
    </th>
    <th className="py-4 px-6 text-right font-semibold">
      {t("clientSearching.clientName", "اسم العميل")}
    </th>
    <th className="py-4 px-6 text-right font-semibold">
      {t("clientSearching.searchDate", "تاريخ البحث")}
    </th>
  </tr>
</thead>

                  <tbody>
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-gray-500">
                          <FiSearch className="mx-auto text-4xl text-gray-300 mb-2" />
                          {t("clientSearching.noMatchingData", "لا توجد بيانات مطابقة للبحث")}
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log, idx) => (
                        <tr 
                          key={idx} 
                          className="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-200 even:bg-gray-50"
                        >
                          <td className="py-4 px-6 text-right text-gray-700">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                              {log.clientId || "-"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-medium text-gray-800">
                            {log.searchKeyWord}
                          </td>
                          <td className="py-4 px-6 text-right text-gray-700">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              log.clientFullName && log.clientFullName.trim() 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {log.clientFullName && log.clientFullName.trim()
                                ? log.clientFullName.trim()
                                : t("clientSearching.unknown", "غير معروف")}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right text-gray-600">
                            {log.searchDate === "0001-01-01T00:00:00"
                              ? "-"
                              : new Date(log.searchDate).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Stats Cards */}
        {!loading && !filterTop && filteredLogs.length > 0 && (
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
       {/* إجمالي عمليات البحث */}
       <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-lg border border-blue-500 relative overflow-hidden">
         {/* خلفية شفافة للنص */}
         <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
         <div className="relative flex items-center justify-between">
           <div>
             <p className="text-white font-bold text-sm mb-2">إجمالي عمليات البحث</p>
             <p className="text-4xl font-extrabold text-white">{filteredLogs.length}</p>
           </div>
           <FiList className="text-5xl text-white" />
         </div>
       </div>
     
       {/* عملاء معروفون */}
       <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg border border-orange-400 relative overflow-hidden">
         <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
         <div className="relative flex items-center justify-between">
           <div>
             <p className="text-white font-bold text-sm mb-2">عملاء معروفون</p>
             <p className="text-4xl font-extrabold text-white">
               {filteredLogs.filter(log => log.clientFullName && log.clientFullName.trim()).length}
             </p>
           </div>
           <FiTrendingUp className="text-5xl text-white" />
         </div>
       </div>
     
       {/* كلمات فريدة */}
       <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg border border-green-400 relative overflow-hidden">
         <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
         <div className="relative flex items-center justify-between">
           <div>
             <p className="text-white font-bold text-sm mb-2">كلمات فريدة</p>
             <p className="text-4xl font-extrabold text-white">
               {new Set(filteredLogs.map(log => log.searchKeyWord)).size}
             </p>
           </div>
           <FiSearch className="text-5xl text-white" />
         </div>
       </div>
     </div>
     
        )}
      </div>
    </div>
  );
}