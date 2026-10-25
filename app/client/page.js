//it-support-system\app\client\page.js

"use client";

import { useCallback, useEffect, useState } from "react";
import loginDesign from "../page.module.css";
import styles from "./client-dashboard.module.css";

export default function ClientPage() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
      const data = await response.json();

      if (!response.ok || !data.user) {
        setUser(null);
        setTickets([]);
        return;
      }

      setUser(data.user);

      const ticketResponse = await fetch("/api/client/tickets");
      const ticketData = await ticketResponse.json();

      if (ticketResponse.ok) {
        setTickets(ticketData.tickets || []);
      } else {
        setTicketMessage(ticketData.error || "Unable to load tickets.");
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleRefresh() {
    setRefreshing(true);

    try {
      await loadDashboard();
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboard();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [loadDashboard]);

  useEffect(() => {
    let ignore = false;

    async function fetchDashboard() {
      try {
        const response = await fetch("/api/client/me");
        const data = await response.json();

        if (!response.ok || !data.user) {
          if (!ignore) {
            setUser(null);
            setTickets([]);
          }
          return;
        }

        const ticketResponse = await fetch("/api/client/tickets");
        const ticketData = await ticketResponse.json();

        if (ignore) return;

        setUser(data.user);

        if (ticketResponse.ok) {
          setTickets(ticketData.tickets || []);
        } else {
          setTicketMessage(ticketData.error || "Unable to load tickets.");
        }
      } catch (error) {
        if (!ignore) {
          console.error("Dashboard loading error:", error);
          setMessage("Unable to connect to the server.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      ignore = true;
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
      <main className={styles.loadingPage}>
        <div className={styles.loadingMark}>IT</div>
        <p>Loading your support workspace...</p>
        <span className={styles.loadingBar} />
      </main>
    );
  }

  if (user) {
    return (
      <main className={styles.dashboardPage}>
        <header className={styles.topbar}>
          <a href="/client" className={styles.brand}>
            <span className={styles.brandIcon}>IT</span>
            <span className={styles.brandText}>
              <strong>
                SUPPORT<span>DESK</span>
              </strong>
              <small>CLIENT SERVICE PORTAL</small>
            </span>
          </a>

          <div className={styles.topbarRight}>
            <span className={styles.accountLabel}>
              <span className={styles.onlineDot} />
              Client workspace
            </span>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className={styles.refreshButton}
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className={styles.logoutButton}
            >
              {loggingOut ? "Signing out..." : "Log out"}
            </button>
          </div>
        </header>

        <div className={styles.dashboardContent}>
          <section className={styles.welcome}>
            <div>
              <p className={styles.eyebrow}>CLIENT OVERVIEW</p>
              <h1>Welcome back, {user.name}.</h1>
              <p className={styles.welcomeDescription}>
                Manage your support requests and keep track of their progress.
              </p>
            </div>

            <div className={styles.welcomeStatus}>
              <span className={styles.onlineDot} />
              Support portal active
            </div>
          </section>

          {message && (
            <p role="alert" className={styles.notice}>
              {message}
            </p>
          )}

          <section className={styles.statsGrid} aria-label="Ticket statistics">
            <StatCard
              label="Total tickets"
              value={tickets.length}
              detail="All your requests"
              type="total"
            />
            <StatCard
              label="Open"
              value={openCount}
              detail="Awaiting action"
              type="open"
            />
            <StatCard
              label="In progress"
              value={inProgressCount}
              detail="Being handled"
              type="progress"
            />
            <StatCard
              label="Resolved"
              value={resolvedCount}
              detail="Completed requests"
              type="resolved"
            />
          </section>

          <section className={styles.contentGrid}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div className={styles.panelHeadingIcon}>+</div>
                <div>
                  <h2>Submit a support ticket</h2>
                  <p>Tell our IT team what you need help with.</p>
                </div>
              </div>

              <form onSubmit={handleCreateTicket} className={styles.form}>
                <label className={styles.label} htmlFor="ticket-title">
                  Issue title <span>Required</span>
                  <input
                    id="ticket-title"
                    className={styles.input}
                    value={ticketTitle}
                    onChange={(event) => setTicketTitle(event.target.value)}
                    placeholder="e.g. Unable to connect to Wi-Fi"
                    maxLength={150}
                    required
                  />
                </label>

                <label className={styles.label} htmlFor="ticket-description">
                  Description <span>Required</span>
                  <textarea
                    id="ticket-description"
                    className={styles.textarea}
                    value={ticketDescription}
                    onChange={(event) =>
                      setTicketDescription(event.target.value)
                    }
                    placeholder="Describe the issue, what happened, and any error messages..."
                    rows={6}
                    required
                  />
                </label>

                <label className={styles.label} htmlFor="ticket-priority">
                  Priority
                  <select
                    id="ticket-priority"
                    className={styles.input}
                    value={ticketPriority}
                    onChange={(event) => setTicketPriority(event.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </label>

                {ticketMessage && (
                  <p
                    role="status"
                    className={
                      ticketMessage.toLowerCase().includes("success")
                        ? styles.successMessage
                        : styles.errorMessage
                    }
                  >
                    {ticketMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={ticketLoading}
                  className={styles.submitButton}
                >
                  {ticketLoading ? "Submitting request..." : "Submit ticket"}
                  {!ticketLoading && <span aria-hidden="true">→</span>}
                </button>

                <p className={styles.formFootnote}>
                  Please avoid including passwords or other sensitive account
                  information in your ticket.
                </p>
              </form>
            </section>

            <section className={`${styles.panel} ${styles.ticketsPanel}`}>
              <div className={styles.ticketsHeading}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelHeadingIcon}>≡</div>
                  <div>
                    <h2>My support tickets</h2>
                    <p>Review the status of your submitted requests.</p>
                  </div>
                </div>
                <span className={styles.ticketCount}>
                  {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
                </span>
              </div>

              {tickets.length === 0 ? (
                <div className={styles.empty}>
                  <div className={styles.emptyIcon}>□</div>
                  <h3>No tickets yet</h3>
                  <p>When you submit a support request, it will appear here.</p>
                </div>
              ) : (
                <div className={styles.ticketList}>
                  {tickets.map((ticket) => (
                    <article key={ticket.id} className={styles.ticket}>
                      <div className={styles.ticketTop}>
                        <span className={styles.ticketId}>
                          TKT-{String(ticket.id).padStart(4, "0")}
                        </span>
                        <span
                          className={`${styles.statusBadge} ${
                            styles[statusClass(ticket.status)]
                          }`}
                        >
                          <span className={styles.badgeDot} />
                          {ticket.status}
                        </span>
                      </div>

                      <h3 className={styles.ticketTitle}>{ticket.title}</h3>

                      <p className={styles.ticketDescription}>
                        {ticket.description}
                      </p>

                      <div className={styles.ticketDivider} />

                      <div className={styles.ticketDetails}>
                        <div>
                          <span className={styles.detailLabel}>Priority</span>
                          <span
                            className={`${styles.priorityBadge} ${
                              styles[priorityClass(ticket.priority)]
                            }`}
                          >
                            {ticket.priority || "Medium"}
                          </span>
                        </div>
                        <div>
                          <span className={styles.detailLabel}>
                            Assigned to
                          </span>
                          <strong className={styles.assignedValue}>
                            {ticket.assignedTo || "Not yet assigned"}
                          </strong>
                        </div>
                      </div>

                      <p className={styles.ticketDate}>
                        Submitted{" "}
                        {ticket.createdAt
                          ? new Date(ticket.createdAt).toLocaleString()
                          : "Date unavailable"}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </section>

          <footer className={styles.footer}>
            <span>SUPPORTDESK · CLIENT PORTAL</span>
            <span>IT SERVICE MANAGEMENT</span>
          </footer>
        </div>
      </main>
    );
  }

  // Login and registration view retains the existing animated design.
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
              <span className={loginDesign.featureIcon}>●</span> Submit support
              tickets
            </div>
            <div>
              <span className={loginDesign.featureIcon}>●</span> Track ticket
              status
            </div>
            <div>
              <span className={loginDesign.featureIcon}>●</span> Monitor
              resolutions
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

function StatCard({ label, value, detail, type }) {
  return (
    <article className={`${styles.statCard} ${styles[`stat${type}`]}`}>
      <div className={styles.statTop}>
        <span className={styles.statLabel}>{label}</span>
        <span className={styles.statMarker} />
      </div>
      <p className={styles.statValue}>{value}</p>
      <p className={styles.statDetail}>{detail}</p>
    </article>
  );
}

function statusClass(status) {
  const classes = {
    Open: "statusOpen",
    "In Progress": "statusProgress",
    Resolved: "statusResolved",
  };

  return classes[status] || "statusDefault";
}

function priorityClass(priority) {
  const classes = {
    Low: "priorityLow",
    Medium: "priorityMedium",
    High: "priorityHigh",
    Critical: "priorityCritical",
  };

  return classes[priority] || "priorityMedium";
}
