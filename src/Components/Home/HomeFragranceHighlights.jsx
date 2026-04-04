import React from "react";
import { useI18n } from "../i18n/I18nContext";

export default function HomeFragranceHighlights() {
  const { lang } = useI18n();
  const isArabic = lang === "ar";
  const textAlignClass = isArabic ? "text-center sm:text-right" : "text-center sm:text-left";
  const desktopTextAlignClass = isArabic ? "text-right" : "text-left";
  const galleryHint = isArabic
    ? "اضغط على الصورة المصغرة لتبديل المعاينة"
    : "Tap a mini image to switch the preview";
  const [selectedImages, setSelectedImages] = React.useState({
    "vera-essence": 0,
    "essence-bold": 0,
  });
  const content = isArabic
    ? {
        eyebrow: "مزايا العطور",
        title: "اكتشف شخصية كل عطر قبل الطلب",
        description:
          "جهزنا لك نظرة سريعة على طابع كل عطر حتى تختار الأنسب لذوقك بسهولة.",
        badge: "مزايا العطر",
        usageLabel: "مناسب لـ",
        cards: {
          vera: {
            name: "VE Vera Essence",
            subtitle: "طابع أنيق وهادئ يناسب من يحب الحضور الناعم والمتوازن.",
            usage: "مثالي للدوام، الخروجات اليومية، والمواعيد الهادئة.",
            benefits: [
              "حضور ناعم ومريح طوال اليوم",
              "إحساس نظيف ومتوازن بدون مبالغة",
              "خيار أنيق للاستخدام اليومي",
            ],
          },
          bold: {
            name: "Essence Bold",
            subtitle: "شخصية جريئة بلمسة لافتة لمن يحب العطر الواضح والقوي.",
            usage: "مناسب للمساء، المناسبات، والإطلالات التي تحتاج حضورًا أقوى.",
            benefits: [
              "طابع قوي يلفت الانتباه بسرعة",
              "يناسب الإطلالات المسائية والمناسبات",
              "اختيار واضح لمن يفضل العطر الجريء",
            ],
          },
        },
      }
    : {
        eyebrow: "Fragrance Highlights",
        title: "Discover each fragrance before you order",
        description:
          "We prepared a quick overview of each fragrance so you can choose the one that matches your taste with confidence.",
        badge: "Fragrance Benefits",
        usageLabel: "Ideal For",
        cards: {
          vera: {
            name: "VE Vera Essence",
            subtitle: "A calm, elegant profile for anyone who prefers a soft balanced presence.",
            usage: "Perfect for workdays, daily outings, and relaxed plans.",
            benefits: [
              "Soft presence that feels comfortable all day",
              "Clean and balanced impression without being too strong",
              "An elegant choice for everyday wear",
            ],
          },
          bold: {
            name: "Essence Bold",
            subtitle: "A bold character with a standout touch for lovers of stronger presence.",
            usage: "Best for evenings, occasions, and looks that need more impact.",
            benefits: [
              "A strong profile that gets noticed quickly",
              "Great for evening looks and occasions",
              "A clear choice for fans of bold fragrances",
            ],
          },
        },
      };

  const cards = [
    {
      id: "vera-essence",
      name: content.cards.vera.name,
      subtitle: content.cards.vera.subtitle,
      usage: content.cards.vera.usage,
      images: ["/ProjectImages/N1.jpeg", "/ProjectImages/B22.jpeg"],
      query: "VE Vera Essence",
      accentClass:
        "from-[#fff7ed] via-[#fffaf3] to-[#f4e7d3] border-[#f2d7b5] shadow-[0_18px_40px_rgba(180,120,48,0.12)]",
      badgeClass: "bg-[#fff1df] text-[#9a5a12]",
      ringClass: "ring-[#f3dec4]",
      thumbActiveClass: "border-[#9a5a12] shadow-md",
      benefits: content.cards.vera.benefits,
    },
    {
      id: "essence-bold",
      name: content.cards.bold.name,
      subtitle: content.cards.bold.subtitle,
      usage: content.cards.bold.usage,
      images: ["/ProjectImages/N2.jpeg", "/ProjectImages/B11.jpeg"],
      query: "Essence Bold",
      accentClass:
        "from-[#fff1f2] via-[#fff6f6] to-[#ffe0e3] border-[#f5c2ca] shadow-[0_18px_40px_rgba(190,24,93,0.14)]",
      badgeClass: "bg-[#ffe4e8] text-[#b4234e]",
      ringClass: "ring-[#ffd4dc]",
      thumbActiveClass: "border-[#be123c] shadow-md",
      benefits: content.cards.bold.benefits,
    },
  ];

  return (
    <section className="py-8 sm:py-10 md:py-12">
      <div className="space-y-3 text-center">
        <span className="inline-flex items-center rounded-full bg-[#eef2f9] px-4 py-1.5 text-xs sm:text-sm font-bold text-[#92278f]">
          {content.eyebrow}
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#231f20]">
          {content.title}
        </h2>
        <p className="mx-auto max-w-3xl text-sm sm:text-base leading-7 text-gray-600">
          {content.description}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        {cards.map((card) => (
          <article
            key={card.id}
            className={`relative mx-auto w-full max-w-[420px] overflow-hidden rounded-[28px] border bg-gradient-to-br ${card.accentClass} lg:max-w-none`}
          >
            <div className="pointer-events-none absolute -top-16 -right-10 h-40 w-40 rounded-full bg-white/50 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/40 blur-3xl" />

            <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:hidden">
              <div className="mx-auto w-full max-w-[290px]">
                <div className={`overflow-hidden rounded-[24px] bg-white/80 p-3 ring-1 ${card.ringClass}`}>
                  <div className="aspect-[3/4] overflow-hidden rounded-[18px] bg-white">
                    <img
                      src={card.images[selectedImages[card.id] ?? 0]}
                      alt={card.name}
                      className="h-full w-full object-contain object-center"
                    />
                  </div>
                </div>
                {card.images.length > 1 && (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {card.images.map((imageSrc, imageIndex) => {
                      const isActive = (selectedImages[card.id] ?? 0) === imageIndex;
                      return (
                        <button
                          key={imageSrc}
                          type="button"
                          onClick={() =>
                            setSelectedImages((prev) => ({
                              ...prev,
                              [card.id]: imageIndex,
                            }))
                          }
                          className={`overflow-hidden rounded-xl border-2 transition-all ${
                            isActive
                              ? card.thumbActiveClass
                              : "border-transparent opacity-80 hover:opacity-100"
                          }`}
                          aria-label={`${card.name} ${imageIndex + 1}`}
                        >
                          <img
                            src={imageSrc}
                            alt=""
                            className="h-14 w-12 bg-white object-contain object-center"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
                {card.images.length > 1 && (
                  <p className="mt-3 text-center text-[11px] font-semibold tracking-[0.16em] text-gray-500 xl:hidden">
                    {galleryHint}
                  </p>
                )}
              </div>

              <div className={`flex min-w-0 flex-1 flex-col gap-5 ${textAlignClass}`}>
                <div className="space-y-4">
                  <span className={`inline-flex self-center rounded-full px-3 py-1 text-xs font-bold ${card.badgeClass}`}>
                    {content.badge}
                  </span>

                  <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-[#231f20]">
                      {card.name}
                    </h3>
                    <p className="text-sm sm:text-base leading-7 text-gray-700">
                      {card.subtitle}
                    </p>
                  </div>

                  <div className="rounded-[22px] bg-white/70 p-4 text-center shadow-sm">
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                      {content.usageLabel}
                    </div>
                    <p className="mt-2 text-sm sm:text-base leading-7 text-gray-700">
                      {card.usage}
                    </p>
                  </div>

                  <ul className="grid gap-3 sm:grid-cols-2">
                    {card.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="rounded-[20px] bg-white/78 px-4 py-3 text-sm font-semibold leading-6 text-gray-700 shadow-sm"
                      >
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>

            <div
              className={`relative hidden gap-5 p-6 lg:flex lg:p-7 ${
                isArabic ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div className="w-[260px] flex-shrink-0">
                <div className={`overflow-hidden rounded-[24px] bg-white/80 p-3 ring-1 ${card.ringClass}`}>
                  <div className="aspect-[3/4] overflow-hidden rounded-[18px] bg-white">
                    <img
                      src={card.images[selectedImages[card.id] ?? 0]}
                      alt={card.name}
                      className="h-full w-full object-contain object-center"
                    />
                  </div>
                </div>
                {card.images.length > 1 && (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {card.images.map((imageSrc, imageIndex) => {
                      const isActive = (selectedImages[card.id] ?? 0) === imageIndex;
                      return (
                        <button
                          key={`${imageSrc}-desktop`}
                          type="button"
                          onClick={() =>
                            setSelectedImages((prev) => ({
                              ...prev,
                              [card.id]: imageIndex,
                            }))
                          }
                          className={`overflow-hidden rounded-xl border-2 transition-all ${
                            isActive
                              ? card.thumbActiveClass
                              : "border-transparent opacity-80 hover:opacity-100"
                          }`}
                          aria-label={`${card.name} ${imageIndex + 1}`}
                        >
                          <img
                            src={imageSrc}
                            alt=""
                            className="h-14 w-12 bg-white object-contain object-center"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className={`flex min-w-0 flex-1 flex-col gap-5 ${desktopTextAlignClass}`}>
                <div className="space-y-4">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${card.badgeClass}`}>
                    {content.badge}
                  </span>

                  <div className="space-y-2">
                    <h3 className="text-3xl font-extrabold text-[#231f20]">
                      {card.name}
                    </h3>
                    <p className="text-base leading-7 text-gray-700">
                      {card.subtitle}
                    </p>
                  </div>

                  <div className="rounded-[22px] bg-white/70 p-4 shadow-sm">
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
                      {content.usageLabel}
                    </div>
                    <p className="mt-2 text-base leading-7 text-gray-700">
                      {card.usage}
                    </p>
                  </div>

                  <ul className="grid gap-3 xl:grid-cols-3">
                    {card.benefits.map((benefit) => (
                      <li
                        key={`${benefit}-desktop`}
                        className="rounded-[20px] bg-white/78 px-4 py-3 text-sm font-semibold leading-6 text-gray-700 shadow-sm"
                      >
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
