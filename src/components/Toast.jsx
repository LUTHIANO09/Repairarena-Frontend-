import { useState, useEffect } from "react";

// ── TOAST COMPONENT ───────────────────────────────────
export function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000); // auto-dismiss after 4 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: { bg: "#012E33", border: "#02C39A", icon: "✅" },
    error:   { bg: "#2C0A0A", border: "#E74C3C", icon: "❌" },
    warning: { bg: "#2C1A00", border: "#F39C12", icon: "⚠️" },
    info:    { bg: "#012E33", border: "#028090", icon: "ℹ️" },
  };

  const c = colors[type] || colors.info;

  return (
    <div style={{
      position: "fixed", top: "20px", right: "20px", zIndex: 9999,
      backgroundColor: c.bg, border: `1.5px solid ${c.border}`,
      borderRadius: "12px", padding: "14px 18px",
      maxWidth: "320px", minWidth: "240px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
      display: "flex", alignItems: "flex-start", gap: "12px",
      animation: "slideIn 0.3s ease",
    }}>
      <span style={{ fontSize: "20px", flexShrink: 0 }}>{c.icon}</span>
      <div style={{ flex: 1 }}>
        <p style={{
          margin: 0, fontSize: "14px", fontWeight: "600",
          color: "#FFFFFF", lineHeight: "1.4"
        }}>
          {message}
        </p>
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none", border: "none", color: "#B7E4E0",
          fontSize: "18px", cursor: "pointer", padding: "0",
          flexShrink: 0, lineHeight: 1,
        }}
      >
        ×
      </button>
      {/* Progress bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0,
        height: "3px", backgroundColor: c.border,
        borderRadius: "0 0 12px 12px",
        animation: "shrink 4s linear forwards",
        width: "100%",
      }} />
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// ── TOAST HOOK — use this in any page ─────────────────
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  };

  const hideToast = () => setToast(null);

  const ToastContainer = () =>
    toast ? <Toast key={toast.id} message={toast.message} type={toast.type} onClose={hideToast} /> : null;

  return { showToast, ToastContainer };
}

// ── FRIENDLY ERROR PARSER ─────────────────────────────
// Converts raw Django errors into human-friendly messages
export function parseError(err) {
  const data = err?.response?.data;
  if (!data) return "Something went wrong. Please try again.";

  // Handle specific known errors
  const raw = JSON.stringify(data).toLowerCase();

  if (raw.includes("unique constraint") || raw.includes("already exists") || raw.includes("already submitted")) {
    if (raw.includes("quote")) return "You have already submitted a quote for this job.";
    if (raw.includes("username")) return "This username is already taken. Please choose another.";
    if (raw.includes("phone")) return "This phone number is already registered.";
    if (raw.includes("profile")) return "Profile already exists for this account.";
    return "This record already exists.";
  }

  if (raw.includes("invalid credentials") || raw.includes("unable to log in")) {
    return "Invalid username or password. Please try again.";
  }

  if (raw.includes("password") && raw.includes("match")) {
    return "Passwords do not match. Please try again.";
  }

  if (raw.includes("required")) {
    return "Please fill in all required fields.";
  }

  if (raw.includes("verification") || raw.includes("not approved")) {
    return "Your account is pending verification. Please wait for admin approval.";
  }

  if (raw.includes("authentication credentials")) {
    return "Please log in to continue.";
  }

  if (raw.includes("token")) {
    return "Session expired. Please log in again.";
  }

  // Fall back to first readable message from Django
  if (typeof data === "object") {
    const firstKey = Object.keys(data)[0];
    const firstVal = data[firstKey];
    if (Array.isArray(firstVal)) return firstVal[0];
    if (typeof firstVal === "string") return firstVal;
  }

  if (typeof data === "string") return data;
  return "Something went wrong. Please try again.";
}