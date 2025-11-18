import baseApi from "@/api/baseApi";

const OrderService = {
  // Tạo đơn hàng mới
  async createOrder(payload) {
    try {
      const response = await baseApi.post("/orders/make-order", payload);
      
      // Kiểm tra status code và message từ backend
      if (response.status !== 200 || response.data?.statusCode !== "SUCCESS2000") {
        throw new Error(response.data?.message || "Order creation failed");
      }
      
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // Lấy danh sách đơn hàng của user đang đăng nhập
  async getMyOrders() {
    try {
      const response = await baseApi.get("/orders");
      
      // Kiểm tra nếu backend trả về lỗi
      if (response.data?.success === false || response.data?.statusCode !== "SUCCESS2000") {
        throw new Error(response.data?.message || "Failed to fetch orders");
      }
      
      // Backend trả về ResponseDTO với data bên trong
      const data = response.data?.data || response.data;
      
      // Đảm bảo trả về array
      return Array.isArray(data) ? data : [];
    } catch (error) {
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