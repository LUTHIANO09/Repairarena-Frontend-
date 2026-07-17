import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomerProfile } from "../services/api";
import { useToast, parseError } from "../components/Toast";
import api from "../services/api";

export default function EditCustomerProfilePage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    default_address: "",
    latitude: "",
    longitude: "",
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getCustomerProfile();
      const p = res.data;
      setFormData({
        default_address: p.default_address || "",
        latitude: p.latitude || "",
        longitude: p.longitude || "",
      });
      setCurrentPhoto(p.profile_photo);
    } catch (err) {
      showToast("Failed to load profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append("default_address", formData.default_address);
      if (formData.latitude) data.append("latitude", formData.latitude);
      if (formData.longitude) data.append("longitude", formData.longitude);
      if (profilePhoto) data.append("profile_photo", profilePhoto);

      await api.put("/profile/customer/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("Profile updated successfully!", "success");
      setTimeout(() => navigate("/customer/dashboard"), 1200);
    } catch (err) {
      showToast(parseError(err), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={S.centered}>
      <p style={{ color: "#5C7A78" }}>Loading profile...</p>
    </div>
  );

  return (
    <div style={S.wrapper}>
      <ToastContainer />

      {/* Top nav */}
      <div style={S.topNav}>
        <button style={S.backBtn} onClick={() => navigate("/customer/dashboard")}>
          ← Back
        </button>
        <h1 style={S.navTitle}>Edit Profile</h1>
        <div />
      </div>

      <div style={S.content}>
        <form onSubmit={handleSubmit}>

          {/* Profile Photo */}
          <div style={S.card}>
            <h2 style={S.cardTitle}>Profile Photo</h2>
            <p style={S.cardSub}>A photo helps Artisans recognise you</p>
            <div style={S.photoRow}>
              <div style={S.photoCircle}>
                {photoPreview || currentPhoto ? (
                  <img
                    src={photoPreview || `http://127.0.0.1:8000${currentPhoto}`}
                    alt="Profile"
                    style={S.photoImg}
                  />
                ) : (
                  <span style={S.photoInitial}>
                    {user.username?.[0]?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="photo-upload" style={S.photoUploadBtn}>
                  Choose Photo
                </label>
                <p style={S.photoHint}>JPG or PNG, max 5MB</p>
              </div>
            </div>
          </div>

          {/* Account Info (read-only) */}
          <div style={S.card}>
            <h2 style={S.cardTitle}>Account Information</h2>
            <p style={S.cardSub}>Contact your support to change username or phone number</p>
            <div style={S.readOnlyRow}>
              <div style={S.readOnlyItem}>
                <p style={S.readOnlyLabel}>Username</p>
                <p style={S.readOnlyValue}>{user.username}</p>
              </div>
              <div style={S.readOnlyItem}>
                <p style={S.readOnlyLabel}>Phone Number</p>
                <p style={S.readOnlyValue}>{user.phone_number}</p>
              </div>
              <div style={S.readOnlyItem}>
                <p style={S.readOnlyLabel}>Account Type</p>
                <p style={S.readOnlyValue}>Customer</p>
              </div>
            </div>
          </div>

          {/* Default Address */}
          <div style={S.card}>
            <h2 style={S.cardTitle}>Default Address</h2>
            <p style={S.cardSub}>
              Used as a starting point when you post jobs — you can always change it per job
            </p>
            <div style={S.field}>
              <label style={S.label}>Address *</label>
              <input
                style={S.input}
                type="text"
                name="default_address"
                placeholder="e.g. 12 Allen Avenue, Ikeja, Lagos"
                value={formData.default_address}
                onChange={handleChange}
                required
              />
            </div>
            <div style={S.twoCol}>
              <div style={S.field}>
                <label style={S.label}>Latitude (optional)</label>
                <input
                  style={S.input}
                  type="number"
                  name="latitude"
                  placeholder="e.g. 6.6018"
                  value={formData.latitude}
                  onChange={handleChange}
                  step="any"
                />
              </div>
              <div style={S.field}>
                <label style={S.label}>Longitude (optional)</label>
                <input
                  style={S.input}
                  type="number"
                  name="longitude"
                  placeholder="e.g. 3.3515"
                  value={formData.longitude}
                  onChange={handleChange}
                  step="any"
                />
              </div>
            </div>
            <div style={S.infoBox}>
              <p style={S.infoText}>
                Your exact address is never shown publicly. It is only used to help find
                Artisans near you and as a pre-fill when you post a job.
              </p>
            </div>
          </div>

          <button
            type="submit"
            style={saving ? { ...S.saveBtn, opacity: 0.7 } : S.saveBtn}
            disabled={saving}
          >
            {saving ? "Saving changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

const S = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "#F4FBFA",
    fontFamily: "Arial, sans-serif",
    width: "100%",
  },
  centered: {
    minHeight: "100vh", display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  topNav: {
    backgroundColor: "#012E33",
    padding: "0 24px", height: 60,
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    position: "sticky", top: 0, zIndex: 100,
    width: "100%",
  },
  backBtn: {
    background: "none", border: "none",
    color: "#02C39A", fontSize: 14,
    fontWeight: "bold", cursor: "pointer",
  },
  navTitle: {
    color: "#FFFFFF", fontSize: 17,
    fontWeight: "bold", margin: 0,
  },
  content: {
    width: "100%", maxWidth: 720,
    margin: "0 auto", padding: "24px 16px 80px",
  },
  card: {
    backgroundColor: "#FFFFFF", borderRadius: 12,
    padding: "24px", marginBottom: 20,
    border: "1px solid #DCEEEC",
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
    width: "100%",
  },
  cardTitle: {
    fontSize: 16, fontWeight: "bold",
    color: "#012E33", margin: "0 0 4px",
  },
  cardSub: {
    fontSize: 13, color: "#5C7A78", margin: "0 0 16px",
  },
  photoRow: {
    display: "flex", alignItems: "center", gap: 20,
  },
  photoCircle: {
    width: 72, height: 72, borderRadius: "50%",
    backgroundColor: "#028090", flexShrink: 0,
    display: "flex", alignItems: "center",
    justifyContent: "center", overflow: "hidden",
    border: "3px solid #DCEEEC",
  },
  photoImg: {
    width: "100%", height: "100%", objectFit: "cover",
  },
  photoInitial: {
    color: "#FFFFFF", fontSize: 28, fontWeight: "bold",
  },
  photoUploadBtn: {
    display: "inline-block",
    padding: "9px 18px",
    backgroundColor: "#EAF6F4",
    color: "#028090",
    border: "1.5px solid #028090",
    borderRadius: 7, fontSize: 13,
    fontWeight: "600", cursor: "pointer",
    marginBottom: 6,
  },
  photoHint: { fontSize: 12, color: "#5C7A78", margin: 0 },
  readOnlyRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
  },
  readOnlyItem: {
    backgroundColor: "#F4FBFA", borderRadius: 8,
    padding: "12px 14px", border: "1px solid #DCEEEC",
  },
  readOnlyLabel: {
    fontSize: 11, color: "#5C7A78",
    fontWeight: "600", margin: "0 0 4px",
    textTransform: "uppercase", letterSpacing: "0.5px",
  },
  readOnlyValue: {
    fontSize: 14, fontWeight: "bold",
    color: "#012E33", margin: 0,
  },
  field: { marginBottom: 18 },
  label: {
    display: "block", fontSize: 13,
    fontWeight: "600", color: "#012E33", marginBottom: 6,
  },
  input: {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid #DCEEEC", borderRadius: 8,
    fontSize: 14, color: "#012E33", outline: "none",
    backgroundColor: "#F4FBFA", boxSizing: "border-box",
  },
  twoCol: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
  },
  infoBox: {
    backgroundColor: "#EAF6F4", borderRadius: 8,
    padding: "12px 14px", border: "1px solid #DCEEEC",
    marginTop: 4,
  },
  infoText: { fontSize: 12, color: "#5C7A78", margin: 0, lineHeight: 1.5 },
  saveBtn: {
    width: "100%", padding: "14px",
    backgroundColor: "#028090", color: "#FFFFFF",
    border: "none", borderRadius: 8,
    fontSize: 16, fontWeight: "bold", cursor: "pointer",
  },
};