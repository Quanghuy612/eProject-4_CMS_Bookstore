import baseApi from "@/api/baseApi";

const createCategory = async (data) => {
  try {
    console.log("📤 Creating category with data:", data);
    const response = await baseApi.post(`/cms/category/create`, data);
    console.log("✅ Category created:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error creating category:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

const getCategoryLevel3 = async () => {
  try {
    const response = await baseApi.get(`/cms/category/level3`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching level 3 categories:", error);
    throw error;
  }
};

const getAllCategories = async () => {
  try {
    console.log("📥 Fetching all categories...");
    const response = await baseApi.get(`/cms/category/list`);
    console.log("✅ Categories fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching categories:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Thêm API update và delete khi backend hỗ trợ
const updateCategory = async (data) => {
  try {
    const response = await baseApi.put(`/cms/category`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

const deleteCategory = async (id) => {
  try {
    console.log(` Deleting category id=${id}`);
    const response = await baseApi.delete(`/cms/category/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Delete category error:", error.response?.data || error);
    throw error.response?.data || error;
  }
};

const categoryService = {
  createCategory,
  getCategoryLevel3,
  getAllCategories,
  updateCategory,  // Thêm vào khi backend hỗ trợ
  deleteCategory,  // Thêm vào khi backend hỗ trợ
};

export default categoryService;