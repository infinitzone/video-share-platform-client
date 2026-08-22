"use client";

import { useState, useEffect } from "react";
import ToggleTheme from "@/utils/ToggleTheme";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME;
import {getAvatarUrl} from "@/utils/media";

interface NavbarProps {
  bg?: string;
  customClass?: string;
  isHomePage?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function Navbar({
  bg,
  customClass,
  isHomePage = false,
  onCollapseChange,
}: NavbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [user, setUser] = useState<ReturnType<typeof auth.getUser>>(null);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const loggedIn = !!auth.isLoggedIn();
    setIsAuth(loggedIn);
    if (loggedIn) {
      setUser(auth.getUser());
    }
  }, []);

  const handleToggleSidebar = () => {
    if (isHomePage) {
      if (typeof window !== "undefined" && window.innerWidth >= 1024) {
        setIsCollapsed((prev) => {
          const nextState = !prev;
          onCollapseChange?.(nextState);
          return nextState;
        });
      } else {
        setSidebarOpen((prev) => !prev);
      }
    } else {
      setSidebarOpen((prev) => !prev);
    }
  };

  return (
    <div>
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-[100] flex h-header w-full items-center justify-between gap-2 px-4 ${
          bg ?? "bg-canvas-subtle"
        } ${customClass ?? ""}`}
      >
        {/* Left Side: Toggle Button & Logo */}
        <div className="flex shrink-0 items-center gap-4">
          <button
            type="button"
            onClick={handleToggleSidebar}
            className="cursor-pointer"
            aria-label="Toggle navigation sidebar"
            style={{ background: "transparent", border: "none", color: "var(--color-text-default)" }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              height="24" 
              width="24" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              focusable="false" 
              aria-hidden="true"
            >
              <path d="M20 5H4a1 1 0 000 2h16a1 1 0 100-2Zm0 6H4a1 1 0 000 2h16a1 1 0 000-2Zm0 6H4a1 1 0 000 2h16a1 1 0 000-2Z" />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-2 no-underline hidden md:flex">
            <Image
              src="/logo/logo.png"
              alt={""+APP_NAME}
              width={20}
              height={20}
              className="avatar avatar-sm"
            />
            <span className="hidden font-semibold text-fg-default sm:inline">
              {APP_NAME}
            </span>
          </Link>
        </div>

        {/* Search */}
        <div className="flex min-w-0 flex-1 justify-center px-2 sm:px-4">
          <div className="input-group w-full max-w-[600px] nav-search-container">
            <input className="input min-w-0" type="search" placeholder="Search" />
            <span
              className="input-group-addon"
              style={{
                cursor: "pointer",
                color: "var(--color-fg-default)",
                backgroundColor: "var(--color-canvas-overlay)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#999999"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg>
            </span>
          </div>
        </div>

        {/* Profile Avatar Drawer Trigger */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-full outline-none"
            aria-label="Open profile menu"
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
          >
            <Image
              src={isAuth? getAvatarUrl(user?.avatar_path): "/avatar-placeholder.png"}
              alt={isAuth ? user?.display_name || "Profile" : "Guest"}
              width={32}
              height={32}
              className="avatar avatar-sm rounded-full object-cover"
            />
          </button>
        </div>
      </header>

      {/* Navigation Aside Panel */}
      <aside
        className={`fixed left-0 transition-all duration-300 ease-in-out border-r border-border-default bg-canvas-subtle ${
          isHomePage
            ? `top-[var(--header-height)] z-40 h-[calc(100vh-var(--header-height))] ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
              } ${isCollapsed ? "lg:w-16" : "lg:w-64"} w-64`
            : `top-0 z-[110] h-screen ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
              } w-64`
        }`}
      >
        {/* Header Header Bar inside Sidebar for Non-Home Pages */}
        {!isHomePage && (
          <div className="flex h-header items-center gap-4 px-4 border-b border-border-subtle shrink-0">
            <button
              type="button"
              onClick={handleToggleSidebar}
              className="cursor-pointer"
              aria-label="Toggle navigation sidebar"
              style={{ background: "transparent", border: "none", color: "var(--color-text-default)" }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                height="24" 
                width="24" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                focusable="false" 
                aria-hidden="true"
              >
                <path d="M20 5H4a1 1 0 000 2h16a1 1 0 100-2Zm0 6H4a1 1 0 000 2h16a1 1 0 000-2Zm0 6H4a1 1 0 000 2h16a1 1 0 000-2Z" />
              </svg>
            </button>

            <Link href="/" className="flex items-center gap-2 no-underline">
              <Image
                src="/logo/logo.png"
                alt={""+APP_NAME}
                width={20}
                height={20}
                className="avatar avatar-sm"
              />
              <span className="font-semibold text-fg-default">
                {APP_NAME}
              </span>
            </Link>
          </div>
        )}

        <nav className="flex flex-col gap-2 p-3 overflow-y-auto">
          {/* Subscriptions */}
          <div
            className="flex items-center gap-3 rounded-2 p-2 hover:bg-canvas-overlay cursor-pointer text-fg-default overflow-hidden transition-colors duration-200"
            title="Subscriptions"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 -960 960 960"
              width="24"
              fill="currentColor"
              className="shrink-0 text-fg-muted"
            >
              <path d="M120-160v-80h720v80H120Zm0-160v-80h720v80H120Zm0-160v-80h720v80H120Zm0-160v-80h720v80H120Z" />
            </svg>
            {(!isHomePage || !isCollapsed) && (
              <span className="whitespace-nowrap font-medium transition-opacity duration-300">
                Subscriptions
              </span>
            )}
          </div>

          <div className="my-2 h-px w-full bg-border-subtle" />
          {/* Trending Fields */}
          <div>
            {(!isHomePage || !isCollapsed) && (
              <div className="mb-3 flex items-center justify-between px-2 transition-opacity duration-300">
                <h2 className="text-sm font-semibold text-fg-default">Trending</h2>
                <span className="text-xs text-fg-muted">Explore</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <button
                title="Technology"
                className="group flex w-full cursor-pointer items-center justify-between rounded-2 p-2 text-left bg-canvas-overlay hover:bg-canvas-elevated border border-border-subtle overflow-hidden transition-colors duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="20"
                    viewBox="0 -960 960 960"
                    width="20"
                    fill="currentColor"
                    className="shrink-0 text-fg-muted"
                  >
                    <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Z" />
                  </svg>
                  {(!isHomePage || !isCollapsed) && (
                    <div className="min-w-0 transition-opacity duration-300">
                      <p className="truncate text-sm text-fg-default">Technology</p>
                      <p className="text-xs text-fg-muted">24K videos</p>
                    </div>
                  )}
                </div>
                {(!isHomePage || !isCollapsed) && (
                  <span className="text-xs text-accent group-hover:text-accent-hover transition-colors duration-200">
                    →
                  </span>
                )}
              </button>

              <button
                title="AI"
                className="group flex w-full cursor-pointer items-center  mjustify-between rounded-2 p-2 text-left bg-canvas-overlay hover:bg-canvas-elevated border border-border-subtle overflow-hidden transition-colors duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="20"
                    viewBox="0 -960 960 960"
                    width="20"
                    fill="currentColor"
                    className="shrink-0 text-fg-muted"
                  >
                    <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T900-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                  </svg>
                  {(!isHomePage || !isCollapsed) && (
                    <div className="min-w-0 transition-opacity duration-300">
                      <p className="truncate text-sm text-fg-default">AI</p>
                      <p className="text-xs text-fg-muted">14K videos</p>
                    </div>
                  )}
                </div>
                {(!isHomePage || !isCollapsed) && (
                  <span className="text-xs text-accent group-hover:text-accent-hover transition-colors duration-200">
                    →
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Navigation Overlay Backdrop */}
      {sidebarOpen && (
        <div
          className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 ${
            isHomePage ? "lg:hidden" : ""
          }`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Profile Drawer Backdrop */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-[150] bg-black/40 transition-opacity duration-300 ${
          drawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Profile Drawer */}
      <aside
        className={`fixed right-0 top-0 z-[200] flex h-screen w-[320px] max-w-[calc(100vw-16px)] flex-col bg-canvas-inset shadow-xl transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="navbar-menu w-full h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border-default p-4">
              {isAuth ? (
                <Link href={`/${user?.username}`} className="no-underline flex items-center gap-3">
                  <Image
                    src={isAuth? getAvatarUrl(user?.avatar_path): "/avatar-placeholder.png"}
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
                <a href="/login" className="btn btn-primary">
                  Sign in
                </a>
              )}

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

            <nav className="p-2 space-y-2">
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

          <div className="border-t border-border-default px-4 py-3 text-center text-xs text-fg-muted">
            {APP_NAME }
          </div>
        </div>
      </aside>
    </div>
  );
}