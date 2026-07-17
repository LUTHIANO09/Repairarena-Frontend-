import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { requestPasswordReset } from "../services/api";
import { useToast, parseError } from "../components/Toast";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await requestPasswordReset({ identifier });
      setSent(true);
      // Dev mode — show the link directly
      if (res.data.dev_link) setDevLink(res.data.dev_link);
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
        <p style={S.tagline}>Account Recovery</p>
      </div>

      <div style={S.card}>
        {!sent ? (
          <>
            <h2 style={S.title}>Forgot Password?</h2>
            <p style={S.sub}>
              Enter your username or phone number and we will send you a reset link.
            </p>
            <form onSubmit={handleSubmit}>
              <div style={S.field}>
                <label style={S.label}>Username or Phone Number</label>
                <input
                  style={S.input}
                  type="text"
                  placeholder="e.g. testcustomer or 08012345678"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                style={loading ? { ...S.btn, opacity: 0.7 } : S.btn}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          <div style={S.successBox}>
            <div style={S.successIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#02C39A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3 style={S.successTitle}>Check Your Email</h3>
            <p style={S.successText}>
              If an account with that username or phone number exists, a password reset link has been sent.
            </p>

            {/* Dev mode — show link directly since email isn't configured yet */}
            {devLink && (
              <div style={S.devBox}>
                <p style={S.devLabel}>Development Mode — Reset Link:</p>
                <a href={devLink} style={S.devLink}>
                  Click here to reset your password
                </a>
              </div>
            )}
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
  btn: {
    width: "100%", padding: "13px",
    backgroundColor: "#028090", color: "#FFFFFF",
    border: "none", borderRadius: 8,
    fontSize: 15, fontWeight: "bold", cursor: "pointer",
  },
  successBox: { textAlign: "center", padding: "8px 0" },
  successIcon: { marginBottom: 16 },
  successTitle: { fontSize: 18, fontWeight: "bold", color: "#012E33", margin: "0 0 8px" },
  successText: { fontSize: 14, color: "#5C7A78", lineHeight: 1.6, margin: "0 0 16px" },
  devBox: {
    backgroundColor: "#FFF9E6", border: "1px solid #F39C12",
    borderRadius: 8, padding: "12px 14px", marginTop: 12,
  },
  devLabel: { fontSize: 11, fontWeight: "bold", color: "#8B6914", margin: "0 0 6px" },
  devLink: { fontSize: 13, color: "#028090", fontWeight: "bold", wordBreak: "break-all" },
  backLink: { textAlign: "center", marginTop: 24, fontSize: 13 },
  link: { color: "#028090", fontWeight: "bold", textDecoration: "none" },
};