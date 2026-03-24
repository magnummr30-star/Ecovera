import React, { useState, useEffect } from "react";
import API_BASE_URL from "../Constant";
import { FiSearch, FiX } from "react-icons/fi";

export default function Clients() {
  const [allClients, setAllClients] = useState([]);
  const [clients, setClients] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError("");
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}Clients/GetClients?PageNum=${pageNumber}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message);
        }
        if (data.length === 0) {
          setHasMore(false);
          if (pageNumber === 1) {
            setClients([]);
          }
        } else {
          setAllClients(data);
          setClients(data);
          setHasMore(true);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [pageNumber]);

  const handlePrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    if (hasMore) {
      setPageNumber((prev) => prev + 1);
    }
  };

  // فلترة العملاء بناءً على البحث
  useEffect(() => {
    if (!searchTerm.trim()) {
      setClients(allClients);
      return;
    }

    const filtered = allClients.filter((client) => {
      const search = searchTerm.toLowerCase();
      return (
        (client.fullName && client.fullName.toLowerCase().includes(search)) ||
        (client.email && client.email.toLowerCase().includes(search)) ||
        (client.phoneNumber && client.phoneNumber.includes(search)) ||
        (client.authProvider && client.authProvider.toLowerCase().includes(search))
      );
    });

    setClients(filtered);
  }, [searchTerm, allClients]);

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="p-5 rtl">
      <div className="bg-white rounded-2xl p-4 md:p-6 mb-5 shadow-lg border border-gray-200 max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-wide text-center">
          قائمة العملاء
        </h1>
        <p className="text-gray-600 mt-1 text-center">
          عدد العملاء: {allClients.length} {searchTerm && `(نتائج البحث: ${clients.length})`}
        </p>
      </div>

      {/* قسم البحث */}
      <div className="max-w-6xl mx-auto mb-5">
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 relative w-full">
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <FiSearch size={20} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن عميل بالاسم، البريد الإلكتروني، رقم الهاتف أو مزود الخدمة..."
                className="w-full pr-12 pl-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="مسح البحث"
                >
                  <FiX size={20} />
                </button>
              )}
            </div>
          </div>
          {searchTerm && (
            <div className="mt-3 text-sm text-gray-600">
              <span className="font-semibold">نتائج البحث:</span> {clients.length} من {allClients.length} عميل
            </div>
          )}
        </div>
      </div>


      {loading && (
        <div className="text-center text-xl text-orange-600 my-8">
          جاري التحميل...
        </div>
      )}

      {error && (
        <div className="text-center text-red-600 text-lg my-8">
          خطأ: {error}
        </div>
      )}

      {!loading && !error && searchTerm && clients.length === 0 && (
        <div className="text-center bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 max-w-6xl mx-auto my-8">
          <p className="text-yellow-800 text-lg font-semibold">
            لم يتم العثور على نتائج للبحث: "{searchTerm}"
          </p>
          <p className="text-yellow-600 text-sm mt-2">
            جرب البحث بالاسم، البريد الإلكتروني، رقم الهاتف أو مزود الخدمة
          </p>
        </div>
      )}

      {!loading && !error && !searchTerm && allClients.length === 0 && (
        <div className="text-center bg-gray-50 border-2 border-gray-200 rounded-xl p-6 max-w-6xl mx-auto my-8">
          <p className="text-gray-800 text-lg font-semibold">
            لا يوجد عملاء في الوقت الحالي
          </p>
        </div>
      )}

      {!loading && !error && clients.length > 0 && (
        <div className="overflow-x-auto mt-5 max-w-6xl mx-auto">
          <table className="w-full border-collapse border border-gray-300 shadow-md">
          <thead>
  <tr className="bg-orange-700 text-white">
    <th className="border border-orange-600 p-3 text-right font-bold">
      الاسم الكامل
    </th>
    <th className="border border-orange-600 p-3 text-right font-bold">
      رقم الهاتف
    </th>
    <th className="border border-orange-600 p-3 text-right font-bold">
      البريد الإلكتروني
    </th>
    <th className="border border-orange-600 p-3 text-right font-bold">
      كلمة السر المشفرة
    </th>
    <th className="border border-orange-600 p-3 text-right font-bold">
      مزود الخدمة
    </th>
  </tr>
</thead>

            <tbody>
              {clients.map((client, index) => (
                <tr 
                  key={index} 
                  className={`border-b border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-orange-50 transition-colors`}
                >
                  <td className="border border-gray-200 p-3 text-center text-gray-800 font-medium">
                    {client.fullName}
                  </td>
                  <td className="border border-gray-200 p-3 text-center text-gray-800 font-medium">
                    {client.phoneNumber || "غير متوفر"}
                  </td>
                  <td className="border border-gray-200 p-3 text-center text-gray-800 font-medium">
                    {client.email || "غير متوفر"}
                  </td>
                  <td className="border border-gray-200 p-3 text-center text-gray-800 font-medium">
                    {client.password || "غير متوفر"}
                  </td>
                  <td className="border border-gray-200 p-3 text-center text-gray-800 font-medium">
                    {client.authProvider}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 text-center max-w-6xl mx-auto">
        <button
          onClick={handlePrevPage}
          disabled={pageNumber === 1}
          className={`px-6 py-3 mx-2 rounded-lg font-medium transition-colors ${
            pageNumber === 1
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-orange-500 text-white hover:bg-orange-600"
          }`}
        >
          السابق
        </button>
        <span className="text-blue-900 font-semibold mx-4">
          الصفحة {pageNumber}
        </span>
        <button
          onClick={handleNextPage}
          disabled={!hasMore}
          className={`px-6 py-3 mx-2 rounded-lg font-medium transition-colors ${
            !hasMore
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-900 text-white hover:bg-blue-800"
          }`}
        >
          التالي
        </button>
      </div>

      <p className="text-center mt-8 text-sm text-gray-600 max-w-6xl mx-auto">
        حقوق النشر © 2025 - جميع الحقوق محفوظة
      </p>
    </div>
  );
}