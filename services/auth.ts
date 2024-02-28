import http from "./http";

const login = async (userData: FormData) => {
  // Removing the Authorization header
  delete http.defaults.headers.common["Authorization"];

  try {
    const token = (await http.post("api/auth/login", userData)).data;
    // Store token to local storage
    localStorage.setItem("refreshToken", token.refresh);
    localStorage.setItem("accessToken", token.access);
    //
    http.defaults.headers.common["Authorization"] = `Bearer ${token.access}`;
  } catch (e) {
    console.error("Authentication failed:", e);
  }
};

const logout = async () => {
  if (process.client) {
    const refreshToken = localStorage.getItem("refreshToken");
    await http.post("api/auth/logout", { refresh: refreshToken });
  }
};

const getRole = async () => {
  return (await http.get("api/auth/role")).data.name;
};

const getUserInfo = async () => {
  return (await http.get("api/auth/users")).data;
};

const verifyToken = async (refreshToken: string | null) => {
  return http.post("api/auth/token/verify/", { token: refreshToken });
};

export { login, logout, getRole, getUserInfo, verifyToken };
