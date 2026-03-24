import React from "react";

export default function ProductDescriptionSection({ moreDetails, t }) {
  const formatDescription = (text) => {
    if (!text)
      return <p className="text-black">{t("productDetails.noDetails", "لا توجد تفاصيل إضافية")}</p>;
    return text.split("\n").map((line, index) =>
      line.trim() === "" ? (
        <br key={index} />
      ) : (
        <p key={index} className="text-black">
          {line}
        </p>
      )
    );
  };

  return (
    <div className="bg-[#FAFAFA] rounded-2xl shadow-xl p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        {t("productDetails.productDetails", "تفاصيل المنتج")}
      </h3>
      <div className="text-gray-700 leading-relaxed text-lg">
        {formatDescription(moreDetails)}
      </div>
    </div>
  );
}
