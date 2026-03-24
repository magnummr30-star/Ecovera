import React, { useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../../Constant";
import { getRoleFromToken } from "../../utils";

export default function CurrencyAdmin() {
  const token = sessionStorage.getItem("token");
  const role = useMemo(() => getRoleFromToken(token), [token]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("AED");
  const [rate, setRate] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}Currency`);
        const data = await res.json();
        setItems(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (role !== "Admin" && role !== "Manager") {
    return <div className="p-6 text-center">غير مصرح لك بالدخول</div>;
  }

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}Currency`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : undefined },
        body: JSON.stringify({ currencyCode: code.toUpperCase(), rateToAED: Number(rate), isActive: true }),
      });
      if (!res.ok) throw new Error("failed");
      const list = await (await fetch(`${API_BASE_URL}Currency`)).json();
      setItems(list || []);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (id) => {
    if (!confirm("إلغاء تفعيل العملة؟")) return;
    try {
      const res = await fetch(`${API_BASE_URL}Currency/${id}`, { method: "DELETE", headers: { Authorization: token ? `Bearer ${token}` : undefined } });
      if (!res.ok) throw new Error("failed");
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-3 md:p-6">
      <div className="rounded-2xl p-4 md:p-6 mb-5 shadow-lg border" style={{ background: 'linear-gradient(to right, #ff7a00, #ea580c)' }}>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">إدارة العملات (الأساس AED)</h1>
        <p className="text-white/90 mt-1">العملات الفعالة</p>
      </div>
      <form onSubmit={save} className="bg-orange-50 rounded shadow p-3 md:p-4 grid grid-cols-1 md:grid-cols-3 gap-3 border border-orange-200">
        <div>
          <label className="block text-sm mb-1 font-semibold text-gray-800">رمز العملة</label>
          <select value={code} onChange={(e) => setCode(e.target.value)} className="border border-orange-300 rounded w-full px-2 py-1 bg-white text-gray-800">
            {['AED','SAR','QAR','OMR','KWD','BHD','USD'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1 font-semibold text-gray-800">السعر مقابل AED</label>
          <input type="number" step="0.000001" value={rate} onChange={(e) => setRate(e.target.value)} className="border border-orange-300 rounded w-full px-2 py-1 bg-white text-gray-800" />
        </div>
        <div className="flex items-end">
          <button disabled={saving} className="bg-[#0a2540] hover:bg-[#13345d] text-white font-bold px-4 py-2 rounded-xl w-full transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">العملات الفعالة</h2>
        {loading ? (
          <div className="p-4 text-center">جاري التحميل...</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-center">لا توجد عملات</div>
        ) : (
          <table className="min-w-full bg-orange-50 rounded shadow overflow-hidden border border-orange-200">
<thead className="bg-orange-700 text-white">
  <tr>
    <th className="text-right p-2 font-bold">العملة</th>
    <th className="text-right p-2 font-bold">السعر مقابل AED</th>
    <th className="text-right p-2 font-bold">آخر تحديث</th>
    <th className="text-right p-2 font-bold">إجراءات</th>
  </tr>
</thead>

            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t border-orange-200 hover:bg-orange-100">
                  <td className="p-2 text-gray-800 font-medium">{c.currencyCode}</td>
                  <td className="p-2 text-gray-800 font-medium">{c.rateToAED}</td>
                  <td className="p-2 text-gray-800 font-medium">{new Date(c.updatedAt).toLocaleString('ar-EG')}</td>
                  <td className="p-2">
                    <button className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all shadow-md" onClick={() => deactivate(c.id)}>إلغاء تفعيل</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}


