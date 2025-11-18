import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const baseApi = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});


baseApi.interceptors.request.use(
  (config) => {
    const token = cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

baseApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const errMessage =
      error.response?.data?.message || "An unknown error occurred";
    return Promise.reject(errMessage);
  }
);

export default baseApi;
