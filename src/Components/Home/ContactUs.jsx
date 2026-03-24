import  {  useEffect,useState } from "react";
import API_BASE_URL from "../Constant"; // تأكد من ضبط المسار الصحيح
import { FaWhatsapp, FaPhone, FaEnvelope, FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import { Helmet } from "react-helmet";
import { useI18n } from "../i18n/I18nContext";
import BackButton from "../Common/BackButton";



export default function ContactUs() {
  const [adminInfo, setAdminInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t, lang } = useI18n();
  const siteName = t("about.siteName", "Ecovera");

  useEffect(() => {
    async function fetchAdminInfo() {
      try {
        const response = await fetch(`${API_BASE_URL}AdminInfo/get-admin-info`);
        if (!response.ok) {
          throw new Error("فشل في جلب بيانات الإدارة");
        }
        const data = await response.json();
        setAdminInfo(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(t("contact.error", "خطأ") + ": " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminInfo();
  }, [t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 rtl">
      <Helmet>
        <title>{t("contact.metaTitle", "من نحن | إيكوفيرا - أفضل تجربة تسوق إلكتروني")}</title>
        <meta
          name="description"
          content={t("contact.metaDesc", "تعرف على إيكوفيرا، منصتك الموثوقة للتجارة الإلكترونية. اكتشف رؤيتنا، سياستنا في الشحن والإرجاع، والتزامنا براحة العملاء. تواصل معنا بسهولة عبر الهاتف أو الواتساب.")}
        />
        <meta
          name="keywords"
          content={t("contact.metaKeywords", "من نحن, إيكوفيرا, تواصل معنا, دعم العملاء, سياسة الإرجاع, تسوق إلكتروني, التجارة الإلكترونية")}
        />
        <meta name="author" content={siteName} />
        <meta
          property="og:title"
          content={t("contact.ogTitle", "من نحن | إيكوفيرا - منصتك للتسوق بثقة")}
        />
        <meta
          property="og:description"
          content={t("contact.ogDesc", "إيكوفيرا تقدم لك تجربة تسوق إلكتروني موثوقة، شحن فوري، سياسة إرجاع عادلة، وتواصل مباشر مع فريق الدعم.")}
        />
        <meta
          property="og:url"
          content="https://souq-elbalad.netlify.app/Contact"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://souq-elbalad.netlify.app/SouqLogo.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={t("contact.twitterTitle", "من نحن | إيكوفيرا - أفضل تجربة تسوق إلكتروني")}
        />
        <meta
          name="twitter:description"
          content={t("contact.twitterDesc", "تعرف على قصة إيكوفيرا وخدماتنا الفريدة. اتصل بنا بسهولة واطلب الآن بثقة.")}
        />
        <meta
          name="twitter:image"
          content="https://souq-elbalad.netlify.app/SouqLogo.png"
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton />
        </div>
        {/* قسم "من نحن" */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-orange-500">
            <h1 className="text-3xl font-bold text-center text-blue-900 mb-6">
              {t("about.title", "من نحن")}
            </h1>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              <p className="text-lg mb-4">
                🌟 <strong className="text-orange-600">{t("contact.welcome", "مرحباً بكم في منصتنا الرائدة")}</strong> {t("contact.inEcom", "في عالم التجارة الإلكترونية! نحن في")}
                <span className="text-blue-900 font-semibold"> {siteName} </span>
                {t("contact.shoppingBelief", "نؤمن أن تجربة التسوق لا تكتمل إلا بتوفير الراحة والثقة والسرعة للعميل، لذلك قمنا ببناء منظومة متكاملة تتيح لك:")}
              </p>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-xl border-r-4 border-orange-500">
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">🚚 {t("about.sameDay", "توصيل فوري في نفس اليوم")}</h3>
                  <p>
                    {t("contact.instantDelivery", "بمجرد إتمام طلبك على موقعنا، نقوم على الفور بشراء المنتج وشحنه إليك خلال ساعات قليلة، لتصلك مشترياتك في نفس اليوم أينما كنت داخل المدينة — بكل سرعة وأمان.")}
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-xl border-r-4 border-blue-900">
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">✅ {t("about.fairReturn", "احترام سياسة الإرجاع العادل")}</h3>
                  <p>
                    {t("contact.returnPolicy", "نحن نحترم حقوق عملائنا كما نحترم شركائنا من البائعين، لذلك نلتزم بسياسة إرجاع مرنة في الحالات التالية:")}
                  </p>
                  <ul className="list-disc mr-4 mt-2 space-y-1">
                    <li>{t("contact.returnReason1", "إذا كان المنتج لا يعمل أو فيه خلل مصنعي")}</li>
                    <li>{t("contact.returnReason2", "إذا لم يكن المنتج هو المطلوب أو لا يحمل نفس العلامة التجارية المذكورة")}</li>
                    <li>{t("contact.returnReason3", "إذا كان المنتج منتهي الصلاحية")}</li>
                    <li>{t("contact.returnReason4", "إذا تم استلامه مفتوحًا أو غير مغلف بشكل سليم")}</li>
                  </ul>
                  <p className="mt-2">
                    {t("contact.contactUs", "كل ما عليك هو التواصل معنا من")}{" "}
                    <a href="/contact" className="text-orange-600 hover:text-blue-900 font-semibold">
                      {t("contact.here", "هنا")}
                    </a>
                    {t("contact.contactUs2", "، وسنقوم باتخاذ اللازم فورًا لضمان رضاك الكامل.")}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border-r-4 border-orange-500">
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">🛒 {t("about.allDayOrder", "الطلب في أي وقت")}</h3>
                  <p>
                    {t("contact.orderAnytime", "منصتنا تعمل على مدار الساعة — يمكنك تقديم طلبك في أي وقت من اليوم، وسنقوم بمعالجته وشراء المنتج مباشرة بعد تأكيدك، ثم نشحنه فورًا إلى عنوانك.")}
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-xl border-r-4 border-blue-900">
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">🤝 {t("contact.ourCommitment", "التزامنا تجاهك")}</h3>
                  <p>
                    {t("contact.commitmentText", "نحن لا نحتفظ بالمنتجات في مخازننا لفترات طويلة، بل نشتريها حسب الطلب لضمان حصولك على منتج حديث، موثوق، وبجودة ممتازة. كما نحرص دائمًا على التعامل مع موردين موثوقين، لضمان جودة المنتجات وأصالة العلامات التجارية.")}
                  </p>
                </div>

                <div className="text-center text-white p-6 rounded-2xl" style={{ background: 'linear-gradient(to left, #1e3a8a, #ea580c)' }}>
                  <p className="text-xl font-semibold" style={{ color: 'white' }}>
                    📞 {t("contact.anyQuestion", "في حال وجود أي استفسار أو ملاحظات، لا تتردد في التواصل مع فريق خدمة العملاء الخاص بنا، نحن هنا لخدمتك.")}
                  </p>
                  <p className="text-lg mt-2" style={{ color: 'white' }}>
                    {t("contact.regards", "مع تحيات فريق")} <span className="font-bold">{siteName} </span> {t("contact.tagline", "- حيث تبدأ تجربة التسوق بثقة وتنتهي برضا.")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* قسم "تواصل معنا" */}
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-900">
            <h2 className="text-2xl font-bold text-center text-orange-600 mb-8">
              {t("contact.title", "تواصل مع خدمة العملاء الآن")}
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                <p className="text-blue-900 font-semibold mt-4">{t("contact.loading", "جاري التحميل...")}</p>
              </div>
            ) : error ? (
              <div className="text-center text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">
                <p className="font-semibold">{t("contact.error", "خطأ")}: {error}</p>
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

                  const circleClasses =
                    "w-14 h-14 flex items-center justify-center rounded-full text-white transition-transform duration-200 hover:-translate-y-1 shadow-lg";

                  return (
                  <div key={index} className="bg-gradient-to-br from-blue-100 to-orange-100 rounded-2xl p-6 shadow-xl border border-blue-200 space-y-6">
                    <div className="text-center space-y-2">
                      <p className="font-semibold text-blue-900 text-lg">
                        {t("contact.reachUs", "طرق التواصل المباشرة")}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t("contact.available24", "خدمة العملاء متاحة دائماً لدعمك والإجابة عن استفساراتك.")}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                      {whatsAppNumber ? (
                        <a
                          href={`https://wa.me/${whatsAppNumber.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${circleClasses} bg-green-600 hover:bg-green-700`}
                          aria-label={t("contact.whatsappCta", "إرسال رسالة عبر واتساب")}
                        >
                          <FaWhatsapp className="text-2xl" />
                        </a>
                      ) : (
                        <div className={`${circleClasses} bg-gray-300 cursor-not-allowed`}>
                          <FaWhatsapp className="text-2xl" />
                        </div>
                      )}

                      {callNumber ? (
                        <a
                          href={`tel:${callNumber.replace(/[^0-9]/g, "")}`}
                          className={`${circleClasses} bg-blue-900 hover:bg-blue-800`}
                          aria-label={t("contact.phoneCta", "الاتصال بنا الآن")}
                        >
                          <FaPhone className="text-xl" />
                        </a>
                      ) : (
                        <div className={`${circleClasses} bg-gray-300 cursor-not-allowed`}>
                          <FaPhone className="text-xl" />
                        </div>
                      )}

                      {email ? (
                        <a
                          href={`mailto:${email}`}
                          className={`${circleClasses} bg-orange-500 hover:bg-orange-600`}
                          aria-label={t("contact.email", "مراسلتنا عبر البريد")}
                        >
                          <FaEnvelope className="text-xl" />
                        </a>
                      ) : (
                        <div className={`${circleClasses} bg-gray-300 cursor-not-allowed`}>
                          <FaEnvelope className="text-xl" />
                        </div>
                      )}
                    </div>

                    <div className="text-center text-sm text-gray-600 space-y-1">
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
                      <div className="text-center">
                        <p className="font-semibold text-blue-900 mb-3">
                          {t("contact.followUs", lang === "ar" ? "تابعنا على" : "Follow us on")}
                        </p>
                        <div className="flex items-center justify-center gap-3">
                          {facebookUrl && (
                            <a
                              href={facebookUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${circleClasses} bg-blue-600 hover:bg-blue-700`}
                            >
                              <FaFacebookF />
                            </a>
                          )}
                          {instagramUrl && (
                            <a
                              href={instagramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${circleClasses}`}
                              style={{ backgroundImage: "linear-gradient(45deg, #F09433 0%, #E6683C 25%, #DC2743 50%, #CC2366 75%, #BC1888 100%)" }}
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
                  </div>
                )})}
              </div>
            )}
          </div>
        </section>

        {/* الفوتر */}
        <footer className="text-center text-gray-600 py-6 border-t border-gray-300">
          <p className="text-sm">
            {t("contact.copyright", "حقوق النشر © 2025 - جميع الحقوق محفوظة ل")} {siteName}
          </p>
        </footer>
      </div>
    </div>
  );
}