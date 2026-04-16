"use client";

import Link from "next/link";

export default function DonateSuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900">Thank You!</h1>
      <p className="text-gray-500 mt-3 leading-relaxed">
        Your donation is making a real difference. Every dollar helps protect
        Ugandan schoolchildren from malaria through indoor residual spraying.
      </p>
      <p className="text-sm text-gray-400 mt-2">
        A receipt has been sent to your email.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Link
          href="/map"
          className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          See Your Impact on the Map
        </Link>
        <Link
          href="/portal"
          className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Go to Donor Portal
        </Link>
      </div>
    </div>
  );
}
