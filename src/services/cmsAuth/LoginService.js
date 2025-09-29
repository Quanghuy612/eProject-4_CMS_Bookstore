import baseApi from "../../api/baseApi";
import { jwtDecode } from "jwt-decode"; 

const api = baseApi;

async function login(loginRequest) {
  const { data } = await api.post("/login", loginRequest);

  if (data && data.data) {
    localStorage.setItem("token", data.data.token);
    return data.data;
  }

  throw new Error("Invalid response from server");
}

function getToken() {
  return localStorage.getItem("token");
}

function logout() {
  localStorage.removeItem("token");
}

function decodeToken(token) {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}

const LoginService = {
  login,
  getToken,
  logout,
  decodeToken, 
};

export default LoginService;
