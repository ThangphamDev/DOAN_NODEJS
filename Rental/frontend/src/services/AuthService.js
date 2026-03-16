import api from "@/api/client";

class AuthService {
  login(email, password) {
    return api.post("/auth/login", { email, password });
  }

  register(payload) {
    return api.post("/auth/register", payload);
  }

  me() {
    return api.get("/auth/me");
  }
}

export default new AuthService();