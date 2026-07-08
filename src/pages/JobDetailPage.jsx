import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobDetail, getQuotesForJob, acceptQuote } from "../services/api";
import { useToast, parseError } from "../components/Toast";

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [job, setJob] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null); // quote id being accepted

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [jobRes, quotesRes] = await Promise.all([
        getJobDetail(id),
        getQuotesForJob(id),
      ]);
      setJob(jobRes.data);
      setQuotes(quotesRes.data);
    } catch (err) {
      showToast("Failed to load job details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async (quoteId, artisanName, price) => {
    setAccepting(quoteId);
    try {
      await acceptQuote(quoteId);
      showToast(
        `Quote accepted! ${artisanName} is now confirmed for your job.`,
        "success"
      );
      setTimeout(() => navigate("/customer/dashboard"), 1500);
    } catch (err) {
      showToast(parseError(err), "error");
    } finally {
      setAccepting(null);
    }
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

  if (loading) return (
    <div style={styles.centered}>
      <p style={{ color: "#5C7A78" }}>Loading job details...</p>
    </div>
  );

  if (!job) return (
    <div style={styles.centered}>
      <p style={{ color: "#E74C3C" }}>Job not found.</p>
      <button style={styles.backBtn} onClick={() => navigate("/customer/dashboard")}>
        ← Back to Dashboard
      </button>
    </div>
  );

  return (
    <div style={styles.wrapper}>
      <ToastContainer />

      {/* TOP NAV */}
      <div style={styles.topNav}>
        <button style={styles.navBack} onClick={() => navigate("/customer/dashboard")}>
          ← Back
        </button>
        <h1 style={styles.navTitle}>Job Details</h1>
        <div />
      </div>

      <div style={styles.content}>

        {/* JOB SUMMARY CARD */}
        <div style={styles.jobCard}>
          <div style={styles.jobCardTop}>
            <span style={styles.jobCategory}>{job.category?.name || "Service"}</span>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: getStatusColor(job.status) + "20",
              color: getStatusColor(job.status),
            }}>
              {getStatusLabel(job.status)}
            </span>
          </div>
          <p style={styles.jobDesc}>{job.description}</p>
          <p style={styles.jobLocation}>📍 {job.area_label || job.address_text}</p>
          {(job.budget_min || job.budget_max) && (
            <p style={styles.jobBudget}>
              Budget: ₦{job.budget_min || "?"} — ₦{job.budget_max || "?"}
            </p>
          )}
          <p style={styles.jobDate}>
            Posted: {new Date(job.created_at).toLocaleDateString()}
          </p>

          {/* Reference photo */}
          {job.reference_photo && (
            <div style={styles.referenceBox}>
              <p style={styles.referenceLabel}>📸 Reference photo (desired result)</p>
              <img
                src={`http://127.0.0.1:8000${job.reference_photo}`}
                alt="Reference"
                style={styles.referenceImg}
              />
              {job.reference_note && (
                <p style={styles.referenceNote}>"{job.reference_note}"</p>
              )}
            </div>
          )}
        </div>

        {/* QUOTES SECTION */}
        <h2 style={styles.sectionTitle}>
          {quotes.length === 0
            ? "No quotes yet"
            : `${quotes.length} Quote${quotes.length > 1 ? "s" : ""} Received`}
        </h2>

        {quotes.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyIcon}>⏳</p>
            <p style={styles.emptyText}>Waiting for Artisans to quote</p>
            <p style={styles.emptyHint}>
              Verified Artisans near you will submit quotes shortly.
            </p>
          </div>
        ) : (
          quotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              jobStatus={job.status}
              accepting={accepting}
              onAccept={handleAcceptQuote}
            />
          ))
        )}

        {/* JOB STATUS TRACKER */}
{job.status !== "open" && job.status !== "quoted" && (
  <div style={styles.statusTrackerCard}>
    <h2 style={styles.sectionTitle}>Job Status</h2>

    {/* Status steps */}
    {[
      { key: "confirmed",           label: "Confirmed" },
      { key: "en_route",            label: "Artisan En Route" },
      { key: "arrived",             label: "Artisan Arrived" },
      { key: "in_progress",         label: "Work In Progress" },
      { key: "pending_confirmation",label: "Work Done" },
      { key: "completed",           label: "Completed ✅" },
    ].map((step, index) => {
      const statusOrder = ["confirmed","en_route","arrived","in_progress","pending_confirmation","completed"];
     const currentIndex = statusOrder.indexOf(job.job_status || job.status);
      const stepIndex = statusOrder.indexOf(step.key);
      const isDone = stepIndex <= currentIndex;
      const isCurrent = step.key === job.status;

      return (
        <div key={step.key} style={styles.statusStep}>
          <div style={{
            ...styles.statusDot,
            backgroundColor: isDone ? "#02C39A" : "#DCEEEC",
            border: isCurrent ? "3px solid #028090" : "none",
          }} />
          <span style={{
            ...styles.statusStepLabel,
            color: isDone ? "#012E33" : "#95A5A6",
            fontWeight: isCurrent ? "bold" : "normal",
          }}>
            {step.label}
            {isCurrent && " ← Current"}
          </span>
        </div>
      );
    })}

    {/* Confirm completion button */}
    {(job.job_status === "pending_confirmation") && (
      <div style={styles.confirmBox}>
        <p style={styles.confirmText}>
          🎉 The Artisan has marked the work as done. Please confirm if you are satisfied.
        </p>
        <button
          style={styles.confirmBtn}
          onClick={async () => {
            try {
              const { updateJobStatus, confirmPortfolioPhoto } = await import("../services/api");
              await updateJobStatus(job.job_id, "completed");
              // Try to confirm portfolio photo if it exists
              try {
                await confirmPortfolioPhoto(job.id);
              } catch (e) {
                // No portfolio photo yet — that's fine
              }
              showToast("Job confirmed as complete! Payment has been released to the Artisan.", "success");
              setTimeout(() => navigate("/customer/dashboard"), 2000);
            } catch (err) {
              showToast(parseError(err), "error");
            }
          }}
        >
          ✅ Confirm Job Complete & Release Payment
        </button>

        <button
          style={styles.disputeBtn}
          onClick={() => showToast("Dispute feature coming soon. Please contact support.", "warning")}
        >
          ⚠️ Raise a Dispute
        </button>
      </div>
    )}

    {(job.job_status === "completed") && (
      <div style={styles.completedBox}>
        <p style={styles.completedText}>
          ✅ Job completed! Payment has been released to the Artisan.
        </p>
        {!job.review && (
            <ReviewForm jobId={job.job_id} showToast={showToast} onSuccess={fetchData} />
        )}
      </div>
    )}
  </div>
)}
      </div>
    </div>
  );
}

// ── REVIEW FORM ───────────────────────────────────────
function ReviewForm({ jobId, showToast, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      showToast("Please select a star rating.", "warning");
      return;
    }
    setLoading(true);
    try {
      const { submitReview } = await import("../services/api");
      await submitReview(jobId, { rating, comment });
      showToast("Review submitted! Thank you for your feedback.", "success");
      setSubmitted(true);
      onSuccess();
    } catch (err) {
      showToast("Failed to submit review. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return (
    <div style={{ textAlign: "center", padding: "16px" }}>
      <p style={{ color: "#27AE60", fontWeight: "bold" }}>⭐ Review submitted! Thank you.</p>
    </div>
  );

  return (
    <div style={reviewStyles.box}>
      <h3 style={reviewStyles.title}>Leave a Review</h3>
      <p style={reviewStyles.sub}>How was the Artisan's work?</p>

      {/* Star rating */}
      <div style={reviewStyles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            style={{
              ...reviewStyles.star,
              color: star <= rating ? "#F39C12" : "#DCEEEC",
            }}
            onClick={() => setRating(star)}
          >
            ★
          </button>
        ))}
      </div>
      <p style={reviewStyles.ratingLabel}>
        {rating === 0 ? "Tap to rate" :
         rating === 1 ? "Poor" :
         rating === 2 ? "Fair" :
         rating === 3 ? "Good" :
         rating === 4 ? "Very Good" : "Excellent!"}
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          style={reviewStyles.input}
          placeholder="Write a comment about the Artisan's work (optional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
        <button
          type="submit"
          style={loading ? { ...reviewStyles.btn, opacity: 0.7 } : reviewStyles.btn}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}

const reviewStyles = {
  box: {
    backgroundColor: "#F4FBFA", borderRadius: "10px",
    padding: "20px", marginTop: "16px",
    border: "1px solid #DCEEEC",
  },
  title: { fontSize: "16px", fontWeight: "bold", color: "#012E33", margin: "0 0 4px 0" },
  sub: { fontSize: "13px", color: "#5C7A78", margin: "0 0 16px 0" },
  stars: { display: "flex", gap: "8px", marginBottom: "8px" },
  star: {
    fontSize: "36px", background: "none", border: "none",
    cursor: "pointer", padding: "0", lineHeight: 1,
  },
  ratingLabel: { fontSize: "13px", color: "#5C7A78", margin: "0 0 16px 0" },
  input: {
    width: "100%", padding: "12px", border: "1.5px solid #DCEEEC",
    borderRadius: "8px", fontSize: "13px", color: "#012E33",
    backgroundColor: "#FFFFFF", boxSizing: "border-box",
    resize: "vertical", fontFamily: "Arial, sans-serif",
    marginBottom: "12px", outline: "none",
  },
  btn: {
    width: "100%", padding: "12px", backgroundColor: "#028090",
    color: "#fff", border: "none", borderRadius: "8px",
    fontSize: "14px", fontWeight: "bold", cursor: "pointer",
  },
};


// ── QUOTE CARD ────────────────────────────────────────
function QuoteCard({ quote, jobStatus, accepting, onAccept }) {
  const [expanded, setExpanded] = useState(false);
  const isAccepted = quote.status === "accepted";
  const isRejected = quote.status === "rejected";
  const canAccept = jobStatus === "open" || jobStatus === "quoted";

  return (
    <div style={{
      ...cardStyles.card,
      border: isAccepted ? "2px solid #02C39A" : "1px solid #DCEEEC",
      backgroundColor: isAccepted ? "#F0FDF9" : "#FFFFFF",
    }}>
      {/* Quote header */}
      <div style={cardStyles.header}>
        <div style={cardStyles.artisanRow}>
          <div style={cardStyles.avatar}>
            {quote.artisan_name?.[0]?.toUpperCase() || "A"}
          </div>
          <div>
            <p style={cardStyles.artisanName}>{quote.artisan_name}</p>
            <p style={cardStyles.artisanRating}>⭐ {quote.artisan_rating} rating</p>
          </div>
        </div>
        <div style={cardStyles.priceCol}>
          <p style={cardStyles.price}>₦{Number(quote.quoted_price).toLocaleString()}</p>
          <p style={cardStyles.priceLabel}>Total Price</p>
        </div>
      </div>

      {/* Status badge */}
      {isAccepted && (
        <div style={cardStyles.acceptedBadge}>✅ Quote Accepted</div>
      )}
      {isRejected && (
        <div style={cardStyles.rejectedBadge}>Quote Not Selected</div>
      )}

      {/* Quick info */}
      <div style={cardStyles.quickInfo}>
        <span style={cardStyles.infoItem}>
          🕐 {quote.estimated_duration_hours
            ? `${quote.estimated_duration_hours}h`
            : quote.estimated_duration_days
            ? `${quote.estimated_duration_days} day(s)`
            : "Duration TBD"}
        </span>
        <span style={cardStyles.infoItem}>
          📅 Starts: {quote.availability === "today" ? "Today"
            : quote.availability === "tomorrow" ? "Tomorrow"
            : quote.custom_start_date || "Custom"}
        </span>
        {quote.has_warranty && (
          <span style={cardStyles.infoItem}>
            🛡 {quote.warranty_days}-day guarantee
          </span>
        )}
      </div>

      {/* Expand/collapse details */}
      <button style={cardStyles.expandBtn} onClick={() => setExpanded(!expanded)}>
        {expanded ? "Hide details ▲" : "View full quote ▼"}
      </button>

      {expanded && (
        <div style={cardStyles.details}>
          <div style={cardStyles.detailSection}>
            <p style={cardStyles.detailTitle}>📋 Scope of Work</p>
            <p style={cardStyles.detailText}>{quote.scope_of_work}</p>
          </div>
          {quote.materials_needed && (
            <div style={cardStyles.detailSection}>
              <p style={cardStyles.detailTitle}>🔧 Materials to be Brought</p>
              <p style={cardStyles.detailText}>{quote.materials_needed}</p>
            </div>
          )}
          <div style={cardStyles.priceBreakdown}>
            <div style={cardStyles.priceRow}>
              <span>Labour Cost</span>
              <span>₦{Number(quote.labour_cost).toLocaleString()}</span>
            </div>
            {quote.materials_cost > 0 && (
              <div style={cardStyles.priceRow}>
                <span>Materials Cost</span>
                <span>₦{Number(quote.materials_cost).toLocaleString()}</span>
              </div>
            )}
            <div style={{ ...cardStyles.priceRow, fontWeight: "bold", color: "#028090" }}>
              <span>Total</span>
              <span>₦{Number(quote.quoted_price).toLocaleString()}</span>
            </div>
          </div>
          {quote.additional_notes && (
            <div style={cardStyles.detailSection}>
              <p style={cardStyles.detailTitle}>📝 Additional Notes</p>
              <p style={cardStyles.detailText}>{quote.additional_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Accept button */}
      {canAccept && !isAccepted && !isRejected && (
        <button
          style={accepting === quote.id
            ? { ...cardStyles.acceptBtn, opacity: 0.7 }
            : cardStyles.acceptBtn}
          onClick={() => onAccept(quote.id, quote.artisan_name, quote.quoted_price)}
          disabled={accepting === quote.id}
        >
          {accepting === quote.id ? "Accepting..." : "✓ Accept This Quote"}
        </button>
      )}
    </div>
  );
}

const cardStyles = {
  card: {
    borderRadius: "12px", padding: "16px",
    marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "12px",
  },
  artisanRow: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: {
    width: "44px", height: "44px", borderRadius: "50%",
    backgroundColor: "#028090", color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "18px", fontWeight: "bold", flexShrink: 0,
  },
  artisanName: { fontSize: "15px", fontWeight: "bold", color: "#012E33", margin: "0 0 2px 0" },
  artisanRating: { fontSize: "12px", color: "#5C7A78", margin: 0 },
  priceCol: { textAlign: "right" },
  price: { fontSize: "20px", fontWeight: "bold", color: "#028090", margin: "0 0 2px 0" },
  priceLabel: { fontSize: "11px", color: "#5C7A78", margin: 0 },
  acceptedBadge: {
    backgroundColor: "#D4EDDA", color: "#27AE60",
    borderRadius: "6px", padding: "6px 12px",
    fontSize: "13px", fontWeight: "bold",
    marginBottom: "10px", textAlign: "center",
  },
  rejectedBadge: {
    backgroundColor: "#F8F9FA", color: "#95A5A6",
    borderRadius: "6px", padding: "6px 12px",
    fontSize: "13px", marginBottom: "10px", textAlign: "center",
  },
  quickInfo: {
    display: "flex", flexWrap: "wrap", gap: "8px",
    marginBottom: "12px",
  },
  infoItem: {
    fontSize: "12px", color: "#5C7A78",
    backgroundColor: "#F4FBFA", padding: "4px 10px",
    borderRadius: "20px", border: "1px solid #DCEEEC",
  },
  expandBtn: {
    backgroundColor: "transparent", border: "none",
    color: "#028090", fontSize: "13px", fontWeight: "bold",
    cursor: "pointer", padding: "4px 0", marginBottom: "8px",
  },
  details: {
    backgroundColor: "#F4FBFA", borderRadius: "8px",
    padding: "14px", marginBottom: "12px",
  },
  detailSection: { marginBottom: "12px" },
  detailTitle: {
    fontSize: "12px", fontWeight: "bold",
    color: "#028090", margin: "0 0 4px 0",
  },
  detailText: { fontSize: "13px", color: "#0B2B2E", margin: 0, lineHeight: "1.5" },
  priceBreakdown: {
    backgroundColor: "#FFFFFF", borderRadius: "6px",
    padding: "10px 14px", marginBottom: "12px",
    border: "1px solid #DCEEEC",
  },
  priceRow: {
    display: "flex", justifyContent: "space-between",
    fontSize: "13px", color: "#5C7A78", padding: "4px 0",
  },
  acceptBtn: {
    width: "100%", padding: "12px", backgroundColor: "#028090",
    color: "#fff", border: "none", borderRadius: "8px",
    fontSize: "15px", fontWeight: "bold", cursor: "pointer",
    marginTop: "4px",
  },
};

const styles = {
  wrapper: {
    minHeight: "100vh", backgroundColor: "#F4FBFA",
    fontFamily: "Arial, sans-serif", paddingBottom: "40px",
  },
  topNav: {
    backgroundColor: "#012E33", padding: "16px 20px",
    display: "flex", justifyContent: "space-between",
    alignItems: "center", position: "sticky", top: 0, zIndex: 100,
  },
  navBack: {
    backgroundColor: "transparent", border: "none",
    color: "#02C39A", fontSize: "14px", fontWeight: "bold",
    cursor: "pointer", padding: 0,
  },
  navTitle: { color: "#FFFFFF", fontSize: "18px", fontWeight: "bold", margin: 0 },
  content: { padding: "20px", maxWidth: "600px", margin: "0 auto" },
  jobCard: {
    backgroundColor: "#FFFFFF", borderRadius: "12px",
    padding: "20px", marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #DCEEEC",
  },
  jobCardTop: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: "12px",
  },
  jobCategory: { fontSize: "14px", fontWeight: "bold", color: "#028090" },
  statusBadge: {
    fontSize: "11px", fontWeight: "bold",
    padding: "4px 10px", borderRadius: "20px",
  },
  jobDesc: { fontSize: "14px", color: "#0B2B2E", margin: "0 0 10px 0", lineHeight: "1.5" },
  jobLocation: { fontSize: "13px", color: "#028090", margin: "0 0 6px 0" },
  jobBudget: { fontSize: "13px", color: "#02C39A", fontWeight: "bold", margin: "0 0 6px 0" },
  jobDate: { fontSize: "12px", color: "#95A5A6", margin: 0 },
  referenceBox: {
    marginTop: "16px", padding: "12px",
    backgroundColor: "#EAF6F4", borderRadius: "8px",
    border: "1px solid #DCEEEC",
  },
  referenceLabel: { fontSize: "12px", fontWeight: "bold", color: "#028090", margin: "0 0 8px 0" },
  referenceImg: {
    width: "100%", borderRadius: "6px",
    maxHeight: "200px", objectFit: "cover",
  },
  referenceNote: {
    fontSize: "12px", color: "#5C7A78",
    fontStyle: "italic", margin: "8px 0 0 0",
  },
  sectionTitle: {
    fontSize: "18px", fontWeight: "bold",
    color: "#012E33", marginBottom: "16px",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF", borderRadius: "12px",
    padding: "32px", textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  emptyIcon: { fontSize: "40px", margin: "0 0 8px 0" },
  emptyText: { fontSize: "16px", fontWeight: "bold", color: "#012E33", margin: "0 0 4px 0" },
  emptyHint: { fontSize: "13px", color: "#5C7A78", margin: 0 },
  centered: {
    minHeight: "100vh", display: "flex",
    flexDirection: "column", alignItems: "center",
    justifyContent: "center", fontFamily: "Arial, sans-serif",
  },
  backBtn: {
    marginTop: "16px", padding: "10px 24px",
    backgroundColor: "#028090", color: "#fff",
    border: "none", borderRadius: "8px",
    fontSize: "14px", cursor: "pointer",
  },

  statusTrackerCard: {
  backgroundColor: "#FFFFFF", borderRadius: "12px",
  padding: "20px", marginBottom: "24px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  border: "1px solid #DCEEEC",
},
statusStep: {
  display: "flex", alignItems: "center",
  gap: "12px", marginBottom: "12px",
},
statusDot: {
  width: "16px", height: "16px",
  borderRadius: "50%", flexShrink: 0,
},
statusStepLabel: { fontSize: "14px" },
confirmBox: {
  backgroundColor: "#EAF6F4", borderRadius: "10px",
  padding: "16px", marginTop: "20px",
  border: "1px solid #02C39A",
},
confirmText: {
  fontSize: "14px", color: "#012E33",
  margin: "0 0 16px 0", lineHeight: "1.5",
},
confirmBtn: {
  width: "100%", padding: "14px", backgroundColor: "#02C39A",
  color: "#012E33", border: "none", borderRadius: "8px",
  fontSize: "15px", fontWeight: "bold", cursor: "pointer",
  marginBottom: "10px",
},
disputeBtn: {
  width: "100%", padding: "12px", backgroundColor: "transparent",
  color: "#E67E22", border: "1.5px solid #E67E22",
  borderRadius: "8px", fontSize: "14px", fontWeight: "bold",
  cursor: "pointer",
},
completedBox: {
  backgroundColor: "#D4EDDA", borderRadius: "10px",
  padding: "16px", marginTop: "20px",
  border: "1px solid #27AE60",
},
completedText: {
  fontSize: "14px", color: "#27AE60",
  fontWeight: "bold", margin: "0 0 8px 0",
},

};

