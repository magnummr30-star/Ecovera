import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import API_BASE_URL, { ProductionServerPath, ServerPath } from "../../Components/Constant.js";
import { useCurrency } from "../Currency/CurrencyContext";
import { useI18n } from "../i18n/I18nContext";
import { getOrCreateSessionId } from "../utils";

const CartIcon = ({ className = "" }) => (
  <svg width="20" height="17" viewBox="0 0 20 17" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M1.60096 0.277344H2.58517L2.63439 0.287186C3.99867 0.31365 5.19073 1.21564 5.58704 2.52136L5.78388 3.20047H16.0493C16.9558 3.2046 17.8165 3.59911 18.4114 4.28311C19.0046 4.97145 19.2671 5.88478 19.1299 6.78303L18.5393 10.8577C18.3427 12.4195 17.023 13.5963 15.4489 13.6135H9.6617C8.27917 13.6084 7.06163 12.7022 6.65984 11.3793L4.16977 2.98394C3.97909 2.26367 3.33023 1.7599 2.58517 1.75367H1.60096C1.19328 1.75367 0.862793 1.42318 0.862793 1.01551C0.862793 0.607831 1.19328 0.277344 1.60096 0.277344ZM8.07787 10.9089C8.2868 11.6097 8.93121 12.09 9.66246 12.0899H15.4497C16.2643 12.0811 16.9541 11.4868 17.0835 10.6825L17.674 6.59801C17.7544 6.12257 17.6233 5.63571 17.315 5.26497C17.0067 4.89422 16.5519 4.67654 16.0697 4.66895H6.22754L8.07787 10.9089Z" />
    <path d="M9.4349 14.793C8.89133 14.793 8.45068 15.2336 8.45068 15.7772C8.45068 16.3208 8.89133 16.7614 9.4349 16.7614C9.97847 16.7614 10.4191 16.3208 10.4191 15.7772C10.4191 15.2336 9.97847 14.793 9.4349 14.793Z" />
    <path d="M15.3397 14.793C14.7961 14.793 14.3555 15.2336 14.3555 15.7772C14.3555 16.3208 14.7961 16.7614 15.3397 16.7614C15.8833 16.7614 16.3239 16.3208 16.3239 15.7772C16.3239 15.2336 15.8833 14.793 15.3397 14.793Z" />
  </svg>
);

function isAdminOrManager(role) {
  if (role == null) return false;
  const roles = Array.isArray(role) ? role : [role];
  return roles.some((r) => {
    const s = String(r).trim().toLowerCase();
    return s === "admin" || s === "manager";
  });
}

export default function ProductItem({ product, CurrentRole, onDeleted, layout = "rail", onClick }) {
  const {
    productId,
    productName,
    productNameAr,
    productNameEn,
    shortName,
    shortNameAr,
    shortNameEn,
    productPrice,
    priceAfterDiscount,
    discountPercentage,
    productImage,
  } = product;
  const productVideoUrl = product?.productVideoUrl ?? product?.ProductVideoUrl;

  const navigate = useNavigate();
  const { format } = useCurrency();
  const { t, lang } = useI18n();

  const getLocalizedValue = (arValue, enValue, fallback) =>
    lang === "ar" ? arValue ?? enValue ?? fallback : enValue ?? arValue ?? fallback;

  const localizedName = getLocalizedValue(productNameAr, productNameEn, productName);
  const localizedShortName = getLocalizedValue(shortNameAr, shortNameEn, shortName ?? localizedName);

  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [addToCartError, setAddToCartError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [availableQuantity, setAvailableQuantity] = useState(null);

  const id = productId ?? product?.productId;
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}Product/GetProductDetailsById?Id=${id}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const q = data?.quantity ?? data?.Quantity ?? null;
        if (!cancelled && q != null) setAvailableQuantity(Math.max(0, Number(q)));
      } catch {
        if (!cancelled) setAvailableQuantity(99);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const maxQty = availableQuantity != null ? Math.max(0, availableQuantity) : 99;
  const noQuantityAvailable = availableQuantity !== null && availableQuantity === 0;
  useEffect(() => {
    if (availableQuantity == null) return;
    if (availableQuantity === 0) setQuantity(1);
    else if (quantity > availableQuantity) setQuantity(availableQuantity);
  }, [availableQuantity]);

  const handleCardClick = (e) => {
    if (onClick) onClick();
    else navigate(`/productDetails/${productId}`, { state: { product } });
  };

  const handleAddToCartClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    const id = productId ?? product.productId;
    if (!id) return;
    setAddToCartError("");
    setAddToCartLoading(true);
    try {
      const detailRes = await fetch(`${API_BASE_URL}Product/GetProductDetailsById?Id=${id}`);
      if (!detailRes.ok) {
        throw new Error(t("addToCart.error", "حدث خطأ أثناء إضافة المنتج للسلة"));
      }
      const detailData = await detailRes.json();
      const productDetailsId = detailData?.productDetailsId ?? detailData?.ProductDetailsId;
      if (!productDetailsId) {
        throw new Error(t("addToCart.error", "حدث خطأ أثناء إضافة المنتج للسلة"));
      }
      const stock = detailData?.quantity ?? detailData?.Quantity ?? 0;
      if (stock === 0) {
        setAddToCartError(t("addToCart.noQuantityAvailable", "لا يوجد كمية أخرى متاحة"));
        setTimeout(() => setAddToCartError(""), 4000);
        setAddToCartLoading(false);
        return;
      }
      const qtyToSend = Math.max(1, Math.min(quantity, stock));
      if (quantity > stock) {
        setQuantity(qtyToSend);
        setAddToCartError(t("addToCart.maxQuantity", "تم تقليل الكمية إلى أقصى المتوفر"));
        setTimeout(() => setAddToCartError(""), 3000);
      }
      const token = sessionStorage.getItem("token");
      let response;
      if (token) {
        response = await fetch(`${API_BASE_URL}Carts/PostCartDetails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productDetailsId: Number(productDetailsId), quantity: qtyToSend }),
        });
      } else {
        const sessionId = getOrCreateSessionId();
        response = await fetch(`${API_BASE_URL}Carts/PostGuestCartDetails`, {
          method: "POST",
          headers: { "Content-Type": "application/json", sessionId },
          body: JSON.stringify({ productDetailsId: Number(productDetailsId), quantity: qtyToSend }),
        });
      }
      if (!response.ok) throw new Error(t("addToCart.error", "حدث خطأ أثناء إضافة المنتج للسلة"));
      setAddToCartSuccess(true);
      setInCart(true);
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      setTimeout(() => setAddToCartSuccess(false), 2000);
    } catch (err) {
      setAddToCartError(err.message || t("addToCart.error", "حدث خطأ أثناء إضافة المنتج للسلة"));
      setTimeout(() => setAddToCartError(""), 3000);
    } finally {
      setAddToCartLoading(false);
    }
  };

  const MoveToUpdateProductPage = (event) => {
    event.stopPropagation();
    event.preventDefault();
    if (!id) return;
    navigate(`/admin/edit-product?productId=${id}`, { state: { productId: id } });
  };

  const handleDelete = async (event) => {
    event.stopPropagation();
    const confirmDelete = window.confirm(t("productItem.confirmDelete", "هل أنت متأكد من حذف هذا المنتج؟"));
    if (!confirmDelete) return;
    const token = sessionStorage.getItem("token");
    if (!token) {
      alert(t("productItem.loginRequired", "يجب تسجيل الدخول"));
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}Product/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 204) {
        if (typeof onDeleted === "function") onDeleted(productId);
        else window.location.reload();
      } else if (res.status === 404) {
        alert(t("productItem.notFound", "المنتج غير موجود"));
      } else if (res.status === 403 || res.status === 401) {
        alert(t("productItem.noPermission", "ليس لديك الصلاحية لحذف المنتج"));
      } else {
        const body = await res.json().catch(() => null);
        alert(body?.message ?? t("productItem.deleteFailed", "فشل حذف المنتج"));
      }
    } catch (error) {
      console.error("خطأ أثناء حذف المنتج", error);
      alert(t("productItem.deleteError", "حدث خطأ أثناء حذف المنتج"));
    }
  };

  const isGrid = layout === "grid";
  const imageUrl = productImage ? (productImage.startsWith("http") ? productImage : ServerPath + productImage) : null;
  const initialVideoUrl = productVideoUrl
    ? (productVideoUrl.startsWith("http") ? productVideoUrl : ServerPath + productVideoUrl)
    : null;
  const fallbackVideoUrl =
    productVideoUrl && !productVideoUrl.startsWith("http")
      ? `${ProductionServerPath}${productVideoUrl}`
      : null;
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);

  useEffect(() => {
    setVideoUrl(initialVideoUrl);
  }, [initialVideoUrl]);

  const handleVideoError = () => {
    if (
      fallbackVideoUrl &&
      videoUrl &&
      videoUrl !== fallbackVideoUrl &&
      ServerPath !== ProductionServerPath
    ) {
      setVideoUrl(fallbackVideoUrl);
    }
  };

  const slideWrapperClass = isGrid ? "" : "min-w-0 shrink-0 grow-0 pl-4 md:pl-5 basis-auto lg:basis-[20%]";

  return (
    <div className={slideWrapperClass} dir="ltr">
      <article
        className={`relative flex flex-col md:pb-4 pb-4 font-semibold bg-white rounded-xl border border-gray-200 border-solid overflow-hidden w-full min-w-0 ${isGrid ? "h-full" : ""} ${onClick ? "cursor-pointer" : ""}`}
        onClick={handleCardClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {isAdminOrManager(CurrentRole) && (
          <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-20">
            <button type="button" onClick={MoveToUpdateProductPage} className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg bg-white/95 text-[#92278f] hover:bg-white shadow border border-gray-200">
              <FaEdit className="text-[#92278f]" size={12} />
              {t("productItem.edit", "تعديل")}
            </button>
            <button type="button" onClick={handleDelete} className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 shadow">
              <FaTrash size={12} />
              {t("productItem.delete", "حذف")}
            </button>
          </div>
        )}

        <div className="flex gap-0 self-stretch px-px text-sm leading-5 text-black relative">
          <div className="flex z-10 flex-col w-full">
            <div className="relative flex justify-center bg-gray-50 min-h-[180px] sm:min-h-[200px] md:min-h-[180px]">
              {videoUrl ? (
                <>
                  <video
                    src={videoUrl}
                    poster={imageUrl || undefined}
                    muted
                    loop
                    playsInline
                    autoPlay
                    onError={handleVideoError}
                    className="transition-opacity duration-300 relative object-contain self-center mt-0 md:aspect-[0.81] aspect-[1] w-full max-w-full max-h-[200px] sm:max-h-[220px] md:max-h-[220px] z-10"
                  />
                  {discountPercentage > 0 && (
                    <div className="text-green-600 bg-transparent p-1 absolute md:hidden left-1.5 -bottom-px text-sm truncate font-semibold">
                      -{discountPercentage}%
                    </div>
                  )}
                  {discountPercentage > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full hidden md:block">
                      %{discountPercentage}
                    </div>
                  )}
                </>
              ) : imageUrl ? (
                <>
                  <img
                    alt={localizedName}
                    loading="lazy"
                    decoding="async"
                    className="transition-opacity duration-300 relative mix-blend-multiply object-contain self-center mt-0 md:aspect-[0.81] aspect-[1] w-full max-w-full max-h-[200px] sm:max-h-[220px] md:max-h-[220px] z-10"
                    src={imageUrl}
                  />
                  {discountPercentage > 0 && (
                    <div className="text-green-600 bg-transparent p-1 absolute md:hidden left-1.5 -bottom-px text-sm truncate font-semibold">
                      -{discountPercentage}%
                    </div>
                  )}
                  {discountPercentage > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full hidden md:block">
                      %{discountPercentage}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">
                  {localizedName}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="self-stretch w-full bg-gray-200 h-px z-10" />

        <div className="md:px-3.5 px-4 flex flex-col justify-between h-full flex-1">
          <a
            href={`/productDetails/${productId}`}
            onClick={(e) => { e.preventDefault(); handleCardClick(e); }}
            className="block"
          >
            <div className="md:mt-4 mt-3 text-[14px] leading-snug md:text-sm font-medium text-black text-opacity-80">
              <h3 className="font-medium text-[15px] md:text-[14px] text-black line-clamp-2 rtl:text-right" dir="ltr">
                {localizedShortName}
              </h3>
            </div>
            <div className="flex mt-2.5 items-center w-full font-semibold justify-start gap-x-2 flex-wrap">
              <div className="whitespace-nowrap tracking-tight text-base md:text-base text-black">
                {format(discountPercentage > 0 ? priceAfterDiscount : productPrice)}
              </div>
              {discountPercentage > 0 && (
                <div className="text-neutral-500 text-[13px] md:text-sm truncate line-through">
                  {format(productPrice)}
                </div>
              )}
              {discountPercentage > 0 && (
                <div className="text-green-600 text-[13px] md:text-sm truncate hidden md:block">
                  -{discountPercentage}%
                </div>
              )}
            </div>
          </a>
          <div className="relative mt-3 md:mt-4">
            {addToCartError && (
              <p className="text-red-600 text-xs mb-1" role="alert">
                {addToCartError}
              </p>
            )}
            <div className="flex items-center gap-2">
              {!(inCart || addToCartSuccess) && !noQuantityAvailable && (
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shrink-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setQuantity((q) => Math.max(1, q - 1)); }}
                    className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 border-r border-gray-300 touch-manipulation text-lg md:text-base"
                    aria-label={t("productItem.decreaseQty", "تقليل الكمية")}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={maxQty}
                    value={quantity}
                    onChange={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (Number.isNaN(v)) return;
                      const clamped = Math.max(1, Math.min(maxQty, v));
                      setQuantity(clamped);
                      if (v > maxQty) {
                        setAddToCartError(t("addToCart.noQuantityAvailable", "لا يوجد كمية أخرى متاحة"));
                        setTimeout(() => setAddToCartError(""), 3000);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-12 h-10 md:w-10 md:h-8 text-center text-base md:text-sm font-semibold border-0 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    aria-label={t("productItem.quantity", "الكمية")}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = Math.min(maxQty, quantity + 1);
                      setQuantity(next);
                      if (quantity >= maxQty && maxQty > 0) {
                        setAddToCartError(t("addToCart.noQuantityAvailable", "لا يوجد كمية أخرى متاحة"));
                        setTimeout(() => setAddToCartError(""), 3000);
                      }
                    }}
                    className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 border-l border-gray-300 touch-manipulation text-lg md:text-base"
                    aria-label={t("productItem.increaseQty", "زيادة الكمية")}
                  >
                    +
                  </button>
                </div>
              )}
              {noQuantityAvailable && (
                <p className="text-red-600 text-xs mb-0.5 w-full" role="alert">
                  {t("addToCart.noQuantityAvailable", "لا يوجد كمية أخرى متاحة")}
                </p>
              )}
              <button
                type="button"
                onClick={handleAddToCartClick}
                disabled={addToCartLoading || inCart || noQuantityAvailable}
                title={addToCartSuccess ? t("addToCart.addedToCart", "تمت الإضافة إلى السلة") : inCart ? t("addToCart.inCart", "في السلة") : t("productItem.addToCart", "أضف للسلة")}
                aria-label={addToCartSuccess ? t("addToCart.addedToCart", "تمت الإضافة إلى السلة") : inCart ? t("addToCart.inCart", "في السلة") : t("productItem.addToCart", "أضف للسلة")}
                className={`flex z-10 justify-center items-center flex-1 min-w-0 max-md:h-11 md:py-2 rounded-lg border border-solid font-semibold transition-colors min-w-[48px] text-base md:text-sm ${inCart || addToCartSuccess ? "bg-emerald-600 border-emerald-600 text-white cursor-default" : noQuantityAvailable ? "bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed" : "text-[#92278f] bg-white border-[#92278f] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#92278f]/10"}`}
              >
                {addToCartSuccess ? (
                  <FaCheck className="text-white shrink-0" aria-hidden />
                ) : inCart ? (
                  <FaCheck className="text-white shrink-0" aria-hidden />
                ) : (
                  <span className={addToCartLoading ? "opacity-70" : ""}>
                    <CartIcon />
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
