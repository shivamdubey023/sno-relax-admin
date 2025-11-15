// Centralized API Configuration for Admin
const getApiBase = () => {
  if (process.env.NODE_ENV === "production") {
    return process.env.REACT_APP_API_BASE || "https://sno-relax-server.onrender.com";
  }
  return process.env.REACT_APP_API_BASE || "http://localhost:5000";
};

export const API_BASE = getApiBase();

export default API_BASE;
