import { useState, useEffect } from "react";
import API_BASE_URL, { SiteName } from "../Constant";
import PhoneModal from "../../Components/CreateOrder/PhoneModel";
import { Helmet } from "react-helmet";
import BackButton from "../Common/BackButton";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaLock,
  FaEnvelope,
  FaEdit,
  FaKey,
  FaMapMarker,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useI18n } from "../i18n/I18nContext";

export default function MyProfile() {
  const [client, setClient] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordUpdated, setPasswordUpdated] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const { t } = useI18n();

  // جلب بيانات العميل
  useEffect(() => {
    fetch(`${API_BASE_URL}Clients/GetClientById`, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setClient(data);
        if (
          data.clientAddresses &&
          Object.keys(data.clientAddresses).length > 0
        ) {
          setSelectedAddress(Object.values(data.clientAddresses)[0]);
        }
      })
      .catch((err) => console.error("Error fetching client data:", err));
  }, []);

  // جلب بيانات المستخدم لمعرفة حالة كلمة المرور
  useEffect(() => {
    fetch(`${API_BASE_URL}Users/GetUserInfo`, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setUserInfo(data))
      .catch((err) => console.error("Error fetching user data:", err));
  }, []);

  // تحديث الاسم في API
  const updateName = () => {
    fetch(
      `${API_BASE_URL}Clients/PutClientName?FirstName=${newFirstName}&LastName=${newLastName}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      }
    )
      .then((res) => {
        if (res.ok) {
          setClient({
            ...client,
            firstName: newFirstName,
            lastName: newLastName,
          });
          setIsEditingName(false);
        } else {
          alert(t("myProfile.nameError", "حدث خطأ أثناء تحديث الاسم ❌"));
        }
      })
      .catch(() => alert(t("myProfile.nameError", "حدث خطأ أثناء تحديث الاسم ❌")));
  };

  // تحديث كلمة المرور
  const updatePassword = () => {
    fetch(`${API_BASE_URL}Users/ChangePassword`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        email: userInfo.userName,
        currentPassword: userInfo.hashedPassword ? currentPassword : null,
        newPassword: newPassword,
      }),
    })
      .then(async (res) => {
        let jsonRes;
        try {
          const text = await res.text();
          jsonRes = text ? JSON.parse(text) : {};
        } catch (error) {
          console.error("Error parsing response:", error);
          jsonRes = {};
        }

        if (res.ok) {
          setPasswordUpdated(t("myProfile.passwordChanged", "تم تغيير كلمة المرور بنجاح ✅"));
          setCurrentPassword("");
          setNewPassword("");
          setTimeout(() => {
            setShowSecurityModal(false);
            setPasswordUpdated(null);
          }, 2000);
        } else {
          setPasswordUpdated(
            jsonRes.message || t("myProfile.passwordError", "حدث خطأ أثناء تحديث كلمة المرور ❌")
          );
        }
      })
      .catch((err) => {
        setPasswordUpdated(t("myProfile.passwordError", "حدث خطأ أثناء تحديث كلمة المرور ❌"));
      });
  };

  if (!client || !userInfo) return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 border-solid"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-8 px-4">
      <Helmet>
        <title>{t("myProfile.metaTitle", "الملف الشخصي")} | {SiteName}</title>
        <meta
          name="description"
          content={t("myProfile.metaDesc", "عرض معلوماتك الشخصية في متجرنا الالكتروني")}
        />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <BackButton className="mb-4" />
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            {t("myProfile.title", "الملف الشخصي")}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-blue-900 mx-auto rounded-full"></div>
        </div>

        {/* Personal Information Card */}
        <div className="bg-white rounded-2xl shadow-2xl border-l-4 border-orange-500 mb-8 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
          <div className="border-b border-gray-200 px-6 py-4" style={{ background: 'linear-gradient(to right, #ff7a00, #ea580c)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center">
                <FaUser className="ml-2" />
                {t("myProfile.personalInfo", "معلوماتك الشخصية")}
              </h2>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <FaUser className="text-white text-2xl" />
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Name Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200 overflow-hidden">
              <div className="flex items-center mb-4 md:mb-0 flex-shrink-0">
                <span className="text-blue-900 font-bold text-lg">{t("myProfile.name", "الاسم")}:</span>
              </div>
              
              {isEditingName ? (
                <div className="flex-1 space-y-4 min-w-0">
                  <div className="flex flex-col md:flex-row gap-4">
                    <input
                      type="text"
                      value={newFirstName}
                      onChange={(e) => setNewFirstName(e.target.value)}
                      placeholder={t("myProfile.firstName", "الاسم الأول")}
                      className="flex-1 px-4 py-3 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-800"
                    />
                    <input
                      type="text"
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                      placeholder={t("myProfile.lastName", "اسم العائلة")}
                      className="flex-1 px-4 py-3 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-800"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={updateName}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                    >
                      {t("myProfile.saveChanges", "حفظ التغييرات")}
                    </button>
                    <button 
                      onClick={() => setIsEditingName(false)}
                      className="px-6 py-3 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-colors duration-200"
                    >
                      {t("myProfile.cancel", "إلغاء")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 flex-1 min-w-0 overflow-hidden max-w-full">
                  <span className="text-gray-800 text-xs sm:text-sm md:text-base font-semibold bg-white px-3 py-2 rounded-lg border truncate block overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0 max-w-full">
                    {client.firstName} {client.lastName}
                  </span>
                  <button 
                    onClick={() => {
                      setNewFirstName(client.firstName);
                      setNewLastName(client.lastName);
                      setIsEditingName(true);
                    }}
                    className="p-3 bg-blue-900 text-white rounded-xl hover:bg-blue-800 transition-colors duration-200 flex-shrink-0"
                  >
                    <FaEdit />
                  </button>
                </div>
              )}
            </div>

            {/* Phone Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center mb-4 md:mb-0">
                <FaPhone className="text-blue-900 ml-2" />
                <span className="text-blue-900 font-bold text-lg">{t("myProfile.phoneNumber", "رقم الهاتف")}:</span>
              </div>
              
              {client.phoneNumber ? (
                <div className="flex items-center gap-4">
                  <span className="text-gray-800 text-lg font-semibold">
                    {client.phoneNumber}
                  </span>
                  <button 
                    onClick={() => setShowPhoneModal(true)}
                    className="p-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors duration-200"
                  >
                    <FaEdit />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowPhoneModal(true)}
                  className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <FaPhone />
                  <span>{t("myProfile.addPhone", "إضافة رقم الهاتف")}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="bg-white rounded-2xl shadow-2xl border-l-4 border-orange-500 mb-8 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
  <div className="border-b border-gray-200 px-6 py-4" style={{ background: 'linear-gradient(to right, #ff7a00, #ea580c)' }}>
    <h2 className="text-xl font-bold text-white flex items-center">
      <FaMapMarkerAlt className="ml-2" />
      {t("myProfile.yourAddresses", "عناوينك")}
    </h2>
  </div>

  <div className="p-6">
    {client.clientAddresses && Object.keys(client.clientAddresses).length > 0 ? (
      <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-200 min-w-0 overflow-hidden">
        <FaMapMarker className="text-orange-700 text-xl flex-shrink-0" />
        <select
          value={selectedAddress}
          onChange={(e) => setSelectedAddress(e.target.value)}
          className="flex-1 min-w-0 max-w-full px-4 py-3 border border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-800 font-semibold text-xs sm:text-sm break-all overflow-hidden" 
          style={{ wordBreak: 'break-all', overflowWrap: 'break-word', maxWidth: '100%' }}
        >
          {Object.entries(client.clientAddresses).map(([id, address]) => (
            <option key={id} value={address} style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}>
              {address}
            </option>
          ))}
        </select>
      </div>
    ) : (
      <div className="text-center py-8 bg-orange-50 rounded-xl border border-orange-200">
        <FaMapMarkerAlt className="text-orange-400 text-5xl mx-auto mb-4" />
        <p className="text-gray-800 text-lg font-semibold">
          {t("myProfile.noAddresses", "لا يوجد عناوين متاحة لديك. سيتم طلب العنوان عند الشراء.")}
        </p>
      </div>
    )}
  </div>
</div>

<style jsx>{`
  select option {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`}</style>

        {/* Security Card */}
        <div className="bg-white rounded-2xl shadow-2xl border-l-4 border-orange-500 mb-8 overflow-hidden transform transition-all duration-300 hover:shadow-xl">
          <div className="border-b border-gray-200 px-6 py-4" style={{ background: 'linear-gradient(to right, #ff7a00, #ea580c)' }}>
            <h2 className="text-xl font-bold text-white flex items-center">
              <FaLock className="ml-2" />
              {t("myProfile.security", "الأمان والخصوصية")}
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Email */}
            <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center mb-4 md:mb-0 flex-shrink-0">
                <FaEnvelope className="text-red-700 ml-2" />
                <span className="text-red-700 font-bold text-lg">{t("myProfile.email", "البريد الإلكتروني")}:</span>
              </div>
              <div className="flex items-center gap-4 flex-1 min-w-0 overflow-hidden">
                <span className="text-gray-800 text-xs sm:text-sm md:text-base font-semibold bg-white px-3 py-2 rounded-lg border break-all overflow-hidden max-w-full" style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}>
                  {userInfo.userName}
                </span>
              </div>
            </div>

            {/* Change Password Button */}
            <button
              onClick={() => setShowSecurityModal(true)}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <FaKey />
              <span>{t("myProfile.changePassword", "تغيير كلمة المرور")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
            {/* Modal Header */}
            <div className="px-6 py-4 rounded-t-2xl" style={{ background: 'linear-gradient(to right, #ff7a00, #ea580c)' }}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">{t("myProfile.changePassword", "تغيير كلمة المرور")}</h3>
                <button 
                  onClick={() => setShowSecurityModal(false)}
                  className="text-white hover:text-orange-300 transition-colors duration-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {userInfo.hashedPassword ? (
                <div className="space-y-2">
                  <label className="text-gray-700 font-semibold">{t("myProfile.currentPassword", "كلمة المرور الحالية")}</label>
                  <input
                    type="password"
                    placeholder={t("myProfile.enterCurrentPassword", "أدخل كلمة المرور الحالية")}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-800"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <FaExclamationTriangle className="text-yellow-600 text-xl" />
                  <p className="text-yellow-700 font-semibold">
                    {t("myProfile.noPasswordSet", "لم تقم بتعيين كلمة مرور، الرجاء إدخال كلمة مرور جديدة.")}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-gray-700 font-semibold">{t("myProfile.newPassword", "كلمة المرور الجديدة")}</label>
                <input
                  type="password"
                  placeholder={t("myProfile.enterNewPassword", "أدخل كلمة المرور الجديدة")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-800"
                />
              </div>

              {passwordUpdated && (
                <div className={`p-4 rounded-xl ${
                  passwordUpdated.includes('✅') 
                    ? 'bg-green-100 border border-green-200 text-green-700' 
                    : 'bg-red-100 border border-red-200 text-red-700'
                }`}>
                  {passwordUpdated}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 bg-gray-50 rounded-b-2xl border-t border-gray-200">
              <button 
                onClick={updatePassword}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors duration-200"
              >
                {t("myProfile.savePassword", "حفظ كلمة المرور")}
              </button>
              <button 
                onClick={() => setShowSecurityModal(false)}
                className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-colors duration-200"
              >
                {t("myProfile.close", "إغلاق")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phone Modal */}
      {showPhoneModal && (
        <PhoneModal
          newPhoneNumber={newPhoneNumber}
          setNewPhoneNumber={setNewPhoneNumber}
          setShowPhoneModal={setShowPhoneModal}
          setClientPhone={(phone) =>
            setClient({ ...client, phoneNumber: phone })
          }
        />
      )}
    </div>
  );
}