const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = rawBaseUrl && rawBaseUrl.length > 0
  ? rawBaseUrl.replace(/\/+$/, "")
  : "http://localhost:5000";

if (import.meta.env.PROD && !rawBaseUrl) {
  console.warn(
    "VITE_API_BASE_URL is not set. Production requests are falling back to localhost."
  );
}

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
