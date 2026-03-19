import api from "@/api/client";
import {
  buildRoomDetailCacheKey,
  buildRoomListCacheKey,
  getPublicCache,
  invalidatePublicRoomCache,
  setPublicCache,
} from "@/utils/publicCache";

class RoomService {
  listRooms(params) {
    return api.get("/rooms", { params });
  }

  getRoomDetail(id) {
    return api.get(`/rooms/${id}`);
  }

  getMyFavorites() {
    return api.get("/favorites/me");
  }

  getMyAppointments() {
    return api.get("/appointments/me");
  }

  cancelAppointment(id) {
    return api.patch(`/appointments/${id}/cancel`);
  }

  toggleFavorite(id) {
    return api.post(`/favorites/${id}/toggle`);
  }

  getReportStatus(id) {
    return api.get(`/rooms/${id}/report-status`);
  }

  createAppointment(id, payload) {
    return api.post(`/appointments/room/${id}`, payload);
  }

  createReview(id, payload) {
    return api.post(`/reviews/room/${id}`, payload).then((response) => {
      invalidatePublicRoomCache({ roomId: id });
      return response;
    });
  }

  reportRoom(id, payload) {
    return api.post(`/rooms/${id}/report`, payload);
  }

  getRoomListCacheKey(params = {}) {
    return buildRoomListCacheKey(params);
  }

  getCachedRoomList(params = {}, options = {}) {
    return getPublicCache(this.getRoomListCacheKey(params), options);
  }

  setCachedRoomList(params = {}, data) {
    setPublicCache(this.getRoomListCacheKey(params), data);
  }

  getRoomDetailCacheKey(id) {
    return buildRoomDetailCacheKey(id);
  }

  getCachedRoomDetail(id, options = {}) {
    return getPublicCache(this.getRoomDetailCacheKey(id), options);
  }

  setCachedRoomDetail(id, data) {
    setPublicCache(this.getRoomDetailCacheKey(id), data);
  }

  invalidatePublicCache(roomId) {
    invalidatePublicRoomCache({ roomId });
  }
}

export default new RoomService();
