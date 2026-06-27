// API Configuration
export const API_BASE_URL = "http://192.168.1.7:5000";

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/user/login`,
  SIGNUP: `${API_BASE_URL}/user/signup`,

  // Products
  GET_PRODUCT: (id: string) => `${API_BASE_URL}/product/${id}`,
  GET_PRODUCTS: `${API_BASE_URL}/product`,

  // Bag
  ADD_TO_BAG: `${API_BASE_URL}/bag`,
  GET_BAG: `${API_BASE_URL}/bag`,

  // Wishlist
  ADD_TO_WISHLIST: `${API_BASE_URL}/wishlist`,
  GET_WISHLIST: `${API_BASE_URL}/wishlist`,

  // Orders
  CREATE_ORDER: `${API_BASE_URL}/Order`,
  GET_ORDERS: `${API_BASE_URL}/Order`,
};
