"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isLoggedIn, clearAuth, getUser } from "@/lib/auth";
import type { User } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const router = useRouter();
  const loggedIn = typeof window !== "undefined" ? isLoggedIn() : false;

  useEffect(() => {
    setSessionUser(getUser());
  }, [loggedIn]);

  function handleLogout() {
    clearAuth();
    router.push("/");
    router.refresh();
  }

  const links = [
    { href: "/map", label: "Map" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/stories", label: "Stories" },
    { href: "/about", label: "About" },
    { href: "/donate", label: "Donate" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">PP</span>
            </div>
            <span className="text-lg font-bold text-ink">
              Pilgrim <span className="text-primary">Protect</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {l.label}
              </Link>
            ))}
            {loggedIn ? (
              <>
                {sessionUser?.role === "admin" ||
                sessionUser?.role === "super_admin" ? (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-primary hover:text-primary/80"
                  >
                    Admin
                  </Link>
                ) : null}
                {sessionUser?.role === "donor" ? (
                  <Link
                    href="/portal"
                    className="text-sm font-medium text-primary hover:text-primary/80"
                  >
                    My Portal
                  </Link>
                ) : null}
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-muted-foreground hover:text-destructive"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-muted-foreground"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 pb-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
          {loggedIn ? (
            <>
              {sessionUser?.role === "admin" ||
              sessionUser?.role === "super_admin" ? (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-primary"
                >
                  Admin
                </Link>
              ) : null}
              {sessionUser?.role === "donor" ? (
                <Link
                  href="/portal"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-primary"
                >
                  My Portal
                </Link>
              ) : null}
              <button onClick={handleLogout} className="block py-2 text-sm font-medium text-red-500">
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-primary">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
