import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import API_BASE_URL, { SiteName } from "../Constant";
import { useI18n } from "../i18n/I18nContext";
import BackButton from "../Common/BackButton";

export default function AboutUs() {
  const { t, lang } = useI18n();
  const [aboutContent, setAboutContent] = useState({ ar: "", en: "" });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const siteName = t("about.siteName", "Ecovera");

  useEffect(() => {
    let isMounted = true;
    const fetchContent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}AdminInfo/get-admin-info`);
        if (!response.ok) {
          throw new Error("Failed to load about content");
        }
        const data = await response.json();
        if (isMounted && data?.length) {
          setAboutContent({
            ar: data[0]?.aboutUsAr || "",
            en: data[0]?.aboutUsEn || "",
          });
        }
      } catch (error) {
        if (isMounted) {
          setFetchError(error.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchContent();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayText =
    lang === "ar"
      ? aboutContent.ar || aboutContent.en
      : aboutContent.en || aboutContent.ar;

  return (
    <div className="min-h-screen bg-blue-50 py-12 px-4">
      <Helmet>
        <title>{t("about.metaTitle", "من نحن")} - {siteName}</title>
        <meta
          name="description"
          content={t("about.metaDesc", "تعرف على خدمات وسياستنا في") + " " + siteName + " - " + t("about.metaDesc2", "توصيل سريع، دعم دائم، وسياسة إرجاع عادلة، هدفنا راحتك وثقتك.")}
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={t("about.metaOgTitle", "من نحن") + " - " + siteName} />
        <meta
          property="og:description"
          content={t("about.metaOgDesc", "اكتشف المزيد عن رؤيتنا، مميزاتنا، ودعمنا المستمر لك في") + " " + siteName + "."}
        />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ar_AR" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <main className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-gray-800 border border-blue-100">
        <div className="mb-6 flex justify-start">
          <BackButton />
        </div>
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-6">
          {t("about.title", "من نحن")}
        </h1>

        <section className="mb-8 text-lg leading-loose whitespace-pre-line">
          {loading ? (
            <p className="text-center text-blue-900">
              {t("about.loading", "جارٍ تحميل المحتوى...")}
            </p>
          ) : fetchError ? (
            <p className="text-center text-red-600">{fetchError}</p>
          ) : displayText ? (
            displayText
          ) : (
            <p>
              {t(
                "about.dynamicFallback",
                "نقوم بتحديث هذه المعلومات قريباً. إليك نبذة مختصرة عن رؤيتنا."
              )}
            </p>
          )}
        </section>

        <div className="text-center">
          <a
            href="/"
            className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-medium text-lg py-3 px-10 rounded-full transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            {t("about.browseNow", "تصفّح المنتجات الآن")}
          </a>
        </div>
      </main>
    </div>
  );
}