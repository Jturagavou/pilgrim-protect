import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export default function Footer() {
  return (
    <footer className="bg-[#4f4c49] text-paper-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <BrandLogo light />
            </div>
            <p className="text-sm text-paper-alt/78 max-w-sm">
              Protecting Ugandan schoolchildren from malaria through
              indoor residual spraying, transparent impact tracking,
              and donor-powered community engagement.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-condensed mb-3 text-sm uppercase tracking-[0.18em]">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/map" className="text-paper-alt/90 hover:text-pilgrim-gold transition-colors">Interactive Map</Link></li>
              <li><Link href="/dashboard" className="text-paper-alt/90 hover:text-pilgrim-gold transition-colors">Impact Dashboard</Link></li>
              <li><Link href="/stories" className="text-paper-alt/90 hover:text-pilgrim-gold transition-colors">Stories</Link></li>
              <li><Link href="/about" className="text-paper-alt/90 hover:text-pilgrim-gold transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-condensed mb-3 text-sm uppercase tracking-[0.18em]">
              Get Involved
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/donate" className="text-paper-alt/90 hover:text-pilgrim-gold transition-colors">Donate</Link></li>
              <li><Link href="/auth/register" className="text-paper-alt/90 hover:text-pilgrim-gold transition-colors">Create Account</Link></li>
              <li><Link href="/portal" className="text-paper-alt/90 hover:text-pilgrim-gold transition-colors">Donor Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/12 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-paper-alt/65">
            &copy; {new Date().getFullYear()} Pilgrim Africa &mdash; Pilgrim Protect Story.
            All rights reserved.
          </p>
          <p className="text-xs text-paper-alt/65">
            Built with care for every child in Uganda.
          </p>
        </div>
      </div>
    </footer>
  );
}
