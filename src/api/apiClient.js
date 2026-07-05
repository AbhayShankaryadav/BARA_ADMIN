const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = {
  // Admin Stats
  getStats: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  // Sales Chart
  getSalesChart: async (period = '7d') => {
    const params = new URLSearchParams({ period });
    const res = await fetch(`${API_BASE_URL}/admin/sales-chart?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch sales chart');
    return res.json();
  },

  // Products
  getProducts: async (category = null) => {
    let url = `${API_BASE_URL}/admin/products`;
    if (category) {
      const params = new URLSearchParams({ category });
      url += `?${params.toString()}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  addProduct: async (productData) => {
    const res = await fetch(`${API_BASE_URL}/admin/add-product`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to add product');
    }
    return data;
  },

  uploadProductImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const res = await fetch(`${API_BASE_URL}/admin/upload-image`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload image');
    const data = await res.json();
    return { imageUrl: data.imageUrl || data.image_url };
  },

  uploadMultipleProductImages: async (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    
    const res = await fetch(`${API_BASE_URL}/admin/upload-multiple-images`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload images');
    return res.json();
  },
  updateProduct: async (id, productData) => {
    const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update product');
    }
    return data;
  },

  deleteProduct: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
  },

  // Categories
  getCategories: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  // Customers
  getCustomers: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/customers`);
    if (!res.ok) throw new Error('Failed to fetch customers');
    return res.json();
  },

  deleteCustomer: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/customers/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete customer');
    return res.json();
  },
  // Orders
  getOrders: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  updateOrderStatus: async (id, status) => {
    const res = await fetch(`${API_BASE_URL}/admin/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  getPendingOrdersCount: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/orders/pending-count`);
    if (!res.ok) throw new Error('Failed to fetch pending orders count');
    return res.json();
  },

  // Coupons
  getCoupons: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/coupons`);
    if (!res.ok) throw new Error('Failed to fetch coupons');
    return res.json();
  },

  addCoupon: async (couponData) => {
    const res = await fetch(`${API_BASE_URL}/admin/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponData),
    });
    if (!res.ok) throw new Error('Failed to add coupon');
    return res.json();
  },

  updateCouponStatus: async (id, active) => {
    const res = await fetch(`${API_BASE_URL}/admin/coupons/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });
    if (!res.ok) throw new Error('Failed to update coupon status');
    return res.json();
  },

  deleteCoupon: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/coupons/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete coupon');
    return res.json();
  },

  // Reviews
  getReviews: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/reviews`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  updateReviewStatus: async (id, approved) => {
    const res = await fetch(`${API_BASE_URL}/admin/reviews/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    });
    if (!res.ok) throw new Error('Failed to update review status');
    return res.json();
  },

  deleteReview: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/reviews/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete review');
    return res.json();
  },
};

export default apiClient;
