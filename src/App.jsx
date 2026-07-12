import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import ArtisanDashboard from "./pages/ArtisanDashboard";
import JobDetailPage from "./pages/JobDetailPage";
import VerificationPage from "./pages/VerificationPage";
import LandingPage from "./pages/LandingPage";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page — default */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected */}
        <Route path="/customer/dashboard" element={
          <ProtectedRoute><CustomerDashboard /></ProtectedRoute>
        } />
        <Route path="/customer/job/:id" element={
          <ProtectedRoute><JobDetailPage /></ProtectedRoute>
        } />
        <Route path="/artisan/dashboard" element={
          <ProtectedRoute><ArtisanDashboard /></ProtectedRoute>
        } />
        <Route path="/artisan/verify" element={
          <ProtectedRoute><VerificationPage /></ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}