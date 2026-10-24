"use client";

import { useCallback, useEffect, useState } from "react";
import loginDesign from "../page.module.css";

export default function ClientPage() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketPriority, setTicketPriority] = useState("Medium");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketLoading, setTicketLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      const response = await fetch("/api/client/me");

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();
      setUser(data.user);

      const ticketResponse = await fetch("/api/client/tickets");
      const ticketData = await ticketResponse.json();

      if (ticketResponse.ok) {
        setTickets(ticketData.tickets || []);
      } else {
        setTicketMessage(ticketData.error || "Unable to load tickets.");
      }
    } catch {
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initializeDashboard() {
      try {
        const response = await fetch("/api/client/me");
        const data = await response.json();

        if (cancelled) return;

        if (!response.ok || !data.user) {
          setUser(null);
          setLoading(false);
          return;
        }

        setUser(data.user);

        const ticketsResponse = await fetch("/api/client/tickets");
        const ticketsData = await ticketsResponse.json();

        if (cancelled) return;

        if (ticketsResponse.ok) {
          setTickets(ticketsData.tickets || []);
        } else {
          setTicketMessage(ticketsData.error || "Unable to load tickets.");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Dashboard initialization error:", error);
          setMessage("Unable to connect to the server.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    initializeDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    try {
      const endpoint =
        mode === "login" ? "/api/client/login" : "/api/client/register";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Something went wrong.");
        return;
      }

      setPassword("");
      setLoading(true);
      await loadDashboard();
    } catch {
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateTicket(event) {
    event.preventDefault();
    setTicketMessage("");
    setTicketLoading(true);

    try {
      const response = await fetch("/api/client/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: ticketTitle,
          description: ticketDescription,
          priority: ticketPriority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setTicketMessage(data.error || "Unable to submit ticket.");
        return;
      }

      setTicketTitle("");
      setTicketDescription("");
      setTicketPriority("Medium");
      setTicketMessage("Ticket submitted successfully.");

      await loadDashboard();
    } catch {
      setTicketMessage("Unable to connect to the server.");
    } finally {
      setTicketLoading(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);

    try {
      const response = await fetch("/api/client/logout", {
        method: "POST",
      });

      if (response.ok) {
        setUser(null);
        setTickets([]);
        setMode("login");
        setMessage("You have been logged out.");
      } else {
        setMessage("Unable to log out. Please try again.");
      }
    } catch {
      setMessage("Unable to connect to the server.");
    } finally {
      setLoggingOut(false);
    }
  }

  const openCount = tickets.filter((ticket) => ticket.status === "Open").length;

  const inProgressCount = tickets.filter(
    (ticket) => ticket.status === "In Progress",
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) => ticket.status === "Resolved",
  ).length;

  // Loading screen
  if (loading) {
    return (
      <main style={styles.page}>
        <p style={styles.subtitle}>Loading your IT support portal...</p>
      </main>
    );
  }

  // Client dashboard - existing functionality preserved
  if (user) {
    return (
      <main style={styles.dashboardPage}>
        <header style={styles.topbar}>
          <div>
            <h1 style={styles.brand}>IT Support Portal</h1>
            <p style={styles.topbarSubtitle}>Client dashboard</p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            style={styles.logoutButton}
          >
            {loggingOut ? "Logging out..." : "Log Out"}
          </button>
        </header>

        <section style={styles.dashboardContent}>
          <div style={styles.welcome}>
            <p style={styles.eyebrow}>CLIENT PORTAL</p>
            <h2 style={styles.welcomeHeading}>Welcome, {user.name}!</h2>
            <p style={styles.muted}>
              Submit technical issues and track your support requests here.
            </p>
          </div>

          <div style={styles.statsGrid}>
            <StatCard label="Total Tickets" value={tickets.length} />
            <StatCard label="Open" value={openCount} />
            <StatCard label="In Progress" value={inProgressCount} />
            <StatCard label="Resolved" value={resolvedCount} />
          </div>

          <div style={styles.contentGrid}>
            <section style={styles.panel}>
              <h2 style={styles.sectionHeading}>Submit a Support Ticket</h2>
              <p style={styles.muted}>
                Describe the problem so the IT team can assist you.
              </p>

              <form onSubmit={handleCreateTicket} style={styles.form}>
                <label style={styles.label}>
                  Issue title
                  <input
                    style={styles.input}
                    value={ticketTitle}
                    onChange={(event) => setTicketTitle(event.target.value)}
                    placeholder="e.g. Computer cannot connect to Wi-Fi"
                    maxLength={150}
                    required
                  />
                </label>

                <label style={styles.label}>
                  Description
                  <textarea
                    style={styles.textarea}
                    value={ticketDescription}
                    onChange={(event) =>
                      setTicketDescription(event.target.value)
                    }
                    placeholder="Explain what happened and any error messages."
                    rows={5}
                    required
                  />
                </label>

                <label style={styles.label}>
                  Priority
                  <select
                    style={styles.input}
                    value={ticketPriority}
                    onChange={(event) => setTicketPriority(event.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </label>

                {ticketMessage && <p style={styles.message}>{ticketMessage}</p>}

                <button
                  type="submit"
                  disabled={ticketLoading}
                  style={styles.submit}
                >
                  {ticketLoading ? "Submitting..." : "Submit Ticket"}
                </button>
              </form>
            </section>

            <section style={styles.panel}>
              <h2 style={styles.sectionHeading}>My Support Tickets</h2>
              <p style={styles.muted}>
                View the current status and assignment of your requests.
              </p>

              {tickets.length === 0 ? (
                <div style={styles.empty}>
                  <p>No tickets yet.</p>
                  <p style={styles.muted}>
                    Submit a ticket using the form to get started.
                  </p>
                </div>
              ) : (
                <div style={styles.ticketList}>
                  {tickets.map((ticket) => (
                    <article key={ticket.id} style={styles.ticket}>
                      <div style={styles.ticketHeader}>
                        <span style={styles.ticketId}>
                          TKT-{String(ticket.id).padStart(4, "0")}
                        </span>

                        <span style={statusStyle(ticket.status)}>
                          {ticket.status}
                        </span>
                      </div>

                      <h3 style={styles.ticketTitle}>{ticket.title}</h3>

                      <p style={styles.ticketDescription}>
                        {ticket.description}
                      </p>

                      <div style={styles.ticketMeta}>
                        <span>
                          Priority: <strong>{ticket.priority}</strong>
                        </span>

                        <span>
                          Assigned to:{" "}
                          <strong>{ticket.assignedTo || "Unassigned"}</strong>
                        </span>
                      </div>

                      <p style={styles.ticketDate}>
                        Submitted: {new Date(ticket.createdAt).toLocaleString()}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>
      </main>
    );
  }

  // Redesigned client login and registration page
  return (
    <main className={loginDesign.page}>
      <div className={loginDesign.gridBackground} aria-hidden="true" />
      <div className={loginDesign.scanline} aria-hidden="true" />

      <div
        className={`${loginDesign.orb} ${loginDesign.orbOne}`}
        aria-hidden="true"
      />
      <div
        className={`${loginDesign.orb} ${loginDesign.orbTwo}`}
        aria-hidden="true"
      />

      <div className={loginDesign.layout}>
        <section className={loginDesign.hero}>
          <div className={loginDesign.brand}>
            <div className={loginDesign.brandIcon}>IT</div>
            <div>
              <strong>
                SUPPORT<span>DESK</span>
              </strong>
              <small>CLIENT SUPPORT PORTAL</small>
            </div>
          </div>

          <div className={loginDesign.status}>
            <span className={loginDesign.statusDot} />
            TECHNICAL SUPPORT SYSTEM
          </div>

          <h1>
            Your IT issues,
            <br />
            <span>our priority.</span>
          </h1>

          <p className={loginDesign.description}>
            Submit technical issues, monitor ticket progress, and stay informed
            as your support requests move toward resolution.
          </p>

          <div className={loginDesign.machine} aria-hidden="true">
            <div className={loginDesign.machineRing} />
            <div className={loginDesign.machineRingInner} />

            <div className={loginDesign.machineCore}>
              <div className={loginDesign.corePulse} />
              <span>IT</span>
              <small>SUPPORT CORE</small>
            </div>

            <span className={`${loginDesign.gear} ${loginDesign.gearLarge}`}>
              ⚙
            </span>
            <span className={`${loginDesign.gear} ${loginDesign.gearSmall}`}>
              ⚙
            </span>
            <span className={`${loginDesign.gear} ${loginDesign.gearBottom}`}>
              ⚙
            </span>

            <div
              className={`${loginDesign.circuit} ${loginDesign.circuitOne}`}
            />
            <div
              className={`${loginDesign.circuit} ${loginDesign.circuitTwo}`}
            />
            <div
              className={`${loginDesign.circuit} ${loginDesign.circuitThree}`}
            />

            <span
              className={`${loginDesign.particle} ${loginDesign.particleOne}`}
            />
            <span
              className={`${loginDesign.particle} ${loginDesign.particleTwo}`}
            />
            <span
              className={`${loginDesign.particle} ${loginDesign.particleThree}`}
            />
          </div>

          <div className={loginDesign.features}>
            <div>
              <span className={loginDesign.featureIcon}>●</span>
              Submit support tickets
            </div>
            <div>
              <span className={loginDesign.featureIcon}>●</span>
              Track ticket status
            </div>
            <div>
              <span className={loginDesign.featureIcon}>●</span>
              Monitor resolutions
            </div>
          </div>
        </section>

        <section className={loginDesign.loginPanel}>
          <div className={loginDesign.panelTop}>
            CLIENT ACCOUNT
            <span className={loginDesign.panelLine} />
          </div>

          <h2 className={loginDesign.authHeading}>
            {mode === "login" ? "Welcome back." : "Create your account."}
          </h2>

          <p className={loginDesign.authIntro}>
            {mode === "login"
              ? "Sign in to access your support tickets and updates."
              : "Register to submit issues and track your support requests."}
          </p>

          <div className={loginDesign.authTabs}>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
              className={
                mode === "login"
                  ? loginDesign.authTabActive
                  : loginDesign.authTab
              }
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("register");
                setMessage("");
              }}
              className={
                mode === "register"
                  ? loginDesign.authTabActive
                  : loginDesign.authTab
              }
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className={loginDesign.authForm}>
            {mode === "register" && (
              <label className={loginDesign.authLabel} htmlFor="client-name">
                Full name
                <input
                  id="client-name"
                  className={loginDesign.authInput}
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </label>
            )}

            <label className={loginDesign.authLabel} htmlFor="client-email">
              Email address
              <input
                id="client-email"
                className={loginDesign.authInput}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label className={loginDesign.authLabel} htmlFor="client-password">
              Password
              <input
                id="client-password"
                className={loginDesign.authInput}
                type="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </label>

            {message && (
              <p role="alert" className={loginDesign.authMessage}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={loginDesign.authSubmit}
            >
              {submitting
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In to Client Portal →"
                  : "Create Client Account →"}
            </button>
          </form>

          <div className={loginDesign.authSecurity}>
            <span className={loginDesign.authSecurityIcon}>⌑</span>
            <span>
              <strong>Your support workspace</strong>
              <br />
              Sign in to manage your requests and track progress.
            </span>
          </div>

          <p className={loginDesign.footer}>
            IT SUPPORTDESK
            <br />
            <span>CLIENT ACCESS · SUPPORT REQUEST MANAGEMENT</span>
          </p>
        </section>
      </div>

      <div className={loginDesign.bottomBar}>
        <span>IT SUPPORTDESK</span>
        <span>CLIENT PORTAL · SUPPORT WHEN YOU NEED IT</span>
      </div>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <article style={styles.statCard}>
      <p style={styles.statLabel}>{label}</p>
      <p style={styles.statValue}>{value}</p>
    </article>
  );
}

function statusStyle(status) {
  const colors = {
    Open: { color: "#fbbf24", background: "#422006" },
    "In Progress": {
      color: "#93c5fd",
      background: "#172554",
    },
    Resolved: {
      color: "#86efac",
      background: "#052e16",
    },
  };

  return {
    ...styles.statusBadge,
    ...(colors[status] || {
      color: "#cbd5e1",
      background: "#1e293b",
    }),
  };
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "#020617",
    color: "#f8fafc",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "440px",
    padding: "32px",
    border: "1px solid #334155",
    borderRadius: "16px",
    background: "#0f172a",
  },
  heading: {
    margin: "0 0 10px",
    fontSize: "28px",
  },
  subtitle: {
    color: "#94a3b8",
    lineHeight: 1.6,
  },
  tabs: {
    display: "flex",
    gap: "10px",
    margin: "24px 0",
  },
  tab: {
    flex: 1,
    padding: "12px",
    border: "1px solid #334155",
    borderRadius: "8px",
    background: "#0f172a",
    color: "#cbd5e1",
    cursor: "pointer",
  },
  activeTab: {
    flex: 1,
    padding: "12px",
    border: "1px solid #3b82f6",
    borderRadius: "8px",
    background: "#1d4ed8",
    color: "#ffffff",
    cursor: "pointer",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    marginTop: "24px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    color: "#cbd5e1",
    fontSize: "14px",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #334155",
    borderRadius: "8px",
    background: "#020617",
    color: "#f8fafc",
    fontSize: "14px",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #334155",
    borderRadius: "8px",
    background: "#020617",
    color: "#f8fafc",
    fontSize: "14px",
    resize: "vertical",
  },
  message: {
    margin: 0,
    color: "#fca5a5",
    fontSize: "14px",
    lineHeight: 1.5,
  },
  submit: {
    padding: "13px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  footer: {
    marginTop: "24px",
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: 1.7,
    textAlign: "center",
  },
  dashboardPage: {
    minHeight: "100vh",
    background: "#020617",
    color: "#f8fafc",
    fontFamily: "Arial, sans-serif",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "20px 5%",
    borderBottom: "1px solid #1e293b",
    background: "#0f172a",
  },
  brand: {
    margin: 0,
    fontSize: "22px",
  },
  topbarSubtitle: {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },
  logoutButton: {
    padding: "10px 16px",
    border: "1px solid #475569",
    borderRadius: "8px",
    background: "#1e293b",
    color: "#f8fafc",
    cursor: "pointer",
  },
  dashboardContent: {
    width: "90%",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "36px 0",
  },
  welcome: {
    marginBottom: "28px",
  },
  eyebrow: {
    color: "#60a5fa",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "2px",
  },
  welcomeHeading: {
    margin: "10px 0",
    fontSize: "30px",
  },
  muted: {
    color: "#94a3b8",
    fontSize: "14px",
    lineHeight: 1.7,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  },
  statCard: {
    padding: "20px",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    background: "#0f172a",
  },
  statLabel: {
    margin: 0,
    color: "#94a3b8",
    fontSize: "13px",
  },
  statValue: {
    margin: "12px 0 0",
    fontSize: "28px",
    fontWeight: 700,
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
    gap: "24px",
    alignItems: "start",
  },
  panel: {
    minWidth: 0,
    padding: "24px",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    background: "#0f172a",
  },
  sectionHeading: {
    margin: "0 0 10px",
    fontSize: "20px",
  },
  empty: {
    marginTop: "24px",
    padding: "24px",
    border: "1px dashed #334155",
    borderRadius: "10px",
    textAlign: "center",
  },
  ticketList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "24px",
  },
  ticket: {
    minWidth: 0,
    padding: "18px",
    border: "1px solid #334155",
    borderRadius: "10px",
    background: "#020617",
  },
  ticketHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
  },
  ticketId: {
    color: "#60a5fa",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "1px",
  },
  statusBadge: {
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 700,
  },
  ticketTitle: {
    margin: "16px 0 8px",
    fontSize: "17px",
    overflowWrap: "anywhere",
  },
  ticketDescription: {
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  ticketMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px 20px",
    marginTop: "16px",
    color: "#94a3b8",
    fontSize: "12px",
  },
  ticketDate: {
    marginTop: "14px",
    color: "#64748b",
    fontSize: "12px",
  },
};
