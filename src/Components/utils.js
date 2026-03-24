import API_BASE_URL, { ServerPath } from "./Constant";
import * as signalR from "@microsoft/signalr";
let connection = null; // تعريف الاتصال كمتغير عام
export const startConnection = async () => {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${ServerPath}/orderHub`, {
        withCredentials: false, // مهم جداً للسماح بالـ CORS
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    try {
      await connection.start();
      console.log("✅ SignalR connection started");
    } catch (error) {
      console.error("❌ Connection failed:", error);
    }
  }
};

export const playNotificationSound = () => {
  const sound = new Howl({
    src: ["/Sounds/notification.mp3"],
    volume: 1.0,
    html5: true,
    onplayerror: function (id, error) {
      console.error("❌ خطأ في تشغيل الصوت:", error);
      sound.once("unlock", () => {
        sound.play();
      });
    },
  });

  sound.play();
};
export const SendSignalMessageForOrders = async (message) => {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    try {
      await connection.invoke("SendMessage", message);
      console.log("📤 Message sent:", message);
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  } else {
    console.log("⚠️ Connection is not established.");
    if (
      connection &&
      connection.state === signalR.HubConnectionState.Disconnected
    ) {
      console.log("🔄 Reopening connection...");
      await startConnection(); // محاولة إعادة الاتصال تلقائيًا
    }
  }
};

export const startListeningToMessages = async (onMessageReceived) => {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${ServerPath}/orderHub`, {
        withCredentials: false, // مهم جداً للسماح بالـ CORS
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
  }

  // تحقق من الحالة الحالية للاتصال
  if (connection.state === signalR.HubConnectionState.Disconnected) {
    try {
      await connection.start();
      connection.on("ReceiveMessage", (message) => {
        if (onMessageReceived) {
          onMessageReceived(message);
        }
      });
      console.log("Connection started successfully");
    } catch (error) {
      console.error("❌ Connection failed:", error);
    }
  } else {
    console.log("The connection is already in a non-disconnected state.");
  }
};

export const stopListeningToMessages = () => {
  if (connection) {
    connection.stop();
    connection = null;
  }
};
export default function getDeliveryDate(locale = "ar") {
  const today = new Date();
  today.setDate(today.getDate() + 2);
  const targetLocale = locale === "en" ? "en-GB" : "ar-EG";
  return today.toLocaleDateString(targetLocale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
export const egyptianGovernorates = [
  "أبوظبي",
  "دبي",
  "الشارقة",
  "عجمان",
  "أم القيوين",
  "رأس الخيمة",
  "الفجيرة",
];

export function getRoleFromToken(token) {
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid JWT structure");

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // للتأكد من التوافق
    const payload = JSON.parse(atob(base64));

    return payload?.role ?? null;
  } catch (error) {
    console.error("خطأ أثناء قراءة الدور من التوكن:", error.message);
    return null;
  }
}

export function GetUserNameFromToken(token) {
  if (!token || typeof token !== "string") return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Token format invalid");

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    const payload = JSON.parse(jsonPayload);

    return payload.fullName || null;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

// دالة للحصول على أو إنشاء SessionId للسلة المؤقتة
export function getOrCreateSessionId() {
  let sessionId = localStorage.getItem("guestSessionId");
  
  if (!sessionId) {
    // إنشاء sessionId فريد
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem("guestSessionId", sessionId);
  }
  
  return sessionId;
}

// دالة لدمج السلة المؤقتة مع سلة المستخدم بعد تسجيل الدخول
export async function mergeGuestCartToUserCart(sessionId, token) {
  if (!sessionId || !token) return false;
  
  try {
    const API_BASE_URL = (await import("./Constant")).default;
    const response = await fetch(`${API_BASE_URL}Carts/MergeGuestCart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        sessionId: sessionId,
      },
    });
    
    if (response.ok) {
      // حذف sessionId بعد الدمج الناجح
      localStorage.removeItem("guestSessionId");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error merging guest cart:", error);
    return false;
  }
}

export const colors = [
  { ColorId: 1, ColorName: "أحمر" },
  { ColorId: 2, ColorName: "أزرق" },
  { ColorId: 3, ColorName: "أخضر" },
  { ColorId: 4, ColorName: "أصفر" },
  { ColorId: 5, ColorName: "أسود" },
  { ColorId: 6, ColorName: "أبيض" },
  { ColorId: 7, ColorName: "رمادي" },
  { ColorId: 8, ColorName: "برتقالي" },
  { ColorId: 9, ColorName: "بنفسجي" },
  { ColorId: 10, ColorName: "وردي" },
  { ColorId: 11, ColorName: "بني" },
  { ColorId: 12, ColorName: "ذهبي" },
  { ColorId: 13, ColorName: "فضي" },
  { ColorId: 14, ColorName: "تركواز" },
  { ColorId: 15, ColorName: "نيلي" },
  { ColorId: 16, ColorName: "كحلي" },
  { ColorId: 17, ColorName: "عنابي" },
  { ColorId: 18, ColorName: "بيج" },
  { ColorId: 19, ColorName: "خردلي" },
  { ColorId: 20, ColorName: "فيروزي" },
  { ColorId: 21, ColorName: "زهري" },
  { ColorId: 22, ColorName: "أرجواني" },
  { ColorId: 23, ColorName: "لافندر" },
  { ColorId: 24, ColorName: "موف" },
  { ColorId: 25, ColorName: "ليموني" },
  { ColorId: 26, ColorName: "أخضر زيتي" },
  { ColorId: 27, ColorName: "أخضر فاتح" },
  { ColorId: 28, ColorName: "أزرق سماوي" },
  { ColorId: 29, ColorName: "أزرق ملكي" },
  { ColorId: 30, ColorName: "قرمزي" },
  { ColorId: 31, ColorName: "اوف وايت" },

];
export const sizes = [
  { SizeId: 1, SizeName: "S" },
  { SizeId: 2, SizeName: "M" },
  { SizeId: 3, SizeName: "L" },
  { SizeId: 4, SizeName: "XL" },
  { SizeId: 5, SizeName: "XXL" },
  { SizeId: 6, SizeName: "XXX" },
  { SizeId: 7, SizeName: "XXXL" },
  { SizeId: 8, SizeName: "XXXX" },
  { SizeId: 9, SizeName: "A" },
  { SizeId: 10, SizeName: "B" },
  { SizeId: 11, SizeName: "C" },
  { SizeId: 12, SizeName: "D" },
  { SizeId: 13, SizeName: "E" },
  { SizeId: 14, SizeName: "F" },
  { SizeId: 15, SizeName: "22" },
  { SizeId: 16, SizeName: "23" },
  { SizeId: 17, SizeName: "24" },
  { SizeId: 18, SizeName: "25" },
  { SizeId: 19, SizeName: "26" },
  { SizeId: 20, SizeName: "27" },
  { SizeId: 21, SizeName: "28" },
  { SizeId: 22, SizeName: "29" },
  { SizeId: 23, SizeName: "30" },
  { SizeId: 24, SizeName: "31" },
  { SizeId: 25, SizeName: "32" },
  { SizeId: 26, SizeName: "33" },
  { SizeId: 27, SizeName: "34" },
  { SizeId: 28, SizeName: "35" },
  { SizeId: 29, SizeName: "36" },
  { SizeId: 30, SizeName: "37" },
  { SizeId: 31, SizeName: "38" },
  { SizeId: 32, SizeName: "39" },
  { SizeId: 33, SizeName: "40" },
  { SizeId: 34, SizeName: "41" },
  { SizeId: 35, SizeName: "42" },
  { SizeId: 36, SizeName: "43" },
  { SizeId: 37, SizeName: "44" },
  { SizeId: 38, SizeName: "45" },
  { SizeId: 39, SizeName: "46" },
  { SizeId: 40, SizeName: "47" },
  { SizeId: 41, SizeName: "XS" },
  { SizeId: 42, SizeName: "XXS" },
  { SizeId: 43, SizeName: "2XS" },
  { SizeId: 44, SizeName: "48" },
  { SizeId: 45, SizeName: "49" },
  { SizeId: 46, SizeName: "50" },
  { SizeId: 47, SizeName: "سنة" },
  { SizeId: 48, SizeName: "سنتين" },
  { SizeId: 49, SizeName: "ثلاث سنوات" },
  { SizeId: 50, SizeName: "أربع سنوات" },
  { SizeId: 51, SizeName: "خمس سنوات" },
  { SizeId: 52, SizeName: "ست سنوات" },
  { SizeId: 53, SizeName: "سبع سنوات" },
  { SizeId: 54, SizeName: "ثماني سنوات" },
  { SizeId: 55, SizeName: "تسع سنوات" },
  { SizeId: 56, SizeName: "عشر سنوات" },
  { SizeId: 57, SizeName: "إحدى عشرة سنة" },
  { SizeId: 58, SizeName: "اثنتا عشرة سنة" },
];
