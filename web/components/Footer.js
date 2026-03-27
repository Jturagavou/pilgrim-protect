import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">PP</span>
              </div>
              <span className="text-lg font-bold text-white">
                Pilgrim Protect
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm">
              Protecting Ugandan schoolchildren from malaria through
              indoor residual spraying, transparent impact tracking,
              and donor-powered community engagement.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/map" className="hover:text-emerald-400 transition-colors">Interactive Map</Link></li>
              <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Impact Dashboard</Link></li>
              <li><Link href="/stories" className="hover:text-emerald-400 transition-colors">Stories</Link></li>
              <li><Link href="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">
              Get Involved
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/donate" className="hover:text-emerald-400 transition-colors">Donate</Link></li>
              <li><Link href="/auth/register" className="hover:text-emerald-400 transition-colors">Create Account</Link></li>
              <li><Link href="/portal" className="hover:text-emerald-400 transition-colors">Donor Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Pilgrim Africa &mdash; Pilgrim Protect Story.
            All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Built with care for every child in Uganda.
          </p>
        </div>
      </div>
    </footer>
  );
}
