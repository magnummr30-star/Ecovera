import React, { Suspense, lazy } from "react";
import "../index.css";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CurrencyProvider } from "./Currency/CurrencyContext";
import { I18nProvider } from "./i18n/I18nContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});
const Home = lazy(() => import("./Home/Home"));
const ForgotPassword = lazy(() => import("./Login&Register/ForgotPassword"));
const Signup = lazy(() => import("./Login&Register/Signup"));
const Login = lazy(() => import("./Login&Register/Login"));
const FindProducts = lazy(() => import("./Products/FindProducts"));
const ProductDetails = lazy(() => import("./Products/ProductDetails"));
const Cart = lazy(() => import("./Cart/Cart"));
const PurchaseDetailsOperation = lazy(() => import("./CreateOrder/PurchaseDetailsOperation"));
const PaymentSuccess = lazy(() => import("./CreateOrder/PaymentSuccess"));
const PaymentCancel = lazy(() => import("./CreateOrder/PaymentCancel"));
const MyPurchases = lazy(() => import("./Clients/MyPurchases"));
const PurchaseDetails = lazy(() => import("./Clients/PurchaseDetails"));
const MyProfile = lazy(() => import("./Clients/MyProfile"));
const Orders = lazy(() => import("./AdminBar/Orders/Orders"));
const OrderDetails = lazy(() => import("./AdminBar/Orders/OrderDetails"));
const Visitors = lazy(() => import("./AdminBar/Visitors/Visitors"));
const ShippingInfo = lazy(() => import("./AdminBar/Shipping/ShippingInfo"));
const Employees = lazy(() => import("./AdminBar/Managers/Employees"));
const AddProduct = lazy(() => import("./AdminBar/Products/AddProduct"));
const AddProductDetails = lazy(() => import("./AdminBar/Products/AddProductDetails"));
const ProductForm = lazy(() => import("./AdminBar/Products/UpdateProduct/ProductForm"));
const CategoriesAdmin = lazy(() => import("./AdminBar/Products/CategoriesAdmin"));
const Clients = lazy(() => import("./AdminBar/Clients"));
const UpdateAdminInfo = lazy(() => import("./AdminBar/UpdateContactUs"));
const LegalContentEditor = lazy(() => import("./AdminBar/LegalContent/LegalContentEditor.jsx"));
const ContactUsCom = lazy(() => import("./Contact_About/ContactUsCom"));
const AboutUs = lazy(() => import("./Contact_About/AboutUs"));
const PrivacyAndTerms = lazy(() => import("./Privacy_Terms/PrivacyAndTerms"));
const ClientSearching = lazy(() => import("./Clients/ClientSearching"));
const BannersAdmin = lazy(() => import("./AdminBar/Banners/BannersAdmin"));
const AnnouncementBarAdmin = lazy(() => import("./AdminBar/Banners/AnnouncementBarAdmin"));
const CurrencyAdmin = lazy(() => import("./AdminBar/Currency/CurrencyAdmin"));
const MyReviews = lazy(() => import("./Clients/MyReviews"));
const ReviewsAdmin = lazy(() => import("./AdminBar/Reviews/ReviewsAdmin"));

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F9F6EF]">
    <div className="h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

function fixButtonBackgrounds() {
  if (typeof document === 'undefined') return;
  
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    const classes = button.className || '';
    
    // إصلاح الأزرار الخضراء
    if ((classes.includes('from-green') || classes.includes('bg-green')) && !button.style.background) {
      if (classes.includes('bg-gradient-to-l')) {
        button.style.background = 'linear-gradient(to left, #16a34a, #15803d)';
      } else if (classes.includes('bg-gradient-to-r')) {
        button.style.background = 'linear-gradient(to right, #16a34a, #15803d)';
      } else if (classes.includes('bg-green-600')) {
        button.style.background = '#16a34a';
      } else if (classes.includes('bg-green-700')) {
        button.style.background = '#15803d';
      }
    }
    
    // إصلاح الأزرار البرتقالية
    if ((classes.includes('from-orange') || classes.includes('bg-orange')) && !button.style.background) {
      if (classes.includes('bg-gradient-to-l')) {
        button.style.background = 'linear-gradient(to left, #f97316, #ea580c)';
      } else if (classes.includes('bg-gradient-to-r')) {
        button.style.background = 'linear-gradient(to right, #f97316, #ea580c)';
      } else if (classes.includes('bg-orange-500')) {
        button.style.background = '#f97316';
      } else if (classes.includes('bg-orange-600')) {
        button.style.background = '#ea580c';
      }
    }
    
    // إصلاح الأزرار الحمراء
    if ((classes.includes('from-red') || classes.includes('bg-red')) && !button.style.background) {
      if (classes.includes('bg-gradient-to-l')) {
        button.style.background = 'linear-gradient(to left, #dc2626, #b91c1c)';
      } else if (classes.includes('bg-gradient-to-r')) {
        button.style.background = 'linear-gradient(to right, #dc2626, #b91c1c)';
      } else if (classes.includes('bg-red-500')) {
        button.style.background = '#dc2626';
      } else if (classes.includes('bg-red-600')) {
        button.style.background = '#b91c1c';
      }
    }
    
    // إصلاح الأزرار الزرقاء
    if ((classes.includes('from-blue') || classes.includes('bg-blue')) && !button.style.background) {
      if (classes.includes('bg-gradient-to-l')) {
        button.style.background = 'linear-gradient(to left, #2563eb, #1e40af)';
      } else if (classes.includes('bg-gradient-to-r')) {
        button.style.background = 'linear-gradient(to right, #2563eb, #1e40af)';
      } else if (classes.includes('bg-blue-600')) {
        button.style.background = '#2563eb';
      } else if (classes.includes('bg-blue-700')) {
        button.style.background = '#1e40af';
      } else if (classes.includes('bg-blue-800')) {
        button.style.background = '#1e3a8a';
      } else if (classes.includes('bg-blue-900')) {
        button.style.background = '#1e3a8a';
      }
    }
    
    // إصلاح الأزرار الداكنة (بنفسجي/وردي)
    if ((classes.includes('from-[#92278f]') || classes.includes('to-[#ee207b]') || classes.includes('bg-[#92278f]') || classes.includes('bg-[#ee207b]') || classes.includes('from-[#0a2540]') || classes.includes('to-[#13345d]') || classes.includes('bg-[#0a2540]') || classes.includes('bg-[#13345d]')) && !button.style.background) {
      if (classes.includes('bg-gradient-to-l')) {
        button.style.background = 'linear-gradient(to left, #92278f, #ee207b)';
      } else if (classes.includes('bg-gradient-to-r')) {
        button.style.background = 'linear-gradient(to right, #92278f, #ee207b)';
      } else if (classes.includes('bg-[#92278f]') || classes.includes('bg-[#0a2540]')) {
        button.style.background = '#92278f';
      } else if (classes.includes('bg-[#ee207b]') || classes.includes('bg-[#13345d]')) {
        button.style.background = '#ee207b';
      }
    }
    
    // ضمان النص الأبيض
    if (classes.includes('text-white') && (classes.includes('bg-gradient') || classes.includes('bg-green') || classes.includes('bg-blue') || classes.includes('bg-red') || classes.includes('bg-orange'))) {
      button.style.color = 'white';
      const spans = button.querySelectorAll('span');
      const svgs = button.querySelectorAll('svg');
      spans.forEach(span => span.style.color = 'white');
      svgs.forEach(svg => {
        svg.style.color = 'white';
        svg.style.stroke = 'white';
      });
    }
  });
}

// تشغيل الدالة عند تحميل الصفحة وبعد تحديث DOM
if (typeof window !== 'undefined') {
  setTimeout(() => {
    fixButtonBackgrounds();
    const observer = new MutationObserver(() => {
      setTimeout(fixButtonBackgrounds, 100);
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }, 100);
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
  <QueryClientProvider client={queryClient}>
  <GoogleOAuthProvider clientId="598205034823-83r1upd5tun3uau6os8aq1fgfpv0sinj.apps.googleusercontent.com">
    <I18nProvider>
      <CurrencyProvider>
        <Router>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/FindProducts" element={<FindProducts />} />
            <Route path="/FindProducts/:query" element={<FindProducts />} />
            <Route path="/productDetails/:id" element={<ProductDetails />} />
            <Route path="/Cart" element={<Cart />} />
            <Route path="/PurchaseDetails" element={<PurchaseDetailsOperation />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-cancelled" element={<PaymentCancel />} />
            <Route path="/MyPurchases" element={<MyPurchases />} />
            <Route path="/Admin/Orders" element={<Orders />} />
            <Route path="/Admin/Visitors" element={<Visitors />} />
            <Route path="/Admin/shipping-prices" element={<ShippingInfo />} />
            <Route path="/admins/Employees" element={<Employees />} />
            <Route path="/admins/AddProduct" element={<AddProduct />} />
            <Route path="/admin/categories" element={<CategoriesAdmin />} />
            <Route path="/admin/edit-product" element={<ProductForm />} />
            <Route path="/admin/Clients" element={<Clients />} />
            <Route path="/admin/UpdateAdminInfo" element={<UpdateAdminInfo />} />
            <Route path="/admin/legal-content" element={<LegalContentEditor />} />
            <Route path="/admin/banners" element={<BannersAdmin />} />
            <Route path="/admin/announcement-bar" element={<AnnouncementBarAdmin />} />
            <Route path="/admin/currency" element={<CurrencyAdmin />} />
            <Route path="/Contact" element={<ContactUsCom />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/terms" element={<PrivacyAndTerms />} />
            <Route path="/Admin/ClientsSearshing" element={<ClientSearching />} />
            <Route
              path="/admins/AddProductDetails"
              element={<AddProductDetails />}
            />
            <Route
              path="/Admin/order-details/:orderId"
              element={<OrderDetails />}
            />
            <Route
              path="/Purchase-Details/:orderId"
              element={<PurchaseDetails />}
            />
            <Route path="/MyProfile" element={<MyProfile />} />
            <Route path="/MyReviews" element={<MyReviews />} />
            <Route path="/admin/reviews" element={<ReviewsAdmin />} />
            </Routes>
          </Suspense>
        </Router>
      </CurrencyProvider>
    </I18nProvider>
  </GoogleOAuthProvider>
  </QueryClientProvider>
  </Provider>
);
