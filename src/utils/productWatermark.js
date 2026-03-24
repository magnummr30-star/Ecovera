/**
 * وضع لوجو الشركة على صور المنتج عند الإضافة أو التعديل — إلزامي.
 * مسارات اللوجو نفس المستخدمة في الموقع (إيكوفيرا / Ecovera).
 */

const LOGO_PATHS = [
  "/ProjectImages/SouqLogoEn.webp",
  "/ProjectImages/SouqLogoEn.png",
  "/ProjectImages/SouqLogoAr.png",
];

let cachedLogoPromise;

const loadImageFromUrl = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("فشل تحميل الصورة"));
    img.src = url;
  });

const loadImageFromFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("تعذر قراءة ملف الصورة."));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("تعذر قراءة ملف الصورة."));
    reader.readAsDataURL(file);
  });

/**
 * تحميل لوجو الشركة — يستخدم عنوان الموقع الحالي لضمان التحميل.
 */
export const getCompanyLogoImage = () => {
  if (cachedLogoPromise !== undefined) return cachedLogoPromise;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  cachedLogoPromise = (async () => {
    for (const path of LOGO_PATHS) {
      try {
        const url = path.startsWith("http") ? path : `${origin}${path}`;
        return await loadImageFromUrl(url);
      } catch {
        continue;
      }
    }
    return null;
  })();
  return cachedLogoPromise;
};

/**
 * إضافة لوجو الشركة على صورة المنتج. إذا لم يتوفر اللوجو لا يتم الرفع (إلزامي).
 * @param {File} file - ملف الصورة
 * @returns {Promise<File>} - ملف الصورة بعد وضع اللوجو
 */
export const addCompanyLogoToProductImage = async (file) => {
  if (!file) throw new Error("لم يتم اختيار صورة.");

  const [baseImage, logoImage] = await Promise.all([
    loadImageFromFile(file),
    getCompanyLogoImage(),
  ]);

  if (!baseImage.width || !baseImage.height) {
    throw new Error("ملف الصورة غير صالح.");
  }

  if (!logoImage || !logoImage.width || !logoImage.height) {
    throw new Error(
      "لم يتم العثور على شعار الشركة. تأكد من وجود ملفات اللوجو في مجلد ProjectImages (مثل SouqLogoEn.png أو SouqLogoAr.png)."
    );
  }

  const canvas = document.createElement("canvas");
  canvas.width = baseImage.width;
  canvas.height = baseImage.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

  const maxLogoWidth = canvas.width * 0.4;
  const maxLogoHeight = canvas.height * 0.4;
  const scale = Math.min(
    maxLogoWidth / logoImage.width,
    maxLogoHeight / logoImage.height,
    1
  );
  const logoWidth = logoImage.width * scale;
  const logoHeight = logoImage.height * scale;
  const x = canvas.width - logoWidth - canvas.width * 0.05;
  const y = canvas.height * 0.05;

  ctx.globalAlpha = 0.45;
  ctx.drawImage(logoImage, x, y, logoWidth, logoHeight);
  ctx.globalAlpha = 1;

  const preferredType =
    file.type === "image/png"
      ? "image/png"
      : file.type === "image/webp"
        ? "image/webp"
        : "image/jpeg";

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("تعذر تجهيز الصورة بعد إضافة الشعار."));
      },
      preferredType,
      preferredType === "image/jpeg" ? 0.92 : 1
    );
  });

  const baseName = file.name?.replace(/\.[^/.]+$/, "") || "product";
  const extension =
    preferredType === "image/png"
      ? ".png"
      : preferredType === "image/webp"
        ? ".webp"
        : ".jpg";

  return new File([blob], `${baseName}_logo${extension}`, {
    type: preferredType,
  });
};
