import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink-deep text-paper-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">PP</span>
              </div>
              <span className="text-lg font-bold text-background">
                Pilgrim Protect
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Protecting Ugandan schoolchildren from malaria through
              indoor residual spraying, transparent impact tracking,
              and donor-powered community engagement.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-background font-semibold mb-3 text-sm uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/map" className="text-paper-alt/90 hover:text-background transition-colors">Interactive Map</Link></li>
              <li><Link href="/dashboard" className="text-paper-alt/90 hover:text-background transition-colors">Impact Dashboard</Link></li>
              <li><Link href="/stories" className="text-paper-alt/90 hover:text-background transition-colors">Stories</Link></li>
              <li><Link href="/about" className="text-paper-alt/90 hover:text-background transition-colors">About Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-background font-semibold mb-3 text-sm uppercase tracking-wider">
              Get Involved
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/donate" className="text-paper-alt/90 hover:text-background transition-colors">Donate</Link></li>
              <li><Link href="/auth/register" className="text-paper-alt/90 hover:text-background transition-colors">Create Account</Link></li>
              <li><Link href="/portal" className="text-paper-alt/90 hover:text-background transition-colors">Donor Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Pilgrim Africa &mdash; Pilgrim Protect Story.
            All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with care for every child in Uganda.
          </p>
        </div>
      </div>
    </footer>
  );
}
