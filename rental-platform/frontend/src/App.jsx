import { Route, Routes } from "react-router-dom";
import "@/App.css";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ChatPage from "@/pages/ChatPage";
import HomePage from "@/pages/HomePage";
import RoomDetailPage from "@/pages/RoomDetailPage";
import DashboardPageLandlord from "@/pages/landlord/LandlordDashboardPage";
import DashboardPageAdmin from "@/pages/admin/AdminDashboardPage";
import AppLayout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/rooms/:id" element={<RoomDetailPage />} />
        <Route
          path="/landlord"
          element={
            <ProtectedRoute roles={["landlord"]}>
              <DashboardPageLandlord />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <DashboardPageAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute roles={["customer", "landlord"]}>
              <ChatPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AppLayout>
  );
}

export default App;
