"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchSchools, createCheckout } from "@/lib/api";

const AMOUNTS = [10, 25, 50, 100, 250];

function DonateForm() {
  const searchParams = useSearchParams();
  const preselectedSchool = searchParams.get("school");

  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(preselectedSchool || "general");
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchools().then(setSchools).catch(console.error);
  }, []);

  const finalAmount = customAmount ? Number(customAmount) : amount;

  async function handleDonate() {
    if (!finalAmount || finalAmount < 1) return;
    setLoading(true);
    try {
      const { sessionUrl } = await createCheckout({
        schoolId: selectedSchool === "general" ? null : selectedSchool,
        amount: finalAmount,
        recurring,
      });
      window.location.href = sessionUrl;
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Make a Donation</h1>
        <p className="text-gray-500 mt-2">
          Your contribution directly funds malaria prevention spraying at Ugandan schools
        </p>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
        {/* School selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose a school to sponsor
          </label>
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="general">General Fund (highest need)</option>
            {schools.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} — {s.district}
              </option>
            ))}
          </select>
        </div>

        {/* Amount selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select amount
          </label>
          <div className="grid grid-cols-5 gap-2">
            {AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => {
                  setAmount(a);
                  setCustomAmount("");
                }}
                className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  amount === a && !customAmount
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                ${a}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <input
              type="number"
              placeholder="Custom amount..."
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              min="1"
            />
          </div>
        </div>

        {/* Recurring toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRecurring(!recurring)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              recurring ? "bg-emerald-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                recurring ? "translate-x-5" : ""
              }`}
            />
          </button>
          <span className="text-sm text-gray-700">Make this a monthly donation</span>
        </div>

        {/* Summary */}
        <div className="bg-emerald-50 rounded-lg p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold text-gray-900">
              ${finalAmount || 0}
              {recurring ? "/month" : " one-time"}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-600">To:</span>
            <span className="font-semibold text-gray-900">
              {selectedSchool === "general"
                ? "General Fund"
                : schools.find((s) => s._id === selectedSchool)?.name || "Selected school"}
            </span>
          </div>
        </div>

        {/* Donate button */}
        <button
          onClick={handleDonate}
          disabled={loading || !finalAmount}
          className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : `Donate $${finalAmount || 0}`}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Payments are processed securely via Stripe. Pilgrim Africa is a registered 501(c)(3) nonprofit.
        </p>
      </div>
    </div>
  );
}

export default function DonatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
        </div>
      }
    >
      <DonateForm />
    </Suspense>
  );
}
