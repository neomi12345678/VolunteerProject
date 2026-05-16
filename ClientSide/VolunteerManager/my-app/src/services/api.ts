// services/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7222", // כתובת השרת שלך
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("adminUser") || "null");
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
