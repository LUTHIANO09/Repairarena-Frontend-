import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadCertificate, submitGuarantor } from "../services/api";
import { useToast, parseError } from "../components/Toast";

export default function VerificationPage() {
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [path, setPath] = useState(null); // "certificate" or "guarantor"
  const [loading, setLoading] = useState(false);

  // Certificate form state
  const [certFile, setCertFile] = useState(null);
  const [institution, setInstitution] = useState("");
  const [dateIssued, setDateIssued] = useState("");

  // Guarantor form state
  const [guarantorName, setGuarantorName] = useState("");
  const [guarantorPhone, setGuarantorPhone] = useState("");
  const [relationship, setRelationship] = useState("");

  const handleCertSubmit = async (e) => {
    e.preventDefault();
    if (!certFile) {
      showToast("Please select a certificate file.", "warning");
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      data.append("certificate_file", certFile);
      data.append("issuing_institution", institution);
      if (dateIssued) data.append("date_issued", dateIssued);
      await uploadCertificate(data);
      showToast("Certificate uploaded successfully! Admin will review and approve your account.", "success");
      setTimeout(() => navigate("/artisan/dashboard"), 2000);
    } catch (err) {
      showToast(parseError(err), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGuarantorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitGuarantor({
        guarantor_name: guarantorName,
        guarantor_phone: guarantorPhone,
        guarantor_relationship: relationship,
      });
      showToast("Guarantor details submitted! We will contact them to confirm.", "success");
      setTimeout(() => navigate("/artisan/dashboard"), 2000);
    } catch (err) {
      showToast(parseError(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <ToastContainer />

      {/* Header */}
      <div style={styles.topNav}>
        <button style={styles.backBtn} onClick={() => navigate("/artisan/dashboard")}>
          ← Back
        </button>
        <h1 style={styles.navTitle}>Get Verified</h1>
        <div />
      </div>

      <div style={styles.content}>
        {/* Intro */}
        <div style={styles.introBanner}>
          <p style={styles.introIcon}>🛡</p>
          <h2 style={styles.introTitle}>Verify Your Account</h2>
          <p style={styles.introSub}>
            Verified Artisans receive more jobs, higher customer trust, and
            priority in search results. Choose your verification path below.
          </p>
        </div>

        {/* Path selection */}
        {!path && (
          <div>
            <h3 style={styles.sectionTitle}>Choose your verification path</h3>

            <div style={styles.pathCard} onClick={() => setPath("certificate")}>
              <div style={styles.pathIcon}>📜</div>
              <div style={styles.pathContent}>
                <h3 style={styles.pathTitle}>Certificate Path</h3>
                <p style={styles.pathDesc}>
                  Upload a certificate or completion document from a trade school,
                  NABTEB, technical college, or apprenticeship programme.
                </p>
                <span style={styles.pathTag}>Recommended</span>
              </div>
              <span style={styles.pathArrow}>→</span>
            </div>

            <div style={styles.pathCard} onClick={() => setPath("guarantor")}>
              <div style={styles.pathIcon}>🤝</div>
              <div style={styles.pathContent}>
                <h3 style={styles.pathTitle}>Guarantor Path</h3>
                <p style={styles.pathDesc}>
                  No formal certificate? Provide the name and phone number of the
                  master or boss who trained you. We will contact them to confirm.
                </p>
                <span style={styles.pathTagAlt}>For apprenticeship-trained Artisans</span>
              </div>
              <span style={styles.pathArrow}>→</span>
            </div>
          </div>
        )}

        {/* Certificate Form */}
        {path === "certificate" && (
          <div>
            <div style={styles.formHeader}>
              <button style={styles.changeBtn} onClick={() => setPath(null)}>
                ← Change path
              </button>
              <h3 style={styles.formTitle}>📜 Certificate Verification</h3>
            </div>

            <form onSubmit={handleCertSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Certificate / Document *</label>
                <input
                  style={styles.fileInput}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setCertFile(e.target.files[0])}
                  required
                />
                <p style={styles.hint}>
                  Accepted formats: PDF, JPG, PNG. Max 5MB.
                </p>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Issuing Institution *</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="e.g. Lagos State Technical College, NABTEB"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Date Issued (optional)</label>
                <input
                  style={styles.input}
                  type="date"
                  value={dateIssued}
                  onChange={(e) => setDateIssued(e.target.value)}
                />
              </div>

              <div style={styles.infoBox}>
                <p style={styles.infoText}>
                  ℹ️ Your certificate will be reviewed by our admin team within
                  24–48 hours. You will be notified once approved.
                </p>
              </div>

              <button
                type="submit"
                style={loading ? { ...styles.submitBtn, opacity: 0.7 } : styles.submitBtn}
                disabled={loading}
              >
                {loading ? "Uploading..." : "Submit Certificate"}
              </button>
            </form>
          </div>
        )}

        {/* Guarantor Form */}
        {path === "guarantor" && (
          <div>
            <div style={styles.formHeader}>
              <button style={styles.changeBtn} onClick={() => setPath(null)}>
                ← Change path
              </button>
              <h3 style={styles.formTitle}>🤝 Guarantor Verification</h3>
            </div>

            <form onSubmit={handleGuarantorSubmit}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Guarantor Full Name *</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="Full name of your master/boss"
                  value={guarantorName}
                  onChange={(e) => setGuarantorName(e.target.value)}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Guarantor Phone Number *</label>
                <input
                  style={styles.input}
                  type="tel"
                  placeholder="e.g. 08012345678"
                  value={guarantorPhone}
                  onChange={(e) => setGuarantorPhone(e.target.value)}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Your Relationship</label>
                <input
                  style={styles.input}
                  type="text"
                  placeholder="e.g. Master who trained me, Former employer"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                />
              </div>

              <div style={styles.infoBox}>
                <p style={styles.infoText}>
                  ℹ️ We will contact your guarantor by phone or SMS to confirm
                  your training. Please inform them to expect our call.
                  Approval takes 24–48 hours.
                </p>
              </div>

              <button
                type="submit"
                style={loading ? { ...styles.submitBtn, opacity: 0.7 } : styles.submitBtn}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Guarantor Details"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh", backgroundColor: "#F4FBFA",
    fontFamily: "Arial, sans-serif",
  },
  topNav: {
    backgroundColor: "#012E33", padding: "16px 20px",
    display: "flex", justifyContent: "space-between",
    alignItems: "center", position: "sticky", top: 0, zIndex: 100,
  },
  backBtn: {
    backgroundColor: "transparent", border: "none",
    color: "#02C39A", fontSize: "14px",
    fontWeight: "bold", cursor: "pointer", padding: 0,
  },
  navTitle: { color: "#FFFFFF", fontSize: "18px", fontWeight: "bold", margin: 0 },
  content: { padding: "20px", maxWidth: "560px", margin: "0 auto" },
  introBanner: {
    backgroundColor: "#012E33", borderRadius: "12px",
    padding: "24px", marginBottom: "24px", textAlign: "center",
  },
  introIcon: { fontSize: "36px", margin: "0 0 8px 0" },
  introTitle: { color: "#FFFFFF", fontSize: "20px", fontWeight: "bold", margin: "0 0 8px 0" },
  introSub: { color: "#B7E4E0", fontSize: "13px", margin: 0, lineHeight: "1.5" },
  sectionTitle: {
    fontSize: "16px", fontWeight: "bold",
    color: "#012E33", marginBottom: "16px",
  },
  pathCard: {
    backgroundColor: "#FFFFFF", borderRadius: "12px",
    padding: "20px", marginBottom: "16px",
    display: "flex", alignItems: "center", gap: "16px",
    cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1.5px solid #DCEEEC",
  },
  pathIcon: { fontSize: "32px", flexShrink: 0 },
  pathContent: { flex: 1 },
  pathTitle: { fontSize: "16px", fontWeight: "bold", color: "#012E33", margin: "0 0 6px 0" },
  pathDesc: { fontSize: "13px", color: "#5C7A78", margin: "0 0 8px 0", lineHeight: "1.4" },
  pathTag: {
    fontSize: "11px", fontWeight: "bold",
    backgroundColor: "#EAF6F4", color: "#028090",
    padding: "3px 10px", borderRadius: "20px",
    border: "1px solid #DCEEEC",
  },
  pathTagAlt: {
    fontSize: "11px", fontWeight: "bold",
    backgroundColor: "#FFF9E6", color: "#8B6914",
    padding: "3px 10px", borderRadius: "20px",
    border: "1px solid #F39C12",
  },
  pathArrow: { fontSize: "20px", color: "#028090", flexShrink: 0 },
  formHeader: { marginBottom: "20px" },
  changeBtn: {
    backgroundColor: "transparent", border: "none",
    color: "#028090", fontSize: "13px",
    cursor: "pointer", padding: "0 0 8px 0",
    fontWeight: "bold",
  },
  formTitle: { fontSize: "18px", fontWeight: "bold", color: "#012E33", margin: 0 },
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
  fileInput: {
    width: "100%", padding: "10px",
    border: "1.5px dashed #028090", borderRadius: "8px",
    fontSize: "13px", color: "#028090",
    boxSizing: "border-box", backgroundColor: "#EAF6F4", cursor: "pointer",
  },
  hint: { fontSize: "12px", color: "#5C7A78", marginTop: "6px" },
  infoBox: {
    backgroundColor: "#EAF6F4", borderRadius: "8px",
    padding: "14px", marginBottom: "20px",
    border: "1px solid #DCEEEC",
  },
  infoText: { fontSize: "13px", color: "#028090", margin: 0, lineHeight: "1.5" },
  submitBtn: {
    width: "100%", padding: "14px", backgroundColor: "#028090",
    color: "#FFFFFF", border: "none", borderRadius: "8px",
    fontSize: "16px", fontWeight: "bold", cursor: "pointer",
  },
};