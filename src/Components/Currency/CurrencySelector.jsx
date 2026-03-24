import React from "react";
import { useCurrency } from "./CurrencyContext";
import { useI18n } from "../i18n/I18nContext";

// SVG Flags Components - Real country flags
const UAEFlag = () => (
  <svg width="20" height="14" viewBox="0 0 24 16" className="inline-block mr-1" style={{ borderRadius: '2px' }}>
    <rect width="24" height="5.33" fill="#007A3D" />
    <rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
    <rect y="10.66" width="24" height="5.34" fill="#000000" />
    <rect width="6" height="16" fill="#FF0000" />
  </svg>
);

const SaudiFlag = () => (
  <svg width="20" height="14" viewBox="0 0 24 16" className="inline-block mr-1" style={{ borderRadius: '2px' }}>
    <rect width="24" height="16" fill="#006C35" />
    <text x="12" y="11" fontSize="8" fill="#FFFFFF" textAnchor="middle" fontFamily="Arial" fontWeight="bold">☪</text>
    <text x="12" y="5" fontSize="6" fill="#FFFFFF" textAnchor="middle" fontFamily="Arial" fontWeight="bold">السيف</text>
  </svg>
);

const QatarFlag = () => (
  <svg width="20" height="14" viewBox="0 0 24 16" className="inline-block mr-1" style={{ borderRadius: '2px' }}>
    <rect width="24" height="16" fill="#8B1538" />
    <polygon points="0,0 7,0 0,16" fill="#FFFFFF" />
    <path d="M0 0 L7 0 L0 16 Z" fill="#FFFFFF" />
  </svg>
);

const OmanFlag = () => (
  <svg width="20" height="14" viewBox="0 0 24 16" className="inline-block mr-1" style={{ borderRadius: '2px' }}>
    <rect width="24" height="5.33" fill="#FFFFFF" />
    <rect y="5.33" width="24" height="5.33" fill="#D21034" />
    <rect y="10.66" width="24" height="5.34" fill="#007A3D" />
    <rect width="6" height="16" fill="#D21034" />
    <circle cx="3" cy="8" r="1.5" fill="#FFFFFF" />
    <circle cx="3" cy="8" r="1" fill="#D21034" />
  </svg>
);

const KuwaitFlag = () => (
  <svg width="20" height="14" viewBox="0 0 24 16" className="inline-block mr-1" style={{ borderRadius: '2px' }}>
    <rect width="24" height="5.33" fill="#007A3D" />
    <rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
    <rect y="10.66" width="24" height="5.34" fill="#CE1126" />
    <polygon points="0,0 6,8 0,16" fill="#000000" />
  </svg>
);

const BahrainFlag = () => (
  <svg width="20" height="14" viewBox="0 0 24 16" className="inline-block mr-1" style={{ borderRadius: '2px' }}>
    <rect width="24" height="16" fill="#CE1126" />
    <polygon points="0,0 8,0 6,2 8,4 6,6 8,8 6,10 8,12 6,14 8,16 0,16" fill="#FFFFFF" />
  </svg>
);

const USFlag = () => (
  <svg width="20" height="14" viewBox="0 0 24 16" className="inline-block mr-1" style={{ borderRadius: '2px' }}>
    <rect width="24" height="16" fill="#B22234" />
    <rect width="9.6" height="8.53" fill="#3C3B6E" />
    {/* Stars area - simplified */}
    <circle cx="2" cy="2" r="0.3" fill="#FFFFFF" />
    <circle cx="4" cy="2" r="0.3" fill="#FFFFFF" />
    <circle cx="6" cy="2" r="0.3" fill="#FFFFFF" />
    <circle cx="2" cy="4" r="0.3" fill="#FFFFFF" />
    <circle cx="4" cy="4" r="0.3" fill="#FFFFFF" />
    <circle cx="6" cy="4" r="0.3" fill="#FFFFFF" />
    {/* Stripes */}
    <rect x="9.6" width="14.4" height="1.23" fill="#FFFFFF" />
    <rect x="9.6" y="2.46" width="14.4" height="1.23" fill="#FFFFFF" />
    <rect x="9.6" y="4.92" width="14.4" height="1.23" fill="#FFFFFF" />
    <rect x="9.6" y="7.38" width="14.4" height="1.23" fill="#FFFFFF" />
    <rect x="9.6" y="9.84" width="14.4" height="1.23" fill="#FFFFFF" />
    <rect x="9.6" y="12.3" width="14.4" height="1.23" fill="#FFFFFF" />
    <rect x="9.6" y="14.77" width="14.4" height="1.23" fill="#FFFFFF" />
  </svg>
);

const FlagIcon = ({ code }) => {
  const flags = {
    AED: <UAEFlag />,
    SAR: <SaudiFlag />,
    QAR: <QatarFlag />,
    OMR: <OmanFlag />,
    KWD: <KuwaitFlag />,
    BHD: <BahrainFlag />,
    USD: <USFlag />,
  };
  return flags[code] || null;
};

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const { t } = useI18n();

  const currencies = [
    { code: "AED", labelKey: "currencyInfo.aed", defaultLabel: "درهم إماراتي" },
    { code: "SAR", labelKey: "currencyInfo.sar", defaultLabel: "ريال سعودي" },
    { code: "QAR", labelKey: "currencyInfo.qar", defaultLabel: "ريال قطري" },
    { code: "OMR", labelKey: "currencyInfo.omr", defaultLabel: "ريال عماني" },
    { code: "KWD", labelKey: "currencyInfo.kwd", defaultLabel: "دينار كويتي" },
    { code: "BHD", labelKey: "currencyInfo.bhd", defaultLabel: "دينار بحريني" },
    { code: "USD", labelKey: "currencyInfo.usd", defaultLabel: "دولار أمريكي" },
  ];

  return (
    <div className="relative inline-block">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="appearance-none bg-white text-[#0a2540] rounded-lg px-3 py-1.5 pr-8 pl-10 border border-gray-300 hover:border-[#ff7a00] focus:border-[#ff7a00] focus:outline-none focus:ring-1 focus:ring-[#ff7a00]/20 transition-all cursor-pointer font-medium shadow-sm hover:shadow text-xs md:text-sm w-48 sm:w-56 md:w-64 whitespace-normal leading-snug"
      >
        {currencies.map(({ code, labelKey, defaultLabel }) => (
          <option 
            key={code} 
            value={code}
            className="bg-white text-[#0a2540] py-1 text-xs md:text-sm whitespace-normal"
          >
            {code} - {t(labelKey, defaultLabel)}
          </option>
        ))}
      </select>
      
      {/* Flag Icon */}
      <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center">
        <FlagIcon code={currency} />
      </div>
      
      {/* Custom dropdown arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center text-[#0a2540]">
        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
        </svg>
      </div>
    </div>
  );
}