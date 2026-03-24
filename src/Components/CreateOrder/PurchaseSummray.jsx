import { GetUserNameFromToken } from "../utils";
import { useCurrency } from "../Currency/CurrencyContext";
import { useI18n } from "../i18n/I18nContext";

export default function OrderSummary({ Products, ShipPrice, isFreeShipping = false, guestName }) {
  const userName = GetUserNameFromToken(sessionStorage.getItem("token")) || guestName || "زائر";
  const { format } = useCurrency();
  const { t } = useI18n();
  
  // حساب السعر الإجمالي للمنتجات
  const totalPrice = Products?.totalPrice || 
    (Array.isArray(Products)
      ? Products.reduce((sum, p) => sum + (p.unitPrice || 0) * (p.quantity || 0), 0)
      : (Products?.unitPrice || 0) * (Products?.quantity || 0));
  
  const finalPrice = totalPrice + ShipPrice;

  return (
    <div className="space-y-4 p-6 bg-white rounded-xl shadow-md border border-gray-200 rtl">
      <h4 className="text-lg font-semibold text-blue-900">
        {t("orderSummary.recipientName", "اسم المستلم")} :
        <strong className="text-orange-600 mr-2"> {userName} </strong>
      </h4>
      
      <h4 className="text-lg font-semibold text-gray-800">
        {t("orderSummary.productsPrice", "سعر المنتجات")}:
        <strong className="text-orange-600 mr-2"> {format(totalPrice)} </strong>
      </h4>
      
      <h4 className={`text-lg font-semibold ${isFreeShipping ? 'text-green-600' : ShipPrice === 0 ? 'text-red-500' : 'text-gray-800'}`}>
        {t("orderSummary.shippingPrice", "سعر الشحن لمحافظتك هو")}
        <strong className={`mr-2 ${isFreeShipping ? 'text-green-600 font-bold' : ShipPrice === 0 ? 'text-red-500' : 'text-orange-600'}`}>
          {isFreeShipping 
            ? (t("orderSummary.freeShipping", "مجاني") || "مجاني 🎉")
            : ShipPrice === 0 
            ? t("orderSummary.selectAddress", "يرجى اختيار العنوان أولاً")
            : format(ShipPrice)}
        </strong>
      </h4>
      
      {/* رسالة توضيحية للشحن المجاني */}
      {isFreeShipping && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3 mt-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-700 text-sm font-semibold">
              {t("orderSummary.freeShippingReason", "الشحن مجاني لأن قيمة الطلب أكبر من أو تساوي 200 درهم")}
            </p>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-300">
        <h4 className={`text-xl font-bold ${ShipPrice === 0 && !isFreeShipping ? 'text-red-500' : 'text-blue-900'}`}>
          {ShipPrice === 0 && !isFreeShipping ? (
            <span className="flex items-center">
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {t("orderSummary.selectAddressForFinal", "يرجى اختيار العنوان لحساب السعر النهائي")}
            </span>
          ) : (
            <>
              {t("orderSummary.finalPrice", "السعر النهائي")}: 
              <strong className="text-orange-600 mr-2 text-2xl">
                {format(finalPrice)}
              </strong>
            </>
          )}
        </h4>
      </div>

      {(ShipPrice !== 0 || isFreeShipping) && (
        <div className="mt-4 p-3 bg-gradient-to-l from-orange-50 to-blue-50 rounded-lg border border-orange-200">
          <div className="flex justify-between items-center text-sm text-gray-700">
            <span>{t("orderSummary.totalProducts", "إجمالي المنتجات")}:</span>
            <span className="font-semibold">{format(totalPrice)}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-700 mt-1">
            <span>{t("orderSummary.shippingCost", "تكلفة الشحن")}:</span>
            <span className={`font-semibold ${isFreeShipping ? 'text-green-600 font-bold' : ''}`}>
              {isFreeShipping 
                ? (t("orderSummary.freeShipping", "مجاني") || "مجاني 🎉")
                : format(ShipPrice)}
            </span>
          </div>
          {isFreeShipping && (
            <div className="mt-2 pt-2 border-t border-green-200">
              <p className="text-green-600 text-xs font-medium text-center">
                {t("orderSummary.freeShippingReason", "الشحن مجاني لأن قيمة الطلب أكبر من أو تساوي 200 درهم")}
              </p>
            </div>
          )}
          <div className="flex justify-between items-center text-lg font-bold text-blue-900 mt-2 pt-2 border-t border-gray-300">
            <span>{t("orderSummary.totalAmount", "المبلغ الإجمالي")}:</span>
            <span className="text-orange-600">{format(finalPrice)}</span>
          </div>
        </div>
      )}
    </div>
  );
}