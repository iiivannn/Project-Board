"use client";

import Link from "next/link";
import Image from "next/image";

type Variant = "landing" | "login" | "register";

export default function PublicTopBar({ variant }: { variant: Variant }) {
  return (
    <header className="pub-topbar">
      <Link href="/" className="pub-topbar__brand">
        <Image
          src="/project-board-logo.png"
          alt="Project Board Logo"
          width={32}
          height={32}
        />
        <span className="pub-topbar__name">Project Board</span>
      </Link>

      <nav className="pub-topbar__right">
        {variant === "landing" && (
          <>
            <Link href="/login" className="pub-topbar__link">
              Log in
            </Link>
            <Link href="/register" className="pub-topbar__cta">
              Get started
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
