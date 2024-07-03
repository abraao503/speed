import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true,
  headers: {
    "ngrok-skip-browser-warning": true,
  },
});

export const openApi = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
});

export default api;
