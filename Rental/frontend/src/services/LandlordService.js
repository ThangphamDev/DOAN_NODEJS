import api from "@/api/client";
import { invalidatePublicRoomCache } from "@/utils/publicCache";
import { buildRoomImageManifest } from "@/utils/roomDetails";

const buildRoomFormData = (payload) => {
  const formData = new FormData();
  let appendedFileCount = 0;

  formData.append("title", payload.title || "");
  formData.append("price", payload.price || "");
  formData.append("area", payload.area || "");
  formData.append("address", payload.address || "");
  formData.append("description", payload.description || "");
  formData.append("status", payload.status || "active");
  formData.append("details", JSON.stringify(payload.details || {}));
  formData.append("imageManifest", JSON.stringify(buildRoomImageManifest(payload.imageItems || [])));

  (payload.imageItems || []).forEach((item) => {
    if (item.type === "new" && item.file) {
      const fileName = item.file?.name || item.name || `room-image-${appendedFileCount + 1}.jpg`;
      formData.append("images", item.file, fileName);
      appendedFileCount += 1;
    }
  });

  return { formData };
};

const multipartConfig = {
  headers: {
    "Content-Type": "multipart/form-data",
  },
  transformRequest: [(data) => data],
};

class LandlordService {
  getMyRooms(status) {
    const params = status ? { status } : undefined;
    return api.get("/landlord/rooms/me", { params });
  }

  getAppointments() {
    return api.get("/appointments/me");
  }

  createRoom(payload) {
    const { formData } = buildRoomFormData(payload);
    return api.post("/rooms", formData, multipartConfig).then((response) => {
      invalidatePublicRoomCache();
      return response;
    });
  }

  updateAppointmentStatus(id, status, rejectReason = "") {
    return api.patch(`/appointments/${id}/status`, { status, rejectReason });
  }

  updateRoom(id, payload) {
    const { formData } = buildRoomFormData(payload);
    return api.patch(`/rooms/${id}`, formData, multipartConfig).then((response) => {
      invalidatePublicRoomCache({ roomId: id });
      return response;
    });
  }

  deleteRoom(id) {
    return api.delete(`/landlord/rooms/${id}`).then((response) => {
      invalidatePublicRoomCache({ roomId: id });
      return response;
    });
  }

  replyReview(reviewId, content) {
    return api.put(`/reviews/${reviewId}/reply`, { content }).then((response) => {
      invalidatePublicRoomCache();
      return response;
    });
  }
}

export default new LandlordService();
