import React, { useRef, useState, useEffect } from "react";
import { useI18n } from "../i18n/I18nContext";
import { FiTruck, FiCreditCard, FiRefreshCw, FiMessageCircle } from "react-icons/fi";

const services = [
  {
    key: "freeShipping",
    icon: FiTruck,
    titleKey: "services.freeShipping",
    titleEn: "Free Shipping",
    titleAr: "شحن مجاني",
    descKey: "services.freeShippingDesc",
    descEn: "For order above AED 200",
    descAr: "للطلبات فوق 200 جنيه",
  },
  {
    key: "cashOnDelivery",
    icon: FiCreditCard,
    titleKey: "services.cashOnDelivery",
    titleEn: "Cash On Delivery",
    titleAr: "الدفع عند الاستلام",
    descKey: "services.codDesc",
    descEn: "For selected products only",
    descAr: "لمنتجات مختارة",
  },
  {
    key: "moneyBack",
    icon: FiRefreshCw,
    titleKey: "services.moneyBack",
    titleEn: "Money Back Guarantee",
    titleAr: "استرجاع خلال 7 أيام",
    descKey: "services.moneyBackDesc",
    descEn: "Refund within 7 days",
    descAr: "استرداد خلال 7 أيام",
  },
  {
    key: "support",
    icon: FiMessageCircle,
    titleKey: "services.support",
    titleEn: "24/7 Support",
    titleAr: "دعم 24/7",
    descKey: "services.supportDesc",
    descEn: "Answer all your questions",
    descAr: "نجيب على كل استفساراتك",
  },
];

export default function HomeServicesStrip() {
  const { t, lang } = useI18n();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const amount = 280;
    scrollRef.current.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  const isRTL = lang === "ar";

  return (
    <section className="w-full px-3 sm:px-4 md:container md:mx-auto py-4 md:py-6 bg-[#eef2f9]">
      {/* Services carousel */}
      <div className="relative w-full max-w-full overflow-hidden" role="region" aria-roledescription="carousel" dir="ltr">
        <div
          ref={scrollRef}
          className="flex w-full gap-3 px-1 pb-2 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-thin snap-x snap-mandatory"
          style={{ scrollbarWidth: "thin", WebkitOverflowScrolling: "touch" }}
        >
          {services.map((s) => {
            const Icon = s.icon;
            const title = lang === "ar" ? s.titleAr : s.titleEn;
            const desc = lang === "ar" ? s.descAr : s.descEn;
            return (
              <div
                key={s.key}
                role="group"
                aria-roledescription="slide"
                className="flex-shrink-0 w-[min(85vw,320px)] sm:w-[min(75vw,340px)] md:flex-1 md:min-w-0 md:max-w-[277px] snap-start"
              >
                <section
                  className={`flex items-center h-full gap-2.5 p-3 sm:p-4 md:pl-5 md:pr-[17px] md:py-5 font-medium rounded-2xl border border-solid border-neutral-200 bg-white ${isRTL ? "flex-row-reverse text-right" : ""}`}
                >
                  <div className="flex-shrink-0 text-[#0A2C52]" aria-hidden>
                    <Icon className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 min-h-[2.5rem]">
                    <h3 className="text-xs sm:text-sm font-semibold md:text-[17px] text-[#111] -tracking-[0.5px] line-clamp-1">
                      {title}
                    </h3>
                    <p className="mt-0.5 md:mt-2.5 text-[11px] sm:text-xs md:text-sm text-[#333] line-clamp-2">
                      {desc}
                    </p>
                  </div>
                </section>
              </div>
            );
          })}
        </div>
        {/* Optional arrows for desktop */}
        <button
          type="button"
          onClick={() => scroll(isRTL ? 1 : -1)}
          disabled={!canScrollLeft}
          className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-md items-center justify-center disabled:opacity-40 disabled:pointer-events-none"
          aria-label={t("carousel.prev", "Previous")}
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scroll(isRTL ? -1 : 1)}
          disabled={!canScrollRight}
          className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-neutral-200 shadow-md items-center justify-center disabled:opacity-40 disabled:pointer-events-none"
          aria-label={t("carousel.next", "Next")}
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}
