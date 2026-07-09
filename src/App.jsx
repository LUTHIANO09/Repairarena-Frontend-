import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import ArtisanDashboard from "./pages/ArtisanDashboard";
import JobDetailPage from "./pages/JobDetailPage";
import VerificationPage from "./pages/VerificationPage";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/customer/dashboard" element={
          <ProtectedRoute><CustomerDashboard /></ProtectedRoute>
        } />
        <Route path="/customer/job/:id" element={
          <ProtectedRoute><JobDetailPage /></ProtectedRoute>
        } />
        <Route path="/artisan/dashboard" element={
          <ProtectedRoute><ArtisanDashboard /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/artisan/verify" element={<ProtectedRoute><VerificationPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}