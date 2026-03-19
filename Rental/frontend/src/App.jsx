import { Outlet, Route, Routes } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import LandlordLayout from "@/components/layout/LandlordLayout";
import AppLayout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppointmentsPage from "@/pages/AppointmentsPage";
import ChatPage from "@/pages/ChatPage";
import FavoritesPage from "@/pages/FavoritesPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import ProfilePage from "@/pages/ProfilePage";
import RegisterPage from "@/pages/RegisterPage";
import RoomDetailPage from "@/pages/RoomDetailPage";
import RoomsPage from "@/pages/RoomsPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminManageReportedContent from "@/pages/admin/ManageReportedContentPage";
import AdminManageRooms from "@/pages/admin/ManageRoomsPage";
import AdminManageUsers from "@/pages/admin/ManageUsersPage";
import LandlordDashboardPage from "@/pages/landlord/LandlordDashboardPage";
import LandlordManageAppointments from "@/pages/landlord/ManageAppointmentsPage";
import LandlordMessagesPage from "@/pages/landlord/MessagesPage";
import LandlordManageReviews from "@/pages/landlord/ManageReviewsPage";
import LandlordManageRooms from "@/pages/landlord/ManageRoomsPage";

function App() {
  return (
    <Routes>
      <Route
        element={
          <AppLayout>
            <Outlet />
          </AppLayout>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rooms/:id" element={<RoomDetailPage />} />
        <Route
          path="/messages"
          element={
            <ProtectedRoute roles={["customer"]}>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute roles={["customer"]}>
              <AppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute roles={["customer"]}>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={["customer", "landlord"]}>
              <ProfilePage />
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

      <Route path="/admin/login" element={<LoginPage adminOnly />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]} redirectTo="/admin/login">
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
