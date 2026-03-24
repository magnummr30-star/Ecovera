import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import API_BASE_URL from "../Constant";
import { useI18n } from "../i18n/I18nContext";
import BackButton from "../Common/BackButton";

export default function PrivacyPolicy() {
  const { t, lang } = useI18n();
  const [content, setContent] = useState({
    termsAr: "",
    termsEn: "",
    privacyAr: "",
    privacyEn: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}LegalContent`);
        if (!response.ok) throw new Error("Failed to load legal content");
        const data = await response.json();
        setContent({
          termsAr: data?.termsAr ?? "",
          termsEn: data?.termsEn ?? "",
          privacyAr: data?.privacyAr ?? "",
          privacyEn: data?.privacyEn ?? "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const termsText =
    lang === "ar"
      ? content.termsAr || content.termsEn
      : content.termsEn || content.termsAr;
  const privacyText =
    lang === "ar"
      ? content.privacyAr || content.privacyEn
      : content.privacyEn || content.privacyAr;

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
        <div className="mb-6">
          <BackButton />
        </div>
        <Helmet>
          <title>{t("legalContent.pageTitle", "الشروط وسياسة الخصوصية")}</title>
          <meta
            name="description"
            content={t(
              "legalContent.pageDesc",
              "تعرّف على شروط الاستخدام وسياسة الخصوصية الخاصة بمتجرنا."
            )}
          />
        </Helmet>

        <h1 className="text-3xl font-bold mb-8 text-center text-blue-900 border-b-2 border-orange-500 pb-4">
          {t("legalContent.pageTitle", "الشروط وسياسة الخصوصية")}
        </h1>

        {loading ? (
          <p className="text-center text-blue-900">
            {t("legalContent.loading", "جارٍ تحميل المحتوى القانوني...")}
          </p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : (
          <>
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-blue-800">
                {t("legalContent.termsTitle", "الشروط والأحكام")}
              </h2>
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 whitespace-pre-wrap leading-relaxed text-gray-800">
                {termsText || t("legalContent.noTerms", "لم يتم توفير محتوى الشروط بعد.")}
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-blue-800">
                {t("legalContent.privacyTitle", "سياسة الخصوصية")}
              </h2>
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 whitespace-pre-wrap leading-relaxed text-gray-800">
                {privacyText || t("legalContent.noPrivacy", "لم يتم توفير سياسة الخصوصية بعد.")}
              </div>
            </section>
          </>
        )}

        <section className="text-center mt-8 p-6 bg-blue-100 rounded-lg border border-blue-300">
          <p className="text-blue-800 text-lg">
            {t("legalContent.questions", "إذا كانت لديك أي استفسارات، لا تتردد في ")}
            <a
              href="/contact"
              className="text-orange-500 hover:text-orange-600 font-bold transition duration-200 underline"
            >
              {t("legalContent.contactUs", "التواصل معنا")}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}