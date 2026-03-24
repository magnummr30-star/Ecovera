import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../../Constant";
import { BsDisplay } from "react-icons/bs";
import { useCurrency } from "../../Currency/CurrencyContext";
import { useI18n } from "../../i18n/I18nContext";
import StoreLayout from "../../Home/StoreLayout";

export default function OrderDetails() {
  const { orderId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { format } = useCurrency();
  const { t, lang } = useI18n();
  
  // Function to translate color names (from Arabic to English or vice versa)
  const translateColor = (colorName) => {
    if (!colorName) return colorName;
    
    // Map Arabic color names to English keys
    const colorMap = {
      "أحمر": "red",
      "أزرق": "blue",
      "أخضر": "green",
      "أصفر": "yellow",
      "أسود": "black",
      "أبيض": "white",
      "وردي": "pink",
      "بنفسجي": "purple",
      "برتقالي": "orange",
      "بني": "brown",
      "رمادي": "gray",
      "كحلي": "navy",
      "بيج": "beige",
      "كاكي": "khaki",
      "كستنائي": "maroon",
      "سماوي": "cyan",
      "أرجواني": "magenta",
      "ليموني": "lime",
      "زيتوني": "olive",
      "تركواز": "teal",
      "فضي": "silver",
      "ذهبي": "gold",
      "نيلي": "navy",
      "عنابي": "maroon",
      "خردلي": "yellow",
      "فيروزي": "cyan",
      "زهري": "pink",
      "لافندر": "purple",
      "موف": "purple",
      "أخضر زيتي": "olive",
      "أخضر فاتح": "green",
      "أزرق سماوي": "cyan",
      "أزرق ملكي": "blue",
      "قرمزي": "red",
    };
    
    // Check if the color name is in Arabic
    const colorKey = colorMap[colorName] || colorName.toLowerCase().trim();
    return t(`colors.${colorKey}`, colorName);
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}Orders/GetOrderDetails?OrderId=${orderId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error(t("orderDetails.notFound", "لم يتم العثور على تفاصيل الطلب"));

        const data = await response.json();
        setProducts(Array.isArray(data) ? data : [data]);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    fetchOrderDetails();
  }, [orderId]);

  const fetchCurrentProduct = async (ProductName) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}Product/GetProductWithName?name=${ProductName}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  async function HandleProductClick(ProductName, ProductId) {
    const product = await fetchCurrentProduct(ProductName);
    navigate(`/productDetails/${Number(ProductId)}`, { state: { product } });
  }

  return (
    <StoreLayout>
      <div className="min-h-screen bg-[#FAFAFA] py-8 px-4">
        <div className="max-w-6xl mx-auto">
        {/* زر العودة */}
        <button 
          className="bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg flex items-center gap-2 mb-6"
          onClick={() => window.history.back()}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t("orderDetails.back", "العودة")}
        </button>

        {/* العنوان */}
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-8 border-b-4 border-orange-500 pb-4">
          {t("orderDetails.title", "تفاصيل الطلب رقم")} {orderId}
        </h2>

        {/* حالات التحميل والأخطاء */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <p className="text-orange-600 text-lg font-semibold">{t("orderDetails.loading", "جارٍ تحميل البيانات...")}</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center mb-6">
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* جدول المنتجات */}
        {products.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl shadow-lg border border-blue-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2563eb] text-white">
                  <tr>
                    <th className="py-4 px-6 text-right font-semibold text-lg text-white">{t("orderDetails.productName", "اسم المنتج")}</th>
                    <th className="py-4 px-6 text-right font-semibold text-lg text-white">{t("orderDetails.color", "اللون")}</th>
                    <th className="py-4 px-6 text-right font-semibold text-lg text-white">{t("orderDetails.size", "المقاس")}</th>
                    <th className="py-4 px-6 text-right font-semibold text-lg text-white">{t("orderDetails.quantity", "الكمية")}</th>
                    <th className="py-4 px-6 text-right font-semibold text-lg text-white">{t("orderDetails.unitPrice", "سعر الوحدة")}</th>
                    <th className="py-4 px-6 text-right font-semibold text-lg text-white">{t("orderDetails.totalPrice", "السعر الإجمالي")}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr 
                      key={index} 
                      className={`border-b border-blue-100 hover:bg-blue-50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-blue-25' : 'bg-white'
                      }`}
                    >
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => HandleProductClick(product.productName, product.productId)}
                          className="text-blue-900 hover:text-orange-600 font-medium underline transition-colors duration-200 text-lg hover:underline-offset-2"
                        >
                          {product.productName}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right text-blue-800 font-medium">
                        {translateColor(product.colorName)}
                      </td>
                      <td className="py-4 px-6 text-right text-blue-800 font-medium">
                        {product.sizeName}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="bg-orange-100 text-orange-800 font-semibold py-1 px-3 rounded-full text-lg">
                          {product.quantity}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-blue-900 font-bold text-lg">
                          {format(product.unitPrice)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-2 px-4 rounded-lg text-lg">
                          {format(product.totalPrice)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {products.map((product, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-lg border border-blue-200 p-4 w-full"
                >
                  <div className="space-y-3">
                    <div className="flex flex-col items-center justify-center border-b border-blue-100 pb-3">
                      <button
                        onClick={() => HandleProductClick(product.productName, product.productId)}
                        className="text-blue-900 hover:text-orange-600 font-bold underline transition-colors duration-200 text-lg text-center"
                      >
                        {product.productName}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600 font-semibold mb-1">{t("orderDetails.color", "اللون")}</p>
                        <p className="text-blue-900 font-medium">{translateColor(product.colorName)}</p>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600 font-semibold mb-1">{t("orderDetails.size", "المقاس")}</p>
                        <p className="text-blue-900 font-medium">{product.sizeName}</p>
                      </div>
                      
                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-xs text-orange-600 font-semibold mb-1">{t("orderDetails.quantity", "الكمية")}</p>
                        <p className="bg-orange-100 text-orange-800 font-bold py-1 px-3 rounded-full text-center inline-block">
                          {product.quantity}
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600 font-semibold mb-1">{t("orderDetails.unitPrice", "سعر الوحدة")}</p>
                        <p className="text-blue-900 font-bold">{format(product.unitPrice)}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-center">
                      <p className="text-xs text-white font-semibold mb-1">{t("orderDetails.totalPrice", "السعر الإجمالي")}</p>
                      <p className="text-white font-bold text-xl">{format(product.totalPrice)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          !loading && (
            <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-8 text-center">
              <p className="text-blue-900 text-xl font-semibold">{t("orderDetails.noProducts", "لا توجد منتجات في هذا الطلب.")}</p>
            </div>
          )
        )}

        {/* ملخص إضافي */}
        {products.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-lg border border-orange-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-blue-700 font-semibold text-lg">{t("orderDetails.totalProducts", "إجمالي المنتجات")}</p>
                <p className="text-blue-900 font-bold text-xl">{products.length}</p>
              </div>
              <div className="text-center">
                <p className="text-orange-700 font-semibold text-lg">{t("orderDetails.totalQuantity", "إجمالي الكمية")}</p>
                <p className="text-orange-900 font-bold text-xl">
                  {products.reduce((sum, product) => sum + product.quantity, 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-blue-700 font-semibold text-lg">{t("orderDetails.totalAmount", "المبلغ الإجمالي")}</p>
                <p className="text-blue-900 font-bold text-xl">
                  {format(products.reduce((sum, product) => sum + product.totalPrice, 0))}
                </p>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </StoreLayout>
  );
}