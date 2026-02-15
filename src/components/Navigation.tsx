"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    async function fetchTheme() {
      try {
        const res = await fetch("/api/user/theme");
        const data = await res.json();
        setTheme(data.theme);
        document.body.setAttribute("data-theme", data.theme);
      } catch (error) {
        console.error("Error fetching theme:", error);
      }
    }

    fetchTheme();
  }, []);

  const handleSetTheme = async (newTheme: "light" | "dark") => {
    try {
      const res = await fetch("/api/user/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme }),
      });

      const data = await res.json();

      if (res.ok) {
        setTheme(data.theme);
        document.body.setAttribute("data-theme", data.theme);
      }
    } catch (error) {
      console.error("Error setting theme:", error);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button - Mobile Only */}
      <button
        className={`hamburger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay - Mobile Only */}
      {isOpen && <div className="nav-overlay" onClick={closeMenu}></div>}

      {/* Navigation */}
      <nav className={`navigation ${isOpen ? "open" : ""}`}>
        <div className="navigation-header">
          <Image
            src="/project-board-logo.png"
            alt="Project Board Logo"
            width={32}
            height={32}
          />
          <h2>Project Board</h2>
        </div>

        <div className="navigation-tabs">
          <Link
            href="/dashboard/tasks"
            className={pathname === "/dashboard/tasks" ? "tab active" : "tab"}
            onClick={closeMenu}
          >
            Tasks
          </Link>
          <Link
            href="/dashboard/details"
            className={pathname === "/dashboard/details" ? "tab active" : "tab"}
            onClick={closeMenu}
          >
            Details
          </Link>
          <Link
            href="/dashboard/settings"
            className={
              pathname === "/dashboard/settings" ? "tab active" : "tab"
            }
            onClick={closeMenu}
          >
            Settings
          </Link>
        </div>

        <div className="navigation-footer">
          {/* Theme Toggle */}
          {/* Theme Toggle Buttons */}
          <div className="theme-buttons">
            <button
              className={`theme-button ${theme === "light" ? "active" : ""}`}
              onClick={() => handleSetTheme("light")}
              aria-label="Light mode"
            >
              <span className="theme-text">Light</span>
            </button>
            <button
              className={`theme-button ${theme === "dark" ? "active" : ""}`}
              onClick={() => handleSetTheme("dark")}
              aria-label="Dark mode"
            >
              <span className="theme-text">Dark</span>
            </button>
          </div>

          {/* Logout Button */}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}
