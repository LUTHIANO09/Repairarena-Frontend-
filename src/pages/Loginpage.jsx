import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import { useToast, parseError } from "../components/Toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await loginUser(formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("justLoggedIn", response.data.user.username);
      const userType = response.data.user.user_type;
      navigate(
        userType === "customer" ? "/customer/dashboard" :
        userType === "artisan"  ? "/artisan/dashboard"  : "/"
      );
    } catch (err) {
      showToast(parseError(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <ToastContainer />
      <div style={styles.header}>
        <h1 style={styles.logo}>RepairArenaNG</h1>
        <p style={styles.tagline}>Connecting you to verified, trusted Artisans</p>
      </div>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Log in to your account</p>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input} type="text" name="username"
              placeholder="Enter your username"
              value={formData.username} onChange={handleChange} required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input} type="password" name="password"
              placeholder="Enter your password"
              value={formData.password} onChange={handleChange} required
            />
          </div>

          <div style={{ textAlign: "right", marginBottom: 20, marginTop: -14 }}>
            <Link to="/forgot-password" style={{ fontSize: 12, color: "#028090", fontWeight: "600", textDecoration: "none" }}>
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <p style={styles.switchText}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh", backgroundColor: "#012E33",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "20px", fontFamily: "Arial, sans-serif",
  },
  header: { textAlign: "center", marginBottom: "32px" },
  logo: { fontSize: "32px", fontWeight: "bold", color: "#02C39A", margin: 0 },
  tagline: { fontSize: "14px", color: "#B7E4E0", marginTop: "8px" },
  card: {
    backgroundColor: "#FFFFFF", borderRadius: "16px",
    padding: "40px", width: "100%", maxWidth: "420px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  title: { fontSize: "24px", fontWeight: "bold", color: "#012E33", margin: "0 0 8px 0" },
  subtitle: { fontSize: "14px", color: "#5C7A78", margin: "0 0 24px 0" },
  inputGroup: { marginBottom: "20px" },
  label: {
    display: "block", fontSize: "14px",
    fontWeight: "600", color: "#012E33", marginBottom: "6px",
  },
  input: {
    width: "100%", padding: "12px 16px",
    border: "1.5px solid #DCEEEC", borderRadius: "8px",
    fontSize: "14px", color: "#012E33", outline: "none",
    boxSizing: "border-box", backgroundColor: "#F4FBFA",
  },
  button: {
    width: "100%", padding: "14px", backgroundColor: "#028090",
    color: "#FFFFFF", border: "none", borderRadius: "8px",
    fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "8px",
  },
  switchText: { textAlign: "center", marginTop: "24px", fontSize: "14px", color: "#5C7A78" },
  link: { color: "#028090", fontWeight: "bold", textDecoration: "none" },
};