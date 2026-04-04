import React, { useEffect, useState, useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

/**
 * Ø¨Ø§Ù†Ø± Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ© â€” Ù†ÙØ³ ØªØµÙ…ÙŠÙ… Ø¨Ø§Ù†Ø± Ø§Ù„Ø£Ù‚Ø³Ø§Ù… ÙÙŠ FindProducts:
 * rounded-xlØŒ borderØŒ shadowØŒ Ù…Ø¹ Ø£Ø²Ø±Ø§Ø± ØªÙ†Ù‚Ù„ ÙˆÙ…ØµØºÙ‘Ø±Ø§Øª ÙˆØªØ¨Ø¯ÙŠÙ„ ØªÙ„Ù‚Ø§Ø¦ÙŠ.
 */

export default function BannerCarousel() {
  const [idx, setIdx] = useState(0);
  const [failedVideoIds, setFailedVideoIds] = useState({});
  const validLengthRef = useRef(0);
  const videoRefs = useRef([]);
  const bannerImageWidth = 1376;
  const bannerImageHeight = 768;

  const localBannerImageUrl1 =
    typeof window !== "undefined"
      ? `${window.location.origin}/ProjectImages/B1.jpeg`
      : "/ProjectImages/B1.jpeg";
  const localBannerImageUrl2 =
    typeof window !== "undefined"
      ? `${window.location.origin}/ProjectImages/B2.jpeg`
      : "/ProjectImages/B2.jpeg";

  const defaultBanners = [
    {
      id: "ecovera-default-banner-1",
      title: "",
      subTitle: "",
      imageUrl: localBannerImageUrl1,
      videoUrl: null,
      linkUrl: "",
    },
    {
      id: "ecovera-default-banner-2",
      title: "",
      subTitle: "",
      imageUrl: localBannerImageUrl2,
      videoUrl: null,
      linkUrl: "",
    },
  ];

  // نعرض بانرات ثابتة عامة للعطور فقط، بدون عناوين منتجات من الـ API
  const bannerPool = defaultBanners;

  const validBanners = bannerPool.filter(
    (b) => (b.imageUrl ?? b.ImageUrl) || (b.videoUrl ?? b.VideoUrl)
  );
  validLengthRef.current = validBanners.length;

  // ØªØ¨Ø¯ÙŠÙ„ ØªÙ„Ù‚Ø§Ø¦ÙŠ ÙƒÙ„ 4 Ø«ÙˆØ§Ù†Ù (ÙŠØ¹Ù…Ù„ Ù…Ø¹ ÙÙŠØ¯ÙŠÙˆ ÙˆØµÙˆØ±)
  useEffect(() => {
    if (validBanners.length <= 1) return;
    const t = setInterval(() => {
      setIdx((p) => (p + 1) % (validLengthRef.current || 1));
    }, 4000);
    return () => clearInterval(t);
  }, [validBanners.length]);

  // ØªØ´ØºÙŠÙ„ ÙÙŠØ¯ÙŠÙˆ Ø§Ù„Ø¨Ø§Ù†Ø± Ø§Ù„Ù†Ø´Ø· ÙÙ‚Ø· ÙˆØ¥ÙŠÙ‚Ø§Ù Ø§Ù„Ø¨Ø§Ù‚ÙŠ
  useEffect(() => {
    validBanners.forEach((_, i) => {
      const el = videoRefs.current[i];
      if (!el) return;
      if (i === idx % validBanners.length) el.play().catch(() => {});
      else el.pause();
    });
  }, [idx, validBanners.length]);

  if (!validBanners.length) return null;

  const goPrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((p) => (p - 1 + validBanners.length) % validBanners.length);
  };
  const goNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((p) => (p + 1) % validBanners.length);
  };

  // Ù†ÙØ³ Ø§Ù„Ø­Ø§ÙˆÙŠØ© ÙˆØ§Ù„ØªØµÙ…ÙŠÙ… Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙÙŠ FindProducts Ù„Ø¨Ø§Ù†Ø± Ø§Ù„Ø£Ù‚Ø³Ø§Ù…
  const containerClass =
    "relative mx-auto w-full max-w-[1376px] overflow-hidden rounded-xl sm:rounded-2xl md:rounded-[20px] border border-gray-200/80 shadow-sm bg-[#f7f2eb]";

  return (
    <div className="w-full mb-4">
      <div className="relative">
        {/* Ø£Ø²Ø±Ø§Ø± Ø§Ù„Ø³Ø§Ø¨Ù‚ / Ø§Ù„ØªØ§Ù„ÙŠ â€” ØªØ¸Ù‡Ø± Ø¯Ø§Ø¦Ù…Ø§Ù‹ Ø¹Ù†Ø¯ ÙˆØ¬ÙˆØ¯ Ø£ÙƒØ«Ø± Ù…Ù† Ø¨Ø§Ù†Ø± */}
        {validBanners.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors shadow-md"
              aria-label="Ø§Ù„Ø³Ø§Ø¨Ù‚"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors shadow-md"
              aria-label="Ø§Ù„ØªØ§Ù„ÙŠ"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Ù†ÙØ³ ØªØµÙ…ÙŠÙ… Ø¨Ø§Ù†Ø± Ø§Ù„Ø£Ù‚Ø³Ø§Ù…: Ø­Ø§ÙˆÙŠØ© ÙˆØ§Ø­Ø¯Ø© ÙˆÙƒÙ„ Ø§Ù„Ø¨Ø§Ù†Ø±Ø§Øª Ù…Ø·Ù„Ø¹Ø© Ù…Ø¹ opacity */}
        <div
          className={containerClass}
          style={{ aspectRatio: `${bannerImageWidth} / ${bannerImageHeight}` }}
        >
          {validBanners.map((banner, i) => {
            const bannerKey = banner.id ?? i;
            const rawImage = banner.imageUrl ?? banner.ImageUrl;
            const imageSrc = rawImage || null;
            const videoUrlRaw = banner.videoUrl ?? banner.VideoUrl;
            const videoSrc = videoUrlRaw || null;
            const hasVideo = Boolean(videoSrc) && !failedVideoIds[bannerKey];
            const fallbackImageSrc = imageSrc || localBannerImageUrl1;
            const hasImage = Boolean(fallbackImageSrc);
            const clickUrl = (banner.linkUrl || banner.clickUrl)?.trim();
            const isActive = i === idx % validBanners.length;
            const content = hasVideo ? (
              <video
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                src={videoSrc}
                poster={imageSrc || undefined}
                className="absolute inset-0 w-full h-full object-cover"
                muted
                loop
                playsInline
                autoPlay={false}
                controls={false}
                onError={() =>
                  setFailedVideoIds((prev) =>
                    prev[bannerKey] ? prev : { ...prev, [bannerKey]: true }
                  )
                }
              />
            ) : hasImage ? (
              <img
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-center"
                src={fallbackImageSrc}
              />
            ) : null;
            return (
              <div
                key={bannerKey}
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: isActive ? 1 : 0 }}
                aria-hidden={!isActive}
              >
                {clickUrl ? (
                  <a
                    href={clickUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                  >
                    {content}
                  </a>
                ) : (
                  content
                )}
                {/* إخفاء النص حتى تبقى الصورة عامة بدون اسم منتج */}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ù…ØµØºÙ‘Ø±Ø§Øª Ø£Ø³ÙÙ„ Ø§Ù„Ø¨Ø§Ù†Ø± */}
      {validBanners.length > 1 && (
        <div className="flex justify-center gap-2 mt-3 flex-wrap">
          {validBanners.map((b, i) => {
            const bannerKey = b.id ?? i;
            const img = b.imageUrl ?? b.ImageUrl;
            const thumbSrc = img || localBannerImageUrl1;
            const isActive = i === idx % validBanners.length;
            return (
              <button
                key={bannerKey}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIdx(i);
                }}
                className={`rounded-lg overflow-hidden border-2 transition-all w-14 h-10 flex-shrink-0 ${
                  isActive
                    ? "border-[#92278f] ring-2 ring-[#92278f]"
                    : "border-gray-300 hover:border-[#92278f]"
                }`}
              >
                {(b.videoUrl ?? b.VideoUrl) && !failedVideoIds[bannerKey] ? (
                  <span className="w-full h-full bg-gray-200 flex items-center justify-center text-[#92278f]">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                ) : thumbSrc ? (
                  <img
                    src={thumbSrc}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full bg-gray-200" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}



