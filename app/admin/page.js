"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query, getDocs, where } from "firebase/firestore";
import Link from "next/link";

// ── Cookie helpers ──────────────────────────────────────
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
}
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// ── Icons ───────────────────────────────────────────────
const SearchIcon = () => (
  <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const TrendingUpIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const InboxIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const KeyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5"/>
    <path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>
  </svg>
);

// ── Helpers ─────────────────────────────────────────────
function formatDate(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function formatTime(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function isSameDay(ts, date) {
  if (!ts) return false;
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth() && d.getDate() === date.getDate();
}
function getInitials(name) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}
function exportToCSV(students) {
  const headers = ["Name", "Email", "Phone", "Address", "Registered At"];
  const rows = students.map((s) => [
    `"${s.name}"`, `"${s.email}"`, `"${s.phone}"`,
    `"${(s.address || "").replace(/"/g, '""')}"`,
    `"${formatDate(s.registeredAt)} ${formatTime(s.registeredAt)}"`,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `students_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Input style ─────────────────────────────────────────
const inputStyle = {
  width: "100%", border: "1.5px solid #d1d5db", borderRadius: "8px",
  fontSize: "14px", fontFamily: "inherit", color: "#111827",
  background: "#fff", outline: "none", boxSizing: "border-box",
};

// ── LockScreen ──────────────────────────────────────────
function LockScreen({ onUnlock }) {
  const [savedGmail, setSavedGmail] = useState(null);
  const [gmail, setGmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("init");

  useEffect(() => {
    const stored = getCookie("sr_admin_gmail");
    if (stored) { setSavedGmail(stored); setStep("password-only"); }
    else { setStep("full"); }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const gmailToUse = step === "password-only" ? savedGmail : gmail.trim().toLowerCase();
    if (!pwd.trim()) { setErr("Please enter your password."); return; }
    if (step === "full" && !gmailToUse) { setErr("Please enter your Gmail."); return; }
    setLoading(true);
    setErr("");
    try {
      const q = query(collection(db, "admin"), where("gmail", "==", gmailToUse));
      const snap = await getDocs(q);
      if (snap.empty) { setErr("invalid credentials"); setPwd(""); setLoading(false); return; }
      const doc = snap.docs[0].data();
      if (doc.password !== pwd) { setErr("invalid credentials"); setPwd(""); setLoading(false); return; }
      setCookie("sr_admin_gmail", gmailToUse, 1);
      onUnlock(gmailToUse);
    } catch (error) {
      console.error(error);
      setErr("invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  function switchAccount() {
    deleteCookie("sr_admin_gmail");
    setSavedGmail(null); setStep("full"); setErr(""); setPwd("");
  }

  if (step === "init") return null;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f4f6f8", fontFamily: "var(--font-inter), sans-serif", padding: "24px",
    }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>


        {/* Card */}
        <div style={{
          background: "#fff", borderRadius: "12px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 2px 16px rgba(0,0,0,.07)",
          padding: "28px",
          overflow: "hidden",
        }}>
          {/* Top bar accent */}
          <div style={{ height: "3px", background: "#059669", borderRadius: "3px", marginBottom: "24px" }}/>

          {/* Identity row — shown only in password-only mode */}
          {step === "password-only" && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "2px" }}>Signing in as</div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{savedGmail}</div>
            </div>
          )}

          {/* Title row — shown on full login */}
          {step === "full" && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", letterSpacing: "-0.01em" }}>Sign in</div>
              <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "2px" }}></div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>

            {/* Gmail */}
            {step === "full" && (
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}
                  htmlFor="login-gmail">Gmail</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex", pointerEvents: "none" }}>
                    <MailIcon />
                  </span>
                  <input id="login-gmail" type="email" autoComplete="email" autoFocus
                    placeholder="Enter your gmail" value={gmail}
                    onChange={(e) => { setGmail(e.target.value); setErr(""); }}
                    style={{ ...inputStyle, padding: "9px 12px 9px 34px" }}
                    onFocus={e => { e.target.style.borderColor = "#059669"; e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,.15)"; }}
                    onBlur={e => { e.target.style.borderColor = "#d1d5db"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "5px" }}
                htmlFor="login-pwd">Password</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex", pointerEvents: "none" }}>
                  <KeyIcon />
                </span>
                <input id="login-pwd" type={showPwd ? "text" : "password"}
                  autoComplete="current-password" autoFocus={step === "password-only"}
                  placeholder="••••••••" value={pwd}
                  onChange={(e) => { setPwd(e.target.value); setErr(""); }}
                  style={{ ...inputStyle, padding: "9px 34px 9px 34px" }}
                  onFocus={e => { e.target.style.borderColor = "#059669"; e.target.style.boxShadow = "0 0 0 3px rgba(5,150,105,.15)"; }}
                  onBlur={e => { e.target.style.borderColor = "#d1d5db"; e.target.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center", padding: 0 }}
                  aria-label="Toggle password visibility">
                  {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Error */}
            {err && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "7px", padding: "8px 11px", fontSize: "12.5px", color: "#b91c1c", fontWeight: 500 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {err}
              </div>
            )}

            {/* Submit */}
            <button type="submit" id="admin-login-btn" disabled={loading}
              style={{
                width: "100%", padding: "10px", background: "#059669",
                color: "#fff", border: "none", borderRadius: "8px",
                fontSize: "14px", fontWeight: 700, fontFamily: "inherit",
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
              }}>
              {loading ? (
                <><span style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }}/>Verifying…</>
              ) : "Sign In"}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: "14px", paddingTop: "13px", borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {step === "password-only" ? (
              <button onClick={switchAccount} style={{ background: "none", border: "none", cursor: "pointer", color: "#059669", fontWeight: 600, fontSize: "12.5px", fontFamily: "inherit", padding: 0 }}>
                Switch account
              </button>
            ) : (
              <span style={{ fontSize: "12px", color: "#d1d5db" }}></span>
            )}
            <Link href="/" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "12.5px" }}>← Back</Link>
          </div>
        </div>

        {step === "password-only" && (
          <p style={{ textAlign: "center", marginTop: "10px", fontSize: "11.5px", color: "#9ca3af" }}>
            Session saved · expires in 24 hours
          </p>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────
function Dashboard({ onLogout, adminGmail }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = query(collection(db, "students"), orderBy("registeredAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => { console.error(err); setLoading(false); });
    return () => unsub();
  }, []);

  const today = useMemo(() => new Date(), []);
  const todayCount = useMemo(() => students.filter((s) => isSameDay(s.registeredAt, today)).length, [students, today]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.includes(q) ||
      s.address?.toLowerCase().includes(q)
    );
  }, [students, search]);

  function handleLogout() {
    deleteCookie("sr_admin_gmail");
    onLogout();
  }

  return (
    <div className="admin-wrapper">
      <nav className="navbar">
        <a className="navbar-brand">
       
          <span className="navbar-title">Admin Panel</span>
        </a>
        <div className="navbar-actions">
          <button className="btn-nav btn-nav-ghost" onClick={handleLogout}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <LogoutIcon /> Logout
          </button>
        </div>
      </nav>

      <main className="admin-main">
        <div className="admin-page-header">
          <h1>Student Registrations</h1>
          <p>Signed in as <strong>{adminGmail}</strong> · Latest Update : just now</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card" style={{ animationDelay: "0ms" }}>
            <div className="stat-icon-wrap indigo"><UsersIcon /></div>
            <div><div className="stat-info-label">Total</div><div className="stat-info-value">{students.length}</div></div>
          </div>
          <div className="stat-card" style={{ animationDelay: "60ms" }}>
            <div className="stat-icon-wrap cyan"><CalendarIcon /></div>
            <div><div className="stat-info-label">Today</div><div className="stat-info-value">{todayCount}</div></div>
          </div>
          <div className="stat-card" style={{ animationDelay: "120ms" }}>
            <div className="stat-icon-wrap green"><TrendingUpIcon /></div>
            <div>
              <div className="stat-info-label">This Week</div>
              <div className="stat-info-value">
                {students.filter((s) => {
                  if (!s.registeredAt) return false;
                  const d = s.registeredAt.toDate ? s.registeredAt.toDate() : new Date(s.registeredAt);
                  const w = new Date(); w.setDate(w.getDate() - 7);
                  return d >= w;
                }).length}
              </div>
            </div>
          </div>
        </div>

        <div className="table-card">
          <div className="table-card-header">
            <h3>All Students</h3>
            <div className="table-controls">
              <div className="search-input-wrap">
                <SearchIcon />
                <input type="text" className="search-input" placeholder="Search…" id="admin-search"
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <button className="btn-export" onClick={() => exportToCSV(filtered)}
                disabled={filtered.length === 0} id="export-csv-btn">
                <DownloadIcon /> Export CSV
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-wrap"><div className="loading-spinner" />Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><InboxIcon /></div>
              <p className="empty-state-text">{search ? "No matches found." : "No registrations yet."}</p>
              <p className="empty-state-sub">{search ? "Try a different term." : "Share the form to get started."}</p>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>#</th><th>Student</th><th>Email</th><th>Phone</th><th>Address</th><th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => (
                      <tr key={s.id}>
                        <td style={{ color: "var(--color-text-muted)", fontWeight: 600, fontSize: "13px" }}>{i + 1}</td>
                        <td>
                          <div className="td-name">
                            <div className="avatar">{getInitials(s.name || "?")}</div>
                            <span className="td-name-text">{s.name}</span>
                          </div>
                        </td>
                        <td style={{ color: "var(--color-text-secondary)" }}>{s.email}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{s.phone}</td>
                        <td style={{ maxWidth: "200px", color: "var(--color-text-secondary)", fontSize: "13.5px" }}>{s.address}</td>
                        <td>
                          <div className="badge-date"><CalendarIcon style={{ width: "13px", height: "13px" }} />{formatDate(s.registeredAt)}</div>
                          <div style={{ fontSize: "11.5px", color: "var(--color-text-muted)", marginTop: "2px" }}>{formatTime(s.registeredAt)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                <span>Showing <strong>{filtered.length}</strong> of <strong>{students.length}</strong> students{search && ` — "${search}"`}</span>
                <span>Live ✦</span>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="footer">© {new Date().getFullYear()} StudentReg Admin Panel</footer>
    </div>
  );
}

// ── Page root ────────────────────────────────────────────
export default function AdminPage() {
  const [adminGmail, setAdminGmail] = useState(null);
  return adminGmail
    ? <Dashboard adminGmail={adminGmail} onLogout={() => setAdminGmail(null)} />
    : <LockScreen onUnlock={(gmail) => setAdminGmail(gmail)} />;
}
