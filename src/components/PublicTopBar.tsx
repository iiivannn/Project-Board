"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type Variant = "landing" | "login" | "register";

export default function PublicTopBar({ variant }: { variant: Variant }) {
  const [hideTopbar, setHideTopbar] = useState(false);

  useEffect(() => {
    let lastScrollY = 0;

    const handler = () => {
      const currentScrollY = window.scrollY;
      setHideTopbar(currentScrollY > lastScrollY);
      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handler);

    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className={`pub-topbar ${hideTopbar ? "hidden" : ""}`}>
      <Link href="/" className="pub-topbar__brand">
        <Image
          src="/project-board-logo.png"
          alt="Project Board Logo"
          width={24}
          height={24}
        />
        <span className="pub-topbar__name">Project Board</span>
      </Link>

      <nav className="pub-topbar__right">
        {variant === "landing" && (
          <>
            <Link href="/login" className="pub-topbar__link">
              Sign in
            </Link>
            <Link href="/register" className="pub-topbar__cta">
              Get Started
            </Link>
          </>
        )}
        {variant === "login" && (
          <>
            <span className="pub-topbar__hint">New here?</span>
            <Link href="/register" className="pub-topbar__ghost">
              Create account
            </Link>
          </>
        )}
        {variant === "register" && (
          <>
            <span className="pub-topbar__hint">Have an account?</span>
            <Link href="/login" className="pub-topbar__ghost">
              Log in
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
