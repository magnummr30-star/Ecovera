import React, { useEffect, useState } from "react";
import API_BASE_URL from "../Constant";
import { useI18n } from "../i18n/I18nContext";

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState(null);
  const { lang } = useI18n();

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}AnnouncementBar/active?lang=${lang}&ts=${Date.now()}`,
          {
            signal: controller.signal,
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (import.meta.env.DEV) {
            console.log("AnnouncementBar received:", data);
          }
          // API returns { Id, Text, LinkUrl, IsActive }
          if (data && data.text) {
            setAnnouncement({
              id: data.id,
              text: data.text,
              linkUrl: data.linkUrl,
              isActive: data.isActive !== false, // Default to true if not specified
            });
          } else {
            setAnnouncement(null);
          }
        } else if (res.status === 404) {
          // No active announcement - this is OK
          setAnnouncement(null);
        }
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("Failed to load announcement", e);
          setAnnouncement(null);
        }
      }
    };
    load();
    return () => controller.abort();
  }, [lang]);

  if (!announcement) return null;

  const isRTL = lang === "ar";

  return (
    <div className="w-full text-white py-2.5 md:py-2 px-2 md:px-4 border-b border-orange-600/50 overflow-hidden relative bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600">
      <div className="announcement-scroll-container">
        <div className={`announcement-scroll-content ${isRTL ? "rtl-scroll" : "ltr-scroll"}`}>
          {/* Multiple copies for seamless overlapping loop */}
          {[...Array(5)].map((_, index) => (
            <React.Fragment key={index}>
              <span className="announcement-text-item">
                {announcement.linkUrl ? (
                  <a
                    href={announcement.linkUrl}
                    className="inline-block font-medium text-xs sm:text-sm md:text-base hover:underline text-white whitespace-nowrap px-1"
                  >
                    {announcement.text}
                  </a>
                ) : (
                  <span className="font-medium text-xs sm:text-sm md:text-base whitespace-nowrap px-1">
                    {announcement.text}
                  </span>
                )}
              </span>
              {index < 4 && (
                <span className="announcement-spacer text-white/70 whitespace-nowrap">{" • • • "}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
