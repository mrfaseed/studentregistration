"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, getDocs } from "firebase/firestore";


// ── SVG Icons (accepting className and style to prevent absolute positioning in dashboard) ──
const UserIcon = ({ style, className = "input-icon" }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = ({ style, className = "input-icon" }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const PhoneIcon = ({ style, className = "input-icon" }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.3h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l.92-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MapPinIcon = ({ style, className = "input-icon input-icon-textarea" }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const AlertIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const EditIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

// Extra icons (no emojis anywhere)
const CheckIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const WarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── Professional & Elegant White Theme Loading Screen ──
function AppLoadingScreen() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      backgroundColor: "#ffffff",
      backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)",
      backgroundSize: "24px 24px",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* Subtle radial white overlay in center for clean text readability against the grid */}
      <div style={{
        position: "absolute",
        width: "650px", height: "650px",
        background: "radial-gradient(circle, rgba(255,255,255,1) 35%, rgba(255,255,255,0.85) 65%, rgba(255,255,255,0) 100%)",
        pointerEvents: "none",
      }} />

      {/* Content Container */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        animation: "loadingFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        {/* Refined Minimalist Logo Card */}
        <div style={{
          width: "68px", height: "68px",
          borderRadius: "20px",
          background: "#ffffff",
          border: "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow: "0 14px 34px -10px rgba(0, 0, 0, 0.08), 0 4px 14px -4px rgba(0, 0, 0, 0.03)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "24px",
          animation: "loadingFloat 3.2s ease-in-out infinite",
        }}>
          <div style={{
            width: "44px", height: "44px",
            borderRadius: "12px",
            background: "#0f172a",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#ffffff",
            boxShadow: "0 4px 10px rgba(15, 23, 42, 0.15)",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "20px", fontWeight: 700, color: "#0f172a",
          letterSpacing: "-0.025em", margin: "0 0 6px 0",
          textAlign: "center",
        }}>
          Student Registration
        </h1>

        {/* Status indicator pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: "7px",
          margin: "0 0 32px 0", padding: "4px 12px",
          background: "#f8fafc", border: "1px solid #e2e8f0",
          borderRadius: "999px",
        }}>
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: "#10b981", display: "inline-block",
            animation: "loadingPulseDot 1.5s infinite ease-in-out",
          }} />
          <span style={{
            fontSize: "12px", color: "#64748b", fontWeight: 500,
            letterSpacing: "-0.005em",
          }}>
            Initializing...
          </span>
        </div>

        {/* Sleek Minimalist Progress Bar */}
        <div style={{
          width: "160px", height: "2px",
          background: "#f1f5f9",
          borderRadius: "999px", overflow: "hidden",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", top: 0, bottom: 0,
            width: "45%",
            background: "linear-gradient(90deg, transparent, #0f172a, transparent)",
            borderRadius: "999px",
            animation: "loadingSlide 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite",
          }} />
        </div>
      </div>

      <style>{`
        @keyframes loadingFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes loadingFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes loadingPulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes loadingSlide {
          0% { left: -45%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────
function getFullEmail(fields) {
  const user = (fields.emailUser || "").trim();
  const domain = (fields.emailDomain || "").trim();

  if (user.includes("@")) {
    const parts = user.split("@").filter(Boolean);
    if (parts.length === 0) return "";
    if (parts.length === 1) {
      return user.endsWith("@") ? `${parts[0]}@` : `${parts[0]}`;
    }
    return `${parts[0]}@${parts[1]}`;
  }

  if (!user) return "";
  const cleanDomain = domain.startsWith("@") ? domain : `@${domain}`;
  return `${user}${cleanDomain}`;
}

function getInitials(name) {
  if (!name) return "SR";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

// ── Animated Phone Number Display Component ─────────────
function AnimatedPhoneDisplay({ value, focused }) {
  const [displaySlots, setDisplaySlots] = useState([]);
  const [prevVal, setPrevVal] = useState(value || "");

  useEffect(() => {
    const oldStr = prevVal;
    const newStr = value || "";
    if (oldStr === newStr) return;

    let updated = [];

    if (newStr.length >= oldStr.length) {
      for (let i = 0; i < newStr.length; i++) {
        if (i >= oldStr.length || newStr[i] !== oldStr[i]) {
          updated.push({ char: newStr[i], key: `${i}-${newStr[i]}-${Date.now()}`, anim: "slide-up" });
        } else {
          updated.push({ char: newStr[i], key: `${i}-${newStr[i]}`, anim: "none" });
        }
      }
      setDisplaySlots(updated);
    } else {
      for (let i = 0; i < oldStr.length; i++) {
        if (i < newStr.length) {
          updated.push({ char: newStr[i], key: `${i}-${newStr[i]}`, anim: "none" });
        } else {
          updated.push({ char: oldStr[i], key: `${i}-${oldStr[i]}-${Date.now()}`, anim: "slide-down" });
        }
      }
      setDisplaySlots(updated);

      const timer = setTimeout(() => {
        setDisplaySlots((current) => current.filter((item) => item.anim !== "slide-down"));
      }, 220);
      setPrevVal(newStr);
      return () => clearTimeout(timer);
    }

    setPrevVal(newStr);
  }, [value, prevVal]);

  return (
    <div style={{ display: "flex", alignItems: "center", height: "24px", fontSize: "16px", fontWeight: 600, color: "var(--color-text-primary)", fontFamily: "monospace", letterSpacing: "1.5px" }}>
      {displaySlots.length === 0 ? (
        <span style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-inter), sans-serif", fontSize: "15px", fontWeight: 400, letterSpacing: "normal" }}>

        </span>
      ) : (
        displaySlots.map((item, index) => (
          <span
            key={item.key}
            style={{
              display: "inline-block",
              marginLeft: index === 5 ? "8px" : "0",
              animation: item.anim === "slide-up" ? "digitSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards" : item.anim === "slide-down" ? "digitSlideDown 0.22s cubic-bezier(0.7, 0, 0.84, 0) forwards" : "none",
              color: item.anim === "slide-down" ? "var(--color-danger)" : "inherit",
            }}
          >
            {item.char}
          </span>
        ))
      )}
      {focused && displaySlots.filter((s) => s.anim !== "slide-down").length < 10 && (
        <span style={{ display: "inline-block", width: "2px", height: "18px", background: "var(--color-primary)", marginLeft: "3px", animation: "blink 1s infinite" }} />
      )}
    </div>
  );
}

// ── Validation ──────────────────────────────────────────
function validate(fields) {
  const errors = {};
  if (!fields.name.trim()) {
    errors.name = "Full name is required.";
  } else if (fields.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  const fullEmail = getFullEmail(fields);
  if (!fields.emailUser.trim()) {
    errors.email = "Email username is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fullEmail)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!fields.phone.trim()) {
    errors.phone = "Mobile number is required.";
  } else if (!/^[6-9]\d{9}$/.test(fields.phone.trim())) {
    errors.phone = "Must be a 10-digit mobile number starting with 6, 7, 8, or 9.";
  }

  if (!fields.address.trim()) {
    errors.address = "Address is required.";
  } else if (fields.address.trim().length < 10) {
    errors.address = "Please provide a more complete address.";
  }
  return errors;
}

// ── MD3 Confirmation Dialog ──────────────────────────────
function ConfirmationDialog({ open, fields, loading, submitError, onEdit, onConfirm }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape" && !loading) onEdit();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, loading, onEdit]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const fullEmail = getFullEmail(fields);
  const rows = [
    { icon: <UserIcon className="" style={{ width: "18px", height: "18px", position: "static", transform: "none" }} />, bg: "#ecfdf5", color: "#059669", label: "Full Name", value: fields.name, mono: false },
    { icon: <MailIcon className="" style={{ width: "18px", height: "18px", position: "static", transform: "none" }} />, bg: "#ecfeff", color: "#0891b2", label: "Email Address", value: fullEmail, mono: false },
    { icon: <PhoneIcon className="" style={{ width: "18px", height: "18px", position: "static", transform: "none" }} />, bg: "#fef3c7", color: "#d97706", label: "Mobile Number", value: `+91 ${fields.phone}`, mono: true },
    { icon: <MapPinIcon className="" style={{ width: "18px", height: "18px", position: "static", transform: "none" }} />, bg: "#fff1f2", color: "#e11d48", label: "Residential Address", value: fields.address, mono: false },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-desc"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "dialogBackdropIn 0.22s ease",
      }}
    >
      {/* Blurred backdrop */}
      <div
        onClick={loading ? undefined : onEdit}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15, 23, 42, 0.55)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      />

      {/* Dialog surface */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "480px",
          background: "#ffffff",
          borderRadius: "28px",
          boxShadow: "0 24px 64px -8px rgba(15, 23, 42, 0.28), 0 8px 24px -4px rgba(15, 23, 42, 0.12)",
          animation: "dialogIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
          overflow: "hidden",
          fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ padding: "28px 28px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "linear-gradient(135deg, #059669 0%, #0d9488 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0, boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)" }}>
              <ShieldIcon />
            </div>
            <div>
              <h2 id="dialog-title" style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
                Review Your Information
              </h2>
              <p id="dialog-desc" style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b", lineHeight: 1.4 }}>
                Please verify before final submission.
              </p>
            </div>
          </div>
          <button
            onClick={loading ? undefined : onEdit}
            disabled={loading}
            aria-label="Close dialog and return to form"
            style={{ background: "none", border: "none", cursor: loading ? "not-allowed" : "pointer", padding: "4px", color: "#94a3b8", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: loading ? 0.4 : 1 }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Divider */}
        <div style={{ margin: "20px 28px 0", height: "1px", background: "#f1f5f9" }} />

        {/* Warning notice */}
       

        {/* Detail rows */}
        <div style={{ padding: "16px 28px 0", display: "flex", flexDirection: "column", gap: "10px" }}>
          {rows.map(({ icon, bg, color, label, value, mono }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "12px 16px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>{label}</div>
                <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#0f172a", fontFamily: mono ? "monospace" : "inherit", letterSpacing: mono ? "0.5px" : "normal", wordBreak: "break-word" }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit error */}
        {submitError && (
          <div style={{ margin: "12px 28px 0", display: "flex", alignItems: "center", gap: "6px", padding: "10px 14px", background: "#fff5f5", border: "1px solid #fecaca", borderRadius: "10px", fontSize: "13px", color: "#b91c1c", fontWeight: 600 }}>
            <AlertIcon /> {submitError}
          </div>
        )}

        {/* Actions */}
        <div style={{ padding: "20px 28px 28px", display: "flex", gap: "12px", flexDirection: "column" }}>
          {/* Confirm button */}
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              width: "100%",
              minHeight: "52px",
              padding: "14px 20px",
              background: loading ? "#6ee7b7" : "linear-gradient(135deg, #059669 0%, #0d9488 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "14px",
              fontSize: "15.5px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: loading ? "none" : "0 6px 18px rgba(5, 150, 105, 0.35)",
              transition: "all 0.2s ease",
              letterSpacing: "-0.01em",
            }}
          >
            {loading ? (
              <><span className="spinner" style={{ borderColor: "rgba(255,255,255,0.35)", borderTopColor: "#fff" }} /> Submitting…</>
            ) : (
              <><CheckIcon size={18} /> Submit</>  
            )}
          </button>
          {/* Edit button */}
          <button
            onClick={onEdit}
            disabled={loading}
            style={{
              width: "100%",
              minHeight: "48px",
              padding: "13px 20px",
              background: "#f8fafc",
              color: loading ? "#94a3b8" : "#374151",
              border: "1.5px solid #e2e8f0",
              borderRadius: "14px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s ease",
            }}
          >
            <EditIcon /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Component ───────────────────────────────────────────
export default function RegistrationPage() {
  const [fields, setFields] = useState({
    name: "",
    emailUser: "",
    emailDomain: "@gmail.com",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  // App-init loading screen
  const [appLoading, setAppLoading] = useState(true);
  // MD3 confirmation dialog
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const addressRef = useRef(null);

  // Auto-expand address textarea without scrollbars or manual resize
  useEffect(() => {
    if (addressRef.current) {
      addressRef.current.style.height = "auto";
      addressRef.current.style.height = `${addressRef.current.scrollHeight}px`;
    }
  }, [fields.address]);

  // Check localStorage on mount for existing registration
  useEffect(() => {
    const savedId = localStorage.getItem("sr_registered_student_id");
    const savedData = localStorage.getItem("sr_registered_student_data");
    const savedEdited = localStorage.getItem("sr_registered_student_has_edited");
    if (savedId && savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setStudentId(savedId);
        populateFieldsFromData(parsed);
        setSubmitted(true);
        setIsRegistered(true);
        if (savedEdited === "true" || parsed.hasEdited) {
          setHasEdited(true);
        }
      } catch (err) {
        console.error("Failed to load saved registration:", err);
      }
    }
    // Minimum 1.4s so the loading screen is always visible
    const minDelay = setTimeout(() => setAppLoading(false), 1400);
    return () => clearTimeout(minDelay);
  }, []);

  function populateFieldsFromData(data) {
    if (!data) return;
    const emailStr = data.email || "";
    let userPart = emailStr;
    let domainPart = "@gmail.com";
    if (emailStr.includes("@")) {
      const idx = emailStr.lastIndexOf("@");
      userPart = emailStr.slice(0, idx);
      domainPart = emailStr.slice(idx);
    }
    const phoneStr = (data.phone || "").replace(/^\+91\s*/i, "");

    setFields({
      name: data.name || "",
      emailUser: userPart,
      emailDomain: domainPart,
      phone: phoneStr,
      address: data.address || "",
    });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    let formattedVal = value;
    if (name === "name") {
      // Auto-capitalize first letter of each word as user types
      formattedVal = value.replace(/\b\w/g, (c) => c.toUpperCase());
    }
    setFields((prev) => {
      const next = { ...prev, [name]: formattedVal };
      const currentErrors = validate(next);
      setErrors(currentErrors);
      return next;
    });
    setSubmitError("");
  }

  function handlePhoneChange(e) {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length <= 10) {
      setFields((prev) => {
        const next = { ...prev, phone: raw };
        const currentErrors = validate(next);
        setErrors(currentErrors);
        return next;
      });
      setSubmitError("");
    }
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
      ...(name.startsWith("email") ? { email: true } : {}),
    }));
    setErrors(validate(fields));
  }

  // handleSubmit: validate then open confirmation dialog (initial reg)
  // For edit mode it submits directly (keeps existing one-time-edit flow)
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = Object.keys(validationErrors)[0];
      const elementId = firstErrorField === "email" ? "emailUser" : firstErrorField === "phone" ? "phone-hidden-input" : firstErrorField;
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => element.focus({ preventScroll: true }), 300);
      }
      return;
    }

    if (isEditing) {
      // Editing mode: submit directly (one-time edit, no dialog needed)
      await handleConfirmSubmit();
    } else {
      // Initial registration: open confirmation dialog
      setSubmitError("");
      setShowReviewDialog(true);
    }
  }

  // handleConfirmSubmit: the actual Firestore write (called from dialog or edit form)
  async function handleConfirmSubmit() {
    setLoading(true);
    setSubmitError("");
    try {
      const fullEmail = getFullEmail(fields);
      const phoneClean = fields.phone.trim().replace(/^\+91\s*/i, "");
      const fullPhone = `+91 ${phoneClean}`;

      // Check if email is already in use by another student in Firestore
      const emailQuery = query(
        collection(db, "students"),
        where("email", "==", fullEmail.toLowerCase())
      );
      const querySnap = await getDocs(emailQuery);
      let emailTaken = false;
      querySnap.forEach((docSnap) => {
        if (docSnap.id !== studentId) {
          emailTaken = true;
        }
      });

      if (emailTaken) {
        setErrors((prev) => ({
          ...prev,
          email: "This Gmail address is already in use by another student.",
        }));
        setLoading(false);
        setShowReviewDialog(false);
        return;
      }

      const docData = {
        name: fields.name.trim(),
        email: fullEmail.toLowerCase(),
        phone: fullPhone,
        address: fields.address.trim(),
      };

      if (isEditing && studentId) {
        // One-time update of existing registration
        const updatedData = { ...docData, hasEdited: true };
        await updateDoc(doc(db, "students", studentId), {
          ...updatedData,
          updatedAt: serverTimestamp(),
        });
        localStorage.setItem("sr_registered_student_data", JSON.stringify(updatedData));
        localStorage.setItem("sr_registered_student_has_edited", "true");
        setHasEdited(true);
        setIsEditing(false);
        setIsRegistered(true);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3500);
      } else {
        // Initial registration
        const docRef = await addDoc(collection(db, "students"), {
          ...docData,
          hasEdited: true,
          registeredAt: serverTimestamp(),
        });
        localStorage.setItem("sr_registered_student_id", docRef.id);
        localStorage.setItem("sr_registered_student_data", JSON.stringify(docData));
        localStorage.setItem("sr_registered_student_has_edited", "true");
        setStudentId(docRef.id);
        setHasEdited(true);
        setSubmitted(true);
        setIsRegistered(true);
        setIsEditing(false);
        setShowReviewDialog(false);
      }
    } catch (err) {
      console.error(err);
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const hasAt = (fields.emailUser || "").includes("@");
  const liveEmail = getFullEmail(fields);

  const currentValErrors = validate(fields);
  const validCount = [
    fields.name?.trim().length >= 2 && !currentValErrors.name,
    fields.emailUser?.trim().length > 0 && !currentValErrors.email,
    fields.phone?.trim().length === 10 && !currentValErrors.phone,
    fields.address?.trim().length >= 10 && !currentValErrors.address,
  ].filter(Boolean).length;
  const progressPercent = Math.round((validCount / 4) * 100);

  function getFieldStatus(fieldName, val) {
    const isTouched = touched[fieldName] || submitted;
    if (!isTouched) return "default";
    if (errors[fieldName]) return "error";
    if (val?.trim()) return "success";
    return "default";
  }

  // Show full-page loading screen on first paint
  if (appLoading) return <AppLoadingScreen />;

  return (
    <>
      {/* MD3 Confirmation Dialog */}
      <ConfirmationDialog
        open={showReviewDialog}
        fields={fields}
        loading={loading}
        submitError={submitError}
        onEdit={() => { if (!loading) setShowReviewDialog(false); }}
        onConfirm={handleConfirmSubmit}
      />
      {/* Navbar with properly aligned logo */}
      <nav className="navbar">
        <a href="/" className="navbar-brand">

          <span className="navbar-title" style={{ fontSize: "18px", fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>Student Registration</span>
        </a>
      </nav>

      {/* Main Section */}
      <main className="form-section" style={{ paddingTop: "64px", paddingBottom: "80px" }}>
        <div className="form-card">
          {isRegistered && !isEditing ? (
            /* ── Read-Only Registered Student Dashboard / Finished Form ── */
            <div style={{ padding: "32px 36px" }}>
              {updateSuccess && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#ecfdf5", border: "1px solid #10b981", color: "#065f46", padding: "12px 16px", borderRadius: "10px", marginBottom: "22px", fontSize: "14px", fontWeight: 600 }}>
                  <CheckIcon size={16} />
                  Registration information updated successfully!
                </div>
              )}

              {/* Celebratory Finished Form Header */}
              <div style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff", borderRadius: "16px", padding: "24px 28px", textAlign: "center", marginBottom: "28px", boxShadow: "0 10px 25px rgba(5, 150, 105, 0.25)", position: "relative", overflow: "hidden", animation: "fadeInUp .4s ease" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", backdropFilter: "blur(4px)" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>You Finished the Form!</h3>
                <p style={{ fontSize: "14px", opacity: 0.95, margin: 0, maxWidth: "420px", marginLeft: "auto", marginRight: "auto", lineHeight: "1.5" }}>
                  Your registration has been Done
                </p>
              </div>

              {/* Details Grid (icons explicitly set to static to prevent floating outside) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "28px" }}>
                <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "15px 18px", display: "flex", alignItems: "center", justify: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <UserIcon className="" style={{ width: "18px", height: "18px", position: "static", transform: "none" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "11.5px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Full Name</div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginTop: "2px" }}>{fields.name}</div>
                    </div>
                  </div>
                </div>

                <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "15px 18px", display: "flex", alignItems: "center", justify: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f0fdfa", color: "#0d9488", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MailIcon className="" style={{ width: "18px", height: "18px", position: "static", transform: "none" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "11.5px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email Address</div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginTop: "2px" }}>{getFullEmail(fields)}</div>
                    </div>
                  </div>
                </div>

                <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "15px 18px", display: "flex", alignItems: "center", justify: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <PhoneIcon className="" style={{ width: "18px", height: "18px", position: "static", transform: "none" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "11.5px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Mobile Number</div>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginTop: "2px", fontFamily: "monospace", letterSpacing: "0.5px" }}>+91 {fields.phone}</div>
                    </div>
                  </div>
                </div>

                <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "15px 18px", display: "flex", alignItems: "center", justify: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#fff1f2", color: "#e11d48", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MapPinIcon className="" style={{ width: "18px", height: "18px", position: "static", transform: "none" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "11.5px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>Residential Address</div>
                      <div style={{ fontSize: "14.5px", fontWeight: 600, color: "#111827", marginTop: "2px", lineHeight: "1.4" }}>{fields.address}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Locked Notice */}
              <div style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#4b5563", fontSize: "14px", fontWeight: 600, textAlign: "center" }}>
                <LockIcon />
                <span>Registration Completed</span>
              </div>
            </div>
          ) : (
            /* ── Registration / Editing Form ── */
            <>
              <div className="form-card-header">
                <h2>{isEditing ? "Edit Registration Details" : "Student Information"}</h2>
                <p style={{ color: isEditing ? "#d97706" : "inherit", fontWeight: isEditing ? 600 : "normal", display: "flex", alignItems: "center", gap: "6px" }}>
                  {isEditing && <WarningIcon />}
                  {isEditing ? "Note: You can only update and confirm your details once." : "Fill in the details below to complete your registration."}
                </p>
                <div style={{ marginTop: "18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: "8px" }}>
                    <span>Registration Progress</span>
                    <span style={{ color: progressPercent === 100 ? "var(--color-success)" : "var(--color-primary)", transition: "color 0.3s ease" }}>{progressPercent}%</span>
                  </div>
                  <div style={{ height: "8px", width: "100%", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${progressPercent}%`,
                        background: progressPercent === 100 ? "linear-gradient(90deg, #10b981, #06b6d4, #f59e0b, #f43f5e)" : "linear-gradient(90deg, #10b981, #06b6d4, #f59e0b)",
                        transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s ease",
                        borderRadius: "999px",
                      }}
                    />
                  </div>
                  {/* Colorful Step Pills */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: "14px" }}>
                    <div style={{ padding: "6px 8px", borderRadius: "8px", background: fields.name ? "#ecfdf5" : "#f1f5f9", border: `1px solid ${fields.name ? "#a7f3d0" : "#e2e8f0"}`, color: fields.name ? "#059669" : "#64748b", fontSize: "11.5px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", transition: "all 0.3s ease" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: fields.name ? "#10b981" : "#cbd5e1" }} />
                      Name {fields.name && "✓"}
                    </div>
                    <div style={{ padding: "6px 8px", borderRadius: "8px", background: fields.emailUser ? "#ecfeff" : "#f1f5f9", border: `1px solid ${fields.emailUser ? "#a5f3fc" : "#e2e8f0"}`, color: fields.emailUser ? "#0891b2" : "#64748b", fontSize: "11.5px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", transition: "all 0.3s ease" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: fields.emailUser ? "#06b6d4" : "#cbd5e1" }} />
                      Email {fields.emailUser && "✓"}
                    </div>
                    <div style={{ padding: "6px 8px", borderRadius: "8px", background: fields.phone ? "#fef3c7" : "#f1f5f9", border: `1px solid ${fields.phone ? "#fde68a" : "#e2e8f0"}`, color: fields.phone ? "#d97706" : "#64748b", fontSize: "11.5px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", transition: "all 0.3s ease" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: fields.phone ? "#f59e0b" : "#cbd5e1" }} />
                      Mobile {fields.phone && "✓"}
                    </div>
                    <div style={{ padding: "6px 8px", borderRadius: "8px", background: fields.address ? "#fff1f2" : "#f1f5f9", border: `1px solid ${fields.address ? "#fecdd3" : "#e2e8f0"}`, color: fields.address ? "#e11d48" : "#64748b", fontSize: "11.5px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", transition: "all 0.3s ease" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: fields.address ? "#f43f5e" : "#cbd5e1" }} />
                      Address {fields.address && "✓"}
                    </div>
                  </div>
                </div>
              </div>
              <form className="form-body" onSubmit={handleSubmit} noValidate>
                {/* Name */}
                <div className="input-group">
                  <label className="input-label" htmlFor="name" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)" }} />
                    Full Name <span style={{ color: "var(--color-danger)" }}>*</span>
                  </label>
                  <div className="input-wrapper">
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.35)", pointerEvents: "none", zIndex: 2 }}>
                      <UserIcon style={{ width: "18px", height: "18px", position: "static", transform: "none" }} />
                    </div>
                    {(() => {
                      const nameStatus = getFieldStatus("name", fields.name);
                      return (
                        <input
                          id="name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          placeholder="Enter Your Name"
                          className={`form-input${nameStatus === "error" ? " error shake" : nameStatus === "success" ? " success" : ""}`}
                          style={{
                            paddingLeft: "58px",
                            borderColor: nameStatus === "success" || fields.name ? "#10b981" : undefined,
                            background: nameStatus === "error" ? "#fff5f5" : fields.name ? "#f0fdf4" : undefined,
                            boxShadow: fields.name && !nameStatus ? "0 0 0 3px rgba(16, 185, 129, 0.12)" : undefined,
                          }}
                          value={fields.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          enterKeyHint="next"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              document.getElementById("emailUser")?.focus();
                            }
                          }}
                        />
                      );
                    })()}
                  </div>
                  {(touched.name || submitted) && errors.name && (
                    <p className="error-msg"><AlertIcon /> {errors.name}</p>
                  )}
                </div>

                {/* Email with fixed suffix badge */}
                <div className="input-group">
                  <label className="input-label" htmlFor="emailUser" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#06b6d4", boxShadow: "0 0 8px rgba(6, 182, 212, 0.6)" }} />
                    Email Address <span style={{ color: "var(--color-danger)" }}>*</span>
                  </label>
                  {(() => {
                    const emailStatus = getFieldStatus("email", fields.emailUser);
                    const emailBorder = emailStatus === "error" ? "var(--color-danger)" : emailStatus === "success" || fields.emailUser ? "#06b6d4" : emailFocused ? "#0891b2" : "var(--color-border)";
                    const emailBg = emailStatus === "error" ? "#fff5f5" : emailStatus === "success" || fields.emailUser ? "#ecfeff" : emailFocused ? "#fff" : "var(--color-bg)";
                    const emailShadow = emailStatus === "error" && emailFocused ? "0 0 0 3px rgba(239, 68, 68, .12)" : (emailStatus === "success" || fields.emailUser) && emailFocused ? "0 0 0 3px rgba(6, 182, 212, .2)" : emailFocused ? "0 0 0 3px rgba(6, 182, 212, .18)" : "none";
                    return (
                      <div
                        className={emailStatus === "error" ? "shake" : ""}
                        style={{
                          display: "flex",
                          alignItems: "stretch",
                          minHeight: "54px",
                          border: `1.5px solid ${emailBorder}`,
                          borderRadius: "var(--radius-md)",
                          background: emailBg,
                          boxShadow: emailShadow,
                          overflow: "hidden",
                          transition: "all var(--transition-base)",
                        }}
                        onClick={() => document.getElementById("emailUser")?.focus()}
                      >
                        <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #06b6d4, #0891b2)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: "10px", marginRight: "6px", alignSelf: "center", boxShadow: "0 4px 10px rgba(6, 182, 212, 0.35)", flexShrink: 0 }}>
                          <MailIcon style={{ position: "static", transform: "none", width: "18px", height: "18px" }} />
                        </div>
                        <input
                          id="emailUser"
                          name="emailUser"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder={hasAt ? "e.g. name@gmail.com" : "username"}
                          style={{
                            border: "none",
                            background: "transparent",
                            padding: "14px 12px",
                            flex: 1,
                            outline: "none",
                            fontSize: "16px",
                            fontFamily: "inherit",
                            color: "var(--color-text-primary)",
                            minWidth: "120px",
                          }}
                          value={fields.emailUser}
                          onChange={handleChange}
                          onFocus={() => setEmailFocused(true)}
                          onBlur={(e) => {
                            setEmailFocused(false);
                            handleBlur(e);
                          }}
                          enterKeyHint="next"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              document.getElementById("phone-hidden-input")?.focus();
                            }
                          }}
                        />
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#ecfeff",
                            borderLeft: hasAt ? "none" : "1px solid #a5f3fc",
                            maxWidth: hasAt ? "0px" : "130px",
                            opacity: hasAt ? 0 : 1,
                            overflow: "hidden",
                            transition: "max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, border-left 0.25s ease",
                            padding: hasAt ? "0" : "0 16px",
                            pointerEvents: "none",
                            userSelect: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "13.5px",
                              fontWeight: 700,
                              color: "#0e7490",
                              fontFamily: "inherit",
                              letterSpacing: "0.01em",
                            }}
                          >
                            @gmail.com
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                  {fields.emailUser && !errors.email && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", fontSize: "12px", color: "#0891b2", animation: "fadeIn .2s ease" }}>
                      <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#06b6d4" }} />
                      <span>Full email: <strong style={{ fontWeight: 600 }}>{liveEmail}</strong></span>
                    </div>
                  )}
                  {(touched.email || submitted) && errors.email && (
                    <p className="error-msg"><AlertIcon /> {errors.email}</p>
                  )}
                </div>

                {/* Animated Mobile Number Input */}
                <div className="input-group">
                  <label className="input-label" htmlFor="phone-hidden-input" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#f59e0b", boxShadow: "0 0 8px rgba(245, 158, 11, 0.6)" }} />
                    Mobile Number <span style={{ color: "var(--color-danger)" }}>*</span>
                  </label>
                  {(() => {
                    const phoneStatus = getFieldStatus("phone", fields.phone);
                    const phoneBorder = phoneStatus === "error" ? "var(--color-danger)" : phoneStatus === "success" || fields.phone ? "#f59e0b" : phoneFocused ? "#d97706" : "var(--color-border)";
                    const phoneBg = phoneStatus === "error" ? "#fff5f5" : phoneStatus === "success" || fields.phone ? "#fffef2" : phoneFocused ? "#fff" : "var(--color-bg)";
                    const phoneShadow = phoneStatus === "error" && phoneFocused ? "0 0 0 3px rgba(239, 68, 68, .12)" : (phoneStatus === "success" || fields.phone) && phoneFocused ? "0 0 0 3px rgba(245, 158, 11, .2)" : phoneFocused ? "0 0 0 3px rgba(245, 158, 11, .18)" : "none";
                    return (
                      <div
                        className={phoneStatus === "error" ? "shake" : ""}
                        style={{
                          display: "flex",
                          alignItems: "stretch",
                          minHeight: "54px",
                          border: `1.5px solid ${phoneBorder}`,
                          borderRadius: "var(--radius-md)",
                          background: phoneBg,
                          boxShadow: phoneShadow,
                          overflow: "hidden",
                          transition: "all var(--transition-base)",
                          position: "relative",
                          cursor: "text",
                        }}
                        onClick={() => document.getElementById("phone-hidden-input")?.focus()}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "0 14px 0 10px", background: "#fef3c7", borderRight: "1px solid #fde68a", color: "#b45309", fontWeight: 800, fontSize: "15px", userSelect: "none", zIndex: 2 }}>
                          <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 10px rgba(245, 158, 11, 0.35)", flexShrink: 0 }}>
                            <PhoneIcon style={{ position: "static", transform: "none", width: "16px", height: "16px" }} />
                          </div>
                          <span>+91</span>
                        </div>

                        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "14px 16px", overflow: "hidden", minHeight: "54px", zIndex: 1, pointerEvents: "none" }}>
                          <AnimatedPhoneDisplay value={fields.phone} focused={phoneFocused} />
                        </div>

                        <input
                          id="phone-hidden-input"
                          name="phone"
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          autoComplete="tel"
                          value={fields.phone}
                          onChange={handlePhoneChange}
                          onFocus={() => setPhoneFocused(true)}
                          onBlur={(e) => {
                            setPhoneFocused(false);
                            handleBlur(e);
                          }}
                          enterKeyHint="next"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              document.getElementById("address")?.focus();
                            }
                          }}
                          style={{
                            position: "absolute",
                            opacity: 0,
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            cursor: "text",
                            zIndex: 3,
                          }}
                        />
                      </div>
                    );
                  })()}
                  {fields.phone && !errors.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px", fontSize: "12px", color: "#d97706", animation: "fadeIn .2s ease" }}>
                      <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#f59e0b" }} />
                      <span>Will be contacted at: <strong style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>+91 {fields.phone.trim().replace(/^\+91\s*/i, "")}</strong></span>
                    </div>
                  )}
                  {(touched.phone || submitted) && errors.phone && (
                    <p className="error-msg"><AlertIcon /> {errors.phone}</p>
                  )}
                </div>

                {/* Address */}
                <div className="input-group">
                  <label className="input-label" htmlFor="address" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ display: "inline-block", width: "10px", height: "10px", borderRadius: "50%", background: "#f43f5e", boxShadow: "0 0 8px rgba(244, 63, 94, 0.6)" }} />
                    Address <span style={{ color: "var(--color-danger)" }}>*</span>
                  </label>
                  <div className="input-wrapper">
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #f43f5e, #e11d48)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", left: "10px", top: "12px", boxShadow: "0 4px 10px rgba(244, 63, 94, 0.35)", pointerEvents: "none", zIndex: 2 }}>
                      <MapPinIcon style={{ width: "18px", height: "18px", position: "static", transform: "none" }} />
                    </div>
                    {(() => {
                      const addressStatus = getFieldStatus("address", fields.address);
                      return (
                        <textarea
                          id="address"
                          ref={addressRef}
                          name="address"
                          autoComplete="street-address"
                          placeholder="Enter your address"
                          className={`form-input form-textarea${addressStatus === "error" ? " error shake" : addressStatus === "success" ? " success" : ""}`}
                          style={{
                            paddingLeft: "58px",
                            paddingTop: "16px",
                            borderColor: addressStatus === "success" || fields.address ? "#f43f5e" : undefined,
                            background: addressStatus === "error" ? "#fff5f5" : fields.address ? "#fff1f2" : undefined,
                            boxShadow: fields.address && !addressStatus ? "0 0 0 3px rgba(244, 63, 94, 0.12)" : undefined,
                          }}
                          value={fields.address}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          enterKeyHint="done"
                          rows={2}
                        />
                      );
                    })()}
                  </div>
                  {(touched.address || submitted) && errors.address && (
                    <p className="error-msg"><AlertIcon /> {errors.address}</p>
                  )}
                </div>

                {submitError && (
                  <p className="error-msg" style={{ marginBottom: "12px", fontSize: "14px" }}>
                    <AlertIcon /> {submitError}
                  </p>
                )}
                {isEditing ? (
                  <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        const savedData = localStorage.getItem("sr_registered_student_data");
                        if (savedData) {
                          try {
                            populateFieldsFromData(JSON.parse(savedData));
                          } catch (e) { }
                        }
                        setIsEditing(false);
                        setErrors({});
                        setSubmitError("");
                      }}
                      style={{
                        flex: 1,
                        minHeight: "54px",
                        padding: "14px 18px",
                        background: "#f3f4f6",
                        color: "#374151",
                        border: "1px solid #d1d5db",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        flex: 2,
                        minHeight: "54px",
                        padding: "14px 18px",
                        background: "linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #059669 100%)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "16px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        boxShadow: "0 6px 18px rgba(16, 185, 129, 0.35), 0 2px 8px rgba(6, 182, 212, 0.2)",
                      }}
                    >
                      {loading ? (
                        <><span className="spinner" />{" "}Confirming…</>
                      ) : (
                        <><CheckIcon size={16} /> Confirm &amp; Lock Information</>
                      )}
                    </button>
                  </div>
                ) : (
                  <button type="submit" className="btn-submit" disabled={loading} id="submit-registration">
                    {loading ? (
                      <>
                        <span className="spinner" /> Submitting…
                      </>
                    ) : (
                      <>
                        Register Now <ArrowRightIcon />
                      </>
                    )}
                  </button>
                )}
              </form>
            </>
          )}
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes digitSlideUp {
          0% { transform: translateY(14px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes digitSlideDown {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(14px); opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes dialogBackdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes dialogIn {
          from { opacity: 0; transform: scale(0.88) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}
