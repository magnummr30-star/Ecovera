import React from "react";

/**
 * Amazon-style dimension (color/size) swatch list.
 * Grid of selectable items: image/color box + divider + label; optional availability.
 */
export default function DimensionSwatchList({
  items = [],
  selectedValue,
  onSelect,
  type = "color",
  translateLabel = (v) => v,
  getColorHex = () => "#CCCCCC",
  getImageUrl,
  disabledItems = [],
  columns = 7,
  roleName = "radiogroup",
  t,
}) {
  if (!items.length) return null;

  const isDisabled = (item) => disabledItems.includes(item);

  return (
    <ul
      className="list-none p-0 m-0 grid gap-3 w-full"
      style={{
        gridTemplateColumns: `repeat(${Math.min(columns, items.length)}, min-content)`,
      }}
      role="radiogroup"
      aria-label={roleName}
    >
      {items.map((item, index) => {
        const value = typeof item === "object" && item !== null ? item.value : item;
        const label = typeof item === "object" && item !== null ? item.label ?? value : value;
        const imageUrl = typeof item === "object" && item !== null ? item.imageUrl : null;
        const available = typeof item === "object" && item !== null ? item.available !== false : true;
        const isSelected = selectedValue === value;
        const disabled = isDisabled(value);

        return (
          <li
            key={value ?? index}
            className="inline-flex"
            style={{ gridArea: `a${index}` }}
          >
            <span className="block">
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={translateLabel(label)}
                onClick={() => !disabled && onSelect(value)}
                disabled={disabled}
                className={`
                  w-full flex flex-col items-center text-center rounded-lg border-2 transition-all duration-200
                  min-w-[64px] max-w-[80px] overflow-hidden
                  ${disabled ? "opacity-50 cursor-not-allowed border-gray-200" : ""}
                  ${!disabled && isSelected ? "border-[#92278f] shadow-lg ring-2 ring-[#92278f] ring-offset-1" : ""}
                  ${!disabled && !isSelected ? "border-gray-300 hover:border-[#92278f] hover:shadow-md" : ""}
                `}
              >
                {/* Image or color swatch */}
                <div className="a-section a-spacing-none swatch-image-container w-full">
                  <div className="a-section a-spacing-none swatch-image-wrapper flex justify-center p-1">
                    {type === "color" ? (
                      imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={translateLabel(label)}
                          className="swatch-image w-14 h-14 object-cover rounded border border-gray-200"
                        />
                      ) : (
                        <div
                          className="w-14 h-14 rounded border border-gray-200 flex-shrink-0"
                          style={{ backgroundColor: getColorHex(value) || getColorHex(label) }}
                        />
                      )
                    ) : (
                      <span className="w-14 h-14 flex items-center justify-center text-xs font-semibold text-gray-700" />
                    )}
                  </div>
                </div>
                <hr aria-hidden="true" className="a-spacing-none a-divider-normal w-full border-t border-gray-200 my-1" />
                <div className="a-section swatch-text px-1 pb-1.5">
                  <span className="text-xs font-medium text-gray-800 block truncate w-full">
                    {translateLabel(label)}
                  </span>
                  {available === false && (
                    <span className="text-xs text-red-600">
                      {t ? t("productDetails.outOfStockShort", "غير متوفر") : "غير متوفر"}
                    </span>
                  )}
                </div>
              </button>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
