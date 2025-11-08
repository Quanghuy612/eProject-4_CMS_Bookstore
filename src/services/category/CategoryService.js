import baseApi from "@/api/baseApi";


const createCategory = async (data) => {
  try {
    const response = await baseApi.post(`/cms/category/create`, data);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};


const getCategoryLevel3 = async () => {
  try {
    const response = await baseApi.get(`/cms/category/level3`);
    return response.data;
  } catch (error) {
    console.error("Error fetching level 3 categories:", error);
    throw error;
  }
};


const getAllCategories = async () => {
  try {
    const response = await baseApi.get(`/cms/category/list`);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};


const categoryService = {
  createCategory,
  getCategoryLevel3,
  getAllCategories,
};

export default categoryService;
