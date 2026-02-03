"use client";

import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navigation() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  return (
    <nav className="navigation">
      <div className="navigation-header">
        <h2>Project Board Origin</h2>
      </div>

      <div className="navigation-tabs">
        <Link
          href="/dashboard/tasks"
          className={pathname === "/dashboard/tasks" ? "tab active" : "tab"}
        >
          Task
        </Link>
        <Link
          href="/dashboard/rewards"
          className={pathname === "/dashboard/rewards" ? "tab active" : "tab"}
        >
          Rewards
        </Link>
        <Link
          href="/dashboard/settings"
          className={pathname === "/dashboard/settings" ? "tab active" : "tab"}
        >
          Settings
        </Link>
      </div>

      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </nav>
  );
}
