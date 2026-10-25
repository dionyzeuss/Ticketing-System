//it-support-system\app\admin\page.js

"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingTicketId, setUpdatingTicketId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // State for viewing and editing tickets.
  const [viewingTicket, setViewingTicket] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState("Medium");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingTicketId, setDeletingTicketId] = useState(null);

  // Load tickets from the API.
  const loadTickets = useCallback(async () => {
    try {
      const response = await fetch("/api/tickets");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load tickets.");
      }

      setTickets(data);
      return true;
    } catch (err) {
      setError(err.message || "Could not connect to the server.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load tickets when the dashboard first opens.
  useEffect(() => {
    let ignore = false;

    async function fetchTickets() {
      try {
        const response = await fetch("/api/tickets");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not load tickets.");
        }

        if (!ignore) {
          setTickets(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Could not load tickets.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchTickets();

    return () => {
      ignore = true;
    };
  }, []);

  // Search and filter tickets.
  const filteredTickets = tickets.filter((ticket) => {
    const matchesTitle = ticket.title
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());

    const matchesStatus =
      statusFilter === "All" || ticket.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || ticket.priority === priorityFilter;

    return matchesTitle && matchesStatus && matchesPriority;
  });

  async function updateTicketStatus(ticketId, status) {
    setError("");
    setSuccess("");
    setUpdatingTicketId(ticketId);

    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not update ticket status.");
      }

      const refreshed = await loadTickets();

      if (refreshed) {
        setSuccess("Ticket status updated successfully.");
      }
    } catch (err) {
      setError(err.message || "Could not update ticket status.");
    } finally {
      setUpdatingTicketId(null);
    }
  }

  // Assign a ticket to an IT support staff member.
  async function updateTicketAssignment(ticketId, assignedTo) {
    setError("");
    setSuccess("");
    setUpdatingTicketId(ticketId);

    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ assignedTo }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not assign ticket.");
      }

      const refreshed = await loadTickets();

      if (refreshed) {
        setSuccess("Ticket assignment updated successfully.");
      }
    } catch (err) {
      setError(err.message || "Could not assign ticket.");
    } finally {
      setUpdatingTicketId(null);
    }
  }

  // Open the edit form and prefill it with the ticket's current details.
  function startEditing(ticket) {
    setError("");
    setSuccess("");
    setViewingTicket(null);
    setEditingTicket(ticket);
    setEditTitle(ticket.title);
    setEditDescription(ticket.description);
    setEditPriority(ticket.priority);
  }

  // Save edits to an existing ticket.
  async function handleEditSubmit(event) {
    event.preventDefault();
    if (!editingTicket) return;

    setError("");
    setSuccess("");

    if (!editTitle.trim() || !editDescription.trim()) {
      setError("Please enter a title and description.");
      return;
    }

    try {
      setSavingEdit(true);
      const response = await fetch(`/api/tickets/${editingTicket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim(),
          priority: editPriority,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not edit ticket.");
      }

      setEditingTicket(null);
      const refreshed = await loadTickets();
      if (refreshed)
        setSuccess(
          `Ticket TKT-${String(data.id).padStart(4, "0")} updated successfully.`,
        );
    } catch (err) {
      setError(err.message || "Could not edit ticket.");
    } finally {
      setSavingEdit(false);
    }
  }

  // Confirm before permanently deleting a ticket.
  async function deleteTicket(ticket) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete TKT-${String(ticket.id).padStart(4, "0")} — "${ticket.title}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingTicketId(ticket.id);

    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not delete ticket.");
      }

      if (viewingTicket?.id === ticket.id) setViewingTicket(null);
      if (editingTicket?.id === ticket.id) setEditingTicket(null);
      const refreshed = await loadTickets();
      if (refreshed)
        setSuccess(
          `Ticket TKT-${String(ticket.id).padStart(4, "0")} deleted successfully.`,
        );
    } catch (err) {
      setError(err.message || "Could not delete ticket.");
    } finally {
      setDeletingTicketId(null);
    }
  }

  // Create a new support ticket.
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || !description.trim()) {
      setError("Please enter a title and description.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not create ticket.");
      }

      setTitle("");
      setDescription("");
      setPriority("Medium");

      const refreshed = await loadTickets();

      if (refreshed) {
        setSuccess("Ticket created successfully.");
      }
    } catch (err) {
      setError(err.message || "Could not create ticket.");
    } finally {
      setSaving(false);
    }
  }

  // Dashboard statistics use all tickets, not filtered tickets.
  const openCount = tickets.filter((ticket) => ticket.status === "Open").length;

  const progressCount = tickets.filter(
    (ticket) => ticket.status === "In Progress",
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) => ticket.status === "Resolved",
  ).length;

  // Clear all search and filter settings.
  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("All");
    setPriorityFilter("All");
  }

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Could not log out. Please try again.");
      }

      router.replace("/admin/login");
      router.refresh();
    } catch (err) {
      setError(err.message || "Logout failed.");
      setLoggingOut(false);
    }
  }

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">IT</div>
          <div>
            <h2>SupportDesk</h2>
            <span>Ticket Management</span>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <div className="nav-item active">
          <span>▦</span> Dashboard
        </div>

        <div className="nav-item">
          <span>▤</span> All Tickets
        </div>

        <div className="sidebar-footer">
          <div className="avatar">IT</div>

          <div className="sidebar-user">
            <strong>IT Support</strong>
            <span>Administrator</span>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            <span aria-hidden="true">↪</span>
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / Dashboard</p>
            <h1>IT Support Dashboard</h1>
          </div>

          <button
            className="refresh-button"
            onClick={loadTickets}
            type="button"
          >
            ↻ Refresh
          </button>
        </header>

        <section className="welcome-card">
          <div>
            <span className="eyebrow">SUPPORT OVERVIEW</span>
            <h2>Welcome to your support workspace.</h2>
            <p>
              Create support requests and monitor their progress in one place.
            </p>
          </div>

          <div className="welcome-symbol">⌘</div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span>Total Tickets</span>
              <span className="stat-icon blue">▤</span>
            </div>
            <strong>{tickets.length}</strong>
            <small>All recorded requests</small>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Open</span>
              <span className="stat-icon orange">◷</span>
            </div>
            <strong>{openCount}</strong>
            <small>Awaiting attention</small>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>In Progress</span>
              <span className="stat-icon purple">⚙</span>
            </div>
            <strong>{progressCount}</strong>
            <small>Currently being handled</small>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span>Resolved</span>
              <span className="stat-icon green">✓</span>
            </div>
            <strong>{resolvedCount}</strong>
            <small>Successfully completed</small>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel create-panel">
            <div className="panel-heading">
              <div>
                <h2>Create a Ticket</h2>
                <p>Describe the technical issue.</p>
              </div>
              <span className="heading-icon">＋</span>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="title">Ticket Title</label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Computer has no internet"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={150}
                required
              />

              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                placeholder="Describe the issue and any troubleshooting already attempted..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={5}
                required
              />

              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>

              {error && (
                <p className="message error" role="alert">
                  {error}
                </p>
              )}

              {success && (
                <p className="message success" role="status">
                  {success}
                </p>
              )}

              <button
                className="primary-button"
                type="submit"
                disabled={saving}
              >
                {saving ? "Creating..." : "+ Create Ticket"}
              </button>
            </form>
          </div>

          <div className="panel tickets-panel">
            <div className="panel-heading">
              <div>
                <h2>Recent Tickets</h2>
                <p>Search and manage your support requests.</p>
              </div>

              <span className="ticket-count">
                {filteredTickets.length} of {tickets.length}
              </span>
            </div>

            {/* Search and filter controls */}
            <div className="ticket-filters">
              <label htmlFor="ticket-search">Search by title</label>
              <input
                id="ticket-search"
                type="search"
                placeholder="Search printer, internet, computer..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              <div className="filter-row">
                <div className="filter-field">
                  <label htmlFor="status-filter">Status</label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option value="All">All statuses</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div className="filter-field">
                  <label htmlFor="priority-filter">Priority</label>
                  <select
                    id="priority-filter"
                    value={priorityFilter}
                    onChange={(event) => setPriorityFilter(event.target.value)}
                  >
                    <option value="All">All priorities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="clear-filters-button"
                onClick={clearFilters}
              >
                Clear search and filters
              </button>
            </div>

            {loading ? (
              <div className="empty-state">Loading tickets...</div>
            ) : tickets.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">▤</div>
                <h3>No tickets yet</h3>
                <p>Create your first ticket using the form.</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">⌕</div>
                <h3>No matching tickets</h3>
                <p>Try another title, status, or priority.</p>
                <button
                  type="button"
                  className="clear-filters-button"
                  onClick={clearFilters}
                >
                  Show all tickets
                </button>
              </div>
            ) : (
              <div className="ticket-list">
                {filteredTickets.map((ticket) => (
                  <article className="ticket-item" key={ticket.id}>
                    <div className="ticket-main">
                      <div className="ticket-id">
                        TKT-{String(ticket.id).padStart(4, "0")}
                      </div>

                      <h3>{ticket.title}</h3>

                      <div className="ticket-client">
                        <span className="ticket-client-avatar">
                          {(ticket.client?.name || "U").charAt(0).toUpperCase()}
                        </span>

                        <div className="ticket-client-info">
                          <strong>
                            {ticket.client?.name || "Unknown client"}
                          </strong>
                          <span>{ticket.client?.email || "Not available"}</span>
                        </div>
                      </div>

                      <p className="ticket-description">{ticket.description}</p>

                      <div className="ticket-tags">
                        <span
                          className={`priority-tag ${ticket.priority.toLowerCase()}`}
                        >
                          {ticket.priority}
                        </span>

                        <select
                          className="ticket-status-select"
                          aria-label={`Update status for ${ticket.title}`}
                          value={ticket.status}
                          disabled={updatingTicketId === ticket.id}
                          onChange={(event) =>
                            updateTicketStatus(ticket.id, event.target.value)
                          }
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>

                        {updatingTicketId === ticket.id && (
                          <span className="updating-label">Updating...</span>
                        )}

                        <label className="assignment-field">
                          <span>Assigned To</span>

                          <select
                            value={ticket.assignedTo || "Unassigned"}
                            aria-label={`Assign ${ticket.title}`}
                            disabled={updatingTicketId === ticket.id}
                            onChange={(event) =>
                              updateTicketAssignment(
                                ticket.id,
                                event.target.value,
                              )
                            }
                          >
                            <option value="Unassigned">Unassigned</option>
                            <option value="Domnic Escalante">
                              Domnic Escalante
                            </option>
                            <option value="IT Support Staff 2">
                              IT Support Staff 2
                            </option>
                            <option value="IT Support Staff 3">
                              IT Support Staff 3
                            </option>
                          </select>
                        </label>
                      </div>

                      <div className="ticket-actions">
                        <button
                          type="button"
                          className="ticket-action-button"
                          onClick={() => setViewingTicket(ticket)}
                        >
                          View details
                        </button>
                        <button
                          type="button"
                          className="ticket-action-button"
                          onClick={() => startEditing(ticket)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="ticket-action-button danger"
                          onClick={() => deleteTicket(ticket)}
                          disabled={deletingTicketId === ticket.id}
                        >
                          {deletingTicketId === ticket.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>

                    <time className="ticket-date">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </time>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {viewingTicket && (
          <div
            className="modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setViewingTicket(null);
            }}
          >
            <section
              className="ticket-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="details-heading"
            >
              <div className="modal-heading">
                <div>
                  <span className="ticket-id">
                    TKT-{String(viewingTicket.id).padStart(4, "0")}
                  </span>
                  <h2 id="details-heading">Ticket Details</h2>
                </div>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setViewingTicket(null)}
                  aria-label="Close details"
                >
                  ×
                </button>
              </div>

              <h3 className="details-title">{viewingTicket.title}</h3>

              <div className="details-client">
                <span className="details-client-label">SUBMITTED BY</span>
                <strong>
                  {viewingTicket.client?.name || "Unknown client"}
                </strong>
                <span>{viewingTicket.client?.email || "Not available"}</span>
              </div>

              <p className="details-description">{viewingTicket.description}</p>

              <div className="details-grid">
                <div>
                  <span>Priority</span>
                  <strong
                    className={`priority-tag ${viewingTicket.priority.toLowerCase()}`}
                  >
                    {viewingTicket.priority}
                  </strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{viewingTicket.status}</strong>
                </div>
                <div>
                  <span>Created</span>
                  <strong>
                    {new Date(viewingTicket.createdAt).toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span>Last updated</span>
                  <strong>
                    {new Date(viewingTicket.updatedAt).toLocaleString()}
                  </strong>
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setViewingTicket(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => startEditing(viewingTicket)}
                >
                  Edit ticket
                </button>
              </div>
            </section>
          </div>
        )}

        {editingTicket && (
          <div
            className="modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !savingEdit)
                setEditingTicket(null);
            }}
          >
            <section
              className="ticket-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-heading"
            >
              <div className="modal-heading">
                <div>
                  <span className="ticket-id">
                    TKT-{String(editingTicket.id).padStart(4, "0")}
                  </span>
                  <h2 id="edit-heading">Edit Ticket</h2>
                  <p>Update the ticket information below.</p>
                </div>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setEditingTicket(null)}
                  disabled={savingEdit}
                  aria-label="Close edit form"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <label htmlFor="edit-title">Ticket Title</label>
                <input
                  id="edit-title"
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  maxLength={150}
                  required
                />
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  rows={5}
                  required
                />
                <label htmlFor="edit-priority">Priority</label>
                <select
                  id="edit-priority"
                  value={editPriority}
                  onChange={(event) => setEditPriority(event.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
                {error && (
                  <p className="message error" role="alert">
                    {error}
                  </p>
                )}
                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setEditingTicket(null)}
                    disabled={savingEdit}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={savingEdit}
                  >
                    {savingEdit ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        <footer className="footer">
          IT Support Ticket System · Built with Next.js, Prisma and MariaDB
        </footer>
      </section>
    </main>
  );
}
