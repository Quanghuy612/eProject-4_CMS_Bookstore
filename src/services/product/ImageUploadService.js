// services/product/ImageUploadService.js
import baseApi from "@/api/baseApi";

class ImageUploadService {
  constructor() {
    this.baseUrl = "/cms/images";
  }

  /**
   * Upload ảnh lên server
   * @param {File} file
   */
  async uploadImage(file) {
    try {
      // Validate trước khi upload
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message,
        };
      }

      const formData = new FormData();
      formData.append("file", file);
      
   
      const response = await baseApi.post(this.baseUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        data: response.data, // { fileName, contentType, size, url }
        message: "Upload ảnh thành công",
      };
    } catch (error) {
      console.error("❌ Lỗi khi upload ảnh:", error);

      let errorMessage = "Upload ảnh thất bại";
      if (error.response) {
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          errorMessage;
      } else if (error.request) {
        errorMessage = "Không thể kết nối đến server";
      }

      return {
        success: false,
        message: errorMessage,
        error,
      };
    }
  }

  /* ===================== VALIDATE ===================== */

  validateFile(file, options = {}) {
    if (!file) {
      return { valid: false, message: "Vui lòng chọn ảnh" };
    }

    const { maxSizeMB = 5 } = options;

    // size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        valid: false,
        message: `Kích thước ảnh không được vượt quá ${maxSizeMB}MB`,
      };
    }

    // type (phù hợp backend)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message: "Chỉ chấp nhận ảnh JPG, PNG, WEBP",
      };
    }

    return { valid: true };
  }

  /* ===================== HELPERS ===================== */

  createPreviewUrl(file) {
    if (!file) return "";
    return URL.createObjectURL(file);
  }

  revokePreviewUrl(url) {
    if (url && url.startsWith("blob:")) {
      URL.revokeObjectURL(url);
    }
  }

  formatFileSize(bytes) {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}

const imageUploadService = new ImageUploadService();
export default imageUploadService;
