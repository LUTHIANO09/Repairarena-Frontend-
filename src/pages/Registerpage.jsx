import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  registerUser, getTerms, agreeToTerms,
  createCustomerProfile, createArtisanProfile
} from "../services/api";
import { useToast, parseError } from "../components/Toast";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "", phone_number: "", user_type: "customer",
    password: "", password2: "",
  });
  const [profileData, setProfileData] = useState({
    default_address: "", latitude: "", longitude: "",
    bio: "", years_of_experience: "",
  });
  const [terms, setTerms] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });

  // ── STEP 1: REGISTER ──
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      showToast("Passwords do not match. Please try again.", "error");
      return;
    }
    setLoading(true);
    try {
      const response = await registerUser(formData);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      showToast("Account created! Please review our Terms & Conditions.", "success");
      const termsResponse = await getTerms(formData.user_type);
      setTerms(termsResponse.data);
      setStep(2);
    } catch (err) {
      showToast(parseError(err), "error");
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2: AGREE TO TERMS ──
  const handleAgreeTerms = async () => {
    if (!agreedToTerms) {
      showToast("You must agree to the Terms & Conditions to continue.", "warning");
      return;
    }
    setLoading(true);
    try {
      await agreeToTerms(terms.id);
      showToast("Terms accepted! Complete your profile to get started.", "success");
      setStep(3);
    } catch (err) {
      showToast(parseError(err), "error");
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 3: PROFILE SETUP ──
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.user_type === "customer") {
        await createCustomerProfile({
          default_address: profileData.default_address,
          latitude: profileData.latitude || null,
          longitude: profileData.longitude || null,
        });
      } else {
        await createArtisanProfile({
          bio: profileData.bio,
          years_of_experience: profileData.years_of_experience,
        });
      }
      showToast("Profile set up! Welcome to RepairArenaNG.", "success");
      localStorage.setItem("justLoggedIn", formData.username);
      setTimeout(() => {
        if (formData.user_type === "customer") navigate("/customer/dashboard");
        else navigate("/artisan/dashboard");
      }, 1000);
    } catch (err) {
      showToast(parseError(err), "error");
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 1: REGISTER FORM ──
  if (step === 1) return (
    <div style={styles.container}>
      <ToastContainer />
      <div style={styles.header}>
        <h1 style={styles.logo}>RepairArenaNG</h1>
        <p style={styles.tagline}>Join Nigeria's most trusted Artisan marketplace</p>
      </div>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Sign up to get started</p>
        <form onSubmit={handleRegisterSubmit}>
          <div style={styles.toggleRow}>
            <button type="button"
              style={formData.user_type === "customer" ? styles.toggleActive : styles.toggleInactive}
              onClick={() => setFormData({ ...formData, user_type: "customer" })}>
              I need a service
            </button>
            <button type="button"
              style={formData.user_type === "artisan" ? styles.toggleActive : styles.toggleInactive}
              onClick={() => setFormData({ ...formData, user_type: "artisan" })}>
              I am an Artisan
            </button>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input style={styles.input} type="text" name="username"
              placeholder="Choose a username" value={formData.username}
              onChange={handleChange} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number</label>
            <input style={styles.input} type="tel" name="phone_number"
              placeholder="e.g. 08012345678" value={formData.phone_number}
              onChange={handleChange} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" name="password"
              placeholder="Minimum 8 characters" value={formData.password}
              onChange={handleChange} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input style={styles.input} type="password" name="password2"
              placeholder="Repeat your password" value={formData.password2}
              onChange={handleChange} required />
          </div>
          <button type="submit"
            style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}
            disabled={loading}>
            {loading ? "Creating account..." : "Continue"}
          </button>
        </form>
        <p style={styles.switchText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  );

  // ── STEP 2: TERMS MODAL ──
  if (step === 2) return (
    <div style={styles.container}>
      <ToastContainer />
      <div style={styles.modalOverlay}>
        <div style={styles.modal}>
          <h2 style={styles.modalTitle}>Terms & Conditions</h2>
          <p style={styles.modalVersion}>
            Version {terms?.version} — {terms?.effective_date}
          </p>
          <div style={styles.termsScroll}>
            {terms?.content || "Loading terms..."}
          </div>
          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              style={{ marginRight: "10px", width: "18px", height: "18px" }}
            />
            <span style={{ fontSize: "14px", color: "#012E33" }}>
              I have read and agree to the Terms & Conditions
            </span>
          </label>
          <div style={styles.modalButtons}>
            <button style={styles.cancelButton}
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setStep(1);
              }}>
              Back
            </button>
            <button
              style={agreedToTerms
                ? { ...styles.button, width: "48%", marginTop: 0 }
                : { ...styles.button, width: "48%", marginTop: 0, opacity: 0.5, cursor: "not-allowed" }}
              onClick={handleAgreeTerms}
              disabled={!agreedToTerms || loading}>
              {loading ? "Processing..." : "Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── STEP 3: PROFILE SETUP ──
  if (step === 3) return (
    <div style={styles.container}>
      <ToastContainer />
      <div style={styles.header}>
        <h1 style={styles.logo}>RepairArenaNG</h1>
        <p style={styles.tagline}>Almost done — complete your profile</p>
      </div>
      <div style={styles.card}>
        <h2 style={styles.title}>
          {formData.user_type === "customer" ? "Your Location" : "Your Trade Info"}
        </h2>
        <p style={styles.subtitle}>
          {formData.user_type === "customer"
            ? "This helps us find Artisans near you"
            : "Tell customers about your skills"}
        </p>
        <form onSubmit={handleProfileSubmit}>
          {formData.user_type === "customer" ? (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Your Default Address</label>
              <input style={styles.input} type="text" name="default_address"
                placeholder="e.g. 12 Allen Avenue, Ikeja, Lagos"
                value={profileData.default_address}
                onChange={handleProfileChange} required />
              <p style={styles.hint}>
                Used as a starting point when you post jobs — always editable per job.
              </p>
            </div>
          ) : (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Bio</label>
                <textarea
                  style={{ ...styles.input, height: "80px", resize: "vertical" }}
                  name="bio"
                  placeholder="Tell customers about your skills and experience..."
                  value={profileData.bio}
                  onChange={handleProfileChange}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Years of Experience</label>
                <input style={styles.input} type="number" name="years_of_experience"
                  placeholder="e.g. 5" value={profileData.years_of_experience}
                  onChange={handleProfileChange} required />
              </div>
            </>
          )}
          <button type="submit"
            style={loading ? { ...styles.button, opacity: 0.7 } : styles.button}
            disabled={loading}>
            {loading ? "Saving..." : "Go to Dashboard"}
          </button>
        </form>
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
  toggleRow: { display: "flex", gap: "8px", marginBottom: "20px" },
  toggleActive: {
    flex: 1, padding: "10px", backgroundColor: "#028090",
    color: "#fff", border: "none", borderRadius: "8px",
    fontWeight: "bold", cursor: "pointer", fontSize: "13px",
  },
  toggleInactive: {
    flex: 1, padding: "10px", backgroundColor: "#EAF6F4",
    color: "#028090", border: "1.5px solid #028090",
    borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "13px",
  },
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
  hint: { fontSize: "12px", color: "#5C7A78", marginTop: "6px" },
  button: {
    width: "100%", padding: "14px", backgroundColor: "#028090",
    color: "#FFFFFF", border: "none", borderRadius: "8px",
    fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "8px",
  },
  cancelButton: {
    width: "48%", padding: "14px", backgroundColor: "#EAF6F4",
    color: "#028090", border: "1.5px solid #028090",
    borderRadius: "8px", fontSize: "15px", fontWeight: "bold", cursor: "pointer",
  },
  switchText: { textAlign: "center", marginTop: "24px", fontSize: "14px", color: "#5C7A78" },
  link: { color: "#028090", fontWeight: "bold", textDecoration: "none" },
  modalOverlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "20px", zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff", borderRadius: "16px",
    padding: "32px", width: "100%", maxWidth: "520px",
    maxHeight: "85vh", display: "flex", flexDirection: "column",
  },
  modalTitle: { fontSize: "22px", fontWeight: "bold", color: "#012E33", margin: "0 0 4px 0" },
  modalVersion: { fontSize: "12px", color: "#5C7A78", margin: "0 0 16px 0" },
  termsScroll: {
    flex: 1, overflowY: "auto", border: "1px solid #DCEEEC",
    borderRadius: "8px", padding: "16px", fontSize: "13px",
    lineHeight: "1.6", color: "#0B2B2E", marginBottom: "16px",
    backgroundColor: "#F4FBFA",
  },
  checkboxRow: {
    display: "flex", alignItems: "center",
    marginBottom: "20px", cursor: "pointer",
  },
  modalButtons: { display: "flex", gap: "12px" },
};