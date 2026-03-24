import { useEffect, useState } from "react";
import API_BASE_URL from "../../Constant";
import SearchBar from "../../Home/SearchBar";
import { Howl } from "howler";
import { Link } from "react-router-dom";
import {
  getRoleFromToken,
  playNotificationSound,
  SendSignalMessageForOrders,
  startListeningToMessages,
} from "../../utils";
import { useCurrency } from "../../Currency/CurrencyContext";
import { FiHome, FiSearch, FiRefreshCw, FiX, FiCheck, FiEdit, FiDollarSign, FiTrendingUp } from "react-icons/fi";

export default function Orders() {
  const [Currentorders, setCurrentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchMode, setSearchMode] = useState(false);
  const [financialAnalytics, setFinancialAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { format } = useCurrency();

  // حالات النافذة الخاصة بإدخال سبب الرفض
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // قائمة حالات الطلب المتاحة
  const orderStatuses = [
    "قيد المعالجة",
    "تم التأكيد",
    "قيد الشحن",
    "تم التوصيل",
    "تم الرفض",
    "تم الإرجاع",
  ];

  useEffect(() => {
    const Role = getRoleFromToken(sessionStorage.getItem("token"));
    if (Role !== "User" && Role != null) {
      startListeningToMessages((message) => {
        fetchOrders(pageNumber);
        playNotificationSound();
      });
    }
    fetchFinancialAnalytics();
  }, []);

  const fetchFinancialAnalytics = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}Orders/GetFinancialAnalytics`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFinancialAnalytics(data);
      }
    } catch (err) {
      console.error("Error fetching financial analytics:", err);
    }
  };

  function getStatusStyle(status) {
    switch (status) {
      case "قيد المعالجة":
        return "status-processing";
      case "تم التأكيد":
        return "status-confirmed";
      case "قيد الشحن":
        return "status-shipping";
      case "تم التوصيل":
        return "status-delivered";
      case "تم الرفض":
        return "status-rejected";
      case "تم الإرجاع":
        return "status-returned";
      default:
        return "status-default";
    }
  }

  function getSelectorStyle(status) {
    switch (status) {
      case "قيد المعالجة":
        return { backgroundColor: "#fef3c7", color: "#92400e" };
      case "تم التأكيد":
        return { backgroundColor: "#d1fae5", color: "#065f46" };
      case "قيد الشحن":
        return { backgroundColor: "#dbeafe", color: "#1e40af" };
      case "تم التوصيل":
        return { backgroundColor: "#f0f9ff", color: "#0c4a6e" };
      case "تم الرفض":
        return { backgroundColor: "#fee2e2", color: "#991b1b" };
      case "تم الإرجاع":
        return { backgroundColor: "#f3f4f6", color: "#374151" };
      default:
        return {};
    }
  }

  // البحث عن طلب معين
  const FindOrder = async (OrderId) => {
    if (!OrderId) {
      setSearchMode(false);
      setCurrentOrders(allOrders);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}Orders/FindOrder?OrderId=${OrderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("لم يتم العثور على الطلب");
      const data = await response.json();
      setCurrentOrders([data]);
      setSearchMode(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // جلب الطلبات
  const fetchOrders = async (PageNum) => {
    setLoading(true);
    setError(null);

    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}Orders/GetOrders?PageNum=${PageNum}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("حدث خطأ أثناء تحميل البيانات");

      const data = await response.json();
      setCurrentOrders(data);
      setAllOrders(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!searchMode) {
      fetchOrders(pageNumber);
    }
  }, [pageNumber, searchMode]);

  // دالة لتحديث حالة الطلب
  const updateOrderStatus = async (orderId, newStatus) => {
    if (newStatus === "تم الرفض") {
      setCurrentOrderId(orderId);
      setRejectionReason("");
      setShowRejectionModal(true);
    } else {
      try {
        const token = sessionStorage.getItem("token");

        const response = await fetch(
          `${API_BASE_URL}Orders/UpdateOrderStatues?OrderId=${Number(
            orderId
          )}&StatusName=${newStatus}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) throw new Error("فشل تحديث حالة الطلب");
        
        setCurrentOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === orderId
              ? { ...order, orderStatus: newStatus }
              : order
          )
        );
        
        setAllOrders((prevAllOrders) =>
          prevAllOrders.map((order) =>
            order.orderId === orderId
              ? { ...order, orderStatus: newStatus }
              : order
          )
        );
        await SendSignalMessageForOrders("Order Statues Updated");
      } catch (err) {
        alert(`خطأ: ${err.message}`);
      }
    }
  };

  // دالة تحديث سبب الرفض
  const updateRejectionReason = async (orderId, reason) => {
    try {
      const token = sessionStorage.getItem("token");
      const url = `${API_BASE_URL}Orders/UpdateOrderStatues?OrderId=${orderId}&StatusName=تم الرفض&rejectionreason=${encodeURIComponent(
        reason
      )}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("فشل تحديث سبب الرفض");
      
      setCurrentOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.orderId === orderId
            ? { ...order, orderStatus: "تم الرفض", rejectionReason: reason }
            : order
        )
      );
      setAllOrders((prevAllOrders) =>
        prevAllOrders.map((order) =>
          order.orderId === orderId
            ? { ...order, orderStatus: "تم الرفض", rejectionReason: reason }
            : order
        )
      );
    } catch (err) {
      alert(`خطأ في تحديث سبب الرفض: ${err.message}`);
    }
  };

  // دالة تأكيد سبب الرفض من النافذة
  const confirmRejection = async () => {
    if (!rejectionReason) {
      alert("يرجى إدخال سبب الرفض.");
      return;
    }
    
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}Orders/UpdateOrderStatues?OrderId=${currentOrderId}&StatusName=تم الرفض`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("فشل تحديث حالة الطلب");
    } catch (err) {
      alert(`خطأ: ${err.message}`);
      return;
    }
    
    await updateRejectionReason(currentOrderId, rejectionReason);
    setShowRejectionModal(false);
    setCurrentOrderId(null);
    setRejectionReason("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 py-6 px-4">
      {/* نافذة إدخال سبب الرفض */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-blue-900">سبب الرفض</h3>
              <button
                onClick={() => setShowRejectionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="أدخل سبب الرفض هنا..."
              className="w-full min-h-[120px] p-4 border border-blue-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            ></textarea>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRejectionModal(false)}
                className="flex-1 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
              >
                إلغاء
              </button>
              <button
                onClick={confirmRejection}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <FiEdit className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 tracking-wide">إدارة الطلبات</h1>
                  <p className="text-gray-600 mt-1">عرض وإدارة جميع الطلبات</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  fetchOrders(pageNumber);
                  fetchFinancialAnalytics();
                }}
                className="bg-gray-100 hover:bg-gray-200 transition-all duration-300 p-3 rounded-full text-gray-700"
                title="تحديث"
              >
                <FiRefreshCw size={20} />
              </button>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold px-4 py-2 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg flex items-center gap-2"
              >
                <FiDollarSign size={20} />
                {showAnalytics ? "إخفاء التحليلات" : "التحليلات المالية"}
              </button>
              <div className="bg-orange-50 rounded-xl p-2 border border-orange-200">
                <span className="text-orange-600 font-bold text-lg">
                  {Currentorders.length} طلب
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Analytics Section */}
        {showAnalytics && financialAnalytics && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiTrendingUp className="text-green-600" size={28} />
              التحليلات المالية
            </h2>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <p className="text-gray-600 text-sm mb-1">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-blue-700">
                  {format(financialAnalytics.totalRevenue || 0)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <p className="text-gray-600 text-sm mb-1">إيرادات اليوم</p>
                <p className="text-2xl font-bold text-green-700">
                  {format(financialAnalytics.totalRevenueToday || 0)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <p className="text-gray-600 text-sm mb-1">إيرادات هذا الشهر</p>
                <p className="text-2xl font-bold text-orange-700">
                  {format(financialAnalytics.totalRevenueThisMonth || 0)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <p className="text-gray-600 text-sm mb-1">متوسط قيمة الطلب</p>
                <p className="text-2xl font-bold text-purple-700">
                  {format(financialAnalytics.averageOrderValue || 0)}
                </p>
              </div>
            </div>

            {/* Orders Count Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-gray-600 text-sm mb-1">إجمالي الطلبات</p>
                <p className="text-xl font-bold text-gray-800">
                  {financialAnalytics.totalOrders || 0}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-gray-600 text-sm mb-1">طلبات اليوم</p>
                <p className="text-xl font-bold text-gray-800">
                  {financialAnalytics.ordersToday || 0}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-gray-600 text-sm mb-1">طلبات هذا الشهر</p>
                <p className="text-xl font-bold text-gray-800">
                  {financialAnalytics.ordersThisMonth || 0}
                </p>
              </div>
            </div>

            {/* Order Status Counts */}
            {financialAnalytics.orderStatusCounts && financialAnalytics.orderStatusCounts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">الطلبات حسب الحالة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {financialAnalytics.orderStatusCounts.map((status, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">{status.statusName}</span>
                        <span className="text-orange-600 font-bold">{status.count}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        القيمة: {format(status.totalValue || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FiSearch className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-blue-900">بحث عن طلب</h2>
          </div>
          <SearchBar searchType="Orders" onSearch={(id) => FindOrder(id)} />
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-900 font-semibold">جاري تحميل الطلبات...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 m-6">
              <p className="text-red-700 text-center font-medium">{error}</p>
            </div>
          )}

          {/* Orders Table */}
          {!loading && !error && Currentorders.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
              <thead>
  <tr className="bg-orange-700 text-white">
    <th className="p-4 text-right font-bold">#</th>
    <th className="p-4 text-right font-bold">اسم العميل</th>
    <th className="p-4 text-right font-bold">عنوان العميل</th>
    <th className="p-4 text-right font-bold">رقم العميل</th>
    <th className="p-4 text-right font-bold">سعر الشحن</th>
    <th className="p-4 text-right font-bold">المبلغ الكلي</th>
    <th className="p-4 text-right font-bold">طريقة الدفع</th>
    <th className="p-4 text-right font-bold">الرقم المحول منه</th>
    <th className="p-4 text-right font-bold">الحالة</th>
    <th className="p-4 text-right font-bold">سبب الرفض</th>
    <th className="p-4 text-right font-bold">التاريخ</th>
  </tr>
</thead>



                <tbody>
                  {Currentorders.map((order, index) => (
                    <tr 
                      key={order.orderId}
                      className={`border-b border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-orange-50 transition-colors duration-200`}
                    >
                      <td className="p-4">
                        <Link 
                          to={`/Admin/order-details/${order.orderId}`}
                          className="text-blue-600 hover:text-blue-800 font-semibold underline decoration-2 decoration-orange-500"
                        >
                          {order.orderId}
                        </Link>
                      </td>
                      <td className="p-4 text-gray-800 font-semibold">{order.fullName}</td>
                      <td className="p-4 text-gray-800 max-w-xs truncate font-medium">{order.address}</td>
                      <td className="p-4 text-gray-800 dir-ltr font-semibold">{order.clientPhone}</td>
                      <td className="p-4 text-green-700 font-bold">{format(order.shippingCoast || 0)}</td>
                      <td className="p-4 text-blue-700 font-bold">{format(order.totalAmount || 0)}</td>
                      <td className="p-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4">
                        {order.transactionNumber ? (
                          <span className="bg-orange-200 text-orange-900 px-3 py-1 rounded-full text-sm font-semibold dir-ltr">
                            {order.transactionNumber}
                          </span>
                        ) : (
                          <span className="text-gray-700 text-sm font-medium">لا يوجد</span>
                        )}
                      </td>
                      <td className="p-4">
                        <select
                          style={getSelectorStyle(order.orderStatus)}
                          value={orderStatuses.includes(order.orderStatus) ? order.orderStatus : "قيد المعالجة"}
                          onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                          className="px-3 py-2 rounded-lg border-0 font-semibold transition-all duration-200 focus:ring-2 focus:ring-orange-500 cursor-pointer bg-white"
                        >
                          {orderStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 max-w-xs">
                        {order.rejectionReason ? (
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-lg text-sm font-semibold">
                            {order.rejectionReason}
                          </span>
                        ) : (
                          <span className="text-gray-700 text-sm font-medium">لا يوجد</span>
                        )}
                      </td>
                      <td className="p-4 text-gray-800 font-semibold">
                        {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && Currentorders.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد طلبات</h3>
              <p className="text-gray-600">لم يتم العثور على أي طلبات حالياً</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!searchMode && !loading && !error && Currentorders.length > 0 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              disabled={pageNumber === 1}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-1 disabled:transform-none shadow-lg disabled:cursor-not-allowed"
            >
              السابق
            </button>
            <span className="bg-white px-6 py-3 rounded-xl shadow-lg text-blue-900 font-bold">
              الصفحة {pageNumber}
            </span>
            <button 
              onClick={() => setPageNumber((prev) => prev + 1)}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
            >
              التالي
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .dir-ltr {
          direction: ltr;
        }
      `}</style>
    </div>
  );
}