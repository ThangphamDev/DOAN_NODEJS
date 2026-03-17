import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App.jsx";
import { AuthProvider } from "@/context/AuthContext.jsx";
import { NotifyProvider } from "@/context/NotifyContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <NotifyProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </NotifyProvider>
    </BrowserRouter>
  </StrictMode>,
);
