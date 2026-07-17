import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { resetPassword } from "../services/api";
import { useToast, parseError } from "../components/Toast";

export default function ResetPasswordPage() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [formData, setFormData] = useState({ new_password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      showToast("Passwords do not match.", "error");
      return;
    }
    if (formData.new_password.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(uid, token, formData);
      setDone(true);
      showToast("Password reset successfully! Redirecting to login...", "success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      showToast(parseError(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.container}>
      <ToastContainer />
      <div style={S.header}>
        <h1 style={S.logo}>RepairArenaNG</h1>
        <p style={S.tagline}>Set New Password</p>
      </div>

      <div style={S.card}>
        {!done ? (
          <>
            <h2 style={S.title}>Create New Password</h2>
            <p style={S.sub}>Choose a strong password with at least 8 characters.</p>
            <form onSubmit={handleSubmit}>
              <div style={S.field}>
                <label style={S.label}>New Password</label>
                <input
                  style={S.input}
                  type="password"
                  name="new_password"
                  placeholder="Minimum 8 characters"
                  value={formData.new_password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={S.field}>
                <label style={S.label}>Confirm New Password</label>
                <input
                  style={S.input}
                  type="password"
                  name="confirm_password"
                  placeholder="Repeat your new password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password strength indicator */}
              {formData.new_password && (
                <div style={S.strengthRow}>
                  {["Weak", "Fair", "Good", "Strong"].map((level, i) => {
                    const strength = formData.new_password.length >= 12 ? 3
                      : formData.new_password.length >= 10 ? 2
                      : formData.new_password.length >= 8 ? 1 : 0;
                    const colors = ["#E74C3C", "#F39C12", "#02C39A", "#27AE60"];
                    return (
                      <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 2,
                        backgroundColor: i <= strength ? colors[strength] : "#DCEEEC",
                        transition: "background-color 0.3s",
                      }} />
                    );
                  })}
                </div>
              )}

              <button
                type="submit"
                style={loading ? { ...S.btn, opacity: 0.7 } : S.btn}
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#02C39A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h3 style={{ fontSize: 18, fontWeight: "bold", color: "#012E33", margin: "0 0 8px" }}>
              Password Reset!
            </h3>
            <p style={{ fontSize: 14, color: "#5C7A78" }}>
              Redirecting you to login...
            </p>
          </div>
        )}

        <p style={S.backLink}>
          <Link to="/login" style={S.link}>← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

const S = {
  container: {
    minHeight: "100vh", backgroundColor: "#012E33",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "20px", fontFamily: "Arial, sans-serif",
  },
  header: { textAlign: "center", marginBottom: 32 },
  logo: { fontSize: 28, fontWeight: "bold", color: "#02C39A", margin: 0 },
  tagline: { fontSize: 13, color: "#B7E4E0", marginTop: 6 },
  card: {
    backgroundColor: "#FFFFFF", borderRadius: 14,
    padding: "36px 32px", width: "100%",
    maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#012E33", margin: "0 0 8px" },
  sub: { fontSize: 14, color: "#5C7A78", margin: "0 0 24px", lineHeight: 1.5 },
  field: { marginBottom: 20 },
  label: { display: "block", fontSize: 13, fontWeight: "600", color: "#012E33", marginBottom: 6 },
  input: {
    width: "100%", padding: "12px 14px",
    border: "1.5px solid #DCEEEC", borderRadius: 8,
    fontSize: 14, color: "#012E33", outline: "none",
    backgroundColor: "#F4FBFA", boxSizing: "border-box",
  },
  strengthRow: { display: "flex", gap: 4, marginBottom: 16 },
  btn: {
    width: "100%", padding: "13px",
    backgroundColor: "#028090", color: "#FFFFFF",
    border: "none", borderRadius: 8,
    fontSize: 15, fontWeight: "bold", cursor: "pointer",
  },
  backLink: { textAlign: "center", marginTop: 24, fontSize: 13 },
  link: { color: "#028090", fontWeight: "bold", textDecoration: "none" },
};