export default function OrderActions({
  UserTransactionNum,
  SetUserTransactionNum,
  setTransactionImage,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
      <h2 className="text-xl font-bold text-blue-900 mb-4 text-center border-b-2 border-orange-500 pb-2">
        إدخال صورة التحويل
      </h2>
      
      <div className="space-y-4">
        {/* ملف صورة التحويل */}
        <div>
          <label className="block text-blue-800 font-semibold mb-2 text-right">
            اختر صورة التحويل
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setTransactionImage(e.target.files[0])}
            className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
          />
        </div>

        {/* حقل رقم الهاتف */}
        <div>
          <label className="block text-blue-800 font-semibold mb-2 text-right">
            رقم الهاتف المرسل منه
          </label>
          <input
            type="number"
            value={UserTransactionNum}
            onChange={(e) => SetUserTransactionNum(parseInt(e.target.value) || 0)}
            min="0"
            required
            placeholder="أدخل رقم الهاتف..."
            className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition duration-200 text-right placeholder-blue-300"
          />
        </div>
      </div>

      {/* رسالة توجيهية */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-700 text-sm text-right">
          <span className="font-bold text-orange-500">ملاحظة:</span> يرجى التأكد من صحة المعلومات المدخلة لتسهيل عملية التحقق من التحويل
        </p>
      </div>
    </div>
  );
}