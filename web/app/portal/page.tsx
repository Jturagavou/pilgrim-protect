"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchMe, fetchMyDonations } from "@/lib/api";
import { getUser, isLoggedIn } from "@/lib/auth";
import { formatDate, formatCurrency } from "@/lib/formatters";
import type { Donation, User } from "@/lib/types";

export default function PortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/auth/login");
      return;
    }
    const u = getUser();
    if (u && u.role !== "donor") {
      if (u.role === "field_worker") router.replace("/dashboard");
      else router.replace("/admin");
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
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const uniqueSchools = new Set(donations.map((d) => d.school?._id).filter(Boolean));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink">
          Welcome back, {user?.name || "Donor"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your donations and see the impact you're making
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-primary/10 border border-border rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(totalDonated)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Total Donated</div>
        </div>
        <div className="bg-primary/10 border border-border rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-primary">
            {donations.length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Donations Made</div>
        </div>
        <div className="bg-primary/10 border border-border rounded-xl p-5 text-center">
          <div className="text-2xl font-bold text-primary">
            {uniqueSchools.size}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Schools Supported</div>
        </div>
      </div>

      {/* Donation history */}
      <div>
        <h2 className="text-lg font-semibold text-ink mb-4">Donation History</h2>
        {donations.length === 0 ? (
          <div className="bg-muted rounded-xl p-8 text-center">
            <p className="text-muted-foreground">You haven't made any donations yet.</p>
            <Link
              href="/donate"
              className="inline-flex mt-4 px-5 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Make Your First Donation
            </Link>
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
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
                  <tr key={d._id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(d.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {d.school ? (
                        <Link
                          href={`/schools/${d.school._id}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {d.school.name}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">General Fund</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-ink">
                      {formatCurrency(d.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          d.recurring
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {d.recurring ? "Monthly" : "One-time"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-pilgrim-olive/15 text-pilgrim-olive">
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
