import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
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
        error.message = `${method} ${requestUrl} failed (${status}): ${
          typeof serverMessage === "string" && serverMessage.trim()
            ? serverMessage
            : "The server returned an empty error response."
        }`;
      } else if (!error.response) {
        error.message = `${method} ${requestUrl} failed: Unable to reach the server. ${
          error.message || "Check the API URL and backend status."
        }`;
      }

      console.error("API request failed:", {
        method,
        url: requestUrl,
        status,
        response: responseData,
        error: error.message
      });
    }

    return Promise.reject(error);
  }
);

export default api;