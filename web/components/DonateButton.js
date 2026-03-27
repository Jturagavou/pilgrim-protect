"use client";

import Link from "next/link";

export default function DonateButton({
  schoolId,
  label = "Sponsor This School",
  className = "",
  size = "default",
}) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-colors bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2";

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    default: "text-sm px-5 py-2.5",
    lg: "text-base px-6 py-3",
  };

  const href = schoolId ? `/donate?school=${schoolId}` : "/donate";

  return (
    <Link href={href} className={`${base} ${sizes[size]} ${className}`}>
      <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {label}
    </Link>
  );
}
