import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import API_BASE_URL from "../Constant";
import { useI18n } from "../i18n/I18nContext";

const CurrencyContext = createContext({
  currency: "AED",
  rates: {},
  setCurrency: () => {},
  format: (value) => value,
  convertFromAED: (value) => value,
});

const symbols = {
  AED: { ar: "د.إ", en: "AED" },
  SAR: { ar: "﷼", en: "SAR" },
  QAR: { ar: "ر.ق", en: "QAR" },
  OMR: { ar: "ر.ع", en: "OMR" },
  KWD: { ar: "د.ك", en: "KWD" },
  BHD: { ar: "د.ب", en: "BHD" },
  USD: { ar: "$", en: "USD" },
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("AED");
  const [rates, setRates] = useState({});
  const { lang } = useI18n();

  useEffect(() => {
    const loadRates = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}Currency`);
        if (!res.ok) {
          console.error("Failed to fetch currency rates:", res.status);
          return;
        }
        const data = await res.json();
        const dict = {};
        data.forEach((r) => {
          if (r.currencyCode && r.rateToAED) {
            dict[r.currencyCode.toUpperCase()] = r.rateToAED;
          }
        });
        console.log("Loaded currency rates:", dict);
        setRates(dict);
      } catch (e) {
        console.error("Failed to load currency rates", e);
      }
    };
    loadRates();
  }, []);

  const convertFromAED = useMemo(() => {
    return (valueInAED) => {
      if (!valueInAED) return 0;
      
      // إذا كانت العملة المختارة هي AED (العملة الأساسية)، لا حاجة للتحويل
      if (currency === "AED") return Number(valueInAED);
      
      // إذا لم تكن هناك rates محملة، أو العملة غير موجودة في rates، نعيد القيمة الأصلية
      if (!rates || Object.keys(rates).length === 0) {
        console.warn("Currency rates not loaded yet, using original value");
        return Number(valueInAED);
      }
      
      const rate = rates[currency.toUpperCase()];
      if (!rate) {
        console.warn(`Currency rate not found for ${currency}. Available rates:`, Object.keys(rates));
        return Number(valueInAED);
      }
      
      // valueInAED * (target per AED)
      // مثال: إذا كان 1 AED = 0.27 USD، فإن 100 AED = 100 * 0.27 = 27 USD
      const converted = Number(valueInAED) * Number(rate);
      return converted;
    };
  }, [rates, currency]);

  const format = useMemo(() => {
    return (valueInAED) => {
      const amount = convertFromAED(valueInAED);
      const symObj = symbols[currency] || { ar: currency, en: currency };
      const sym = symObj[lang] || symObj.en;
      
      // Format number based on language
      const formattedAmount = amount.toLocaleString(lang === "ar" ? "ar-SA" : "en-US", { 
        maximumFractionDigits: 2, 
        minimumFractionDigits: 0 
      });
      
      // For Arabic: symbol on right, for English: symbol on left
      if (lang === "ar") {
        return `${formattedAmount} ${sym}`;
      } else {
        return `${sym} ${formattedAmount}`;
      }
    };
  }, [convertFromAED, currency, lang]);

  const value = { currency, rates, setCurrency, convertFromAED, format };
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}


