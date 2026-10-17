"use client";

import { useState } from "react";
import Link from "next/link";

export interface HeaderProps {
  variant?: "full" | "minimal";
  badge?: string;
  badgeType?: "default" | "success" | "error" | "warning";
  backHref?: string;
  backLabel?: string;
}

export default function Header({
  variant = "full",
  badge,
  badgeType = "default",
  backHref = "/",
  backLabel = "← Homepage",
}: HeaderProps) {
  const [open, setOpen] = useState(false);

  if (variant === "minimal") {
    return (
      <header className="topbar">
        <div className="wrap nav">
          <Link className="brand" href="/" aria-label="MCast home">
            <img src="/assets/mcast-logo.png" alt="MCast" />
          </Link>
          <div className="nav-actions" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "12px" }}>
            {badge && (
              <span className="pill" style={{ fontSize: "0.76rem" }}>
                <span
                  className="live-dot"
                  style={{
                    width: "7px",
                    height: "7px",
                    background:
                      badgeType === "success"
                        ? "#22c55e"
                        : badgeType === "error"
                        ? "#ef4444"
                        : "var(--yellow)",
                    boxShadow:
                      badgeType === "success"
                        ? "0 0 0 3px rgba(34,197,94,.2)"
                        : badgeType === "error"
                        ? "0 0 0 3px rgba(239,68,68,.2)"
                        : "0 0 0 3px rgba(255,229,0,.2)",
                    animation: badgeType === "error" ? "none" : undefined,
                  }}
                />
                {badge}
              </span>
            )}
            <Link
              className="btn btn-outline"
              href={backHref}
              style={{ padding: "8px 16px", fontSize: "0.82rem" }}
            >
              {backLabel}
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="topbar">
      <div className="wrap nav">
        <Link className="brand" href="/" aria-label="MCast home">
          <img src="/assets/mcast-logo.png" alt="MCast" />
        </Link>
        <nav className={`nav-links ${open ? "open" : ""}`} id="nav-links" aria-label="Main navigation">
          <Link href="/#features" onClick={() => setOpen(false)}>
            Features
          </Link>
          <Link href="/#how-it-works" onClick={() => setOpen(false)}>
            How it works
          </Link>
          <Link href="/#commands" onClick={() => setOpen(false)}>
            Commands
          </Link>
          <Link href="/#setup" onClick={() => setOpen(false)}>
            Setup
          </Link>
          <Link href="/#faq" onClick={() => setOpen(false)}>
            FAQ
          </Link>
        </nav>
        <div className="nav-actions">
          <Link className="btn btn-primary" href="/#download">
            Get MCast{" "}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3v12m-5-5 5 5 5-5" />
              <path d="M5 16v4h14v-4" />
            </svg>
          </Link>
          <button
            className="menu-toggle"
            id="menu-toggle"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-controls="nav-links"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

