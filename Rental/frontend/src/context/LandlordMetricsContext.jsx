import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import useAuth from "@/hooks/useAuth";
import chatService from "@/services/ChatService";
import landlordService from "@/services/LandlordService";
import { getApiData } from "@/utils/apiResponse";

const defaultMetrics = {
  roomsCount: 0,
  pendingAppointmentsCount: 0,
  unreadMessagesCount: 0,
  pendingReviewsCount: 0,
};

const LandlordMetricsContext = createContext({
  metrics: defaultMetrics,
  refreshMetrics: async () => {},
  syncUnreadMessagesCount: () => {},
});

export const LandlordMetricsProvider = ({ children }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(defaultMetrics);

  const refreshMetrics = useCallback(async () => {
    if (user?.role !== "landlord") {
      setMetrics(defaultMetrics);
      return;
    }

    try {
      const [roomsResult, appointmentsResult, inboxResult] = await Promise.allSettled([
        landlordService.getMyRooms(),
        landlordService.getAppointments(),
        chatService.getInbox(),
      ]);

      const rooms = roomsResult.status === "fulfilled" ? getApiData(roomsResult.value, []) : [];
      const appointments = appointmentsResult.status === "fulfilled" ? getApiData(appointmentsResult.value, []) : [];
      const inbox = inboxResult.status === "fulfilled" ? getApiData(inboxResult.value, []) : [];

      setMetrics({
        roomsCount: rooms.length,
        pendingAppointmentsCount: appointments.filter((item) => item.status === "pending").length,
        unreadMessagesCount: inbox.reduce((sum, item) => sum + Number(item.unreadCount || 0), 0),
        pendingReviewsCount: rooms
          .flatMap((room) => room.reviews || [])
          .filter((review) => !review.landlordReply)
          .length,
      });
    } catch {
      setMetrics(defaultMetrics);
    }
  }, [user?.role]);

  const syncUnreadMessagesCount = useCallback((value) => {
    setMetrics((prev) => {
      const nextValue = Number(value || 0);
      return prev.unreadMessagesCount === nextValue ? prev : { ...prev, unreadMessagesCount: nextValue };
    });
  }, []);

  useEffect(() => {
    void refreshMetrics();
  }, [refreshMetrics]);

  const value = useMemo(
    () => ({
      metrics,
      refreshMetrics,
      syncUnreadMessagesCount,
    }),
    [metrics, refreshMetrics, syncUnreadMessagesCount]
  );

  return <LandlordMetricsContext.Provider value={value}>{children}</LandlordMetricsContext.Provider>;
};

export const useLandlordMetrics = () => useContext(LandlordMetricsContext);
