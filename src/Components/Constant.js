const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");
const getBrowserOrigin = () =>
  typeof window === "undefined" ? "" : trimTrailingSlash(window.location.origin || "");

const envApiBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || "");
const envServerPath = trimTrailingSlash(import.meta.env.VITE_SERVER_PATH || "");
const envSiteUrl = trimTrailingSlash(import.meta.env.VITE_SITE_URL || "");

const resolvedServerPath =
  envServerPath ||
  (envApiBaseUrl ? envApiBaseUrl.replace(/\/api$/i, "") : "");

const fallbackApiBaseUrl = resolvedServerPath ? `${resolvedServerPath}/api` : "/api";
const API_BASE_URL = `${trimTrailingSlash(envApiBaseUrl || fallbackApiBaseUrl)}/`;
const siteUrl = envSiteUrl || getBrowserOrigin();

export const ServerPath = resolvedServerPath;
export const ProductionServerPath = resolvedServerPath || siteUrl;
export const NetlifyDomain = siteUrl ? `${siteUrl}/` : "/";
export const SiteName = import.meta.env.VITE_SITE_NAME || "Ecovera";
export const SiteNameAR = import.meta.env.VITE_SITE_NAME_AR || "إيكوفيرا";

export const CATEGORY_COLORS = [
  "#92278f", "#ee207b", "#f49e24", "#0ea5e9", "#10b981",
  "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4", "#84cc16",
  "#a855f7", "#ef4444", "#14b8a6", "#eab308",
];

export default API_BASE_URL;
