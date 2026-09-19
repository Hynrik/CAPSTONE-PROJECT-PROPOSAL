import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL
});

// ATTACH TOKEN AUTOMATICALLY
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const method = error.config?.method?.toUpperCase() || "REQUEST";
      const requestUrl = error.config?.url || "unknown URL";
      const fullRequestUrl = error.config?.baseURL
        ? new URL(requestUrl, error.config.baseURL).toString()
        : requestUrl;
      const status = error.response?.status;
      const responseData = error.response?.data;
      const serverMessage =
        typeof responseData === "string"
          ? responseData
          : responseData?.message ||
            (responseData
              ? JSON.stringify(responseData)
              : undefined);

      if (error.response) {
        error.message = `${method} ${fullRequestUrl} failed (${status}): ${
          typeof serverMessage === "string" && serverMessage.trim()
            ? serverMessage
            : "The server returned an empty error response."
        }`;
      } else if (!error.response) {
        error.message = `${method} ${fullRequestUrl} failed: Unable to reach the server. ${
          error.message || "Check the API URL and backend status."
        }`;
      }

      console.error("API request failed:", {
        method,
        url: fullRequestUrl,
        status,
        response: responseData,
        error: error.message
      });
    }

    return Promise.reject(error);
  }
);

export default api;