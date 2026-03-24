import React from "react";
import { useI18n } from "../../src/Components/i18n/I18nContext";

const WebsiteLogo = ({ width = 120, height = 120, className = "" }) => {
  const { lang } = useI18n();
  const logoPath = lang === "en" 
    ? "/ProjectImages/SouqLogoEn.webp" 
    : "/ProjectImages/SouqLogoAr.png";

  return (
    <img
      src={logoPath}
      alt="GoMango Logo"
      width={width}
      height={height}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
};

export default WebsiteLogo;
