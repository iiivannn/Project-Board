"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

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

  const handleToggleTheme = async () => {
    try {
      const res = await fetch("/api/user/theme", {
        method: "PATCH",
      });

      const data = await res.json();

      if (res.ok) {
        setTheme(data.theme);
        document.body.setAttribute("data-theme", data.theme);
      }
    } catch (error) {
      console.error("Error toggling theme:", error);
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
          <h2>Project Board Origin</h2>
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
            href="/dashboard/rewards"
            className={pathname === "/dashboard/rewards" ? "tab active" : "tab"}
            onClick={closeMenu}
          >
            Rewards
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
          <button
            className="theme-toggle"
            onClick={handleToggleTheme}
            aria-label="Toggle theme"
          >
            <span className="theme-icon">{theme === "dark" ? "☀️" : "🌙"}</span>
            <span className="theme-text">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          {/* Logout Button */}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}
