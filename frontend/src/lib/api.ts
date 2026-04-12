const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = rawBaseUrl && rawBaseUrl.length > 0
  ? rawBaseUrl.replace(/\/+$/, "")
  : "http://localhost:5000";

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
