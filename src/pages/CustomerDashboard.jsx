import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyJobs, getCategories, createJob } from "../services/api";
import { useToast, parseError } from "../components/Toast";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [activeTab, setActiveTab] = useState("home");
  const [jobs, setJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const justLoggedIn = localStorage.getItem("justLoggedIn");
    if (justLoggedIn) {
      showToast(`Welcome back, ${justLoggedIn}! 👋`, "success");
      localStorage.removeItem("justLoggedIn");
    }
  }, []);

  const fetchData = async () => {
    try {
      const [jobsRes, categoriesRes] = await Promise.all([
        getMyJobs(),
        getCategories(),
      ]);
      setJobs(jobsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      showToast("Failed to load data. Please refresh.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "#02C39A", quoted: "#F39C12", confirmed: "#028090",
      in_progress: "#8E44AD", completed: "#27AE60",
      cancelled: "#E74C3C", disputed: "#E67E22",
    };
    return colors[status] || "#95A5A6";
  };

  const getStatusLabel = (status) => {
    const labels = {
      open: "Open — Waiting for quotes",
      quoted: "Quotes received",
      confirmed: "Artisan confirmed",
      in_progress: "Work in progress",
      completed: "Completed",
      cancelled: "Cancelled",
      disputed: "Disputed",
    };
    return labels[status] || status;
  };

  return (
    <div style={styles.wrapper}>
      <ToastContainer />

      {/* TOP NAV */}
      <div style={styles.topNav}>
        <h1 style={styles.navLogo}>RepairArenaNG</h1>
        <div style={styles.navRight}>
          <span style={styles.navUser}>👤 {user.username}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={styles.content}>

        {/* HOME TAB */}
        {activeTab === "home" && (
          <div>
            <div style={styles.welcomeBanner}>
              <h2 style={styles.welcomeTitle}>Welcome back, {user.username}! 👋</h2>
              <p style={styles.welcomeSub}>What do you need fixed today?</p>
            </div>

            <div style={styles.actionCard} onClick={() => setActiveTab("post-job")}>
              <div style={styles.actionIcon}>🔧</div>
              <div>
                <h3 style={styles.actionTitle}>Post a New Job</h3>
                <p style={styles.actionSub}>Get quotes from verified Artisans near you</p>
              </div>
              <span style={styles.actionArrow}>→</span>
            </div>

            <h3 style={styles.sectionTitle}>Your Recent Jobs</h3>
            {loading ? (
              <p style={styles.emptyText}>Loading...</p>
            ) : jobs.length === 0 ? (
              <div style={styles.emptyCard}>
                <p style={styles.emptyIcon}>📋</p>
                <p style={styles.emptyText}>No jobs yet.</p>
                <p style={styles.emptyHint}>Post your first job to get quotes from Artisans!</p>
                <button style={styles.primaryBtn} onClick={() => setActiveTab("post-job")}>
                  Post a Job
                </button>
              </div>
            ) : (
              jobs.slice(0, 3).map((job) => (
                <div key={job.id} style={{...styles.jobCard, cursor: "pointer"}}
                    onClick={() => navigate(`/customer/job/${job.id}`)}>
                  <div style={styles.jobCardTop}>
                    <span style={styles.jobCategory}>{job.category?.name || "Service"}</span>
                    <span style={{
                      ...styles.jobStatus,
                      backgroundColor: getStatusColor(job.status) + "20",
                      color: getStatusColor(job.status),
                    }}>
                      {getStatusLabel(job.status)}
                    </span>
                  </div>
                  <p style={styles.jobDesc}>{job.description?.substring(0, 80)}...</p>
                  <p style={styles.jobLocation}>📍 {job.area_label || job.address_text}</p>
                </div>
              ))
            )}
            {jobs.length > 3 && (
              <button style={styles.viewAllBtn} onClick={() => setActiveTab("my-jobs")}>
                View all {jobs.length} jobs →
              </button>
            )}
          </div>
        )}

        {/* MY JOBS TAB */}
        {activeTab === "my-jobs" && (
          <div>
            <h2 style={styles.pageTitle}>My Jobs</h2>
            {jobs.length === 0 ? (
              <div style={styles.emptyCard}>
                <p style={styles.emptyIcon}>📋</p>
                <p style={styles.emptyText}>No jobs yet.</p>
                <button style={styles.primaryBtn} onClick={() => setActiveTab("post-job")}>
                  Post a Job
                </button>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} style={{...styles.jobCard, cursor: "pointer"}}
                    onClick={() => navigate(`/customer/job/${job.id}`)}>
                  <div style={styles.jobCardTop}>
                    <span style={styles.jobCategory}>{job.category?.name || "Service"}</span>
                    <span style={{
                      ...styles.jobStatus,
                      backgroundColor: getStatusColor(job.status) + "20",
                      color: getStatusColor(job.status),
                    }}>
                      {getStatusLabel(job.status)}
                    </span>
                  </div>
                  <p style={styles.jobDesc}>{job.description}</p>
                  <p style={styles.jobLocation}>📍 {job.area_label || job.address_text}</p>
                  <p style={styles.jobDate}>
                    Posted: {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* POST JOB TAB */}
        {activeTab === "post-job" && (
          <PostJobForm
            categories={categories}
            showToast={showToast}
            onSuccess={() => {
              fetchData();
              setActiveTab("my-jobs");
            }}
            onCancel={() => setActiveTab("home")}
          />
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={styles.bottomNav}>
        {[
          { key: "home", icon: "🏠", label: "Home" },
          { key: "post-job", icon: "➕", label: "Post Job" },
          { key: "my-jobs", icon: "📋", label: "My Jobs" },
        ].map((tab) => (
          <button
            key={tab.key}
            style={activeTab === tab.key ? styles.bottomTabActive : styles.bottomTab}
            onClick={() => setActiveTab(tab.key)}
          >
            <span style={styles.tabIcon}>{tab.icon}</span>
            <span style={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}


// ── POST JOB FORM ─────────────────────────────────────
function PostJobForm({ categories, showToast, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    category_id: "", description: "", address_text: "",
    area_label: "", latitude: "", longitude: "",
    budget_min: "", budget_max: "", reference_note: "",
  });
  const [photos, setPhotos] = useState([]);
  const [referencePhoto, setReferencePhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) data.append(key, formData[key]);
      });
      photos.forEach((photo) => data.append("photos", photo));
      if (referencePhoto) data.append("reference_photo", referencePhoto);
      await createJob(data);
      showToast("Job posted successfully! Waiting for quotes from Artisans.", "success");
      setTimeout(onSuccess, 1000);
    } catch (err) {
      showToast(parseError(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={styles.formHeader}>
        <button style={styles.backBtn} onClick={onCancel}>← Back</button>
        <h2 style={styles.pageTitle}>Post a Job</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>What do you need? *</label>
          <select style={styles.input} name="category_id"
            value={formData.category_id} onChange={handleChange} required>
            <option value="">Select a service category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Describe the problem *</label>
          <textarea
            style={{ ...styles.input, height: "100px", resize: "vertical" }}
            name="description"
            placeholder="e.g. My kitchen sink is leaking under the cabinet..."
            value={formData.description} onChange={handleChange} required
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Job Location (exact address) *</label>
          <input style={styles.input} type="text" name="address_text"
            placeholder="e.g. 12 Allen Avenue, Ikeja, Lagos"
            value={formData.address_text} onChange={handleChange} required />
          <p style={styles.hint}>Only shown to the Artisan once you confirm their quote.</p>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>General Area (shown to all Artisans) *</label>
          <input style={styles.input} type="text" name="area_label"
            placeholder="e.g. Ikeja, Lagos"
            value={formData.area_label} onChange={handleChange} required />
        </div>
        <div style={styles.rowGroup}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Budget Min (₦)</label>
            <input style={styles.input} type="number" name="budget_min"
              placeholder="e.g. 5000"
              value={formData.budget_min} onChange={handleChange} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Budget Max (₦)</label>
            <input style={styles.input} type="number" name="budget_max"
              placeholder="e.g. 15000"
              value={formData.budget_max} onChange={handleChange} />
          </div>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Photos of the problem</label>
          <input style={styles.fileInput} type="file" accept="image/*" multiple
            onChange={(e) => setPhotos(Array.from(e.target.files))} />
          <p style={styles.hint}>Upload photos showing the current issue</p>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Reference photo (optional)</label>
          <input style={styles.fileInput} type="file" accept="image/*"
            onChange={(e) => setReferencePhoto(e.target.files[0])} />
          <p style={styles.hint}>Show the Artisan how you want the finished result to look</p>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Reference note (optional)</label>
          <input style={styles.input} type="text" name="reference_note"
            placeholder="e.g. Similar to this but painted white"
            value={formData.reference_note} onChange={handleChange} />
        </div>
        <button type="submit"
          style={loading ? { ...styles.primaryBtn, opacity: 0.7 } : styles.primaryBtn}
          disabled={loading}>
          {loading ? "Posting..." : "Post Job & Get Quotes"}
        </button>
      </form>
    </div>
  );
}


// ── STYLES ────────────────────────────────────────────
const styles = {
  wrapper: {
    minHeight: "100vh", backgroundColor: "#F4FBFA",
    fontFamily: "Arial, sans-serif", paddingBottom: "80px",
  },
  topNav: {
    backgroundColor: "#012E33", padding: "16px 20px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    position: "sticky", top: 0, zIndex: 100,
  },
  navLogo: { color: "#02C39A", fontSize: "20px", fontWeight: "bold", margin: 0 },
  navRight: { display: "flex", alignItems: "center", gap: "12px" },
  navUser: { color: "#B7E4E0", fontSize: "13px" },
  logoutBtn: {
    padding: "6px 14px", backgroundColor: "transparent",
    color: "#02C39A", border: "1px solid #02C39A",
    borderRadius: "6px", fontSize: "12px", cursor: "pointer",
  },
  content: { padding: "20px", maxWidth: "600px", margin: "0 auto" },
  welcomeBanner: {
    backgroundColor: "#012E33", borderRadius: "12px",
    padding: "20px", marginBottom: "20px",
  },
  welcomeTitle: { color: "#FFFFFF", fontSize: "20px", margin: "0 0 4px 0", fontWeight: "bold" },
  welcomeSub: { color: "#B7E4E0", fontSize: "14px", margin: 0 },
  actionCard: {
    backgroundColor: "#FFFFFF", borderRadius: "12px",
    padding: "16px 20px", marginBottom: "24px",
    display: "flex", alignItems: "center", gap: "16px",
    cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    border: "1.5px solid #DCEEEC",
  },
  actionIcon: { fontSize: "28px" },
  actionTitle: { fontSize: "16px", fontWeight: "bold", color: "#012E33", margin: "0 0 4px 0" },
  actionSub: { fontSize: "13px", color: "#5C7A78", margin: 0 },
  actionArrow: { marginLeft: "auto", fontSize: "20px", color: "#028090" },
  sectionTitle: { fontSize: "16px", fontWeight: "bold", color: "#012E33", marginBottom: "12px" },
  emptyCard: {
    backgroundColor: "#FFFFFF", borderRadius: "12px",
    padding: "32px", textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  emptyIcon: { fontSize: "40px", margin: "0 0 8px 0" },
  emptyText: { fontSize: "16px", fontWeight: "bold", color: "#012E33", margin: "0 0 4px 0" },
  emptyHint: { fontSize: "13px", color: "#5C7A78", margin: "0 0 16px 0" },
  jobCard: {
    backgroundColor: "#FFFFFF", borderRadius: "12px",
    padding: "16px", marginBottom: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #DCEEEC",
  },
  jobCardTop: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: "8px",
  },
  jobCategory: { fontSize: "13px", fontWeight: "bold", color: "#028090" },
  jobStatus: { fontSize: "11px", fontWeight: "bold", padding: "4px 10px", borderRadius: "20px" },
  jobDesc: { fontSize: "13px", color: "#5C7A78", margin: "0 0 8px 0" },
  jobLocation: { fontSize: "12px", color: "#028090", margin: "0 0 4px 0" },
  jobDate: { fontSize: "11px", color: "#95A5A6", margin: 0 },
  viewAllBtn: {
    width: "100%", padding: "12px", backgroundColor: "transparent",
    color: "#028090", border: "1.5px solid #028090",
    borderRadius: "8px", fontSize: "14px", fontWeight: "bold",
    cursor: "pointer", marginTop: "8px",
  },
  bottomNav: {
    position: "fixed", bottom: 0, left: 0, right: 0,
    backgroundColor: "#FFFFFF", borderTop: "1px solid #DCEEEC",
    display: "flex", boxShadow: "0 -2px 10px rgba(0,0,0,0.08)",
  },
  bottomTab: {
    flex: 1, padding: "10px 0", backgroundColor: "transparent",
    border: "none", cursor: "pointer",
    display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
  },
  bottomTabActive: {
    flex: 1, padding: "10px 0", backgroundColor: "#EAF6F4",
    border: "none", cursor: "pointer",
    display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
    borderTop: "2px solid #028090",
  },
  tabIcon: { fontSize: "20px" },
  tabLabel: { fontSize: "10px", color: "#028090", fontWeight: "bold" },
  pageTitle: { fontSize: "22px", fontWeight: "bold", color: "#012E33", marginBottom: "20px" },
  formHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" },
  backBtn: {
    padding: "8px 14px", backgroundColor: "transparent",
    color: "#028090", border: "1px solid #028090",
    borderRadius: "6px", cursor: "pointer", fontSize: "13px",
  },
  inputGroup: { marginBottom: "20px" },
  rowGroup: { display: "flex", gap: "12px", marginBottom: "20px" },
  label: {
    display: "block", fontSize: "14px", fontWeight: "600",
    color: "#012E33", marginBottom: "6px",
  },
  input: {
    width: "100%", padding: "12px 16px",
    border: "1.5px solid #DCEEEC", borderRadius: "8px",
    fontSize: "14px", color: "#012E33", outline: "none",
    boxSizing: "border-box", backgroundColor: "#F4FBFA",
  },
  fileInput: {
    width: "100%", padding: "10px",
    border: "1.5px dashed #028090", borderRadius: "8px",
    fontSize: "13px", color: "#028090",
    boxSizing: "border-box", backgroundColor: "#EAF6F4", cursor: "pointer",
  },
  hint: { fontSize: "12px", color: "#5C7A78", marginTop: "6px" },
  primaryBtn: {
    width: "100%", padding: "14px", backgroundColor: "#028090",
    color: "#FFFFFF", border: "none", borderRadius: "8px",
    fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "8px",
  },
};