import React, { useState, useEffect } from "react";
import { FaWhatsapp, FaPhone, FaEnvelope, FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import { Helmet } from "react-helmet";
import API_BASE_URL from "../Constant";
import { useI18n } from "../i18n/I18nContext";
import BackButton from "../Common/BackButton";

export default function ContactUsCom() {
  const [adminInfo, setAdminInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t, lang } = useI18n();
  const siteName = t("about.siteName", "Ecovera");

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}AdminInfo/get-admin-info`);
        if (!response.ok) throw new Error(t("contact.error", "خطأ") + " 500");
        const data = await response.json();
        setAdminInfo(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminInfo();
  }, [t]);

  const circleClasses =
    "w-16 h-16 flex items-center justify-center rounded-full text-white transition-transform duration-200 hover:-translate-y-1 shadow-xl";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030b27] via-[#061a3a] to-[#0a2855] py-10 px-4">
      <Helmet>
        <title>{t("contact.metaTitle", "من نحن | إيكوفيرا - أفضل تجربة تسوق إلكتروني")}</title>
        <meta
          name="description"
          content={t("contact.metaDesc", "تعرف على إيكوفيرا، منصتك الموثوقة للتجارة الإلكترونية. اكتشف رؤيتنا، سياستنا في الشحن والإرجاع، والتزامنا براحة العملاء. تواصل معنا بسهولة عبر الهاتف أو الواتساب.")}
        />
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex justify-start">
          <BackButton />
        </div>
        <header className="text-center space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-200">
            {t("contact.contactTitle", "تواصل معنا")}
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white">
            {t("contact.title", "تواصل مع خدمة العملاء الآن")}
          </h1>
          <p className="text-white/70 max-w-3xl mx-auto leading-relaxed">
            {t("contact.available24", "خدمة العملاء متاحة دائماً لدعمك والإجابة عن استفساراتك.")}
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="bg-white/10 text-white rounded-2xl shadow-2xl px-8 py-10 backdrop-blur">
              <p className="text-xl font-semibold animate-pulse">{t("contact.loading", "جاري التحميل...")}</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-16">
            <div className="bg-red-500/10 text-red-100 rounded-2xl shadow-2xl px-8 py-10 backdrop-blur">
              <p className="text-xl font-semibold">{error}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminInfo.map((info, index) => {
              const whatsAppNumber = info.whatsAppNumber ?? info.whatsappNumber;
              const callNumber = info.callNumber ?? info.phoneNumber;
              const email = info.email;
              const facebookUrl = info.facebookUrl ?? info.facebookURL ?? info.facebook;
              const instagramUrl = info.instagramUrl ?? info.instagramURL ?? info.instagram;
              const tikTokUrl = info.tikTokUrl ?? info.tiktokUrl ?? info.tikTok;

              return (
                <article
                  key={index}
                  className="bg-white/10 rounded-3xl border border-white/10 text-white p-6 space-y-6 backdrop-blur-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.65)]"
                >
                  <div className="text-center space-y-2">
                    <p className="text-orange-300 text-sm font-bold tracking-wide">
                      {t("contact.reachUs", "طرق التواصل المباشرة")}
                    </p>
                    <h3 className="text-2xl font-bold">{t("contact.supportTeam", "فريق الدعم")}</h3>
                    <p className="text-white/70 text-sm">
                      {t("contact.available24", "خدمة العملاء متاحة دائماً لدعمك والإجابة عن استفساراتك.")}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-4">
                    {whatsAppNumber ? (
                      <a
                        href={`https://wa.me/${whatsAppNumber.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${circleClasses} bg-[#25D366] hover:bg-[#1fb158]`}
                        aria-label={t("contact.whatsappCta", "اضغط هنا لإرسال رسالة عبر واتساب")}
                      >
                        <FaWhatsapp className="text-3xl" />
                      </a>
                    ) : (
                      <div className={`${circleClasses} bg-white/20`}>
                        <FaWhatsapp className="text-3xl" />
                      </div>
                    )}

                    {callNumber ? (
                      <a
                        href={`tel:${callNumber.replace(/[^0-9]/g, "")}`}
                        className={`${circleClasses} bg-[#0b1f3d] hover:bg-[#15305c]`}
                        aria-label={t("contact.phoneCta", "اضغط هنا للاتصال بنا الآن")}
                      >
                        <FaPhone className="text-2xl" />
                      </a>
                    ) : (
                      <div className={`${circleClasses} bg-white/20`}>
                        <FaPhone className="text-2xl" />
                      </div>
                    )}

                    {email ? (
                      <a
                        href={`mailto:${email}`}
                        className={`${circleClasses} bg-[#fb923c] hover:bg-[#f97316]`}
                        aria-label={t("contact.email", "البريد الإلكتروني")}
                      >
                        <FaEnvelope className="text-2xl" />
                      </a>
                    ) : (
                      <div className={`${circleClasses} bg-white/20`}>
                        <FaEnvelope className="text-2xl" />
                      </div>
                    )}
                  </div>

                  <div className="text-center text-white/80 text-sm space-y-1">
                    <p>
                      {whatsAppNumber
                        ? `${t("contact.whatsappNumber", "رقم الواتساب")}: ${whatsAppNumber}`
                        : t("contact.whatsappUnavailable", "رقم الواتساب غير متاح حالياً.")}
                    </p>
                    <p>
                      {callNumber
                        ? `${t("contact.callNumber", "رقم الهاتف")}: ${callNumber}`
                        : t("contact.phoneUnavailable", "رقم الهاتف غير متاح حالياً.")}
                    </p>
                    <p>
                      {email
                        ? `${t("contact.emailAddress", "البريد الإلكتروني")}: ${email}`
                        : t("contact.emailUnavailable", "البريد الإلكتروني غير متاح حالياً.")}
                    </p>
                  </div>

                  {(facebookUrl || instagramUrl || tikTokUrl) && (
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-sm text-white/75 text-center mb-3">{t("contact.followUs", lang === "ar" ? "تابعنا على" : "Follow us on")}</p>
                      <div className="flex justify-center gap-3">
                        {facebookUrl && (
                          <a
                            href={facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${circleClasses} bg-[#1877F2] hover:bg-[#0f5bd8]`}
                          >
                            <FaFacebookF />
                          </a>
                        )}
                        {instagramUrl && (
                          <a
                            href={instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={circleClasses}
                            style={{
                              backgroundImage:
                                "linear-gradient(45deg,#F94F5C 0%,#F84489 35%,#D12BA1 60%,#7C3AED 100%)",
                            }}
                          >
                            <FaInstagram />
                          </a>
                        )}
                        {tikTokUrl && (
                          <a
                            href={tikTokUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${circleClasses} bg-black hover:bg-gray-900`}
                          >
                            <FaTiktok />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <footer className="text-center text-white/70 pt-8 border-t border-white/10">
          <p className="text-sm">
            &copy; 2025 {siteName} - {t("contactUs.allRightsReserved", "جميع الحقوق محفوظة.")}
          </p>
        </footer>
      </div>
    </div>
  );
}