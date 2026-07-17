import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import ArtisanDashboard from "./pages/ArtisanDashboard";
import JobDetailPage from "./pages/JobDetailPage";
import VerificationPage from "./pages/VerificationPage";
import LandingPage from "./pages/LandingPage";
import EditProfilePage from "./pages/EditProfilePage";
import EditCustomerProfilePage from "./pages/EditCustomerProfilePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body, #root {
          width: 100%;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
      `}</style>
      <BrowserRouter>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Customer */}
          <Route path="/customer/dashboard" element={
            <ProtectedRoute><CustomerDashboard /></ProtectedRoute>
          } />
          <Route path="/customer/job/:id" element={
            <ProtectedRoute><JobDetailPage /></ProtectedRoute>
          } />

          {/* Artisan */}
          <Route path="/artisan/dashboard" element={
            <ProtectedRoute><ArtisanDashboard /></ProtectedRoute>
          } />
          <Route path="/artisan/verify" element={
            <ProtectedRoute><VerificationPage /></ProtectedRoute>
          } />
          <Route path="/artisan/edit-profile" element={
            <ProtectedRoute><EditProfilePage /></ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />

          <Route path="/customer/edit-profile" element={
            <ProtectedRoute><EditCustomerProfilePage /></ProtectedRoute>
          } />

          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />

        </Routes>
      </BrowserRouter>
    </>
  );
}