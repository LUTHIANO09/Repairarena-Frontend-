import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getArtisanProfile, getCategories,
  updateArtisanCategories
} from "../services/api";
import { useToast, parseError } from "../components/Toast";
import api from "../services/api";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [formData, setFormData] = useState({
    bio: "",
    years_of_experience: "",
    bank_name: "",
    bank_account_number: "",
    bank_code: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, catsRes] = await Promise.all([
        getArtisanProfile(),
        getCategories(),
      ]);
      const p = profileRes.data;
      setFormData({
        bio: p.bio || "",
        years_of_experience: p.years_of_experience || "",
        bank_name: p.bank_name || "",
        bank_account_number: p.bank_account_number || "",
        bank_code: p.bank_code || "",
      });
      setSelectedCategories(p.categories?.map((c) => c.id) || []);
      setAllCategories(catsRes.data);
    } catch (err) {
      showToast("Failed to load profile data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Update profile fields
      await api.put("/profile/artisan/", formData);
      // Update categories
      await updateArtisanCategories({ category_ids: selectedCategories });
      showToast("Profile updated successfully!", "success");
      setTimeout(() => navigate("/artisan/dashboard"), 1200);
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
        <button style={S.backBtn} onClick={() => navigate("/artisan/dashboard")}>
          ← Back
        </button>
        <h1 style={S.navTitle}>Edit Profile</h1>
        <div />
      </div>

      <div style={S.content}>
        <form onSubmit={handleSubmit}>

          {/* Bio */}
          <div style={S.card}>
            <h2 style={S.cardTitle}>About You</h2>
            <div style={S.field}>
              <label style={S.label}>Bio</label>
              <textarea
                style={S.textarea}
                name="bio"
                placeholder="Tell customers about your skills, experience, and how you work..."
                value={formData.bio}
                onChange={handleChange}
                rows={4}
              />
            </div>
            <div style={S.field}>
              <label style={S.label}>Years of Experience</label>
              <input
                style={S.input}
                type="number"
                name="years_of_experience"
                placeholder="e.g. 5"
                value={formData.years_of_experience}
                onChange={handleChange}
                min="0"
                max="50"
              />
            </div>
          </div>

          {/* Categories */}
          <div style={S.card}>
            <h2 style={S.cardTitle}>Trade Categories</h2>
            <p style={S.cardSub}>Select all categories that apply to your skills</p>
            <div style={S.categoryGrid}>
              {allCategories.map((cat) => {
                const selected = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    style={{
                      ...S.catBtn,
                      backgroundColor: selected ? "#028090" : "#F4FBFA",
                      color: selected ? "#FFFFFF" : "#028090",
                      border: selected ? "1.5px solid #028090" : "1.5px solid #DCEEEC",
                    }}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {selected && <span style={S.catCheck}>✓</span>}
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bank Details */}
          <div style={S.card}>
            <h2 style={S.cardTitle}>Bank Details</h2>
            <p style={S.cardSub}>Used for payouts after job completion</p>
            <div style={S.twoCol}>
              <div style={S.field}>
                <label style={S.label}>Bank Name</label>
                <input
                  style={S.input}
                  type="text"
                  name="bank_name"
                  placeholder="e.g. First Bank"
                  value={formData.bank_name}
                  onChange={handleChange}
                />
              </div>
              <div style={S.field}>
                <label style={S.label}>Bank Code</label>
                <input
                  style={S.input}
                  type="text"
                  name="bank_code"
                  placeholder="e.g. 011"
                  value={formData.bank_code}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div style={S.field}>
              <label style={S.label}>Account Number</label>
              <input
                style={S.input}
                type="text"
                name="bank_account_number"
                placeholder="10-digit account number"
                value={formData.bank_account_number}
                onChange={handleChange}
                maxLength={10}
              />
            </div>
            <div style={S.infoBox}>
              <p style={S.infoText}>
                Your bank details are used only for Paystack payouts. They are stored securely and never shared with customers.
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
    padding: "0 24px",
    height: 60,
    display: "flex",
    alignItems: "center",
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
    width: "100%",
    maxWidth: 720,
    margin: "0 auto",
    padding: "24px 16px 80px",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: "24px",
    marginBottom: 20,
    border: "1px solid #DCEEEC",
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
    width: "100%",
  },
  cardTitle: {
    fontSize: 16, fontWeight: "bold",
    color: "#012E33", margin: "0 0 4px",
  },
  cardSub: {
    fontSize: 13, color: "#5C7A78",
    margin: "0 0 16px",
  },
  field: { marginBottom: 18 },
  label: {
    display: "block", fontSize: 13,
    fontWeight: "600", color: "#012E33",
    marginBottom: 6,
  },
  input: {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid #DCEEEC",
    borderRadius: 8, fontSize: 14,
    color: "#012E33", outline: "none",
    backgroundColor: "#F4FBFA",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid #DCEEEC",
    borderRadius: 8, fontSize: 14,
    color: "#012E33", outline: "none",
    backgroundColor: "#F4FBFA",
    resize: "vertical", lineHeight: 1.5,
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  categoryGrid: {
    display: "flex", flexWrap: "wrap", gap: 10,
  },
  catBtn: {
    padding: "9px 18px", borderRadius: 20,
    fontSize: 13, fontWeight: "600",
    cursor: "pointer", display: "flex",
    alignItems: "center", gap: 6,
    transition: "all 0.2s ease",
  },
  catCheck: { fontSize: 11, fontWeight: "bold" },
  infoBox: {
    backgroundColor: "#EAF6F4",
    borderRadius: 8, padding: "12px 14px",
    border: "1px solid #DCEEEC",
    marginTop: 4,
  },
  infoText: { fontSize: 12, color: "#5C7A78", margin: 0, lineHeight: 1.5 },
  saveBtn: {
    width: "100%", padding: "14px",
    backgroundColor: "#028090",
    color: "#FFFFFF", border: "none",
    borderRadius: 8, fontSize: 16,
    fontWeight: "bold", cursor: "pointer",
    marginTop: 4,
  },
};