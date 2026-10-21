"use client";

import { useCallback, useEffect, useState } from "react";

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
          setMessage(ticketsData.error || "Unable to load tickets.");
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

  if (loading) {
    return (
      <main style={styles.page}>
        <p style={styles.subtitle}>Loading your IT support portal...</p>
      </main>
    );
  }

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

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.heading}>IT Support Portal</h1>
        <p style={styles.subtitle}>
          Sign in to manage your IT support requests.
        </p>

        <div style={styles.tabs}>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
            style={mode === "login" ? styles.activeTab : styles.tab}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("register");
              setMessage("");
            }}
            style={mode === "register" ? styles.activeTab : styles.tab}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === "register" && (
            <label style={styles.label}>
              Full name
              <input
                style={styles.input}
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                required
              />
            </label>
          )}

          <label style={styles.label}>
            Email address
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              minLength={8}
              required
            />
          </label>

          {message && <p style={styles.message}>{message}</p>}

          <button type="submit" disabled={submitting} style={styles.submit}>
            {submitting
              ? "Please wait..."
              : mode === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <p style={styles.footer}>
          Need assistance? Contact your IT support team.
        </p>
      </section>
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
    "In Progress": { color: "#93c5fd", background: "#172554" },
    Resolved: { color: "#86efac", background: "#052e16" },
  };

  return {
    ...styles.statusBadge,
    ...(colors[status] || { color: "#cbd5e1", background: "#1e293b" }),
  };
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "#080d19",
    color: "#f8fafc",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "32px",
    background: "#111827",
    border: "1px solid #273449",
    borderRadius: "16px",
    boxSizing: "border-box",
  },
  heading: {
    margin: "0 0 10px",
    fontSize: "28px",
    textAlign: "center",
  },
  subtitle: {
    color: "#a8b3c7",
    textAlign: "center",
    lineHeight: 1.5,
  },
  tabs: { display: "flex", gap: "8px", marginBottom: "24px" },
  tab: {
    flex: 1,
    padding: "12px",
    border: "1px solid #374151",
    borderRadius: "8px",
    background: "#1f2937",
    color: "#d1d5db",
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
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "14px",
    color: "#e2e8f0",
  },
  input: {
    boxSizing: "border-box",
    width: "100%",
    padding: "12px",
    border: "1px solid #374151",
    borderRadius: "8px",
    background: "#0b1220",
    color: "#ffffff",
    fontSize: "15px",
  },
  textarea: {
    boxSizing: "border-box",
    width: "100%",
    padding: "12px",
    border: "1px solid #374151",
    borderRadius: "8px",
    background: "#0b1220",
    color: "#ffffff",
    fontSize: "15px",
    resize: "vertical",
    fontFamily: "inherit",
  },
  message: { margin: 0, color: "#fca5a5", fontSize: "14px" },
  submit: {
    padding: "13px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  footer: {
    marginTop: "24px",
    marginBottom: 0,
    color: "#94a3b8",
    fontSize: "12px",
    textAlign: "center",
    lineHeight: 1.5,
  },
  dashboardPage: {
    minHeight: "100vh",
    background: "#080d19",
    color: "#f8fafc",
    fontFamily: "Arial, sans-serif",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    padding: "20px 5%",
    borderBottom: "1px solid #273449",
    background: "#111827",
  },
  brand: { margin: 0, fontSize: "22px" },
  topbarSubtitle: { margin: "5px 0 0", color: "#94a3b8", fontSize: "13px" },
  logoutButton: {
    padding: "10px 16px",
    border: "1px solid #475569",
    borderRadius: "8px",
    background: "#1f2937",
    color: "#f8fafc",
    cursor: "pointer",
  },
  dashboardContent: {
    width: "min(1400px, 92%)",
    margin: "0 auto",
    padding: "32px 0 48px",
  },
  welcome: { marginBottom: "24px" },
  eyebrow: {
    color: "#60a5fa",
    fontSize: "12px",
    fontWeight: "bold",
    letterSpacing: "2px",
  },
  welcomeHeading: { margin: "8px 0", fontSize: "30px" },
  muted: { color: "#94a3b8", lineHeight: 1.6, fontSize: "14px" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "14px",
    margin: "24px 0",
  },
  statCard: {
    padding: "20px",
    border: "1px solid #273449",
    borderRadius: "12px",
    background: "#111827",
  },
  statLabel: { margin: 0, color: "#94a3b8", fontSize: "13px" },
  statValue: { margin: "12px 0 0", fontSize: "30px", fontWeight: "bold" },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 360px), 1fr))",
    gap: "20px",
    alignItems: "start",
  },
  panel: {
    minWidth: 0,
    padding: "22px",
    border: "1px solid #273449",
    borderRadius: "12px",
    background: "#111827",
  },
  sectionHeading: { margin: "0 0 8px", fontSize: "20px" },
  empty: {
    padding: "24px 12px",
    border: "1px dashed #374151",
    borderRadius: "10px",
    textAlign: "center",
  },
  ticketList: { display: "flex", flexDirection: "column", gap: "14px" },
  ticket: {
    padding: "16px",
    border: "1px solid #334155",
    borderRadius: "10px",
    background: "#0b1220",
    overflowWrap: "anywhere",
  },
  ticketHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  ticketId: { color: "#93c5fd", fontSize: "12px", fontWeight: "bold" },
  statusBadge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  ticketTitle: { margin: "14px 0 8px", fontSize: "17px" },
  ticketDescription: {
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
  },
  ticketMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    color: "#94a3b8",
    fontSize: "12px",
    marginTop: "16px",
  },
  ticketDate: { color: "#64748b", fontSize: "12px", marginBottom: 0 },
};
