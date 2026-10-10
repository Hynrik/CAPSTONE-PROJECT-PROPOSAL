const DEFAULT_API_BASE_URL = "http://localhost:5000/api";

export const getApiBaseUrl = (configuredUrl?: string) => {
  const baseUrl = configuredUrl?.trim().replace(/\/+$/, "");

  if (!baseUrl) {
    return DEFAULT_API_BASE_URL;
  }

  return /\/api$/i.test(baseUrl) ? baseUrl : `${baseUrl}/api`;
};

const API_BASE_URL = getApiBaseUrl(import.meta.env.VITE_API_URL);

export default API_BASE_URL;