/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";

type Project = {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  logs: Log[];
  reward: Reward | null;
};

type Reward = {
  id: string;
  description: string;
};

type Log = {
  id: string;
  content: string;
  createdAt: string;
};

export default function TasksPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [logContent, setLogContent] = useState("");
  const [rewardDescription, setRewardDescription] = useState("");
  const [loading, setLoading] = useState(true);

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
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (res.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error("Error updating project status: ", error);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject) return;

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: logContent,
        }),
      });

      if (res.ok) {
        setLogContent("");
        setShowLogModal(false);
        setSelectedProject(null);
        fetchProjects();
      }
    } catch (error) {
      console.error("Error adding task log: ", error);
    }
  };

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject) return;

    try {
      const res = await fetch(`/api/projects/${selectedProject.id}/reward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: rewardDescription,
        }),
      });

      if (res.ok) {
        setRewardDescription("");
        setShowRewardModal(false);
        setSelectedProject(null);
        fetchProjects();
      }
    } catch (error) {
      console.log("Error adding reward: ", error);
    }
  };

  const toDoProjects = projects.filter((p) => p.status === "todo");
  const inProgressProjects = projects.filter((p) => p.status === "inprogress");
  const completedProjects = projects.filter((p) => p.status === "complete");
  const obsoleteProjects = projects.filter((p) => p.status === "obsolete");

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) {
    return <div className="loading">Loading projects...</div>;
  }

  return (
    <div className="tasks-page">
      <h1>Project Tasks</h1>

      <div className="columns-container">
        <div className="column">
          <div className="column-header">
            <h2>To Do</h2>
            <button type="button" onClick={() => setShowAddModal(true)}>
              + Add Item
            </button>
          </div>

          <div className="column-content">
            {toDoProjects.map((project) => (
              <div key={project.id} className="project-card">
                <h3>{project.title}</h3>
                <p>{project.description}</p>

                <div className="card-actions">
                  <button
                    onClick={() => handleStatusChange(project.id, "inprogress")}
                  >
                    Start
                  </button>
                  <button onClick={() => handleDeleteProject(project.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="column">
          <div className="column-header">
            <h2>In Progress</h2>
            <button
              type="button"
              className="add-button"
              onClick={() => {
                if (inProgressProjects.length > 0) {
                  setSelectedProject(inProgressProjects[0]);
                  setShowLogModal(true);
                }
              }}
              disabled={inProgressProjects.length === 0}
            >
              + Log Task
            </button>
          </div>

          <div className="column-content">
            {inProgressProjects.map((project) => (
              <div key={project.id} className="project-card">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="card-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProject(project);
                      setShowLogModal(true);
                    }}
                  >
                    Add Log
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(project.id, "complete")}
                  >
                    Move to Complete
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(project.id, "obsolete")}
                  >
                    Obsolete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="column">
          <div className="column-header">
            <h2>Completed</h2>
            <button
              type="button"
              className="add-button"
              onClick={() => {
                const projectWithoutReward = completedProjects.find(
                  (p) => !p.reward,
                );
                if (projectWithoutReward) {
                  setSelectedProject(projectWithoutReward);
                  setShowRewardModal(true);
                }
              }}
              disabled={!completedProjects.some((p) => !p.reward)}
            >
              + Add Reward
            </button>
          </div>

          <div className="column-content">
            {completedProjects.map((project) => (
              <div key={project.id} className="project-card">
                <h3>{project.title}</h3>
                <p>{project.description}</p>

                <div className="modal-actions">
                  <button
                    onClick={() => handleStatusChange(project.id, "inprogress")}
                  >
                    Move to In Progress
                  </button>
                  {project.reward ? (
                    <button
                      className="reward-btn"
                      onClick={() => {
                        setSelectedProject(project);
                        setShowRewardModal(true);
                      }}
                    >
                      Change Reward
                    </button>
                  ) : (
                    <button
                      className="reward-btn"
                      onClick={() => {
                        setSelectedProject(project);
                        setShowRewardModal(true);
                      }}
                    >
                      Add Reward
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="column">
          <div className="column-header">
            <h2>Obsolete</h2>
          </div>

          <div className="column-content">
            {obsoleteProjects.map((project) => (
              <div key={project.id} className="project-card obsolete">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteProject(project.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div
            className="modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
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
                <input
                  id="project-description"
                  type="text"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  required
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

      {showLogModal && selectedProject && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div
            className="modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <h2>Log Task for {selectedProject.title}</h2>
            <form onSubmit={handleAddLog}>
              <div className="form-group">
                <label htmlFor="task-description">Task Description</label>
                <textarea
                  id="task-description"
                  value={logContent}
                  onChange={(e) => setLogContent(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowLogModal(false)}>
                  Cancel
                </button>
                <button type="submit">Add Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRewardModal && selectedProject && (
        <div
          className="modal-overlay"
          onClick={() => setShowRewardModal(false)}
        >
          <div
            className="modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <h2>Add Reward for {selectedProject.title}</h2>
            <form onSubmit={handleAddReward}>
              <div className="form-group">
                <label htmlFor="reward-description">Reward Description</label>
                <textarea
                  id="reward-description"
                  value={rewardDescription}
                  onChange={(e) => setRewardDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowRewardModal(false)}>
                  Cancel
                </button>
                <button type="submit">Add Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
