import axios from "axios";
import baseApi from "../../api/baseApi";

const api = baseApi;

// Lấy danh sách user
const getAllCmsUsers = async () => {
  try {
    const response = await api.get(`/cms/user`);
    return response.data;
  } catch (error) {
    console.error("Error fetching CMS users:", error);
    throw error;
  }
};

// Khóa / mở khóa user
const updateCmsUserStatus = async (id, locked) => {
  try {
    const response = await api.put(`/cms/user/${id}/status`, {
      locked,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};

const cmsUserService = {
  getAllCmsUsers,
  updateCmsUserStatus,
};

export default cmsUserService;
