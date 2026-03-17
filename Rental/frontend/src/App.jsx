import { Outlet, Route, Routes } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import HomePage from "@/pages/HomePage";
import RoomDetailPage from "@/pages/RoomDetailPage";
import ChatPage from "@/pages/ChatPage";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminManageRooms from "@/pages/admin/ManageRoomsPage";
import AdminManageUsers from "@/pages/admin/ManageUsersPage";
import AdminManageReportedContent from "@/pages/admin/ManageReportedContentPage";
import LandlordLayout from "@/components/layout/LandlordLayout";
import LandlordDashboardPage from "@/pages/landlord/LandlordDashboardPage";
import LandlordManageRooms from "@/pages/landlord/ManageRoomsPage";
import LandlordManageAppointments from "@/pages/landlord/ManageAppointmentsPage";
import LandlordManageReviews from "@/pages/landlord/ManageReviewsPage";
import LandlordMessagesPage from "@/pages/landlord/MessagesPage";
import AppLayout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout><Outlet /></AppLayout>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rooms/:id" element={<RoomDetailPage />} />
        <Route
          path="/messages"
          element={
            <ProtectedRoute roles={["customer", "landlord"]}>
              <ChatPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/landlord"
        element={
          <ProtectedRoute roles={["landlord"]}>
            <LandlordLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<LandlordDashboardPage />} />
        <Route path="rooms" element={<LandlordManageRooms />} />
        <Route path="messages" element={<LandlordMessagesPage />} />
        <Route path="appointments" element={<LandlordManageAppointments />} />
        <Route path="reviews" element={<LandlordManageReviews />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="rooms" element={<AdminManageRooms />} />
        <Route path="users" element={<AdminManageUsers />} />
        <Route path="reports" element={<AdminManageReportedContent />} />
      </Route>
    </Routes>
  );
}

export default App;
