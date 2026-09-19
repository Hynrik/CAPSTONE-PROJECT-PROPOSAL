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
      const serverMessage = error.response?.data?.message;

      if (typeof serverMessage === "string" && serverMessage.trim()) {
        error.message = serverMessage;
      } else if (!error.response) {
        error.message = "Unable to reach the server. Please try again.";
      }
    }

    return Promise.reject(error);
  }
);

export default api;