import React from "react";
import { useI18n } from "../i18n/I18nContext";

const VisaIcon = ({ className = "w-12 h-8" }) => (
  <svg viewBox="0 0 56 18" fill="none" className={className} aria-hidden>
    <rect width="56" height="18" rx="4" fill="#1A1F71" />
    <text x="28" y="13" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial, sans-serif">VISA</text>
  </svg>
);

const MastercardIcon = ({ className = "w-12 h-8" }) => (
  <svg viewBox="0 0 48 32" fill="none" className={className} aria-hidden>
    <circle cx="18" cy="16" r="10" fill="#EB001B" />
    <circle cx="30" cy="16" r="10" fill="#F79E1B" />
    <path d="M24 22.4a10 10 0 0 1 0-12.8 10 10 0 0 1 0 12.8z" fill="#FF5F00" />
  </svg>
);

const DebitCardIcon = ({ className = "w-12 h-8" }) => (
  <svg viewBox="0 0 44 32" fill="none" className={className} aria-hidden>
    <rect x="1" y="1" width="42" height="30" rx="4" fill="#fff" stroke="#334155" strokeWidth="1.5" />
    <rect x="1" y="1" width="42" height="10" rx="3" fill="#cbd5e1" />
    <rect x="6" y="4" width="8" height="5" rx="1" fill="#f59e0b" />
    <rect x="6" y="16" width="20" height="2.5" rx="1" fill="#64748b" />
    <rect x="6" y="21" width="14" height="2" rx="1" fill="#94a3b8" />
  </svg>
);

const CashIcon = ({ className = "w-12 h-8" }) => (
  <svg viewBox="0 0 48 32" fill="none" className={className} aria-hidden>
    <rect x="2" y="4" width="44" height="24" rx="3" fill="#f0fdf4" stroke="#22c55e" strokeWidth="1.5" />
    <circle cx="24" cy="16" r="6" stroke="#22c55e" strokeWidth="1.5" fill="none" />
    <path d="M24 11v10M20 16h8" stroke="#22c55e" strokeWidth="1.2" />
    <rect x="6" y="8" width="6" height="3" rx="1" fill="#22c55e" opacity="0.4" />
    <rect x="36" y="8" width="6" height="3" rx="1" fill="#22c55e" opacity="0.4" />
  </svg>
);

const paymentMethods = [
  { key: "visa", Icon: VisaIcon, label: "Visa" },
  { key: "mastercard", Icon: MastercardIcon, label: "Mastercard" },
  { key: "debit", Icon: DebitCardIcon, labelKey: "payment.debitCard" },
  { key: "card", Icon: DebitCardIcon, labelKey: "payment.card" },
  { key: "cash", Icon: CashIcon, labelKey: "payment.cash" },
];

export default function PaymentMethodsBar() {
  const { t, lang } = useI18n();
  const isRTL = lang === "ar";

  return (
    <div className="w-full flex justify-center bg-white border-b border-neutral-200" role="region" aria-label={t("paymentMethods", "طرق الدفع")}>
      <div className={`w-full max-w-[1400px] mx-auto px-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2 sm:py-2.5 ${isRTL ? "flex-row-reverse" : ""}`}>
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {paymentMethods.map(({ key, Icon, label, labelKey }) => (
          <span
            key={key}
            className="flex items-center justify-center w-9 h-6 sm:w-11 sm:h-7 rounded border border-neutral-200 bg-gray-50 p-0.5 sm:p-1 text-gray-600 flex-shrink-0"
            title={labelKey ? t(labelKey, key === "debit" ? "بطاقة مدين" : key === "card" ? "كارد" : "كاش") : label}
          >
            <Icon className={key === "cash" ? "w-5 h-5 sm:w-7 sm:h-7" : "w-7 h-4 sm:w-9 sm:h-5"} />
          </span>
        ))}
      </div>
      </div>
    </div>
  );
}
