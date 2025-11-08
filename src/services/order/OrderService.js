import baseApi from "@/api/baseApi";

const OrderService = {
  // Tạo đơn hàng mới
  async createOrder(payload) {
    try {
      const response = await baseApi.post("/orders/make-order", payload);
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // Lấy danh sách đơn hàng của user đang đăng nhập
  async getMyOrders() {
    try {
      const response = await baseApi.get("/orders");
      console.log("Full orders API response:", response);
      console.log("response.data:", response.data);
      console.log("response.data.data:", response.data?.data);
      // Backend trả về ResponseDTO với data bên trong
      const data = response.data?.data || response.data;
      console.log("Final data:", data);
      console.log("Is array?", Array.isArray(data));
      // Đảm bảo trả về array
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("OrderService.getMyOrders error:", error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // Lấy chi tiết đơn hàng theo ID
  async getOrderById(orderId) {
    try {
      const response = await baseApi.get(`/orders/${orderId}`);
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },
};

export default OrderService;
