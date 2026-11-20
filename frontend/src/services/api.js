
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

export const checkBackendHealth = async () => {
  const response = await api.get("/health");
  return response.data;
};

export const predictCustomer = async (customerData) => {
  const response = await api.post("/predict", customerData);
  return response.data;
};

export const explainCustomer = async (customerData) => {
  const response = await api.post("/explain", customerData);
  return response.data;
};

export const investigateCustomer = async (customerData) => {
  const response = await api.post("/investigate", customerData);
  return response.data;
};

export default api;
