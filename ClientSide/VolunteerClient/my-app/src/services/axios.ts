import axios from 'axios';

const baseURL = 'https://localhost:7222/api';

const axiosInstance = axios.create({ baseURL });

axiosInstance.interceptors.request.use((request) => {
  const token = localStorage.getItem("token");

  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }

  return request;
});

export default axiosInstance;