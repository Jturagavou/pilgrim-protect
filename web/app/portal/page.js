"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchMe, fetchMyDonations } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { formatDate, formatCurrency } from "@/lib/formatters";

export default function PortalPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/auth/login");
      return;
    }
    Promise.all([fetchMe(), fetchMyDonations()])
      .then(([meData, donData]) => {
        setUser(meData.user);
        setDonations(donData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
      </div>
    );
  }

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const uniqueSchools = new Set(donations.map((d) => d.school?._id).filter(Boolean));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || "Donor"}
        </h1>
        <p className="text-gray-500 mt-1">
          Track your donations and see the impact you're making
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-emerald-50 rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-emerald-700">
            {formatCurrency(totalDonated)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Total Donated</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-emerald-700">
            {donations.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">Donations Made</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-emerald-700">
            {uniqueSchools.size}
          </div>
          <div className="text-xs text-gray-500 mt-1">Schools Supported</div>
        </div>
      </div>

      {/* Donation history */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Donation History</h2>
        {donations.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-gray-500">You haven't made any donations yet.</p>
            <Link
              href="/donate"
              className="inline-flex mt-4 px-5 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Make Your First Donation
            </Link>
          </div>
        ) : (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Date</th>
                  <th className="text-left px-4 py-3 font-medium">School</th>
                  <th className="text-right px-4 py-3 font-medium">Amount</th>
                  <th className="text-center px-4 py-3 font-medium">Type</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {donations.map((d) => (
                  <tr key={d._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(d.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {d.school ? (
                        <Link
                          href={`/schools/${d.school._id}`}
                          className="text-emerald-600 hover:underline font-medium"
                        >
                          {d.school.name}
                        </Link>
                      ) : (
                        <span className="text-gray-500">General Fund</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      {formatCurrency(d.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          d.recurring
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {d.recurring ? "Monthly" : "One-time"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
