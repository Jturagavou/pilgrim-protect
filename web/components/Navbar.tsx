"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import type { User } from "@/lib/types";
import { clearAuth, getUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

function subscribeToAuthChange(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const sessionUser = useSyncExternalStore(
    subscribeToAuthChange,
    () => getUser() as User | null,
    () => null
  );
  const router = useRouter();

  const loggedIn = !!sessionUser;

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
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#5b5957]/95 text-white backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          <Link href="/" className="flex items-center gap-2" aria-label="Pilgrim Protect home">
            <BrandLogo compact light />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-semibold text-white/88 transition-colors hover:text-pilgrim-gold"
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
                    className="text-sm font-semibold text-white/88 transition-colors hover:text-pilgrim-gold"
                  >
                    Admin
                  </Link>
                ) : null}
                {sessionUser?.role === "donor" ? (
                  <Link
                    href="/portal"
                    className="text-sm font-semibold text-white/88 transition-colors hover:text-pilgrim-gold"
                  >
                    My Portal
                  </Link>
                ) : null}
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-white/72 transition-colors hover:text-orange-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="text-sm font-semibold text-white/88 transition-colors hover:text-pilgrim-gold"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-white/90 hover:text-pilgrim-gold"
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
        <div className="md:hidden border-t border-white/10 bg-[#5b5957] px-4 pb-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-white/90 hover:text-pilgrim-gold"
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
                  className="block py-2 text-sm font-semibold text-white/90 hover:text-pilgrim-gold"
                >
                  Admin
                </Link>
              ) : null}
              {sessionUser?.role === "donor" ? (
                <Link
                  href="/portal"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm font-semibold text-white/90 hover:text-pilgrim-gold"
                >
                  My Portal
                </Link>
              ) : null}
              <button onClick={handleLogout} className="block py-2 text-sm font-semibold text-orange-200 hover:text-pilgrim-gold">
                Logout
              </button>
            </>
          ) : (
            <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-semibold text-white/90 hover:text-pilgrim-gold">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
