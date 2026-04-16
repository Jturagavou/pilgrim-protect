"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchImpact, fetchMapData } from "@/lib/api";
import ImpactCounter from "@/components/ImpactCounter";
import MapView from "@/components/MapView";
import type { ImpactStats, MapFeature } from "@/lib/types";

export default function HomePage() {
  const [impact, setImpact] = useState<ImpactStats | null>(null);
  const [mapFeatures, setMapFeatures] = useState<MapFeature[]>([]);

  useEffect(() => {
    fetchImpact().then(setImpact).catch(console.error);
    fetchMapData()
      .then((data) => setMapFeatures(data.features || []))
      .catch(console.error);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Protecting Ugandan Children from Malaria
            </h1>
            <p className="mt-4 text-lg text-emerald-100 leading-relaxed">
              Pilgrim Protect brings transparency to indoor residual spraying
              at schools across Uganda. See every room sprayed, every child
              protected — in real time.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/map"
                className="inline-flex items-center px-6 py-3 bg-white text-emerald-800 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Explore the Map
              </Link>
              <Link
                href="/donate"
                className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg border border-emerald-500 hover:bg-emerald-500 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                Sponsor a School
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Impact counters */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-gray-900 mb-10">
            Our Impact So Far
          </h2>
          {impact ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <ImpactCounter
                end={impact.totalSchools}
                label="Schools Protected"
                icon={
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21" />
                  </svg>
                }
              />
              <ImpactCounter
                end={impact.totalRoomsSprayed}
                label="Rooms Sprayed"
                icon={
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                }
              />
              <ImpactCounter
                end={impact.totalStudentsProtected}
                label="Students Protected"
                icon={
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                }
              />
              <ImpactCounter
                end={impact.totalSprayReports}
                label="Spray Reports"
                icon={
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                  </svg>
                }
              />
            </div>
          ) : (
            <div className="text-center text-gray-400">Loading impact data...</div>
          )}
        </div>
      </section>

      {/* Mini map preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Schools Across Uganda
            </h2>
            <p className="text-gray-500 mt-2">
              Each marker represents a school in our spraying program
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 h-[400px]">
            <MapView
              features={mapFeatures}
              initialZoom={6.5}
              compact
            />
          </div>
          <div className="text-center mt-6">
            <Link
              href="/map"
              className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
            >
              Open full interactive map
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-700 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Every Room Sprayed Protects Lives
          </h2>
          <p className="mt-3 text-emerald-100">
            Your donation directly funds indoor residual spraying at a school
            in Uganda. Every dollar is tracked, every impact is visible.
          </p>
          <Link
            href="/donate"
            className="inline-flex items-center mt-6 px-8 py-3 bg-white text-emerald-800 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
          >
            Make a Difference Today
          </Link>
        </div>
      </section>
    </div>
  );
}
