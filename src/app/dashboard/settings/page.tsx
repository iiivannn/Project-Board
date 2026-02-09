/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [loadingUsername, setLoadingUsername] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError("");
    setUsernameSuccess("");
    setLoadingUsername(true);

    try {
      const res = await fetch("/api/user/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername }),
      });

      const data = await res.json();

      if (!res.ok) {
        setUsernameError(data.error || "Failed to update username");
        setLoadingUsername(false);
        return;
      }

      setUsernameSuccess("Username updated successfully!");
      setUsername(newUsername);
      setLoadingUsername(false);

      // Clear success message after 3 seconds
      setTimeout(() => setUsernameSuccess(""), 3000);
    } catch (error) {
      setUsernameError("Something went wrong");
      setLoadingUsername(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setLoadingPassword(true);

    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Failed to update password");
        setLoadingPassword(false);
        return;
      }

      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setLoadingPassword(false);

      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (error) {
      setPasswordError("Something went wrong");
      setLoadingPassword(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch("/api/user/theme");
        const data = await res.json();
        setUsername(data.username);
        setNewUsername(data.username);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchUserData();
  }, []);

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="settings-container">
        {/* Username Section */}
        <div className="settings-card">
          <h2>Change Username</h2>
          <form onSubmit={handleUsernameChange}>
            <div className="form-group">
              <label>Current Username</label>
              <input
                type="text"
                value={username}
                disabled
                className="disabled-input"
              />
            </div>

            <div className="form-group">
              <label>New Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
            </div>

            {usernameError && (
              <div className="error-message">{usernameError}</div>
            )}
            {usernameSuccess && (
              <div className="success-message">{usernameSuccess}</div>
            )}

            <button
              type="submit"
              disabled={loadingUsername || newUsername === username}
              className="submit-button"
            >
              {loadingUsername ? "Updating..." : "Update Username"}
            </button>
          </form>
        </div>

        {/* Password Section */}
        <div className="settings-card">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {passwordError && (
              <div className="error-message">{passwordError}</div>
            )}
            {passwordSuccess && (
              <div className="success-message">{passwordSuccess}</div>
            )}

            <button
              type="submit"
              disabled={loadingPassword}
              className="submit-button"
            >
              {loadingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Logout Section */}
        <div className="settings-card danger-card">
          <h2>Logout</h2>
          <p>Sign out of your account</p>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
