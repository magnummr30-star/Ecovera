import React from "react";
import { useI18n } from "../i18n/I18nContext";

const buildImageSrc = (fileName) => `/ProjectImages/all_img/${encodeURIComponent(fileName)}`;

const galleryItems = [
  {
    id: "gallery-01",
    fileName: "WhatsApp Image 2026-04-04 at 11.37.50 AM.jpeg",
    tone: "azure",
  },
  {
    id: "gallery-02",
    fileName: "WhatsApp Image 2026-04-04 at 11.38.16 AM (1).jpeg",
    tone: "sunset",
  },
  {
    id: "gallery-03",
    fileName: "WhatsApp Image 2026-04-04 at 11.38.16 AM (2).jpeg",
    tone: "sunset",
  },
  {
    id: "gallery-04",
    fileName: "WhatsApp Image 2026-04-04 at 11.38.16 AM (3).jpeg",
    tone: "pearl",
  },
  {
    id: "gallery-05",
    fileName: "WhatsApp Image 2026-04-04 at 11.38.16 AM (4).jpeg",
    tone: "azure",
  },
  {
    id: "gallery-06",
    fileName: "WhatsApp Image 2026-04-04 at 11.38.16 AM (5).jpeg",
    tone: "sunset",
  },
  {
    id: "gallery-07",
    fileName: "WhatsApp Image 2026-04-04 at 11.38.16 AM (6).jpeg",
    tone: "pearl",
  },
  {
    id: "gallery-08",
    fileName: "WhatsApp Image 2026-04-04 at 11.38.16 AM (7).jpeg",
    tone: "azure",
  },
  {
    id: "gallery-09",
    fileName: "WhatsApp Image 2026-04-04 at 11.38.16 AM (8).jpeg",
    tone: "sunset",
  },
  {
    id: "gallery-10",
    fileName: "WhatsApp Image 2026-04-04 at 11.38.16 AM (9).jpeg",
    tone: "pearl",
  },
  {
    id: "gallery-11",
    fileName: "WhatsApp Image 2026-04-04 at 11.38.16 AM.jpeg",
    tone: "azure",
  },
  {
    id: "gallery-12",
    fileName: "WhatsApp Image 2026-04-04 at 11.38.17 AM.jpeg",
    tone: "pearl",
  },
].map((item, index) => ({
  ...item,
  src: buildImageSrc(item.fileName),
  orderLabel: String(index + 1).padStart(2, "0"),
}));

const themeStyles = {
  azure: {
    shell:
      "border-sky-200/80 bg-[linear-gradient(135deg,#f4fbff_0%,#e0f2fe_45%,#dbeafe_100%)] shadow-[0_24px_65px_rgba(14,116,144,0.12)]",
    chip: "bg-white/85 text-sky-700",
    glowPrimary: "bg-sky-300/35",
    glowSecondary: "bg-cyan-200/45",
    imageGlow: "bg-sky-300/25",
    overlay: "from-sky-900/45 via-sky-900/12 to-transparent",
    thumbActive:
      "border-sky-300 ring-2 ring-sky-200 shadow-[0_14px_24px_rgba(56,189,248,0.18)]",
  },
  sunset: {
    shell:
      "border-orange-200/80 bg-[linear-gradient(135deg,#fff7ed_0%,#ffedd5_38%,#ffe4e6_100%)] shadow-[0_24px_65px_rgba(180,83,9,0.12)]",
    chip: "bg-white/85 text-orange-700",
    glowPrimary: "bg-amber-300/35",
    glowSecondary: "bg-rose-200/45",
    imageGlow: "bg-orange-300/25",
    overlay: "from-orange-950/40 via-orange-950/10 to-transparent",
    thumbActive:
      "border-orange-300 ring-2 ring-orange-200 shadow-[0_14px_24px_rgba(251,146,60,0.2)]",
  },
  pearl: {
    shell:
      "border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_40%,#eff6ff_100%)] shadow-[0_24px_65px_rgba(100,116,139,0.12)]",
    chip: "bg-white/88 text-slate-700",
    glowPrimary: "bg-slate-300/35",
    glowSecondary: "bg-blue-100/55",
    imageGlow: "bg-slate-300/20",
    overlay: "from-slate-950/38 via-slate-900/10 to-transparent",
    thumbActive:
      "border-slate-300 ring-2 ring-slate-200 shadow-[0_14px_24px_rgba(148,163,184,0.18)]",
  },
};

function GalleryPreviewCard({ selectedItem, selectedMood, content, theme, compact = false }) {
  return (
    <div
      className={`relative overflow-hidden border border-white/75 bg-white/78 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur ${
        compact
          ? "mx-auto w-full max-w-[320px] rounded-[24px] p-2.5"
          : "rounded-[28px] p-3"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-x-8 top-0 h-24 rounded-full ${theme.imageGlow} blur-3xl`}
      />

      <div
        className={`relative overflow-hidden bg-white ${
          compact ? "rounded-[18px]" : "rounded-[22px]"
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b ${theme.overlay} ${
            compact ? "h-24" : "h-36"
          }`}
        />
        <div className="aspect-[4/5]">
          <img
            src={selectedItem.src}
            alt={`${content.previewLabel} ${selectedItem.orderLabel}`}
            className="h-full w-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
        </div>

        <div
          className={`absolute bottom-3 inset-x-3 flex items-end justify-between gap-2 ${
            compact ? "" : "sm:bottom-4 sm:inset-x-4 sm:gap-3"
          }`}
        >
          <div
            className={`rounded-[18px] bg-slate-950/28 text-white backdrop-blur-md ${
              compact
                ? "max-w-[78%] px-3 py-2"
                : "max-w-[78%] px-4 py-3"
            }`}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/75">
              {content.previewLabel}
            </p>
            <p className={`mt-1 font-extrabold leading-tight ${compact ? "text-base" : "text-xl"}`}>
              {selectedMood.title}
            </p>
          </div>

          <span
            className={`inline-flex items-center justify-center rounded-full bg-white/90 font-bold text-slate-800 shadow-lg ${
              compact
                ? "min-h-10 min-w-10 px-3 text-xs"
                : "min-h-11 min-w-11 px-3 text-sm"
            }`}
          >
            {selectedItem.orderLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function GalleryThumbnailStrip({
  galleryItems,
  selectedItem,
  setSelectedId,
  theme,
  content,
  mobile = false,
  className = "",
}) {
  return (
    <div
      className={`${
        mobile
          ? "mx-auto flex w-full max-w-[320px] gap-3 overflow-x-auto px-1 pb-1 snap-x snap-mandatory"
          : "mt-4 grid grid-cols-4 gap-3"
      } ${className}`}
    >
      {galleryItems.map((item, index) => {
        const isActive = item.id === selectedItem.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedId(item.id)}
            className={`group overflow-hidden rounded-[18px] border bg-white/90 p-1.5 transition-all duration-200 ${
              mobile ? "w-[92px] flex-shrink-0 snap-start" : "w-auto"
            } ${
              isActive
                ? theme.thumbActive
                : "border-white/70 hover:-translate-y-0.5 hover:shadow-md"
            }`}
            aria-label={`${content.thumbAria} ${index + 1}`}
          >
            <div className="aspect-[3/4] overflow-hidden rounded-[14px] bg-slate-100">
              <img
                src={item.src}
                alt=""
                className={`h-full w-full object-cover object-center transition duration-300 ${
                  isActive ? "scale-[1.03]" : "group-hover:scale-105"
                }`}
                loading="lazy"
                decoding="async"
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function GalleryInfoCard({
  selectedItem,
  selectedMood,
  content,
  theme,
  galleryItems,
  setSelectedId,
  mobile = false,
  textAlignClass = "text-left",
  showSwipeHint = true,
  showThumbnails = true,
}) {
  return (
    <div
      className={`rounded-[24px] border border-white/75 bg-white/72 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur ${
        mobile ? "mx-auto w-full max-w-[320px] p-4 text-center" : "rounded-[28px] p-5"
      }`}
    >
      {mobile ? (
        <div className="space-y-3">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${theme.chip}`}>
            {content.galleryLabel}
          </span>
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900">{selectedMood.title}</h3>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {selectedItem.orderLabel}/{galleryItems.length}
            </p>
          </div>
        </div>
      ) : (
        <div className={`flex items-center justify-between gap-3 ${textAlignClass}`}>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              {content.galleryLabel}
            </p>
            <h3 className="mt-1 text-xl font-extrabold text-slate-900">{selectedMood.title}</h3>
          </div>

          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${theme.chip}`}>
            {selectedItem.orderLabel}/{galleryItems.length}
          </span>
        </div>
      )}

      <p
        className={`mt-3 leading-7 text-slate-600 ${
          mobile ? "mx-auto max-w-[30rem] text-sm" : "text-sm sm:text-base"
        }`}
      >
        {selectedMood.description}
      </p>

      {mobile && showSwipeHint && (
        <p className="mt-4 text-[11px] font-semibold tracking-[0.18em] text-slate-400">
          {content.swipeHint}
        </p>
      )}

      {showThumbnails && (
        <GalleryThumbnailStrip
          galleryItems={galleryItems}
          selectedItem={selectedItem}
          setSelectedId={setSelectedId}
          theme={theme}
          content={content}
          mobile={mobile}
          className={mobile ? "mt-4" : ""}
        />
      )}
    </div>
  );
}

export default function HomeProductGallery() {
  const { lang } = useI18n();
  const isArabic = lang === "ar";
  const desktopTextAlignClass = isArabic ? "text-right" : "text-left";
  const content = isArabic
    ? {
        eyebrow: "ألبوم المنتجات",
        title: "لقطات دعائية أنيقة تبرز جمال العطور",
        description:
          "جمعنا صور المنتجات في جزء واحد بتدرجات هادئة ولمسات لونية متناسقة حتى يظهر كل منتج بشكل فاخر وواضح.",
        stats: ["12 صورة دعائية", "ألوان متناغمة", "عرض تفاعلي سريع"],
        galleryLabel: "المشهد الحالي",
        previewLabel: "معاينة كبيرة",
        thumbAria: "اختيار صورة المنتج رقم",
        swipeHint: "اسحب لرؤية بقية الصور",
        moods: {
          azure: {
            title: "هدوء أزرق راقٍ",
            description:
              "التدرجات الباردة تمنح الصورة إحساسًا نظيفًا وفاخرًا، وتبرز تفاصيل المنتج بشكل هادئ وواثق.",
          },
          sunset: {
            title: "دفء ذهبي جذاب",
            description:
              "الألوان الدافئة مع اللمسات الوردية تعطي المنتج حضورًا أقرب وأغنى بصريًا داخل الصفحة الرئيسية.",
          },
          pearl: {
            title: "نقاء ناعم ولامع",
            description:
              "الخلفيات الفاتحة والانعاكسات الهادئة تخلق عرضًا خفيفًا ومميزًا يناسب صور العطور الدعائية.",
          },
        },
      }
    : {
        eyebrow: "Product Album",
        title: "Elegant campaign shots that elevate the fragrances",
        description:
          "We grouped the product images into one polished section with soft gradients and balanced color styling so every product feels premium and clear.",
        stats: ["12 campaign shots", "Balanced color palette", "Interactive gallery"],
        galleryLabel: "Current Scene",
        previewLabel: "Large Preview",
        thumbAria: "Select product image number",
        swipeHint: "Swipe to see more shots",
        moods: {
          azure: {
            title: "Refined Blue Mood",
            description:
              "Cool gradients create a clean premium feeling while keeping the product details crisp and confident.",
          },
          sunset: {
            title: "Warm Golden Glow",
            description:
              "Warm tones with soft rose accents give the product a richer and more inviting visual presence.",
          },
          pearl: {
            title: "Soft Luminous Clarity",
            description:
              "Bright backdrops and gentle reflections keep the gallery light, elegant, and suitable for fragrance campaign imagery.",
          },
        },
      };

  const [selectedId, setSelectedId] = React.useState(galleryItems[0].id);
  const selectedItem = galleryItems.find((item) => item.id === selectedId) ?? galleryItems[0];
  const theme = themeStyles[selectedItem.tone];
  const selectedMood = content.moods[selectedItem.tone];

  return (
    <section className="py-8 sm:py-10 md:py-12">
      <div className={`relative overflow-hidden rounded-[26px] sm:rounded-[32px] border ${theme.shell}`}>
        <div
          className={`pointer-events-none absolute -top-24 ${
            isArabic ? "-left-20" : "-right-20"
          } h-64 w-64 rounded-full ${theme.glowPrimary} blur-3xl`}
        />
        <div
          className={`pointer-events-none absolute -bottom-28 ${
            isArabic ? "-right-16" : "-left-16"
          } h-72 w-72 rounded-full ${theme.glowSecondary} blur-3xl`}
        />

        <div className="relative p-4 sm:p-6 md:p-8 lg:hidden">
          <div className="mx-auto flex max-w-[360px] flex-col gap-3">
            <div className="space-y-3 text-center">
              <span className={`inline-flex rounded-full px-4 py-1.5 text-xs font-bold shadow-sm ${theme.chip}`}>
                {content.eyebrow}
              </span>
              <h2 className="mx-auto max-w-[14ch] text-[1.95rem] font-extrabold leading-[1.06] text-slate-950">
                {content.title}
              </h2>
              <p className="mx-auto max-w-[30ch] text-sm leading-7 text-slate-700/85">
                {content.description}
              </p>
            </div>

            <GalleryPreviewCard
              selectedItem={selectedItem}
              selectedMood={selectedMood}
              content={content}
              theme={theme}
              compact
            />

            <div className="mx-auto w-full max-w-[320px]">
              <p className="mt-1 text-center text-[11px] font-semibold tracking-[0.18em] text-slate-400">
                {content.swipeHint}
              </p>
              <GalleryThumbnailStrip
                galleryItems={galleryItems}
                selectedItem={selectedItem}
                setSelectedId={setSelectedId}
                theme={theme}
                content={content}
                mobile
                className="mt-2"
              />
            </div>

            <GalleryInfoCard
              selectedItem={selectedItem}
              selectedMood={selectedMood}
              content={content}
              theme={theme}
              galleryItems={galleryItems}
              setSelectedId={setSelectedId}
              mobile
              showSwipeHint={false}
              showThumbnails={false}
            />

            <div className="mx-auto mt-1 flex max-w-[320px] flex-wrap justify-center gap-2.5">
              {content.stats.map((stat) => (
                <div
                  key={stat}
                  className="rounded-full border border-white/80 bg-white/76 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
                >
                  {stat}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative hidden gap-6 p-6 md:p-8 lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-start">
          <div className="order-1">
            <GalleryPreviewCard
              selectedItem={selectedItem}
              selectedMood={selectedMood}
              content={content}
              theme={theme}
            />
          </div>

          <div className={`order-2 flex flex-col gap-5 ${desktopTextAlignClass}`}>
            <div className="space-y-4">
              <span className={`inline-flex rounded-full px-4 py-1.5 text-sm font-bold shadow-sm ${theme.chip}`}>
                {content.eyebrow}
              </span>

              <div className="space-y-3">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-950">
                  {content.title}
                </h2>
                <p className="text-base leading-7 text-slate-700/85">
                  {content.description}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {content.stats.map((stat) => (
                <div
                  key={stat}
                  className="rounded-[20px] border border-white/75 bg-white/72 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur"
                >
                  {stat}
                </div>
              ))}
            </div>

            <GalleryInfoCard
              selectedItem={selectedItem}
              selectedMood={selectedMood}
              content={content}
              theme={theme}
              galleryItems={galleryItems}
              setSelectedId={setSelectedId}
              textAlignClass={desktopTextAlignClass}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
