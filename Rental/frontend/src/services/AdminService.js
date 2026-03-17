import api from "@/api/client";

class AdminService {
  getReportedRooms() {
    return api.get("/admin/rooms/reported");
  }

  getReportedRoomDetail(id) {
    return api.get(`/admin/rooms/reported/${id}`);
  }

  getUsers() {
    return api.get("/admin/users");
  }

  getUserDetail(id) {
    return api.get(`/admin/users/${id}`);
  }

  createUser(payload) {
    return api.post("/admin/users", payload);
  }

  deleteRoom(id) {
    return api.delete(`/admin/rooms/${id}`);
  }

  lockUser(id) {
    return api.patch(`/admin/users/${id}/lock`);
  }

  unlockUser(id) {
    return api.patch(`/admin/users/${id}/unlock`);
  }
}

export default new AdminService();
