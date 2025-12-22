import baseApi from "@/api/baseApi";

const FeedbackService = {
  /**
   * CMS: Lấy danh sách feedback (có phân trang + filter)
   */
  async getReviews(params = {}) {
    try {
      // Tách signal từ params
      const { signal, ...queryParams } = params;
      
      const response = await baseApi.get(
        `/cms/reviews`,
        {
          params: queryParams,
          signal // Truyền signal để hủy request
        }
      );
      return response;
    } catch (error) {
      console.error("CMS - Get reviews error:", error);
      throw error;
    }
  },

  /**
   * CMS: Xoá feedback
   */
  async deleteReview(id) {
    try {
      const response = await baseApi.delete(
        `/cms/reviews/${id}`
      );
      return response;
    } catch (error) {
      console.error("CMS - Delete review error:", error);
      throw error;
    }
  }
};

export default FeedbackService;