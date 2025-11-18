import baseApi from "../../api/baseApi";
import { jwtDecode } from "jwt-decode";
import Cookies from "universal-cookie";

const api = baseApi;
const cookies = new Cookies();

async function login(loginRequest) {
  const { data } = await api.post("/login", loginRequest);

  if (data && data.data) {
    cookies.set("token", data.data.token, { path: "/" });
    return data.data;
  }

  throw new Error("Invalid response from server");
}

function getToken() {
  return cookies.get("token");
}

function logout() {
  cookies.remove("token", { path: "/" });
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
