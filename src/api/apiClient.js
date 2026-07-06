const API_BASE_URL = 'http://localhost:5000/api';

// A helper function to automatically add the auth token to requests
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('accessToken');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    // Try to parse the error message from the response body
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
};

const apiClient = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to login');
    }
    return data;
  },
  // Admin Stats
  getStats: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/stats`);
    return res;
  },

  // Sales Chart
  getSalesChart: async (period = '7d') => {
    const params = new URLSearchParams({ period });
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/sales-chart?${params.toString()}`);
    return res;
  },

  // Products
  getProducts: async (category = null) => {
    let url = `${API_BASE_URL}/admin/products`;
    if (category) {
      const params = new URLSearchParams({ category });
      url += `?${params.toString()}`;
    }
    const res = await fetchWithAuth(url);
    return res;
  },

  addProduct: async (productData) => { // This one already had headers, but let's use the helper for consistency
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/add-product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    return res;
  },

  uploadProductImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/upload-image`, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
    const data = await res;
    return { imageUrl: data.imageUrl || data.image_url }; // Assuming res is now parsed JSON
  },

  uploadMultipleProductImages: async (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/upload-multiple-images`, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
    return res;
  },
  updateProduct: async (id, productData) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    return res;
  },

  deleteProduct: async (id) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'DELETE',
    });
    return res;
  },

  // Categories
  getCategories: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/categories`);
    return res;
  },

  // Customers
  getCustomers: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/customers`);
    return res;
  },

  deleteCustomer: async (id) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/customers/${id}`, {
      method: 'DELETE',
    });
    return res;
  },
  // Orders
  getOrders: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/orders`);
    return res;
  },

  updateOrderStatus: async (id, status) => { // This one also had headers, but let's use the helper
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return res;
  },

  getPendingOrdersCount: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/orders/pending-count`);
    return res;
  },

  // Coupons
  getCoupons: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/coupons`);
    return res;
  },

  addCoupon: async (couponData) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData),
    });
    return res;
  },

  updateCouponStatus: async (id, active) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/coupons/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });
    return res;
  },

  deleteCoupon: async (id) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/coupons/${id}`, {
      method: 'DELETE',
    });
    return res;
  },

  // Reviews
  getReviews: async () => {
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/reviews`);
    return res;
  },

  updateReviewStatus: async (id, approved) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/reviews/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    });
    return res;
  },

  deleteReview: async (id) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/admin/reviews/${id}`, {
      method: 'DELETE',
    });
    return res;
  },
};

export default apiClient;
