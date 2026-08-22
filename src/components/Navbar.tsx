"use client";

import { useState, useEffect } from "react";
import ToggleTheme from "@/utils/ToggleTheme";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";

// Fallback avatar when user has no custom image or is logged out
const DUMMY_AVATAR =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBB4LQTn0vRq4ydPLp-uTj_lEUHOHYWUU18JlCq5KuMw&s=10";

interface HomeProps {
  bg?: string;
  customClass?: string;
}

export default function Navbar({ bg, customClass }: HomeProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<ReturnType<typeof auth.getUser>>(null);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const loggedIn = !!auth.isLoggedIn();
    setIsAuth(loggedIn);
    if (loggedIn) {
      setUser(auth.getUser());
    }
  }, []);

  const handleLogout = () => {
    auth.logout();
    setIsAuth(false);
    setUser(null);
    setDrawerOpen(false);
  };

  // Determine avatar source based on user data
  const avatarSrc = isAuth && user?.avatar_path ? "http://localhost"+user.avatar_path : "/avatar-placeholder.png";
  console.log(avatarSrc);
  return (
    <div>
      {/* Header */}
      <header
        className={`
          fixed top-0 left-0 right-0 z-[100] flex h-header w-full 
          items-center justify-between gap-2 px-4
          ${bg ?? "bg-canvas-subtle"}
          ${customClass ?? ""}
        `}  
      >
        {/* Logo */}
        <div className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo/logo.png"
            alt="Dekho"
            width={20}
            height={20}
            className="avatar avatar-sm"
          />
          <span className="hidden font-semibold text-fg-default sm:inline">
            Dekho
          </span>
        </div>

        {/* Search */}
        <div className="flex min-w-0 flex-1 justify-center px-2 sm:px-4">
          <div className="input-group w-full max-w-[600px] nav-search-container">
            <input
              className="input min-w-0"
              type="search"
              placeholder="Search"
            />
            <span
              className="input-group-addon"
              style={{
                cursor: "pointer",
                paddingRight: "20px",
                paddingLeft: "18px",
                color: "var(--color-fg-default)",
                backgroundColor: "var(--color-canvas-overlay )",
              }}
            >
              Search
            </span>
          </div>
        </div>

        {/* Actions - Avatar is always clickable */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-full outline-none"
            aria-label="Open menu"
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
          >
            <Image
              src={avatarSrc}
              alt={isAuth ? user?.display_name || "Profile" : "Guest"}
              width={32}
              height={32}
              className="avatar avatar-sm rounded-full object-cover"
            />
          </button>
        </div>
      </header>

      {/* Backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-[150] bg-black/40 transition-opacity duration-fast ${
          drawerOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-[200] flex h-screen w-[320px] max-w-[calc(100vw-16px)] flex-col bg-canvas-inset shadow-xl transition-transform duration-slow ease-out-expo ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="navbar-menu w-full h-full flex flex-col justify-between">
          <div>
            {/* Account Header inside Drawer */}
            <div className="flex items-center justify-between border-b border-border-default p-4">
              {isAuth ? (
                <Link href={`/${user?.username}`} className="no-underline flex items-center gap-3">
                  <Image
                    src={avatarSrc}
                    alt="Profile"
                    width={48}
                    height={48}
                    className="avatar avatar-sm rounded-full object-cover"
                  />

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-fg-default">
                      {user?.display_name || "User"}
                    </p>
                    <p className="truncate text-sm text-fg-muted">
                      @{user?.username || "username"}
                    </p>
                  </div>
                </Link>
              ) : (
                <a
                  href="/login"
                  className="btn btn-primary"
                >
                  Sign in
                </a>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="btn btn-ghost outline-none"
                aria-label="Close"
                style={{ borderRadius: "50px", padding: "10px" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 -960 960 960"
                  fill="currentColor"
                >
                  <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <nav className="p-2 space-y-2">
              {/* Appearance / Theme Toggle */}
              <div className="flex items-center justify-between bg-canvas-subtle rounded-2 px-3 py-2.5 hover:bg-canvas-subtle">
                <div className="flex items-center gap-3">
                  <span className="flex items-center text-fg-muted">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 -960 960 960"
                      fill="currentColor"
                    >
                      <path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z" />
                    </svg>
                  </span>
                  <span className="text-fg-default">Appearance</span>
                </div>
                <ToggleTheme />
              </div>
            </nav>
          </div>

          {/* Footer */}
          <div className="border-t border-border-default px-4 py-3 text-center text-xs text-fg-muted">
            Dekho
          </div>
        </div>
      </aside>
    </div>
  );
}