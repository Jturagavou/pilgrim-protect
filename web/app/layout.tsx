import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Montserrat, Roboto, Oswald, Inconsolata } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MapboxTokenProvider } from "@/components/map/MapboxTokenProvider";
import { getPublicMapboxToken } from "@/lib/mapboxToken";

/** Ensures env (e.g. NEXT_PUBLIC_MAPBOX_TOKEN) is read per request — avoids a static layout cached with an empty token. */
export const dynamic = "force-dynamic";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-condensed",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const inconsolata = Inconsolata({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Pilgrim Protect — Malaria Prevention for Uganda Schools",
  description:
    "Track and sponsor indoor residual spraying at Ugandan schools. See real impact data, explore the interactive map, and help protect children from malaria.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const mapboxToken = getPublicMapboxToken();
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${roboto.variable} ${oswald.variable} ${inconsolata.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <MapboxTokenProvider token={mapboxToken}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </MapboxTokenProvider>
      </body>
    </html>
  );
}
