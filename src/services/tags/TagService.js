import baseApi from "@/api/baseApi";

const getAllTags = async () => {
  try {
    const response = await baseApi.get("/cms/tags");
    return response.data;
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
};

const getTagById = async (id) => {
  try {
    const response = await baseApi.get(`/cms/tags/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching tag by id:", error);
    throw error;
  }
};

const createTag = async (data) => {
  try {
    const response = await baseApi.post("/cms/tags", data);
    return response.data;
  } catch (error) {
    console.error("Error creating tag:", error);
    throw error;
  }
};

const updateTag = async (id, data) => {
  try {
    const response = await baseApi.put(`/cms/tags/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating tag:", error);
    throw error;
  }
};

const deleteTag = async (id) => {
  try {
    const response = await baseApi.delete(`/cms/tags/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting tag:", error);
    throw error;
  }
};

const tagService = {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
};

export default tagService;
