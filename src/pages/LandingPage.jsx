import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ── SVG ICON COMPONENTS ──────────────────────────────
const Icon = {
  Shield: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  Lock: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Star: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Camera: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  MessageSquare: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  FileText: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  Search: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  CreditCard: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  UserCheck: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="8.5" cy="7" r="4"/>
      <polyline points="17 11 19 13 23 9"/>
    </svg>
  ),
  Briefcase: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  ),
  DollarSign: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  Award: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/>
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  ),
  Clock: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Phone: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.26h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  Mail: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [activeTab, setActiveTab] = useState("customer");
  const [visibleSections, setVisibleSections] = useState({});
  const [counter, setCounter] = useState({ jobs: 0, artisans: 0, cities: 0 });
  const [statsStarted, setStatsStarted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({ ...prev, [entry.target.dataset.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll("[data-id]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsStarted) {
          setStatsStarted(true);
          const animate = (key, end, duration) => {
            const start = Date.now();
            const timer = setInterval(() => {
              const p = Math.min((Date.now() - start) / duration, 1);
              const e = 1 - Math.pow(1 - p, 3);
              setCounter((prev) => ({ ...prev, [key]: Math.floor(end * e) }));
              if (p === 1) clearInterval(timer);
            }, 16);
          };
          animate("jobs", 1200, 2000);
          animate("artisans", 350, 2000);
          animate("cities", 12, 2000);
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [statsStarted]);

  const vis = (id) => !!visibleSections[id];

  const fadeUp = (id, delay = 0) => ({
    opacity: vis(id) ? 1 : 0,
    transform: vis(id) ? "translateY(0)" : "translateY(32px)",
    transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
  });

  const fadeLeft = (id, delay = 0) => ({
    opacity: vis(id) ? 1 : 0,
    transform: vis(id) ? "translateX(0)" : "translateX(-40px)",
    transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
  });

  const fadeRight = (id, delay = 0) => ({
    opacity: vis(id) ? 1 : 0,
    transform: vis(id) ? "translateX(0)" : "translateX(40px)",
    transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
  });

  const customerSteps = [
    { icon: <Icon.FileText />, num: "01", title: "Post a Job", desc: "Describe the work needed, upload photos of the problem, and optionally show what the finished result should look like." },
    { icon: <Icon.MessageSquare />, num: "02", title: "Compare Quotes", desc: "Verified Artisans submit structured quotes — scope, price, timeline, and warranty. Compare every detail side by side." },
    { icon: <Icon.MapPin />, num: "03", title: "Track in Real Time", desc: "Accept the best quote and track your Artisan live through every stage — confirmed, en route, arrived, in progress, done." },
    { icon: <Icon.CreditCard />, num: "04", title: "Pay Securely", desc: "Pay via card, bank transfer, or USSD. Funds are held safely and released only after you confirm the work is done right." },
  ];

  const artisanSteps = [
    { icon: <Icon.UserCheck />, num: "01", title: "Register & Verify", desc: "Sign up and complete verification via your trade certificate or a guarantor reference. Reviewed and approved within 48 hours." },
    { icon: <Icon.Search />, num: "02", title: "Browse Open Jobs", desc: "Go online and see job requests near you in your trade category. Each listing shows the area and customer's budget range." },
    { icon: <Icon.FileText />, num: "03", title: "Submit Your Quote", desc: "Fill in a structured quotation form covering scope, labour cost, materials, timeline, and your workmanship guarantee." },
    { icon: <Icon.Award />, num: "04", title: "Build Your Reputation", desc: "Completed jobs automatically add before/after photos to your public portfolio — a verifiable professional record that travels with you." },
  ];

  const features = [
    { icon: <Icon.Shield />, title: "Dual-Path Verification", desc: "Every Artisan is verified before taking a job — via trade certificate or a confirmed guarantor reference. No unverified strangers in your home.", color: "#02C39A" },
    { icon: <Icon.MessageSquare />, title: "Structured Quotations", desc: "Artisans fill a standard form covering scope, materials, labour, timeline, and warranty. Compare quotes like-for-like, not guesses.", color: "#028090" },
    { icon: <Icon.Lock />, title: "Escrow Payments", desc: "Payment is held securely in the platform and only released to the Artisan after you confirm the work has been done satisfactorily.", color: "#8E44AD" },
    { icon: <Icon.Camera />, title: "Verified Portfolio", desc: "Before and after photos from real completed jobs build each Artisan's public profile — independently confirmed by the customer.", color: "#E74C3C" },
    { icon: <Icon.MapPin />, title: "Live Job Tracking", desc: "Follow your Artisan's progress through six real-time status stages from confirmation to job completion.", color: "#F39C12" },
    { icon: <Icon.Star />, title: "Tamper-Proof Reviews", desc: "Only customers who completed a verified job can leave a review. Ratings reflect real outcomes, not anonymous opinions.", color: "#028090" },
  ];

  const artisanBenefits = [
    "A steady stream of verified job leads in your trade category",
    "A professional portfolio that grows automatically with every job",
    "Structured quotes that help you win jobs and appear credible",
    "Secure, prompt payouts directly to your bank account",
    "Ratings and reviews that build a reputation that travels with you",
  ];

  const testimonials = [
    { name: "Ngozi Eze", role: "Homeowner · Victoria Island", text: "I found a verified plumber in under 10 minutes. The escrow payment gave me complete confidence. I will never go back to roadside Artisans.", initial: "N" },
    { name: "Emeka Okafor", role: "Landlord · Lekki Phase 1", text: "Managing repairs across three properties used to be chaotic. RepairArenaNG keeps every job in one place. The job history alone is invaluable.", initial: "E" },
    { name: "Adewale Fashola", role: "Electrician · Ikeja", text: "Since joining I receive three to five job requests every week. The portfolio feature has helped me close larger contracts I would never have won before.", initial: "A" },
  ];

  return (
    <div style={S.page}>

      {/* ─── KEYFRAMES ─────────────────────────────── */}
      <style>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulseRing {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          50% { opacity: 0.22; transform: scale(1.04); }
        }
        @keyframes progressAnim {
          0% { width: 0%; }
          100% { width: 68%; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50% { transform: translateY(7px); opacity: 0.2; }
        }
        a { text-decoration: none; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ─── NAVBAR ─────────────────────────────────── */}
      <nav style={{
        ...S.nav,
        backgroundColor: scrollY > 60 ? "rgba(1,46,51,0.96)" : "transparent",
        backdropFilter: scrollY > 60 ? "blur(12px)" : "none",
        borderBottom: scrollY > 60 ? "1px solid rgba(255,255,255,0.08)" : "none",
      }}>
        <div style={S.navInner}>
          <span style={S.navLogo}>RepairArenaNG</span>

          {/* Desktop links */}
          <div style={S.navLinks}>
            <a href="#how-it-works" style={S.navLink}>How It Works</a>
            <a href="#features" style={S.navLink}>Features</a>
            <a href="#for-artisans" style={S.navLink}>For Artisans</a>
          </div>
          <div style={S.navActions}>
            <button style={S.navLoginBtn} onClick={() => navigate("/login")}>Log In</button>
            <button style={S.navSignupBtn} onClick={() => navigate("/register")}>
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <button style={S.mobileMenuBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Icon.Menu />
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div style={S.mobileMenu}>
            <a href="#how-it-works" style={S.mobileLink} onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#features" style={S.mobileLink} onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#for-artisans" style={S.mobileLink} onClick={() => setMobileMenuOpen(false)}>For Artisans</a>
            <button style={S.mobileCTA} onClick={() => navigate("/register")}>Get Started</button>
          </div>
        )}
      </nav>

      {/* ─── HERO ────────────────────────────────────── */}
      <section style={S.hero}>
        {/* Ambient background rings */}
        <div style={{ ...S.ring, width: 700, height: 700, top: -200, right: -200, animationDelay: "0s" }} />
        <div style={{ ...S.ring, width: 440, height: 440, bottom: -120, left: -120, animationDelay: "2s" }} />

        <div style={S.heroInner}>
          {/* Left — copy */}
          <div style={S.heroLeft}>
            <div style={S.heroPill}>
              <span style={S.heroPillDot} />
              Nigeria's Trusted Artisan Marketplace
            </div>
            <h1 style={S.heroH1}>
              Verified Artisans.<br />
              <span style={S.heroAccent}>On Demand.</span>
            </h1>
            <p style={S.heroP}>
              Connect with verified plumbers, electricians, carpenters, and AC technicians.
              Compare structured quotes, track jobs live, and pay only when the work is done right.
            </p>
            <div style={S.heroCTAs}>
              <button style={S.heroPrimary} onClick={() => navigate("/register")}>
                <span>Find an Artisan</span>
                <Icon.ArrowRight />
              </button>
              <button style={S.heroSecondary} onClick={() => navigate("/register")}>
                Join as an Artisan
              </button>
            </div>
            <div style={S.heroTrustRow}>
              {[
                { icon: <Icon.Shield />, text: "Verified Artisans" },
                { icon: <Icon.Lock />, text: "Escrow Protected" },
                { icon: <Icon.Star />, text: "Real Reviews" },
              ].map((t, i) => (
                <div key={i} style={S.trustItem}>
                  <span style={S.trustIcon}>{t.icon}</span>
                  <span style={S.trustText}>{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating UI cards */}
          <div style={S.heroRight}>
            {/* Card 1 — artisan profile */}
            <div style={{ ...S.hCard, animation: "floatY 5s ease-in-out infinite", animationDelay: "0s" }}>
              <div style={S.hCardRow}>
                <div style={S.hAvatar}>M</div>
                <div style={{ flex: 1 }}>
                  <p style={S.hName}>Musa Abdullahi</p>
                  <p style={S.hSub}>Plumber · 4.9 rating</p>
                </div>
                <div style={S.hBadge}>
                  <Icon.Check />
                  <span>Verified</span>
                </div>
              </div>
              <div style={S.hDivider} />
              <div style={S.hCardRow}>
                <span style={S.hLabel}>Quote submitted</span>
                <span style={S.hPrice}>₦8,500</span>
              </div>
            </div>

            {/* Card 2 — live tracking */}
            <div style={{ ...S.hCard, marginTop: 16, animation: "floatY 5s ease-in-out infinite", animationDelay: "0.8s" }}>
              <div style={S.hCardRow}>
                <span style={S.hPulseDot} />
                <span style={S.hStatusText}>Artisan en route · 8 mins away</span>
              </div>
              <div style={S.progressTrack}>
                <div style={S.progressFill} />
              </div>
              <div style={S.stagesRow}>
                {["Confirmed", "En Route", "Arrived", "Done"].map((s, i) => (
                  <span key={i} style={{ ...S.stageLabel, color: i <= 1 ? "#02C39A" : "#5C7A78" }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Card 3 — review */}
            <div style={{ ...S.hCard, marginTop: 16, animation: "floatY 5s ease-in-out infinite", animationDelay: "1.6s" }}>
              <div style={S.hStars}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: "#F39C12", display: "inline-block" }}>
                    <Icon.Star />
                  </span>
                ))}
              </div>
              <p style={S.hReviewText}>"Excellent work — fixed everything quickly and cleanly."</p>
              <p style={S.hReviewAuthor}>— Chidinma O., Lagos</p>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div style={S.scrollCue}>
          <div style={S.scrollLine} />
        </div>
      </section>

      {/* ─── STATS BAR ───────────────────────────────── */}
      <div ref={statsRef} style={S.statsBar}>
        {[
          { value: `${counter.jobs.toLocaleString()}+`, label: "Jobs Completed" },
          { value: `${counter.artisans}+`, label: "Verified Artisans" },
          { value: `${counter.cities}+`, label: "Cities Covered" },
          { value: "4.8 / 5", label: "Average Rating" },
        ].map((s, i) => (
          <div key={i} style={S.statItem}>
            <p style={S.statValue}>{s.value}</p>
            <p style={S.statLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ─── HOW IT WORKS ────────────────────────────── */}
      <section id="how-it-works" style={S.section}>
        <div data-id="hiw-head" style={{ ...S.sectionHead, ...fadeUp("hiw-head") }}>
          <p style={S.eyebrow}>Simple Process</p>
          <h2 style={S.h2}>How RepairArenaNG Works</h2>
          <p style={S.sectionSub}>Everything managed in one place — from posting a job to releasing payment.</p>
        </div>

        {/* Tab toggle */}
        <div style={S.tabRow}>
          <button
            style={activeTab === "customer" ? S.tabOn : S.tabOff}
            onClick={() => setActiveTab("customer")}
          >
            For Customers
          </button>
          <button
            style={activeTab === "artisan" ? S.tabOn : S.tabOff}
            onClick={() => setActiveTab("artisan")}
          >
            For Artisans
          </button>
        </div>

        <div style={S.stepsGrid}>
          {(activeTab === "customer" ? customerSteps : artisanSteps).map((step, i) => (
            <div
              key={`${activeTab}-${i}`}
              data-id={`step-${activeTab}-${i}`}
              style={{ ...S.stepCard, ...fadeUp(`step-${activeTab}-${i}`, i * 0.12) }}
            >
              <div style={S.stepNumLabel}>{step.num}</div>
              <div style={S.stepIconWrap}>{step.icon}</div>
              <h3 style={S.stepTitle}>{step.title}</h3>
              <p style={S.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────── */}
      <section id="features" style={{ ...S.section, backgroundColor: "#012E33" }}>
        <div data-id="feat-head" style={{ ...S.sectionHead, ...fadeUp("feat-head") }}>
          <p style={{ ...S.eyebrow, color: "#02C39A" }}>Why RepairArenaNG</p>
          <h2 style={{ ...S.h2, color: "#FFFFFF" }}>Built for Trust</h2>
          <p style={{ ...S.sectionSub, color: "#B7E4E0" }}>
            Every feature exists to solve a real problem Nigerians face when hiring tradespeople.
          </p>
        </div>

        <div style={S.featGrid}>
          {features.map((f, i) => (
            <div
              key={i}
              data-id={`feat-${i}`}
              style={{ ...S.featCard, ...fadeUp(`feat-${i}`, i * 0.1) }}
            >
              <div style={{ ...S.featIconBox, backgroundColor: f.color + "18", color: f.color }}>
                {f.icon}
              </div>
              <h3 style={S.featTitle}>{f.title}</h3>
              <p style={S.featDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FOR ARTISANS ────────────────────────────── */}
      <section id="for-artisans" style={S.section}>
        <div style={S.artisanGrid}>
          <div data-id="art-left" style={{ ...fadeLeft("art-left") }}>
            <p style={S.eyebrow}>For Skilled Tradespeople</p>
            <h2 style={S.h2}>Grow Your Business</h2>
            <p style={{ ...S.sectionSub, textAlign: "left", margin: "0 0 28px" }}>
              Stop depending on word-of-mouth. Join a platform that brings steady, fairly-priced
              jobs directly to you — and builds your professional reputation with every job you complete.
            </p>
            <div style={S.benefitsList}>
              {artisanBenefits.map((b, i) => (
                <div key={i} style={S.benefitRow}>
                  <div style={S.benefitTick}><Icon.Check /></div>
                  <span style={S.benefitText}>{b}</span>
                </div>
              ))}
            </div>
            <button style={S.artisanCTA} onClick={() => navigate("/register")}>
              <span>Join as an Artisan</span>
              <Icon.ArrowRight />
            </button>
          </div>

          {/* Mock artisan card */}
          <div data-id="art-right" style={{ ...fadeRight("art-right") }}>
            <div style={S.mockCard}>
              <div style={S.mockHead}>
                <div style={S.mockAv}>A</div>
                <div>
                  <p style={S.mockName}>Adewale Fashola</p>
                  <p style={S.mockRole}>Electrician · Lagos</p>
                  <div style={S.mockVerRow}>
                    <Icon.CheckCircle />
                    <span style={S.mockVerText}>Certificate Verified</span>
                  </div>
                </div>
              </div>
              <div style={S.mockStats}>
                {[
                  { v: "4.9", l: "Rating" },
                  { v: "127", l: "Jobs Done" },
                  { v: "5 yrs", l: "Experience" },
                ].map((s, i) => (
                  <div key={i} style={S.mockStat}>
                    <p style={S.mockStatV}>{s.v}</p>
                    <p style={S.mockStatL}>{s.l}</p>
                  </div>
                ))}
              </div>
              <p style={S.mockPortLabel}>Portfolio — 24 verified jobs</p>
              <div style={S.mockPortGrid}>
                {["#028090", "#02C39A", "#012E33", "#5C7A78"].map((c, i) => (
                  <div key={i} style={{ ...S.mockPortItem, backgroundColor: c }}>
                    <div style={S.mockPortOverlay}>
                      <Icon.Camera />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────── */}
      <section style={{ ...S.section, backgroundColor: "#F4FBFA" }}>
        <div data-id="test-head" style={{ ...S.sectionHead, ...fadeUp("test-head") }}>
          <p style={S.eyebrow}>Customer Stories</p>
          <h2 style={S.h2}>Trusted Across Lagos</h2>
        </div>
        <div style={S.testGrid}>
          {testimonials.map((t, i) => (
            <div
              key={i}
              data-id={`test-${i}`}
              style={{ ...S.testCard, ...fadeUp(`test-${i}`, i * 0.15) }}
            >
              <div style={S.testStars}>
                {[...Array(5)].map((_, j) => (
                  <span key={j} style={{ color: "#F39C12", display: "inline-block" }}>
                    <Icon.Star />
                  </span>
                ))}
              </div>
              <p style={S.testText}>"{t.text}"</p>
              <div style={S.testAuthor}>
                <div style={S.testAv}>{t.initial}</div>
                <div>
                  <p style={S.testName}>{t.name}</p>
                  <p style={S.testRole}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────── */}
      <section style={S.ctaBanner}>
        <div style={S.ctaRing} />
        <div data-id="cta-main" style={{ ...S.ctaInner, ...fadeUp("cta-main") }}>
          <h2 style={S.ctaH2}>Ready to Get Started?</h2>
          <p style={S.ctaP}>
            Join thousands of Nigerians who have found a better way to hire skilled, verified Artisans.
          </p>
          <div style={S.ctaBtns}>
            <button style={S.ctaPrimary} onClick={() => navigate("/register")}>
              Find an Artisan
            </button>
            <button style={S.ctaSecondary} onClick={() => navigate("/register")}>
              Join as an Artisan
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────── */}
      <footer style={S.footer}>
        <div style={S.footerGrid}>
          <div>
            <p style={S.footerBrand}>RepairArenaNG</p>
            <p style={S.footerTagline}>Nigeria's most trusted Artisan marketplace.</p>
            <div style={S.footerContact}>
              <Icon.Mail />
              <span>lutholamide78@gmail.com</span>
            </div>
            <div style={S.footerContact}>
              <Icon.Phone />
              <span>08105435073</span>
            </div>
          </div>
          {[
            {
              title: "Platform",
              links: [
                { label: "Sign Up", action: () => navigate("/register") },
                { label: "Log In", action: () => navigate("/login") },
                { label: "How It Works", action: () => {} },
              ],
            },
            {
              title: "For Artisans",
              links: [
                { label: "Get Verified", action: () => {} },
                { label: "Submit Quotes", action: () => {} },
                { label: "Build Portfolio", action: () => {} },
              ],
            },
            {
              title: "Legal",
              links: [
                { label: "Terms & Conditions", action: () => {} },
                { label: "Privacy Policy", action: () => {} },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <p style={S.footerColTitle}>{col.title}</p>
              {col.links.map((l) => (
                <p key={l.label} style={S.footerLink} onClick={l.action}>{l.label}</p>
              ))}
            </div>
          ))}
        </div>
        <div style={S.footerBottom}>
          <p style={S.footerCopy}>
            © 2026 RepairArenaNG. All rights reserved. Built by Ibrahim Olamide Luth.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── DESIGN TOKENS ─────────────────────────────────────
const TEAL   = "#012E33";
const TEAL2  = "#028090";
const ACCENT = "#02C39A";
const WHITE  = "#FFFFFF";
const MUTED  = "#B7E4E0";
const GREY   = "#5C7A78";
const LIGHT  = "#F4FBFA";
const BORDER = "#DCEEEC";

const S = {
  page: { fontFamily: "'Arial', sans-serif", backgroundColor: WHITE, overflowX: "hidden", margin: 0 },

  // NAV
  nav: {
    position: "fixed", top: 0, left: 0, right: 0,
    zIndex: 999, transition: "all 0.3s ease",
  },
  navInner: {
    maxWidth: 1160, margin: "0 auto", padding: "0 32px",
    height: 68, display: "flex", alignItems: "center",
  },
  navLogo: {
    color: ACCENT, fontSize: 20, fontWeight: "bold",
    letterSpacing: "-0.3px", marginRight: "auto",
  },
  navLinks: { display: "flex", gap: 32, marginRight: 32 },
  navLink: { color: MUTED, fontSize: 14, cursor: "pointer" },
  navActions: { display: "flex", gap: 12 },
  navLoginBtn: {
    background: "none", color: ACCENT,
    border: `1px solid ${ACCENT}`, borderRadius: 6,
    padding: "8px 18px", fontSize: 13, fontWeight: "600", cursor: "pointer",
  },
  navSignupBtn: {
    background: ACCENT, color: TEAL,
    border: "none", borderRadius: 6,
    padding: "8px 18px", fontSize: 13, fontWeight: "bold", cursor: "pointer",
  },
  mobileMenuBtn: {
    display: "none", background: "none",
    border: "none", color: WHITE, cursor: "pointer", padding: 4,
  },
  mobileMenu: {
    backgroundColor: "rgba(1,46,51,0.98)", padding: "16px 32px 24px",
    display: "flex", flexDirection: "column", gap: 16,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  mobileLink: { color: MUTED, fontSize: 15, cursor: "pointer" },
  mobileCTA: {
    backgroundColor: ACCENT, color: TEAL,
    border: "none", borderRadius: 6,
    padding: "12px", fontSize: 14, fontWeight: "bold", cursor: "pointer",
  },

  // HERO
  hero: {
    minHeight: "100vh", backgroundColor: TEAL,
    padding: "0 32px", position: "relative",
    overflow: "hidden", display: "flex",
    flexDirection: "column", justifyContent: "center",
  },
  ring: {
    position: "absolute", borderRadius: "50%",
    backgroundColor: TEAL2, opacity: 0.14,
    animation: "pulseRing 7s ease-in-out infinite",
  },
  heroInner: {
    maxWidth: 1160, margin: "0 auto", width: "100%",
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 64, alignItems: "center", paddingTop: 80,
  },
  heroLeft: { position: "relative", zIndex: 1 },
  heroPill: {
    display: "inline-flex", alignItems: "center", gap: 8,
    backgroundColor: "rgba(2,195,154,0.12)",
    border: "1px solid rgba(2,195,154,0.25)",
    color: ACCENT, borderRadius: 20,
    padding: "6px 14px", fontSize: 12,
    fontWeight: "600", marginBottom: 24,
    letterSpacing: "0.3px",
  },
  heroPillDot: {
    width: 7, height: 7, borderRadius: "50%",
    backgroundColor: ACCENT, display: "inline-block",
    animation: "blink 2s ease-in-out infinite",
  },
  heroH1: {
    fontSize: 52, fontWeight: "bold", color: WHITE,
    margin: "0 0 20px", lineHeight: 1.12,
    letterSpacing: "-1px",
  },
  heroAccent: { color: ACCENT },
  heroP: {
    fontSize: 17, color: MUTED, lineHeight: 1.72,
    margin: "0 0 32px", maxWidth: 460,
  },
  heroCTAs: { display: "flex", gap: 14, marginBottom: 32, flexWrap: "wrap" },
  heroPrimary: {
    display: "inline-flex", alignItems: "center", gap: 8,
    backgroundColor: ACCENT, color: TEAL,
    border: "none", borderRadius: 7,
    padding: "14px 24px", fontSize: 15,
    fontWeight: "bold", cursor: "pointer",
  },
  heroSecondary: {
    display: "inline-flex", alignItems: "center", gap: 8,
    backgroundColor: "transparent", color: ACCENT,
    border: `1.5px solid ${ACCENT}`, borderRadius: 7,
    padding: "14px 24px", fontSize: 15,
    fontWeight: "bold", cursor: "pointer",
  },
  heroTrustRow: { display: "flex", gap: 24, flexWrap: "wrap" },
  trustItem: { display: "flex", alignItems: "center", gap: 7, color: GREY },
  trustIcon: { color: TEAL2, display: "flex", alignItems: "center" },
  trustText: { fontSize: 13 },

  // HERO CARDS
  heroRight: { position: "relative", zIndex: 1, display: "flex", flexDirection: "column" },
  hCard: {
    backgroundColor: "rgba(255,255,255,0.07)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12, padding: 16,
  },
  hCardRow: { display: "flex", alignItems: "center", gap: 12 },
  hAvatar: {
    width: 40, height: 40, borderRadius: "50%",
    backgroundColor: TEAL2, color: WHITE,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 15, fontWeight: "bold", flexShrink: 0,
  },
  hName: { color: WHITE, fontSize: 14, fontWeight: "bold", margin: "0 0 2px" },
  hSub: { color: MUTED, fontSize: 12, margin: 0 },
  hBadge: {
    marginLeft: "auto", display: "flex", alignItems: "center", gap: 4,
    backgroundColor: "rgba(2,195,154,0.18)", color: ACCENT,
    borderRadius: 20, padding: "4px 10px", fontSize: 12, fontWeight: "600",
  },
  hDivider: { height: 1, backgroundColor: "rgba(255,255,255,0.08)", margin: "12px 0" },
  hLabel: { color: MUTED, fontSize: 12 },
  hPrice: { color: ACCENT, fontSize: 20, fontWeight: "bold", marginLeft: "auto" },
  hPulseDot: {
    width: 8, height: 8, borderRadius: "50%",
    backgroundColor: ACCENT, display: "inline-block",
    animation: "blink 1.5s ease-in-out infinite", flexShrink: 0,
  },
  hStatusText: { color: MUTED, fontSize: 13 },
  progressTrack: {
    height: 5, backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3, margin: "12px 0 8px", overflow: "hidden",
  },
  progressFill: {
    height: "100%", borderRadius: 3, backgroundColor: ACCENT,
    animation: "progressAnim 3s ease-in-out infinite alternate",
  },
  stagesRow: { display: "flex", justifyContent: "space-between" },
  stageLabel: { fontSize: 10, fontWeight: "600" },
  hStars: { display: "flex", gap: 2, marginBottom: 8 },
  hReviewText: { color: WHITE, fontSize: 13, lineHeight: 1.5, margin: "0 0 8px", fontStyle: "italic" },
  hReviewAuthor: { color: GREY, fontSize: 11, margin: 0 },

  // SCROLL CUE
  scrollCue: {
    position: "absolute", bottom: 28, left: "50%",
    transform: "translateX(-50%)", display: "flex",
    flexDirection: "column", alignItems: "center",
  },
  scrollLine: {
    width: 1, height: 40, backgroundColor: ACCENT,
    opacity: 0.5, animation: "scrollBounce 1.8s ease-in-out infinite",
  },

  // STATS BAR
  statsBar: {
    backgroundColor: "#011C20",
    display: "flex", justifyContent: "space-around",
    flexWrap: "wrap", padding: "40px 32px",
  },
  statItem: { textAlign: "center", padding: "8px 24px" },
  statValue: { fontSize: 36, fontWeight: "bold", color: ACCENT, margin: "0 0 4px" },
  statLabel: { fontSize: 13, color: MUTED, margin: 0, letterSpacing: "0.3px" },

  // SECTIONS
  section: { padding: "88px 32px" },
  sectionHead: { textAlign: "center", maxWidth: 640, margin: "0 auto 52px" },
  eyebrow: {
    fontSize: 11, fontWeight: "bold", color: TEAL2,
    textTransform: "uppercase", letterSpacing: "2.5px",
    margin: "0 0 14px",
  },
  h2: { fontSize: 36, fontWeight: "bold", color: TEAL, margin: "0 0 16px", letterSpacing: "-0.5px" },
  sectionSub: { fontSize: 16, color: GREY, lineHeight: 1.7, margin: 0, textAlign: "center" },

  // HOW IT WORKS
  tabRow: {
    display: "flex", justifyContent: "center",
    gap: 0, marginBottom: 48,
    border: `1px solid ${BORDER}`, borderRadius: 8,
    width: "fit-content", margin: "0 auto 48px",
    overflow: "hidden",
  },
  tabOn: {
    padding: "11px 28px", backgroundColor: TEAL,
    color: WHITE, border: "none",
    fontSize: 14, fontWeight: "bold", cursor: "pointer",
  },
  tabOff: {
    padding: "11px 28px", backgroundColor: WHITE,
    color: GREY, border: "none",
    fontSize: 14, fontWeight: "600", cursor: "pointer",
  },
  stepsGrid: {
    maxWidth: 1100, margin: "0 auto",
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20,
  },
  stepCard: {
    backgroundColor: WHITE, borderRadius: 10,
    padding: "28px 22px",
    border: `1px solid ${BORDER}`,
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
    position: "relative",
  },
  stepNumLabel: {
    fontSize: 40, fontWeight: "bold", color: LIGHT,
    position: "absolute", top: 14, right: 18,
    lineHeight: 1, userSelect: "none",
  },
  stepIconWrap: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: LIGHT, color: TEAL2,
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 18,
  },
  stepTitle: { fontSize: 15, fontWeight: "bold", color: TEAL, margin: "0 0 10px" },
  stepDesc: { fontSize: 13, color: GREY, lineHeight: 1.65, margin: 0 },

  // FEATURES
  featGrid: {
    maxWidth: 1100, margin: "0 auto",
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20,
  },
  featCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 10, padding: "28px 24px",
    border: "1px solid rgba(255,255,255,0.09)",
  },
  featIconBox: {
    width: 48, height: 48, borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 18,
  },
  featTitle: { fontSize: 16, fontWeight: "bold", color: WHITE, margin: "0 0 10px" },
  featDesc: { fontSize: 13, color: MUTED, lineHeight: 1.65, margin: 0 },

  // ARTISAN
  artisanGrid: {
    maxWidth: 1100, margin: "0 auto",
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 72, alignItems: "center",
  },
  benefitsList: { marginBottom: 32 },
  benefitRow: { display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 },
  benefitTick: {
    width: 22, height: 22, borderRadius: "50%",
    backgroundColor: LIGHT, color: TEAL2,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, marginTop: 1,
  },
  benefitText: { fontSize: 14, color: "#0B2B2E", lineHeight: 1.5 },
  artisanCTA: {
    display: "inline-flex", alignItems: "center", gap: 8,
    backgroundColor: TEAL2, color: WHITE,
    border: "none", borderRadius: 7,
    padding: "14px 24px", fontSize: 15,
    fontWeight: "bold", cursor: "pointer",
  },

  // MOCK CARD
  mockCard: {
    backgroundColor: TEAL, borderRadius: 14,
    padding: 24, boxShadow: "0 24px 60px rgba(1,46,51,0.28)",
  },
  mockHead: { display: "flex", alignItems: "center", gap: 16, marginBottom: 20 },
  mockAv: {
    width: 52, height: 52, borderRadius: "50%",
    backgroundColor: TEAL2, color: WHITE,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20, fontWeight: "bold", flexShrink: 0,
  },
  mockName: { color: WHITE, fontSize: 16, fontWeight: "bold", margin: "0 0 3px" },
  mockRole: { color: MUTED, fontSize: 13, margin: "0 0 5px" },
  mockVerRow: { display: "flex", alignItems: "center", gap: 5, color: ACCENT },
  mockVerText: { fontSize: 12, fontWeight: "600", color: ACCENT },
  mockStats: {
    display: "flex", justifyContent: "space-around",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 8, padding: 16, marginBottom: 20,
  },
  mockStat: { textAlign: "center" },
  mockStatV: { color: ACCENT, fontSize: 20, fontWeight: "bold", margin: "0 0 4px" },
  mockStatL: { color: MUTED, fontSize: 11, margin: 0 },
  mockPortLabel: { color: GREY, fontSize: 12, marginBottom: 10 },
  mockPortGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  mockPortItem: {
    height: 80, borderRadius: 8,
    position: "relative", overflow: "hidden",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  mockPortOverlay: {
    position: "absolute", inset: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "rgba(255,255,255,0.5)",
  },

  // TESTIMONIALS
  testGrid: {
    maxWidth: 1100, margin: "0 auto",
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24,
  },
  testCard: {
    backgroundColor: WHITE, borderRadius: 10,
    padding: "28px 24px",
    border: `1px solid ${BORDER}`,
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
  },
  testStars: { display: "flex", gap: 2, marginBottom: 14 },
  testText: { fontSize: 14, color: "#0B2B2E", lineHeight: 1.7, margin: "0 0 20px", fontStyle: "italic" },
  testAuthor: { display: "flex", alignItems: "center", gap: 12 },
  testAv: {
    width: 40, height: 40, borderRadius: "50%",
    backgroundColor: TEAL2, color: WHITE,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16, fontWeight: "bold", flexShrink: 0,
  },
  testName: { fontSize: 14, fontWeight: "bold", color: TEAL, margin: "0 0 2px" },
  testRole: { fontSize: 12, color: GREY, margin: 0 },

  // CTA
  ctaBanner: {
    backgroundColor: TEAL, padding: "100px 32px",
    textAlign: "center", position: "relative", overflow: "hidden",
  },
  ctaRing: {
    position: "absolute", width: 600, height: 600,
    borderRadius: "50%", backgroundColor: TEAL2, opacity: 0.1,
    top: "50%", left: "50%", transform: "translate(-50%, -50%)",
    animation: "pulseRing 7s ease-in-out infinite",
  },
  ctaInner: { position: "relative", zIndex: 1 },
  ctaH2: { fontSize: 40, fontWeight: "bold", color: WHITE, margin: "0 0 16px", letterSpacing: "-0.5px" },
  ctaP: { fontSize: 17, color: MUTED, margin: "0 0 36px", lineHeight: 1.65 },
  ctaBtns: { display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" },
  ctaPrimary: {
    backgroundColor: ACCENT, color: TEAL,
    border: "none", borderRadius: 7,
    padding: "15px 32px", fontSize: 15, fontWeight: "bold", cursor: "pointer",
  },
  ctaSecondary: {
    backgroundColor: "transparent", color: ACCENT,
    border: `1.5px solid ${ACCENT}`, borderRadius: 7,
    padding: "15px 32px", fontSize: 15, fontWeight: "bold", cursor: "pointer",
  },

  // FOOTER
  footer: { backgroundColor: "#011C20", padding: "64px 32px 0" },
  footerGrid: {
    maxWidth: 1100, margin: "0 auto",
    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40,
    paddingBottom: 48, borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  footerBrand: { color: ACCENT, fontSize: 18, fontWeight: "bold", margin: "0 0 8px" },
  footerTagline: { color: GREY, fontSize: 13, margin: "0 0 20px", lineHeight: 1.5 },
  footerContact: {
    display: "flex", alignItems: "center", gap: 8,
    color: GREY, fontSize: 13, marginBottom: 8,
  },
  footerColTitle: { color: WHITE, fontSize: 13, fontWeight: "bold", margin: "0 0 16px" },
  footerLink: { color: GREY, fontSize: 13, margin: "0 0 10px", cursor: "pointer" },
  footerBottom: { maxWidth: 1100, margin: "0 auto", padding: "20px 0" },
  footerCopy: { color: "#3A5558", fontSize: 12, margin: 0 },
};