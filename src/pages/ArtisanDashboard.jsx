import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getJobs, getArtisanProfile, toggleAvailability,
  submitQuote, getArtisanActiveJobs, updateJobStatus
} from "../services/api";
import { useToast, parseError } from "../components/Toast";

export default function ArtisanDashboard() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [activeTab, setActiveTab] = useState("home");
  const [profile, setProfile] = useState(null);
  const [openJobs, setOpenJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchData();
    const justLoggedIn = localStorage.getItem("justLoggedIn");
    if (justLoggedIn) {
      showToast(`Welcome back, ${justLoggedIn}! 🔧`, "success");
      localStorage.removeItem("justLoggedIn");
    }
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, jobsRes, myJobsRes] = await Promise.all([
        getArtisanProfile(),
        getJobs(),
        getArtisanActiveJobs(),
      ]);
      setProfile(profileRes.data);
      setOpenJobs(jobsRes.data);
      setMyJobs(myJobsRes.data);
    } catch (err) {
      showToast("Failed to load data. Please refresh.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const res = await toggleAvailability();
      setProfile({ ...profile, is_available: res.data.is_available });
      showToast(
        res.data.is_available
          ? "You are now Online — you will receive job requests."
          : "You are now Offline — you will not receive job requests.",
        "info"
      );
    } catch (err) {
      showToast("Failed to update availability. Please try again.", "error");
    }
  };

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      await updateJobStatus(jobId, newStatus);
      showToast(`Job status updated to: ${newStatus.replace(/_/g, " ")}`, "success");
      fetchData();
    } catch (err) {
      showToast(parseError(err), "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: "#028090", en_route: "#F39C12",
      arrived: "#8E44AD", in_progress: "#E67E22",
      pending_confirmation: "#02C39A", completed: "#27AE60",
      cancelled: "#E74C3C",
    };
    return colors[status] || "#95A5A6";
  };

  const getStatusLabel = (status) => {
    const labels = {
      confirmed: "Confirmed — Ready to go",
      en_route: "En Route",
      arrived: "Arrived",
      in_progress: "In Progress",
      pending_confirmation: "Work Done — Awaiting Customer Confirmation",
      completed: "Completed ✅",
      cancelled: "Cancelled",
    };
    return labels[status] || status;
  };

  const getNextStatus = (current) => {
    const flow = {
      confirmed: { label: "I'm On My Way", next: "en_route" },
      en_route: { label: "I've Arrived", next: "arrived" },
      arrived: { label: "Start Work", next: "in_progress" },
      in_progress: { label: "Mark Work Done", next: "pending_confirmation" },
    };
    return flow[current] || null;
  };

  return (
    <div style={styles.wrapper}>
      <ToastContainer />

      {/* TOP NAV */}
      <div style={styles.topNav}>
        <h1 style={styles.navLogo}>RepairArenaNG</h1>
        <div style={styles.navRight}>
          <span style={styles.navUser}>🔧 {user.username}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={styles.content}>

        {/* HOME TAB */}
        {activeTab === "home" && (
          <div>
            <div style={styles.profileCard}>
              <div style={styles.profileTop}>
                <div>
                  <h2 style={styles.profileName}>{user.username}</h2>
                  <p style={styles.profileSub}>
                    {profile?.verification_status === "approved"
                      ? "✅ Verified Artisan"
                      : "⏳ Verification Pending"}
                  </p>
                </div>
                <div style={styles.ratingBadge}>
                  <span style={styles.ratingNum}>{profile?.average_rating || "0.0"}</span>
                  <span style={styles.ratingStar}>★</span>
                </div>
              </div>

              <div style={styles.availabilityRow}>
                <div>
                  <p style={styles.availLabel}>Availability</p>
                  <p style={styles.availStatus}>
                    {profile?.is_available
                      ? "🟢 Online — receiving jobs"
                      : "🔴 Offline — not receiving jobs"}
                  </p>
                </div>
                <button
                  style={profile?.is_available ? styles.toggleOnline : styles.toggleOffline}
                  onClick={handleToggleAvailability}
                >
                  {profile?.is_available ? "Go Offline" : "Go Online"}
                </button>
              </div>

              <div style={styles.statsRow}>
                <div style={styles.statItem}>
                  <span style={styles.statNum}>{profile?.completed_jobs_count || 0}</span>
                  <span style={styles.statLabel}>Jobs Done</span>
                </div>
                <div style={styles.statDivider} />
                <div style={styles.statItem}>
                  <span style={styles.statNum}>{myJobs.filter(j => !["completed","cancelled"].includes(j.status)).length}</span>
                  <span style={styles.statLabel}>Active</span>
                </div>
                <div style={styles.statDivider} />
                <div style={styles.statItem}>
                  <span style={styles.statNum}>{profile?.average_rating || "0.0"}★</span>
                  <span style={styles.statLabel}>Rating</span>
                </div>
              </div>
            </div>

                {profile?.verification_status !== "approved" && (
                <div style={styles.warningCard}>
                    <p style={styles.warningTitle}>⚠️ Account Pending Verification</p>
                    <p style={styles.warningSub}>
                    Your account is pending admin verification. You will be able
                    to submit quotes once approved.
                    </p>
                    <button
                    style={styles.verifyBtn}
                    onClick={() => navigate("/artisan/verify")}
                    >
                    Get Verified Now →
                    </button>
                </div>
                )}

            {/* Active jobs preview */}
            {myJobs.filter(j => !["completed","cancelled"].includes(j.status)).length > 0 && (
              <>
                <h3 style={styles.sectionTitle}>🔴 Active Jobs</h3>
                {myJobs
                  .filter(j => !["completed","cancelled"].includes(j.status))
                  .slice(0, 2)
                  .map((job) => (
                    <ActiveJobCard
                        key={job.id}
                        job={job}
                        getStatusColor={getStatusColor}
                        getStatusLabel={getStatusLabel}
                        getNextStatus={getNextStatus}
                        onUpdateStatus={handleUpdateStatus}
                        onPhotoUploaded={(msg, type = "success") => showToast(msg, type)}
                    />
                    ))}
                <button style={styles.viewAllBtn} onClick={() => setActiveTab("my-jobs")}>
                  View all my jobs →
                </button>
              </>
            )}

            {/* Open jobs */}
            <h3 style={styles.sectionTitle}>Open Jobs Near You</h3>
            {loading ? (
              <p style={styles.emptyText}>Loading...</p>
            ) : openJobs.length === 0 ? (
              <div style={styles.emptyCard}>
                <p style={styles.emptyIcon}>📋</p>
                <p style={styles.emptyText}>No open jobs right now.</p>
                <p style={styles.emptyHint}>Check back soon!</p>
              </div>
            ) : (
              openJobs.slice(0, 3).map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onQuote={() => {
                    setSelectedJob(job);
                    setActiveTab("submit-quote");
                  }}
                  canQuote={profile?.verification_status === "approved"}
                />
              ))
            )}
            {openJobs.length > 3 && (
              <button style={styles.viewAllBtn} onClick={() => setActiveTab("browse-jobs")}>
                View all {openJobs.length} open jobs →
              </button>
            )}
          </div>
        )}

        {/* MY JOBS TAB */}
        {activeTab === "my-jobs" && (
          <div>
            <h2 style={styles.pageTitle}>My Jobs</h2>
            {myJobs.length === 0 ? (
              <div style={styles.emptyCard}>
                <p style={styles.emptyIcon}>📋</p>
                <p style={styles.emptyText}>No accepted jobs yet.</p>
                <p style={styles.emptyHint}>Submit quotes on open jobs to get started.</p>
              </div>
            ) : (
            myJobs.map((job) => (
            <ActiveJobCard
                key={job.id}
                job={job}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
                getNextStatus={getNextStatus}
                onUpdateStatus={handleUpdateStatus}
                onPhotoUploaded={(msg, type = "success") => showToast(msg, type)}
            />
            ))
            )}
          </div>
        )}

        {/* BROWSE JOBS TAB */}
        {activeTab === "browse-jobs" && (
          <div>
            <h2 style={styles.pageTitle}>Open Jobs</h2>
            {openJobs.length === 0 ? (
              <div style={styles.emptyCard}>
                <p style={styles.emptyIcon}>📋</p>
                <p style={styles.emptyText}>No open jobs right now.</p>
              </div>
            ) : (
              openJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onQuote={() => {
                    setSelectedJob(job);
                    setActiveTab("submit-quote");
                  }}
                  canQuote={profile?.verification_status === "approved"}
                />
              ))
            )}
          </div>
        )}

        {/* SUBMIT QUOTE TAB */}
        {activeTab === "submit-quote" && selectedJob && (
          <QuoteForm
            job={selectedJob}
            onSuccess={() => {
              setSelectedJob(null);
              setActiveTab("home");
              fetchData();
            }}
            onCancel={() => {
              setSelectedJob(null);
              setActiveTab("browse-jobs");
            }}
          />
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div>
            <h2 style={styles.pageTitle}>My Profile</h2>
            <div style={styles.profileDetailCard}>
              <div style={styles.profileDetailRow}>
                <span style={styles.detailLabel}>Username</span>
                <span style={styles.detailValue}>{user.username}</span>
              </div>
              <div style={styles.profileDetailRow}>
                <span style={styles.detailLabel}>Phone</span>
                <span style={styles.detailValue}>{user.phone_number}</span>
              </div>
              <div style={styles.profileDetailRow}>
                <span style={styles.detailLabel}>Verification</span>
                <span style={{
                  ...styles.detailValue,
                  color: profile?.verification_status === "approved" ? "#27AE60" : "#E67E22"
                }}>
                  {profile?.verification_status === "approved" ? "✅ Approved" : "⏳ Pending"}
                </span>
              </div>
              <div style={styles.profileDetailRow}>
                <span style={styles.detailLabel}>Rating</span>
                <span style={styles.detailValue}>{profile?.average_rating || "0.0"} ★</span>
              </div>
              <div style={styles.profileDetailRow}>
                <span style={styles.detailLabel}>Jobs Completed</span>
                <span style={styles.detailValue}>{profile?.completed_jobs_count || 0}</span>
              </div>
              <div style={styles.profileDetailRow}>
                <span style={styles.detailLabel}>Subscription</span>
                <span style={styles.detailValue}>
                  {profile?.subscription_tier === "priority" ? "⭐ Priority" : "Free"}
                </span>
              </div>
            </div>
            <h3 style={styles.sectionTitle}>My Trade Categories</h3>
            <div style={styles.categoriesRow}>
              {profile?.categories?.length > 0
                ? profile.categories.map((cat) => (
                    <span key={cat.id} style={styles.categoryBadge}>{cat.name}</span>
                  ))
                : <p style={styles.emptyHint}>No categories set yet.</p>}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div style={styles.bottomNav}>
        {[
          { key: "home",        icon: "🏠", label: "Home" },
          { key: "my-jobs",     icon: "💼", label: "My Jobs" },
          { key: "browse-jobs", icon: "🔍", label: "Browse" },
          { key: "profile",     icon: "👤", label: "Profile" },
        ].map((tab) => (
          <button
            key={tab.key}
            style={
              activeTab === tab.key ||
              (activeTab === "submit-quote" && tab.key === "browse-jobs")
                ? styles.bottomTabActive
                : styles.bottomTab
            }
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


// ── ACTIVE JOB CARD ───────────────────────────────────
function ActiveJobCard({ job, getStatusColor, getStatusLabel, getNextStatus, onUpdateStatus, onPhotoUploaded }) {  
    const [uploading, setUploading] = useState(false);
  const nextStep = getNextStatus(job.status);
  const statusColor = getStatusColor(job.status);

  return (
    <div style={{
      ...activeCardStyles.card,
      borderLeft: `4px solid ${statusColor}`,
    }}>
      <div style={activeCardStyles.top}>
        <div>
        <p style={activeCardStyles.category}>
        {job.category_name || "Service"}
        </p>
        <p style={activeCardStyles.customer}>
        👤 {job.customer_name}
        </p>
        </div>
        <span style={{
          ...activeCardStyles.statusBadge,
          backgroundColor: statusColor + "20",
          color: statusColor,
        }}>
          {getStatusLabel(job.status)}
        </span>
      </div>

      {/* Price */}
        <p style={activeCardStyles.price}>
        ₦{Number(job.quoted_price || 0).toLocaleString()}
        </p>

      {/* Address — shown once confirmed */}
      {job.destination_address && (
        <div style={activeCardStyles.addressBox}>
          <p style={activeCardStyles.addressLabel}>📍 Job Location</p>
          <p style={activeCardStyles.addressText}>{job.destination_address}</p>
          {job.maps_link && (
            <a
              href={job.maps_link}
              target="_blank"
              rel="noreferrer"
              style={activeCardStyles.mapsLink}
            >
              🗺 Get Directions
            </a>
          )}
        </div>
      )}

      {/* Next action button */}
      {nextStep && (
        <button
          style={activeCardStyles.actionBtn}
          onClick={() => onUpdateStatus(job.id, nextStep.next)}
        >
          {nextStep.label} →
        </button>
      )}

      {/* Work done — upload after photo */}
      {job.status === "pending_confirmation" && (
        <div style={activeCardStyles.uploadBox}>
          <p style={activeCardStyles.uploadLabel}>
            📸 Upload after-photo so customer can confirm
          </p>
          <input
            type="file"
            accept="image/*"
            style={activeCardStyles.fileInput}
                onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                setUploading(true);
                try {
                    const { uploadAfterPhoto } = await import("../services/api");
                    const data = new FormData();
                    data.append("after_photo", file);
                    await uploadAfterPhoto(job.id, data);
                    onPhotoUploaded("After-photo uploaded! The customer will now confirm it.");
                } catch (err) {
                    onPhotoUploaded("Failed to upload photo. Please try again.", "error");
                } finally {
                    setUploading(false);
                }
                }}
          />
          {uploading && <p style={{ fontSize: "12px", color: "#028090" }}>Uploading...</p>}
        </div>
      )}

      {job.status === "completed" && (
        <div style={activeCardStyles.completedBox}>
          <p style={activeCardStyles.completedText}>
            ✅ Job completed! Payment has been released to your account.
          </p>
        </div>
      )}
    </div>
  );
}

const activeCardStyles = {
  card: {
    backgroundColor: "#FFFFFF", borderRadius: "12px",
    padding: "16px", marginBottom: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #DCEEEC",
  },
  top: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "8px",
  },
  category: { fontSize: "14px", fontWeight: "bold", color: "#028090", margin: "0 0 4px 0" },
  customer: { fontSize: "12px", color: "#5C7A78", margin: 0 },
  statusBadge: {
    fontSize: "11px", fontWeight: "bold",
    padding: "4px 10px", borderRadius: "20px", flexShrink: 0,
  },
  price: { fontSize: "18px", fontWeight: "bold", color: "#012E33", margin: "0 0 12px 0" },
  addressBox: {
    backgroundColor: "#EAF6F4", borderRadius: "8px",
    padding: "10px 12px", marginBottom: "12px",
    border: "1px solid #DCEEEC",
  },
  addressLabel: { fontSize: "11px", fontWeight: "bold", color: "#028090", margin: "0 0 4px 0" },
  addressText: { fontSize: "13px", color: "#012E33", margin: "0 0 6px 0" },
  mapsLink: {
    fontSize: "13px", color: "#028090",
    fontWeight: "bold", textDecoration: "none",
    display: "inline-block",
  },
  actionBtn: {
    width: "100%", padding: "12px", backgroundColor: "#028090",
    color: "#fff", border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: "bold", cursor: "pointer",
    marginBottom: "8px",
  },
  uploadBox: {
    backgroundColor: "#FFF9E6", borderRadius: "8px",
    padding: "12px", border: "1px solid #F39C12",
  },
  uploadLabel: { fontSize: "13px", color: "#8B6914", fontWeight: "bold", margin: "0 0 8px 0" },
  fileInput: { width: "100%", fontSize: "13px" },
  completedBox: {
    backgroundColor: "#D4EDDA", borderRadius: "8px",
    padding: "12px", border: "1px solid #27AE60",
  },
  completedText: { fontSize: "13px", color: "#27AE60", fontWeight: "bold", margin: 0 },
  verifyBtn: {
  marginTop: "12px", padding: "10px 20px",
  backgroundColor: "#028090", color: "#fff",
  border: "none", borderRadius: "8px",
  fontSize: "13px", fontWeight: "bold", cursor: "pointer",
},

};


// ── JOB CARD ─────────────────────────────────────────
function JobCard({ job, onQuote, canQuote }) {
  return (
    <div style={cardStyles.card}>
      <div style={cardStyles.top}>
        <span style={cardStyles.category}>{job.category?.name || "Service"}</span>
        <span style={cardStyles.area}>📍 {job.area_label}</span>
      </div>
      <p style={cardStyles.desc}>{job.description}</p>
      {(job.budget_min || job.budget_max) && (
        <p style={cardStyles.budget}>
          Budget: ₦{job.budget_min || "?"} — ₦{job.budget_max || "?"}
        </p>
      )}
      <p style={cardStyles.date}>
        Posted: {new Date(job.created_at).toLocaleDateString()}
      </p>
      <button
        style={canQuote ? cardStyles.quoteBtn : cardStyles.quoteBtnDisabled}
        onClick={canQuote ? onQuote : undefined}
        disabled={!canQuote}
      >
        {canQuote ? "Submit Quote" : "Verification Required"}
      </button>
    </div>
  );
}

const cardStyles = {
  card: {
    backgroundColor: "#FFFFFF", borderRadius: "12px",
    padding: "16px", marginBottom: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #DCEEEC",
  },
  top: { display: "flex", justifyContent: "space-between", marginBottom: "8px" },
  category: { fontSize: "13px", fontWeight: "bold", color: "#028090" },
  area: { fontSize: "12px", color: "#5C7A78" },
  desc: { fontSize: "13px", color: "#0B2B2E", margin: "0 0 8px 0" },
  budget: { fontSize: "12px", color: "#02C39A", fontWeight: "bold", margin: "0 0 4px 0" },
  date: { fontSize: "11px", color: "#95A5A6", margin: "0 0 12px 0" },
  quoteBtn: {
    width: "100%", padding: "10px", backgroundColor: "#028090",
    color: "#fff", border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: "bold", cursor: "pointer",
  },
  quoteBtnDisabled: {
    width: "100%", padding: "10px", backgroundColor: "#DCEEEC",
    color: "#5C7A78", border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: "bold", cursor: "not-allowed",
  },
};


// ── QUOTE FORM ────────────────────────────────────────
function QuoteForm({ job, onSuccess, onCancel }) {
  const { showToast, ToastContainer } = useToast();
  const [formData, setFormData] = useState({
    scope_of_work: "", materials_needed: "",
    labour_cost: "", materials_cost: "0", quoted_price: "",
    estimated_duration_hours: "", estimated_duration_days: "",
    availability: "today", custom_start_date: "",
    has_warranty: false, warranty_days: "", additional_notes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handlePriceChange = (e) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    const labour = parseFloat(updated.labour_cost) || 0;
    const materials = parseFloat(updated.materials_cost) || 0;
    updated.quoted_price = (labour + materials).toString();
    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanData = {};
      Object.keys(formData).forEach((key) => {
        const val = formData[key];
        if (val === "" || val === null) return;
        if (key === "custom_start_date" && formData.availability !== "custom") return;
        if (key === "warranty_days" && !formData.has_warranty) return;
        cleanData[key] = val;
      });
      await submitQuote(job.id, cleanData);
      showToast("Quote submitted successfully! The customer will review it shortly.", "success");
      setTimeout(onSuccess, 1500);
    } catch (err) {
      showToast(parseError(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <div style={styles.formHeader}>
        <button style={styles.backBtn} onClick={onCancel}>← Back</button>
        <h2 style={styles.pageTitle}>Submit Quote</h2>
      </div>
      <div style={styles.jobSummaryCard}>
        <p style={styles.jobSummaryCategory}>{job.category?.name}</p>
        <p style={styles.jobSummaryDesc}>{job.description}</p>
        <p style={styles.jobSummaryArea}>📍 {job.area_label}</p>
        {(job.budget_min || job.budget_max) && (
          <p style={styles.jobSummaryBudget}>
            Customer budget: ₦{job.budget_min} — ₦{job.budget_max}
          </p>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div style={styles.sectionHeader}>📋 Scope of Work</div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>What exactly will you do? *</label>
          <textarea style={{ ...styles.input, height: "80px", resize: "vertical" }}
            name="scope_of_work"
            placeholder="Describe exactly what work you will carry out..."
            value={formData.scope_of_work} onChange={handleChange} required />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Materials you will bring</label>
          <textarea style={{ ...styles.input, height: "60px", resize: "vertical" }}
            name="materials_needed"
            placeholder="List any materials or tools you will supply..."
            value={formData.materials_needed} onChange={handleChange} />
        </div>
        <div style={styles.sectionHeader}>💰 Pricing</div>
        <div style={styles.rowGroup}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Labour Cost (₦) *</label>
            <input style={styles.input} type="number" name="labour_cost"
              placeholder="e.g. 8000" value={formData.labour_cost}
              onChange={handlePriceChange} required />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Materials Cost (₦)</label>
            <input style={styles.input} type="number" name="materials_cost"
              placeholder="e.g. 2000" value={formData.materials_cost}
              onChange={handlePriceChange} />
          </div>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Total Price (₦) *</label>
          <input
            style={{ ...styles.input, backgroundColor: "#EAF6F4", fontWeight: "bold" }}
            type="number" name="quoted_price"
            placeholder="Auto-calculated from above"
            value={formData.quoted_price} onChange={handleChange} required />
          <p style={styles.hint}>Auto-calculated — adjust if needed</p>
        </div>
        <div style={styles.sectionHeader}>⏱ Timeline</div>
        <div style={styles.rowGroup}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Hours</label>
            <input style={styles.input} type="number" name="estimated_duration_hours"
              placeholder="e.g. 3" value={formData.estimated_duration_hours}
              onChange={handleChange} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Days</label>
            <input style={styles.input} type="number" name="estimated_duration_days"
              placeholder="e.g. 1" value={formData.estimated_duration_days}
              onChange={handleChange} />
          </div>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>When can you start? *</label>
          <select style={styles.input} name="availability"
            value={formData.availability} onChange={handleChange}>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="custom">Custom date</option>
          </select>
        </div>
        {formData.availability === "custom" && (
          <div style={styles.inputGroup}>
            <label style={styles.label}>Start Date *</label>
            <input style={styles.input} type="date" name="custom_start_date"
              value={formData.custom_start_date} onChange={handleChange} />
          </div>
        )}
        <div style={styles.sectionHeader}>🛡 Guarantee</div>
        <div style={styles.inputGroup}>
          <label style={styles.checkboxRow}>
            <input type="checkbox" name="has_warranty"
              checked={formData.has_warranty} onChange={handleChange}
              style={{ marginRight: "10px", width: "18px", height: "18px" }} />
            <span style={{ fontSize: "14px", color: "#012E33" }}>I guarantee my work</span>
          </label>
        </div>
        {formData.has_warranty && (
          <div style={styles.inputGroup}>
            <label style={styles.label}>Guarantee period (days)</label>
            <input style={styles.input} type="number" name="warranty_days"
              placeholder="e.g. 30" value={formData.warranty_days}
              onChange={handleChange} />
          </div>
        )}
        <div style={styles.sectionHeader}>📝 Additional Notes</div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Anything else the customer should know?</label>
          <textarea style={{ ...styles.input, height: "60px", resize: "vertical" }}
            name="additional_notes"
            placeholder="e.g. I will need access to the main water valve..."
            value={formData.additional_notes} onChange={handleChange} />
        </div>
        <button type="submit"
          style={loading ? { ...styles.primaryBtn, opacity: 0.7 } : styles.primaryBtn}
          disabled={loading}>
          {loading ? "Submitting..." : "Submit Quote"}
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
  profileCard: {
    backgroundColor: "#012E33", borderRadius: "12px",
    padding: "20px", marginBottom: "20px",
  },
  profileTop: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "16px",
  },
  profileName: { color: "#FFFFFF", fontSize: "20px", margin: "0 0 4px 0", fontWeight: "bold" },
  profileSub: { color: "#B7E4E0", fontSize: "13px", margin: 0 },
  ratingBadge: {
    backgroundColor: "#02C39A", borderRadius: "10px",
    padding: "8px 14px", textAlign: "center",
  },
  ratingNum: { color: "#012E33", fontSize: "20px", fontWeight: "bold", display: "block" },
  ratingStar: { color: "#012E33", fontSize: "14px" },
  availabilityRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "8px",
    padding: "12px 16px", marginBottom: "16px",
  },
  availLabel: { color: "#B7E4E0", fontSize: "12px", margin: "0 0 4px 0" },
  availStatus: { color: "#FFFFFF", fontSize: "13px", fontWeight: "bold", margin: 0 },
  toggleOnline: {
    padding: "8px 16px", backgroundColor: "#E74C3C",
    color: "#fff", border: "none", borderRadius: "6px",
    fontSize: "12px", fontWeight: "bold", cursor: "pointer",
  },
  toggleOffline: {
    padding: "8px 16px", backgroundColor: "#02C39A",
    color: "#012E33", border: "none", borderRadius: "6px",
    fontSize: "12px", fontWeight: "bold", cursor: "pointer",
  },
  statsRow: { display: "flex", justifyContent: "space-around", alignItems: "center" },
  statItem: { textAlign: "center" },
  statNum: { color: "#02C39A", fontSize: "22px", fontWeight: "bold", display: "block" },
  statLabel: { color: "#B7E4E0", fontSize: "11px" },
  statDivider: { width: "1px", height: "30px", backgroundColor: "rgba(255,255,255,0.2)" },
  warningCard: {
    backgroundColor: "#FFF3CD", border: "1px solid #F39C12",
    borderRadius: "10px", padding: "14px", marginBottom: "20px",
  },
  warningTitle: { color: "#8B6914", fontWeight: "bold", margin: "0 0 4px 0", fontSize: "14px" },
  warningSub: { color: "#8B6914", fontSize: "13px", margin: 0 },
  sectionTitle: { fontSize: "16px", fontWeight: "bold", color: "#012E33", marginBottom: "12px" },
  emptyCard: {
    backgroundColor: "#FFFFFF", borderRadius: "12px",
    padding: "32px", textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  emptyIcon: { fontSize: "40px", margin: "0 0 8px 0" },
  emptyText: { fontSize: "16px", fontWeight: "bold", color: "#012E33", margin: "0 0 4px 0" },
  emptyHint: { fontSize: "13px", color: "#5C7A78", margin: 0 },
  viewAllBtn: {
    width: "100%", padding: "12px", backgroundColor: "transparent",
    color: "#028090", border: "1.5px solid #028090",
    borderRadius: "8px", fontSize: "14px", fontWeight: "bold",
    cursor: "pointer", marginTop: "8px", marginBottom: "20px",
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
  jobSummaryCard: {
    backgroundColor: "#EAF6F4", borderRadius: "10px",
    padding: "14px", marginBottom: "20px", border: "1px solid #DCEEEC",
  },
  jobSummaryCategory: { fontSize: "14px", fontWeight: "bold", color: "#028090", margin: "0 0 4px 0" },
  jobSummaryDesc: { fontSize: "13px", color: "#0B2B2E", margin: "0 0 6px 0" },
  jobSummaryArea: { fontSize: "12px", color: "#5C7A78", margin: "0 0 4px 0" },
  jobSummaryBudget: { fontSize: "12px", color: "#02C39A", fontWeight: "bold", margin: 0 },
  sectionHeader: {
    fontSize: "14px", fontWeight: "bold", color: "#028090",
    padding: "8px 0", marginBottom: "12px", borderBottom: "1px solid #DCEEEC",
  },
  inputGroup: { marginBottom: "20px" },
  rowGroup: { display: "flex", gap: "12px", marginBottom: "20px" },
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
  checkboxRow: { display: "flex", alignItems: "center", cursor: "pointer" },
  primaryBtn: {
    width: "100%", padding: "14px", backgroundColor: "#028090",
    color: "#FFFFFF", border: "none", borderRadius: "8px",
    fontSize: "16px", fontWeight: "bold", cursor: "pointer", marginTop: "8px",
  },
  profileDetailCard: {
    backgroundColor: "#FFFFFF", borderRadius: "12px",
    padding: "8px 16px", marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  profileDetailRow: {
    display: "flex", justifyContent: "space-between",
    padding: "12px 0", borderBottom: "1px solid #EAF6F4",
  },
  detailLabel: { fontSize: "13px", color: "#5C7A78" },
  detailValue: { fontSize: "13px", fontWeight: "bold", color: "#012E33" },
  categoriesRow: { display: "flex", flexWrap: "wrap", gap: "8px" },
  categoryBadge: {
    padding: "6px 14px", backgroundColor: "#EAF6F4",
    color: "#028090", borderRadius: "20px",
    fontSize: "13px", fontWeight: "bold", border: "1px solid #DCEEEC",
  },
};