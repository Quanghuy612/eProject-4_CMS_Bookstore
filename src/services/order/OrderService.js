import baseApi from "@/api/baseApi";

const api = baseApi;

const orderService = {
  getAllOrders: async () => {
    try {
      const response = await api.get('/cms/orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  },

  getOrderDetail: async (id) => {
    try {
      const response = await api.get(`/cms/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order detail for id ${id}:`, error);
      throw error;
    }
  },

  searchOrders: async (filters = {}) => {
    try {
      const response = await api.get('/cms/orders', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error searching orders:', error);
      throw error;
    }
  },

  // SỬA: Đúng endpoint và cách gọi
  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.put(`/cms/orders/${id}/status?status=${status}`);
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${id}:`, error);
      throw error;
    }
  },

  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/cms/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting order ${id}:`, error);
      throw error;
    }
  }
};

export default orderService;