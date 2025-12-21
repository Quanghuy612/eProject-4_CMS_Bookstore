import baseApi from "@/api/baseApi";

const FeedbackService = {
 
  /**
   * Lấy danh sách đánh giá theo productId (có phân trang)
   */
  async getReviewsByProductId(productId, params = {}) {
    try {
      if (!productId) {
        throw new Error("ProductId is required");
      }

      let pageNumber = 0;
      let pageSize = 10;
      let sortBy = "createdAt";
      let sortDirection = "desc";

      if (params.pageNumber !== undefined && params.pageNumber >= 0) {
        pageNumber = params.pageNumber;
      }

      if (params.pageSize !== undefined && params.pageSize > 0) {
        pageSize = params.pageSize;
      }

      if (params.sortBy) {
        sortBy = params.sortBy;
      }

      if (params.sortDirection === "asc" || params.sortDirection === "desc") {
        sortDirection = params.sortDirection;
      }

      const response = await baseApi.get(
        `/reviews/product/${productId}`,
        {
          params: {
            pageNumber,
            pageSize,
            sortBy,
            sortDirection,
          },
        }
      );

      return response;
    } catch (error) {
      console.error("Get reviews by productId error:", error);
      throw error;
    }
  },

  /**
   * Lấy tất cả đánh giá (không phân trang)
   */
  async getAllReviewsByProductId(productId) {
    try {
      if (!productId) {
        throw new Error("ProductId is required");
      }

      const response = await baseApi.get(
        `/reviews/product/${productId}/all`
      );
      return response;
    } catch (error) {
      console.error("Get all reviews error:", error);
      throw error;
    }
  },

  /**
   * Lấy thống kê đánh giá
   */
  async getReviewStatistics(productId) {
    try {
      if (!productId) {
        throw new Error("ProductId is required");
      }

      const response = await baseApi.get(
        `/reviews/product/${productId}/statistics`
      );
      return response;
    } catch (error) {
      console.error("Get review statistics error:", error);
      throw error;
    }
  },
};

export default FeedbackService;
