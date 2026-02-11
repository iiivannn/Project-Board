"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import DroppableColumn from "../../../components/DroppableColumn";

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
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [modalMode, setModalMode] = useState<
    "view" | "addProject" | "addLog" | "addReward"
  >("view");
  const [selectedProjectForAction, setSelectedProjectForAction] =
    useState<string>("");

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
  const [showDeleteRewardModal, setShowDeleteRewardModal] = useState(false);
  const [deleteRewardPassword, setDeleteRewardPassword] = useState("");
  const [deleteRewardError, setDeleteRewardError] = useState("");

  // For log modal with project selection
  const [selectedProjectIdForLog, setSelectedProjectIdForLog] = useState("");

  const formatStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      todo: "To Do",
      inprogress: "In Progress",
      complete: "Complete",
      obsolete: "Obsolete",
    };
    return statusMap[status] || status;
  };

  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
  );

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
        setShowProjectModal(false);
        setModalMode("view");
        setSelectedProjectForAction("");
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

  const handleStatusChange = async (
    projectId: string,
    newStatus: string,
    previousStatus: string,
  ) => {
    // 1. OPTIMISTIC UPDATE (Immediate UI change)
    // Update the list
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p)),
    );

    // Update the modal (if open)
    if (selectedProject?.id === projectId) {
      setSelectedProject((prev) =>
        prev ? { ...prev, status: newStatus } : null,
      );
    }

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Server error");

      const updatedProject = await res.json();

      // 2. RECONCILE (Sync any other server-calculated fields like updatedAt)
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, ...updatedProject } : p)),
      );

      if (selectedProject?.id === projectId) {
        setSelectedProject(updatedProject);
      }
    } catch (error) {
      console.error("Error updating status:", error);

      // 3. ROLLBACK (Only on failure)
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, status: previousStatus } : p,
        ),
      );

      if (selectedProject?.id === projectId) {
        setSelectedProject((prev) =>
          prev ? { ...prev, status: previousStatus } : null,
        );
      }

      alert("Failed to update status. Reverting change...");
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

        // If in action mode, close modal
        if (modalMode === "addLog") {
          setShowProjectModal(false);
          setModalMode("view");
          setSelectedProjectForAction("");
        }

        setSelectedProjectIdForLog("");
        fetchProjects();

        // Refresh selected project if modal is open in view mode
        if (modalMode === "view" && selectedProject) {
          const refreshed = await fetch(`/api/projects`);
          const allProjects = await refreshed.json();
          const updatedProject = allProjects.find(
            (p: Project) => p.id === projectId,
          );
          setSelectedProject(updatedProject);
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

        // If in action mode, close modal
        if (modalMode === "addReward") {
          setShowProjectModal(false);
          setModalMode("view");
          setSelectedProjectForAction("");
        }

        fetchProjects();

        // Refresh modal if in view mode
        if (modalMode === "view") {
          const refreshed = await fetch(`/api/projects`);
          const allProjects = await refreshed.json();
          const updatedProject = allProjects.find(
            (p: Project) => p.id === selectedProject.id,
          );
          setSelectedProject(updatedProject);
        }
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

  const handleDeleteReward = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteRewardError("");

    if (!selectedProject) return;

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/reward`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deleteRewardPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDeleteRewardError(data.error || "Failed to delete reward");
        return;
      }

      setDeleteRewardPassword("");
      setShowDeleteRewardModal(false);
      fetchProjects();

      // Refresh modal
      const refreshed = await fetch(`/api/projects`);
      const allProjects = await refreshed.json();
      const updatedProject = allProjects.find(
        (p: Project) => p.id === selectedProject.id,
      );
      setSelectedProject(updatedProject);
    } catch (error) {
      console.error("Error deleting reward: ", error);
      setDeleteRewardError("Something went wrong");
    }
  };

  const handleCardClick = (project: Project) => {
    setSelectedProject(project);
    setModalMode("view");
    setShowProjectModal(true);
  };

  const handleColumnButtonClick = (
    mode: "addProject" | "addLog" | "addReward",
    status: string,
  ) => {
    const projectsInStatus = projects.filter((p) => p.status === status);

    if (mode === "addProject") {
      // For "Add Item" - start with no selection
      setSelectedProject(null);
      setSelectedProjectForAction("");
      setModalMode("addProject");
      setShowProjectModal(true);
    } else if (mode === "addLog") {
      // For "Log Task" - preselect first in-progress project if exists
      if (projectsInStatus.length > 0) {
        setSelectedProject(projectsInStatus[0]);
        setSelectedProjectForAction(projectsInStatus[0].id);
        setModalMode("addLog");
        setShowProjectModal(true);
      }
    } else if (mode === "addReward") {
      // For "Add Reward" - find first project without reward
      const projectWithoutReward = projectsInStatus.find((p) => !p.reward);
      if (projectWithoutReward) {
        setSelectedProject(projectWithoutReward);
        setSelectedProjectForAction(projectWithoutReward.id);
        setModalMode("addReward");
        setShowProjectModal(true);
      }
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const project = projects.find((p) => p.id === active.id);
    setActiveProject(project || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (!over) return;

    const projectId = active.id as string;
    const overId = over.id as string;

    // Find the current project state
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    // Determine the new status
    const overProject = projects.find((p) => p.id === overId);
    const newStatus = overProject ? overProject.status : overId;

    // FIX: Use the correct status values from database
    const validStatuses = ["todo", "inprogress", "complete", "obsolete"];
    if (!validStatuses.includes(newStatus) || project.status === newStatus) {
      return;
    }

    // Store the old status for potential rollback
    const previousStatus = project.status;

    // Update UI optimistically
    setProjects((prevProjects) =>
      prevProjects.map((p) =>
        p.id === projectId ? { ...p, status: newStatus } : p,
      ),
    );

    if (selectedProject?.id === projectId) {
      setSelectedProject({ ...selectedProject, status: newStatus });
    }

    // Trigger API call with rollback capability
    handleStatusChange(projectId, newStatus, previousStatus);
  };

  const toDoProjects = projects.filter((p) => p.status === "todo");
  const inProgressProjects = projects.filter((p) => p.status === "inprogress");
  const completedProjects = projects.filter((p) => p.status === "complete");
  const obsoleteProjects = projects.filter((p) => p.status === "obsolete");

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="tasks-page">
        <h1>Project Tasks</h1>

        <div className="columns-container">
          {/* TO DO COLUMN */}
          <DroppableColumn
            id="todo"
            title="To Do"
            projects={toDoProjects}
            onCardClick={handleCardClick}
            headerButton={
              <button
                type="button"
                className="add-button"
                onClick={() => handleColumnButtonClick("addProject", "todo")}
              >
                + Add Item
              </button>
            }
          />

          {/* IN PROGRESS COLUMN */}
          <DroppableColumn
            id="inprogress"
            title="In Progress"
            projects={inProgressProjects}
            onCardClick={handleCardClick}
            headerButton={
              <button
                type="button"
                className="add-button"
                onClick={() => handleColumnButtonClick("addLog", "inprogress")}
                disabled={inProgressProjects.length === 0}
              >
                + Log Task
              </button>
            }
          />

          {/* COMPLETE COLUMN */}
          <DroppableColumn
            id="complete"
            title="Complete"
            projects={completedProjects}
            onCardClick={handleCardClick}
            headerButton={
              <button
                type="button"
                className="add-button"
                onClick={() => handleColumnButtonClick("addReward", "complete")}
                disabled={!completedProjects.some((p) => !p.reward)}
              >
                + Add Reward
              </button>
            }
          />

          {/* OBSOLETE COLUMN */}
          <DroppableColumn
            id="obsolete"
            title="Obsolete"
            projects={obsoleteProjects}
            onCardClick={handleCardClick}
          />
        </div>

        <DragOverlay>
          {activeProject ? (
            <div className="project-card dragging">
              <h3>{activeProject.title}</h3>
              <p>{activeProject.description}</p>
            </div>
          ) : null}
        </DragOverlay>

        {/* PROJECT DETAILS MODAL */}
        {showProjectModal && (
          <div
            className="modal-overlay"
            onClick={() => {
              setShowProjectModal(false);
              setModalMode("view");
              setSelectedProjectForAction("");
            }}
          >
            <div
              className="modal modal-large"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  {modalMode === "view" && selectedProject && (
                    <>
                      <h2>{selectedProject.title}</h2>
                      <p className="project-description">
                        {selectedProject.description}
                      </p>
                    </>
                  )}
                  {modalMode === "addProject" && <h2>Add New Project</h2>}
                  {modalMode === "addLog" && <h2>Add Task Log</h2>}
                  {modalMode === "addReward" && <h2>Add Reward</h2>}
                </div>
                <button
                  className="close-button"
                  onClick={() => {
                    setShowProjectModal(false);
                    setModalMode("view");
                    setSelectedProjectForAction("");
                  }}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                {/* ADD PROJECT MODE */}
                {modalMode === "addProject" && (
                  <div className="section">
                    <h3>Select Project or Create New</h3>
                    <div className="form-group">
                      <label htmlFor="project-action-select">Project</label>
                      <select
                        id="project-action-select"
                        value={selectedProjectForAction}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "__new__") {
                            // Show create new form
                            setSelectedProjectForAction("__new__");
                          } else if (value) {
                            // Load existing project
                            const proj = projects.find((p) => p.id === value);
                            if (proj) {
                              setSelectedProject(proj);
                              setSelectedProjectForAction(value);
                              setModalMode("view");
                            }
                          }
                        }}
                      >
                        <option value="">-- Select a project --</option>
                        <option value="__new__">Create New Project</option>
                      </select>
                    </div>

                    {selectedProjectForAction === "__new__" && (
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
                          <label htmlFor="project-description">
                            Description
                          </label>
                          <textarea
                            id="project-description"
                            value={newProjectDescription}
                            onChange={(e) =>
                              setNewProjectDescription(e.target.value)
                            }
                            rows={4}
                          />
                        </div>

                        <div className="modal-actions">
                          <button
                            type="button"
                            onClick={() => {
                              setShowProjectModal(false);
                              setModalMode("view");
                              setSelectedProjectForAction("");
                            }}
                          >
                            Cancel
                          </button>
                          <button type="submit">Add Project</button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* ADD LOG MODE */}
                {modalMode === "addLog" && (
                  <div className="section">
                    <h3>Select Project</h3>
                    <div className="form-group">
                      <label htmlFor="log-project-select">Project</label>
                      <select
                        id="log-project-select"
                        value={selectedProjectForAction}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value) {
                            const proj = projects.find((p) => p.id === value);
                            if (proj) {
                              setSelectedProject(proj);
                              setSelectedProjectForAction(value);
                            }
                          }
                        }}
                      >
                        <option value="">-- Select a project --</option>
                        {inProgressProjects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedProject && (
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
                    )}
                  </div>
                )}

                {/* ADD REWARD MODE */}
                {modalMode === "addReward" && (
                  <div className="section">
                    <h3>Select Project</h3>
                    <div className="form-group">
                      <label htmlFor="reward-project-select">Project</label>
                      <select
                        id="reward-project-select"
                        value={selectedProjectForAction}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value) {
                            const proj = projects.find((p) => p.id === value);
                            if (proj) {
                              setSelectedProject(proj);
                              setSelectedProjectForAction(value);
                            }
                          }
                        }}
                      >
                        <option value="">-- Select a project --</option>
                        {completedProjects
                          .filter((p) => !p.reward)
                          .map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.title}
                            </option>
                          ))}
                      </select>
                    </div>

                    {selectedProject && (
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
                    )}
                  </div>
                )}

                {/* VIEW MODE - ORIGINAL MODAL CONTENT */}
                {modalMode === "view" && selectedProject && (
                  <>
                    {/* Project Info */}
                    <div className="project-info">
                      <div className="info-row">
                        <strong>Status:</strong>
                        <span
                          className={`status-badge status-${selectedProject.status}`}
                        >
                          {formatStatus(selectedProject.status)}
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
                            {new Date(
                              selectedProject.updatedAt,
                            ).toLocaleString()}
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
                          <div className="reward-actions">
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
                            <button
                              type="button"
                              className="btn-delete-reward"
                              onClick={() => setShowDeleteRewardModal(true)}
                            >
                              Delete Reward
                            </button>
                          </div>
                        </div>
                      ) : selectedProject.status === "complete" ? (
                        <form
                          onSubmit={handleAddReward}
                          className="inline-form"
                        >
                          <input
                            type="text"
                            value={rewardDescription}
                            onChange={(e) =>
                              setRewardDescription(e.target.value)
                            }
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
                              handleStatusChange(
                                selectedProject.id,
                                "inprogress",
                                selectedProject.status,
                              )
                            }
                            className="btn-status"
                          >
                            Start Project
                          </button>
                        )}
                        {selectedProject.status === "inprogress" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  selectedProject.id,
                                  "complete",
                                  selectedProject.status,
                                )
                              }
                              className="btn-status"
                            >
                              Mark Complete
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  selectedProject.id,
                                  "obsolete",
                                  selectedProject.status,
                                )
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
                              handleStatusChange(
                                selectedProject.id,
                                "inprogress",
                                selectedProject.status,
                              )
                            }
                            className="btn-status"
                          >
                            Move to In Progress
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDeleteProject(selectedProject.id)
                          }
                          className="btn-status btn-danger"
                        >
                          Delete Project
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
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

        {/* DELETE REWARD MODAL */}
        {showDeleteRewardModal && selectedProject && (
          <div
            className="modal-overlay"
            onClick={() => {
              setShowDeleteRewardModal(false);
              setDeleteRewardError("");
              setDeleteRewardPassword("");
            }}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Delete Reward</h2>
              <p className="modal-info modal-warning">
                Are you sure you want to delete the reward for{" "}
                <strong>{selectedProject.title}</strong>? This action cannot be
                undone.
              </p>
              <form onSubmit={handleDeleteReward}>
                <div className="form-group">
                  <label htmlFor="delete-reward-password">Password</label>
                  <input
                    id="delete-reward-password"
                    type="password"
                    value={deleteRewardPassword}
                    onChange={(e) => setDeleteRewardPassword(e.target.value)}
                    placeholder="Enter your password to confirm..."
                    required
                  />
                </div>

                {deleteRewardError && (
                  <div className="error-message">{deleteRewardError}</div>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteRewardModal(false);
                      setDeleteRewardError("");
                      setDeleteRewardPassword("");
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-danger-action">
                    Delete Reward
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}
