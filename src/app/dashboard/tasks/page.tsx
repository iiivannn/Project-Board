"use client";

import { useState, useEffect } from "react";

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

export default function TasksPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Form states
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [logContent, setLogContent] = useState("");
  const [rewardDescription, setRewardDescription] = useState("");
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editingLogContent, setEditingLogContent] = useState("");

  // Reward editing states
  const [showRewardEditModal, setShowRewardEditModal] = useState(false);
  const [editRewardPassword, setEditRewardPassword] = useState("");
  const [editRewardDescription, setEditRewardDescription] = useState("");
  const [rewardEditError, setRewardEditError] = useState("");

  // For log modal with project selection
  const [selectedProjectIdForLog, setSelectedProjectIdForLog] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        setProjects(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching projects: ", error);
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching projects: ", error);
      setLoading(false);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newProjectTitle,
          description: newProjectDescription,
        }),
      });

      if (res.ok) {
        setNewProjectTitle("");
        setNewProjectDescription("");
        setShowAddModal(false);
        fetchProjects();
      }
    } catch (error) {
      console.error("Error creating project: ", error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setShowProjectModal(false);
        fetchProjects();
      }
    } catch (error) {
      console.error("Error deleting project: ", error);
    }
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchProjects();
        // Refresh the selected project if modal is open
        if (selectedProject?.id === projectId) {
          const updatedProject = await res.json();
          setSelectedProject(updatedProject);
        }
      }
    } catch (error) {
      console.error("Error updating project status: ", error);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!logContent.trim()) return;

    const projectId = selectedProject?.id || selectedProjectIdForLog;
    if (!projectId) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: logContent }),
      });

      if (res.ok) {
        setLogContent("");
        setShowLogModal(false);
        setSelectedProjectIdForLog("");
        fetchProjects();

        // Refresh selected project if modal is open
        if (selectedProject) {
          const updated = projects.find((p) => p.id === projectId);
          if (updated) {
            const refreshed = await fetch(`/api/projects`);
            const allProjects = await refreshed.json();
            const updatedProject = allProjects.find(
              (p: Project) => p.id === projectId,
            );
            setSelectedProject(updatedProject);
          }
        }
      }
    } catch (error) {
      console.error("Error adding task log: ", error);
    }
  };

  const handleUpdateLog = async (logId: string) => {
    if (!editingLogContent.trim() || !selectedProject) return;

    try {
      const res = await fetch(
        `/api/projects/${selectedProject.id}/logs/${logId}`,
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

        // Refresh modal
        const refreshed = await fetch(`/api/projects`);
        const allProjects = await refreshed.json();
        const updatedProject = allProjects.find(
          (p: Project) => p.id === selectedProject.id,
        );
        setSelectedProject(updatedProject);
      }
    } catch (error) {
      console.error("Error updating log: ", error);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!selectedProject) return;
    if (!confirm("Are you sure you want to delete this log?")) return;

    try {
      const res = await fetch(
        `/api/projects/${selectedProject.id}/logs/${logId}`,
        {
          method: "DELETE",
        },
      );

      if (res.ok) {
        fetchProjects();

        // Refresh modal
        const refreshed = await fetch(`/api/projects`);
        const allProjects = await refreshed.json();
        const updatedProject = allProjects.find(
          (p: Project) => p.id === selectedProject.id,
        );
        setSelectedProject(updatedProject);
      }
    } catch (error) {
      console.error("Error deleting log: ", error);
    }
  };

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject || !rewardDescription.trim()) return;

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/reward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: rewardDescription }),
      });

      if (res.ok) {
        setRewardDescription("");
        fetchProjects();

        // Refresh modal
        const refreshed = await fetch(`/api/projects`);
        const allProjects = await refreshed.json();
        const updatedProject = allProjects.find(
          (p: Project) => p.id === selectedProject.id,
        );
        setSelectedProject(updatedProject);
      }
    } catch (error) {
      console.log("Error adding reward: ", error);
    }
  };

  const handleEditReward = async (e: React.FormEvent) => {
    e.preventDefault();
    setRewardEditError("");

    if (!selectedProject || !editRewardDescription.trim()) return;

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/reward`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: editRewardDescription,
          password: editRewardPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRewardEditError(data.error || "Failed to update reward");
        return;
      }

      setEditRewardPassword("");
      setEditRewardDescription("");
      setShowRewardEditModal(false);
      fetchProjects();

      // Refresh modal
      const refreshed = await fetch(`/api/projects`);
      const allProjects = await refreshed.json();
      const updatedProject = allProjects.find(
        (p: Project) => p.id === selectedProject.id,
      );
      setSelectedProject(updatedProject);
    } catch (error) {
      console.error("Error editing reward: ", error);
      setRewardEditError("Something went wrong");
    }
  };

  const handleCardClick = (project: Project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleHeaderLogClick = (status: string) => {
    const projectsInStatus = projects.filter((p) => p.status === status);
    if (projectsInStatus.length > 0) {
      setSelectedProjectIdForLog(projectsInStatus[0].id);
      setShowLogModal(true);
    }
  };

  const toDoProjects = projects.filter((p) => p.status === "todo");
  const inProgressProjects = projects.filter((p) => p.status === "in progress");
  const completedProjects = projects.filter((p) => p.status === "complete");
  const obsoleteProjects = projects.filter((p) => p.status === "obsolete");

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  return (
    <div className="tasks-page">
      <h1>Project Tasks</h1>

      <div className="columns-container">
        {/* TO DO COLUMN */}
        <div className="column">
          <div className="column-header">
            <h2>To Do</h2>
            <button
              type="button"
              className="add-button"
              onClick={() => setShowAddModal(true)}
            >
              + Add Item
            </button>
          </div>

          <div className="column-content">
            {toDoProjects.length === 0 ? (
              <div className="empty-column">No projects yet</div>
            ) : (
              toDoProjects.map((project) => (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() => handleCardClick(project)}
                >
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* IN PROGRESS COLUMN */}
        <div className="column">
          <div className="column-header">
            <h2>In Progress</h2>
            <button
              type="button"
              className="add-button"
              onClick={() => handleHeaderLogClick("in progress")}
              disabled={inProgressProjects.length === 0}
            >
              + Log Task
            </button>
          </div>

          <div className="column-content">
            {inProgressProjects.length === 0 ? (
              <div className="empty-column">No projects in progress</div>
            ) : (
              inProgressProjects.map((project) => (
                <div
                  key={project.id}
                  className="project-card"
                  onClick={() => handleCardClick(project)}
                >
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  {project.logs.length > 0 && (
                    <span className="log-count">
                      {project.logs.length} log(s)
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* COMPLETE COLUMN */}
        <div className="column">
          <div className="column-header">
            <h2>Complete</h2>
            <button
              type="button"
              className="add-button"
              onClick={() => {
                const projectWithoutReward = completedProjects.find(
                  (p) => !p.reward,
                );
                if (projectWithoutReward) {
                  setSelectedProject(projectWithoutReward);
                  setShowProjectModal(true);
                }
              }}
              disabled={!completedProjects.some((p) => !p.reward)}
            >
              + Add Reward
            </button>
          </div>

          <div className="column-content">
            {completedProjects.length === 0 ? (
              <div className="empty-column">No completed projects</div>
            ) : (
              completedProjects.map((project) => (
                <div
                  key={project.id}
                  className="project-card complete"
                  onClick={() => handleCardClick(project)}
                >
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>

                  {/* Show log count */}
                  {project.logs.length > 0 && (
                    <span className="log-count">
                      {project.logs.length} log(s)
                    </span>
                  )}

                  {/* Show reward */}
                  {project.reward && (
                    <span className="reward-badge">
                      🎁 {project.reward.description}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* OBSOLETE COLUMN */}
        <div className="column">
          <div className="column-header">
            <h2>Obsolete</h2>
          </div>

          <div className="column-content">
            {obsoleteProjects.length === 0 ? (
              <div className="empty-column">No obsolete projects</div>
            ) : (
              obsoleteProjects.map((project) => (
                <div
                  key={project.id}
                  className="project-card obsolete"
                  onClick={() => handleCardClick(project)}
                >
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ADD PROJECT MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Project</h2>
            <form onSubmit={handleAddProject}>
              <div className="form-group">
                <label htmlFor="project-title">Title</label>
                <input
                  id="project-title"
                  type="text"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="project-description">Description</label>
                <textarea
                  id="project-description"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit">Add Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROJECT DETAILS MODAL */}
      {showProjectModal && selectedProject && (
        <div
          className="modal-overlay"
          onClick={() => setShowProjectModal(false)}
        >
          <div
            className="modal modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>{selectedProject.title}</h2>
                <p className="project-description">
                  {selectedProject.description}
                </p>
              </div>
              <button
                className="close-button"
                onClick={() => setShowProjectModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Project Info */}
              <div className="project-info">
                <div className="info-row">
                  <strong>Status:</strong>
                  <span
                    className={`status-badge status-${selectedProject.status.replace(/\s+/g, "-")}`}
                  >
                    {selectedProject.status}
                  </span>
                </div>
                <div className="info-row">
                  <strong>Created:</strong>
                  <span>
                    {new Date(selectedProject.createdAt).toLocaleString()}
                  </span>
                </div>
                {selectedProject.status === "complete" && (
                  <div className="info-row">
                    <strong>Completed:</strong>
                    <span>
                      {new Date(selectedProject.updatedAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Add Log Section */}
              <div className="section">
                <h3>Add Task Log</h3>
                <form onSubmit={handleAddLog} className="inline-form">
                  <textarea
                    value={logContent}
                    onChange={(e) => setLogContent(e.target.value)}
                    placeholder="What did you work on?"
                    rows={3}
                    required
                  />
                  <button type="submit" className="btn-primary">
                    Add Log
                  </button>
                </form>
              </div>

              {/* Add/View Reward Section */}
              <div className="section">
                <h3>Reward</h3>
                {selectedProject.reward ? (
                  <div className="reward-display">
                    <div className="reward-content">
                      <span className="reward-icon">🎁</span>
                      <div>
                        <p>{selectedProject.reward.description}</p>
                        <small>
                          Added on{" "}
                          {new Date(
                            selectedProject.reward.createdAt,
                          ).toLocaleDateString()}
                        </small>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-edit-reward"
                      onClick={() => {
                        setEditRewardDescription(
                          selectedProject.reward!.description,
                        );
                        setShowRewardEditModal(true);
                      }}
                    >
                      Edit Reward
                    </button>
                  </div>
                ) : selectedProject.status === "complete" ? (
                  <form onSubmit={handleAddReward} className="inline-form">
                    <input
                      type="text"
                      value={rewardDescription}
                      onChange={(e) => setRewardDescription(e.target.value)}
                      placeholder="Enter reward description..."
                      required
                    />
                    <button type="submit" className="btn-primary">
                      Add Reward
                    </button>
                  </form>
                ) : (
                  <p className="disabled-text">
                    Complete this project to add a reward
                  </p>
                )}
              </div>

              {/* Logs Table */}
              <div className="section">
                <h3>Task Logs ({selectedProject.logs.length})</h3>
                {selectedProject.logs.length === 0 ? (
                  <p className="empty-text">No logs yet</p>
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

              {/* Status Actions */}
              <div className="section">
                <h3>Actions</h3>
                <div className="status-actions">
                  {selectedProject.status === "todo" && (
                    <button
                      onClick={() =>
                        handleStatusChange(selectedProject.id, "in progress")
                      }
                      className="btn-status"
                    >
                      Start Project
                    </button>
                  )}
                  {selectedProject.status === "in progress" && (
                    <>
                      <button
                        onClick={() =>
                          handleStatusChange(selectedProject.id, "complete")
                        }
                        className="btn-status"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() =>
                          handleStatusChange(selectedProject.id, "obsolete")
                        }
                        className="btn-status btn-warning"
                      >
                        Mark Obsolete
                      </button>
                    </>
                  )}
                  {selectedProject.status === "complete" && (
                    <button
                      onClick={() =>
                        handleStatusChange(selectedProject.id, "in progress")
                      }
                      className="btn-status"
                    >
                      Move to In Progress
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteProject(selectedProject.id)}
                    className="btn-status btn-danger"
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOG MODAL WITH PROJECT SELECTION */}
      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Task Log</h2>
            <form onSubmit={handleAddLog}>
              <div className="form-group">
                <label htmlFor="project-select">Select Project</label>
                <select
                  id="project-select"
                  value={selectedProjectIdForLog}
                  onChange={(e) => setSelectedProjectIdForLog(e.target.value)}
                  required
                >
                  <option value="">-- Choose a project --</option>
                  {projects
                    .filter((p) => p.status === "in progress")
                    .map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="log-content">Log Content</label>
                <textarea
                  id="log-content"
                  value={logContent}
                  onChange={(e) => setLogContent(e.target.value)}
                  rows={4}
                  placeholder="What did you work on?"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowLogModal(false)}>
                  Cancel
                </button>
                <button type="submit">Add Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT REWARD MODAL */}
      {showRewardEditModal && selectedProject && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowRewardEditModal(false);
            setRewardEditError("");
            setEditRewardPassword("");
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Reward</h2>
            <p className="modal-info">
              Enter your password to confirm editing the reward for{" "}
              <strong>{selectedProject.title}</strong>
            </p>
            <form onSubmit={handleEditReward}>
              <div className="form-group">
                <label htmlFor="edit-reward-description">
                  Reward Description
                </label>
                <input
                  id="edit-reward-description"
                  type="text"
                  value={editRewardDescription}
                  onChange={(e) => setEditRewardDescription(e.target.value)}
                  placeholder="Enter new reward description..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-reward-password">Password</label>
                <input
                  id="edit-reward-password"
                  type="password"
                  value={editRewardPassword}
                  onChange={(e) => setEditRewardPassword(e.target.value)}
                  placeholder="Enter your password..."
                  required
                />
              </div>

              {rewardEditError && (
                <div className="error-message">{rewardEditError}</div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowRewardEditModal(false);
                    setRewardEditError("");
                    setEditRewardPassword("");
                  }}
                >
                  Cancel
                </button>
                <button type="submit">Update Reward</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
