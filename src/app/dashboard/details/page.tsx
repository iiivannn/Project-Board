"use client";

import { useState, useEffect, useMemo } from "react";

type Project = {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  logs: Log[];
  reward: Reward | null;
};

type Reward = {
  id: string;
  description: string;
  createdAt: string;
};

type Log = {
  id: string;
  content: string;
  createdAt: string;
};

export default function DetailsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Project editing states
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedReward, setEditedReward] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Password modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  // Log form states
  const [showAddLogForm, setShowAddLogForm] = useState(false);
  const [newLogContent, setNewLogContent] = useState("");
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editingLogContent, setEditingLogContent] = useState("");

  const formatStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      todo: "To Do",
      inprogress: "In Progress",
      complete: "Complete",
      obsolete: "Obsolete",
    };
    return statusMap[status] || status;
  };

  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Update edited values when project changes
  useEffect(() => {
    if (selectedProject) {
      setEditedTitle(selectedProject.title);
      setEditedDescription(selectedProject.description);
      setEditedReward(selectedProject.reward?.description || "");
      setHasChanges(false);
    } else {
      setEditedTitle("");
      setEditedDescription("");
      setEditedReward("");
      setHasChanges(false);
    }
  }, [selectedProject]);

  // Check for changes
  useEffect(() => {
    if (!selectedProject) return;

    const titleChanged = editedTitle !== selectedProject.title;
    const descChanged = editedDescription !== selectedProject.description;
    const rewardChanged =
      editedReward !== (selectedProject.reward?.description || "");

    setHasChanges(titleChanged || descChanged || rewardChanged);
  }, [editedTitle, editedDescription, editedReward, selectedProject]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSaveChanges = () => {
    if (!hasChanges || !selectedProject) return;
    setShowPasswordModal(true);
  };

  const handleConfirmSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!selectedProject || !password) return;

    try {
      // Update project title and description
      const projectRes = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editedTitle,
          description: editedDescription,
          password,
        }),
      });

      if (!projectRes.ok) {
        const data = await projectRes.json();
        setPasswordError(data.error || "Failed to update project");
        return;
      }

      // Update or create reward if changed
      const originalReward = selectedProject.reward?.description || "";
      if (editedReward !== originalReward) {
        if (editedReward && !selectedProject.reward) {
          // Create new reward
          await fetch(`/api/projects/${selectedProject.id}/reward`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description: editedReward }),
          });
        } else if (editedReward && selectedProject.reward) {
          // Update existing reward
          await fetch(`/api/projects/${selectedProject.id}/reward`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              description: editedReward,
              password,
            }),
          });
        } else if (!editedReward && selectedProject.reward) {
          // Delete reward
          await fetch(`/api/projects/${selectedProject.id}/reward`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          });
        }
      }

      // Success - refresh and close
      setPassword("");
      setShowPasswordModal(false);
      setHasChanges(false);
      fetchProjects();
    } catch (error) {
      console.error("Error saving changes:", error);
      setPasswordError("Something went wrong");
    }
  };

  const handleCancelChanges = () => {
    if (selectedProject) {
      setEditedTitle(selectedProject.title);
      setEditedDescription(selectedProject.description);
      setEditedReward(selectedProject.reward?.description || "");
      setHasChanges(false);
    }
  };

  const handleDeleteProject = () => {
    if (!selectedProject) return;

    if (
      !confirm(
        `Are you sure you want to delete "${selectedProject.title}"? This action is irreversible.`,
      )
    ) {
      return;
    }

    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!selectedProject || !deletePassword) return;

    try {
      const projectRes = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });

      if (!projectRes.ok) {
        const data = await projectRes.json();
        setPasswordError(data.error || "Failed to delete project");
        return;
      }

      setDeletePassword("");
      setShowDeleteModal(false);
      setSelectedProjectId("");
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project: ", error);
      setPasswordError("Something went wrong");
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newLogContent.trim()) return;

    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newLogContent }),
      });

      if (res.ok) {
        setNewLogContent("");
        setShowAddLogForm(false);
        fetchProjects();
      }
    } catch (error) {
      console.error("Error adding log:", error);
    }
  };

  const handleUpdateLog = async (logId: string) => {
    if (!selectedProjectId || !editingLogContent.trim()) return;

    try {
      const res = await fetch(
        `/api/projects/${selectedProjectId}/logs/${logId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: editingLogContent }),
        },
      );

      if (res.ok) {
        setEditingLogId(null);
        setEditingLogContent("");
        fetchProjects();
      }
    } catch (error) {
      console.error("Error updating log:", error);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!selectedProjectId) return;
    if (!confirm("Are you sure you want to delete this log?")) return;

    try {
      const res = await fetch(
        `/api/projects/${selectedProjectId}/logs/${logId}`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error("Error deleting log:", error);
    }
  };

  if (loading) {
    return <div className="loading">Loading details...</div>;
  }

  return (
    <div className="details-page">
      <h1>Project Details</h1>

      {/* PROJECT SELECTOR */}
      <div className="project-selector">
        <div className="form-group">
          <label htmlFor="project-select">Select Project</label>
          <select
            id="project-select"
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setShowAddLogForm(false);
              setEditingLogId(null);
            }}
          >
            <option value="">-- Choose a project --</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title} ({formatStatus(project.status)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PROJECT DETAILS TABLE */}
      <section className="details-section">
        <h2>Project Information</h2>

        {!selectedProject ? (
          <div className="empty-state">
            <p>No project selected</p>
          </div>
        ) : (
          <div className="project-details-table">
            <div className="details-grid">
              {/* Title & Description */}
              <div className="detail-row">
                <div className="detail-label">Title & Description</div>
                <div className="detail-value">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    placeholder="Project title..."
                  />
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder="Project description..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Status (Read-only) */}
              <div className="detail-row">
                <div className="detail-label">Status</div>
                <div className="detail-value">
                  <span
                    className={`status-badge status-${selectedProject.status}`}
                  >
                    {formatStatus(selectedProject.status)}
                  </span>
                </div>
              </div>

              {/* Reward */}
              <div className="detail-row">
                <div className="detail-label">Reward</div>
                <div className="detail-value">
                  <input
                    type="text"
                    value={editedReward}
                    onChange={(e) => setEditedReward(e.target.value)}
                    placeholder="Reward description..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="detail-row">
                <div className="detail-label">Actions</div>
                <div className="detail-value detail-actions">
                  <button
                    onClick={handleSaveChanges}
                    className="btn-save"
                    disabled={!hasChanges}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelChanges}
                    className="btn-cancel"
                    disabled={!hasChanges}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    className="btn-delete-project"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* PROJECT LOGS TABLE */}
      <section className="details-section">
        <h2>Project Logs</h2>

        {!selectedProject ? (
          <div className="empty-state">
            <p>No project selected</p>
          </div>
        ) : (
          <>
            <div className="logs-controls">
              <button
                className="add-log-button"
                onClick={() => setShowAddLogForm(!showAddLogForm)}
              >
                {showAddLogForm ? "Cancel" : "+ Add Log"}
              </button>
            </div>

            {showAddLogForm && (
              <form onSubmit={handleAddLog} className="add-log-form">
                <textarea
                  value={newLogContent}
                  onChange={(e) => setNewLogContent(e.target.value)}
                  placeholder="Enter log content..."
                  rows={3}
                  required
                />
                <button type="submit" className="btn-primary">
                  Add Log
                </button>
              </form>
            )}

            <div className="logs-list">
              {selectedProject.logs.length === 0 ? (
                <div className="empty-state">
                  <p>No logs for this project yet.</p>
                </div>
              ) : (
                <div className="logs-table">
                  {selectedProject.logs.map((log) => (
                    <div key={log.id} className="log-row">
                      <div className="log-content">
                        {editingLogId === log.id ? (
                          <textarea
                            value={editingLogContent}
                            onChange={(e) =>
                              setEditingLogContent(e.target.value)
                            }
                            rows={2}
                            autoFocus
                          />
                        ) : (
                          <p>{log.content}</p>
                        )}
                        <small>
                          {new Date(log.createdAt).toLocaleString()}
                        </small>
                      </div>
                      <div className="log-actions">
                        {editingLogId === log.id ? (
                          <>
                            <button
                              onClick={() => handleUpdateLog(log.id)}
                              className="btn-save"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingLogId(null);
                                setEditingLogContent("");
                              }}
                              className="btn-cancel"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingLogId(log.id);
                                setEditingLogContent(log.content);
                              }}
                              className="btn-edit"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              className="btn-delete"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* PASSWORD CONFIRMATION MODAL */}
      {showPasswordModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowPasswordModal(false);
            setPassword("");
            setPasswordError("");
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Changes</h2>
            <p className="modal-info">
              Enter your password to confirm changes to{" "}
              <strong>{selectedProject?.title}</strong>
            </p>
            <form onSubmit={handleConfirmSave}>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password..."
                  required
                />
              </div>

              {passwordError && (
                <div className="error-message">{passwordError}</div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword("");
                    setPasswordError("");
                  }}
                >
                  Cancel
                </button>
                <button type="submit">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PROJECT CONFIRMATION MODAL */}
      {showDeleteModal && selectedProject && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowDeleteModal(false);
            setDeletePassword("");
            setPasswordError("");
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Project</h2>
            <p className="modal-info modal-warning">
              You are about to permanently delete{" "}
              <strong>{selectedProject.title}</strong>. This will also delete
              all logs and rewards associated with this project. This action
              cannot be undone.
            </p>
            <form onSubmit={handleConfirmDelete}>
              <div className="form-group">
                <label htmlFor="delete-password">Password</label>
                <input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password to confirm..."
                  required
                />
              </div>

              {passwordError && (
                <div className="error-message">{passwordError}</div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword("");
                    setPasswordError("");
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-danger-action">
                  Delete Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
