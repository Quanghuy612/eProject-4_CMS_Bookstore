import baseApi from "@/api/baseApi";

const ProductService = {
  // Lấy tất cả sản phẩm
  async getAllProducts() {
    try {
      const response = await baseApi.get("/cms/products/get/all");
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // Lấy chi tiết sản phẩm theo ID
  async getProductDetails(productId) {
    try {
      const response = await baseApi.get(`/cms/products/get/${productId}`);
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // Tạo sản phẩm mới
  async createProduct(payload) {
    try {
      const response = await baseApi.post("/cms/products", payload);
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // Cập nhật sản phẩm
  async updateProduct(productId, payload) {
    try {
      const response = await baseApi.put(`/cms/products/${productId}`, payload);
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  // Xoá sản phẩm
  async deleteProduct(productId) {
    try {
      const response = await baseApi.delete(`/cms/products/${productId}`);
      return response.data?.data || response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  },
};

export default ProductService;
