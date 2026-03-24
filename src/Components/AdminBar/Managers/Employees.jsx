import { useEffect, useState } from "react";
import API_BASE_URL from "../../Constant";

export default function Employees() {
  const [managers, setManagers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newManager, setNewManager] = useState({
    email: "",
    fullName: "",
    password: "",
    role: "General Manager",
  });
  const [errorMessage, setErrorMessage] = useState(""); // حالة لتخزين الأخطاء

  // جلب التوكن من sessionStorage
  const token = sessionStorage.getItem("token");

  // تحميل بيانات المديرين عند فتح الصفحة
  useEffect(() => {
    fetchManagers();
  }, []);

  async function fetchManagers() {
    try {
      setErrorMessage(""); // إعادة ضبط رسالة الخطأ
      const response = await fetch(`${API_BASE_URL}Users/get-Employees`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل في تحميل البيانات");
      }

      const data = await response.json();
      console.log(data);
      setManagers(data);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function addManager() {
    try {
      setErrorMessage("");

      // التحقق من الدور - إذا كان كاشير أو دعم فني، إظهار رسالة وإرجاع
      if (newManager.role === "Cashier Man" || newManager.role === "Technical support") {
        setErrorMessage("سيتم في التحديث القادم");
        return;
      }

      // إذا كان المدير أو سائق شحن، المتابعة كالمعتاد
      const endpoint =
        newManager.role === "General Manager"
          ? `${API_BASE_URL}Users/PostManager`
          : `${API_BASE_URL}Users/PostShippingMan`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emailOrAuthId: newManager.email,
          password: newManager.password,
          firstName: newManager.fullName.split(" ")[0],
          secondName:
            (newManager.fullName.split(" ")[1] ?? "") +
            " " +
            (newManager.fullName.split(" ")[2] ?? "") +
            " " +
            (newManager.fullName.split(" ")[3] ?? ""),
          AuthProvider: "online Store",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل في إضافة المدير");
      }

      setShowModal(false);
      fetchManagers();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function deleteManager(email) {
    try {
      setErrorMessage(""); // إعادة ضبط رسالة الخطأ
      const response = await fetch(
        `${API_BASE_URL}Users/RemoveEmployee?email=${email}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل في حذف المدير");
      }

      fetchManagers();
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <>
      <div className="container mx-auto p-6">
      <div className="bg-orange-700 rounded-2xl p-4 md:p-6 mb-5 shadow-lg border border-orange-600 max-w-6xl mx-auto">
  <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide text-center">
    إدارة الموظفين
  </h1>
  <p className="text-white mt-1 text-center">
    إضافة وإدارة موظفي المتجر
  </p>
</div>

        {/* عرض رسالة الخطأ إن وجدت */}
        {errorMessage && (
          <div className="mb-4 p-2 bg-red-500 text-white text-center rounded max-w-6xl mx-auto">
            {errorMessage}
          </div>
        )}

        {/* جدول عرض المديرين */}
        <div className="max-w-6xl mx-auto">
          <table className="w-full border-collapse border border-orange-300 bg-orange-50 rounded-lg overflow-hidden shadow-lg">
          <thead className="bg-orange-700 text-white">
    <tr>
      <th className="p-3 font-bold text-right border border-orange-600">الأسم الكامل</th>
      <th className="p-3 font-bold text-right border border-orange-600">الإيميل</th>
      <th className="p-3 font-bold text-right border border-orange-600">الدور</th>
      <th className="p-3 font-bold text-right border border-orange-600">الإجراءات</th>
    </tr>
  </thead>

          <tbody>
            {managers.map((manager, index) => (
              <tr 
                key={index} 
                className={`border-b border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-orange-50 transition-colors`}
              >
                <td className="border border-gray-200 p-3 text-gray-800 font-semibold">{manager.fullName}</td>
                <td className="border border-gray-200 p-3 text-gray-800 font-semibold">{manager.email}</td>
                <td className="border border-gray-200 p-3 text-gray-800 font-semibold">{manager.roleName}</td>
                <td className="border border-gray-200 p-3 text-center">
                  <button
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all shadow-md"
                    onClick={() => deleteManager(manager.email)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* زر فتح النافذة المنبثقة لإضافة مدير جديد */}
        <div className="max-w-6xl mx-auto mt-4">
          <button
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={() => setShowModal(true)}
          >
            إضافة موظف جديد
          </button>
        </div>

        {/* النافذة المنبثقة لإدخال بيانات المدير الجديد */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-orange-50 p-6 rounded-xl shadow-2xl w-96 border border-orange-200">
              <h3 className="text-xl font-bold mb-4 text-center text-gray-800">
                إضافة مدير جديد
              </h3>
              <div className="mb-4">
                <label className="block mb-1 text-right font-semibold text-gray-800">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-orange-300 rounded-lg bg-white text-gray-800"
                  value={newManager.fullName}
                  onChange={(e) =>
                    setNewManager({ ...newManager, fullName: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 text-right font-semibold text-gray-800">
                  البريد الإلكتروني:
                </label>
                <input
                  type="email"
                  className="w-full p-2 border border-orange-300 rounded-lg bg-white text-gray-800"
                  value={newManager.email}
                  onChange={(e) =>
                    setNewManager({ ...newManager, email: e.target.value })
                  }
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 text-right font-semibold text-gray-800">
                  كلمة المرور:
                </label>
                <input
                  type="password"
                  className="w-full p-2 border border-orange-300 rounded-lg bg-white text-gray-800"
                  value={newManager.password}
                  onChange={(e) =>
                    setNewManager({ ...newManager, password: e.target.value })
                  }
                />
              </div>

              <div className="mb-4">
                <label className="block mb-1 text-right font-semibold text-gray-800">
                  اختر الدور:
                </label>
                <select
                  className="w-full p-2 border border-orange-300 rounded-lg bg-white text-gray-800"
                  value={newManager.role}
                  onChange={(e) =>
                    setNewManager({ ...newManager, role: e.target.value })
                  }
                >
                  <option value="General Manager">مدير عام</option>
                  <option value="Technical support">دعم فني</option>
                  <option value="Cashier Man">كاشير</option>
                  <option value="Shipping Man">سائق شحن</option>
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded mr-2"
                  onClick={() => setShowModal(false)}
                >
                  إلغاء
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded"
                  onClick={addManager}
                >
                  إضافة
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
