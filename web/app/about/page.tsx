import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-ink">
          About Pilgrim Protect
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-lg">
          A Pilgrim Africa initiative bringing transparency and community
          engagement to malaria prevention in Ugandan schools.
        </p>
      </div>

      {/* Mission */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-ink mb-4">Our Mission</h2>
        <p className="text-muted-foreground leading-relaxed">
          Malaria remains one of the leading causes of school absenteeism and childhood
          mortality in Uganda. Pilgrim Protect was created to tackle this head-on through
          indoor residual spraying (IRS) — a proven, WHO-recommended intervention that
          dramatically reduces mosquito populations inside school buildings.
        </p>
        <p className="text-muted-foreground leading-relaxed mt-3">
          But we go beyond spraying. We believe donors deserve to see exactly where their
          money goes, and communities deserve to see that someone cares. Every spray
          report is logged, verified, and visible on our interactive map — creating an
          unprecedented level of transparency for malaria prevention.
        </p>
      </section>

      {/* How it works */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-ink mb-6">How Spraying Works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              title: "Identify & Plan",
              desc: "Our team identifies schools with the highest malaria burden. Each school is surveyed, rooms are counted, and a spraying schedule is created.",
            },
            {
              step: "2",
              title: "Spray & Document",
              desc: "Trained field workers arrive with WHO-approved insecticide. Every room is sprayed and documented with photos, notes, and GPS coordinates.",
            },
            {
              step: "3",
              title: "Verify & Report",
              desc: "Reports are submitted through our mobile app, verified by supervisors, and published to the platform — visible to donors in real time.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold text-lg">{item.step}</span>
              </div>
              <h3 className="font-semibold text-ink mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Team */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-ink mb-6">The Team</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              name: "Pilgrim Africa",
              role: "Parent Organization",
              desc: "A nonprofit dedicated to lasting change in Uganda through health, education, and community development programs.",
            },
            {
              name: "Field Workers",
              role: "Spray Teams",
              desc: "Trained Ugandan professionals who carry out spraying operations, submit documentation, and build trust with local communities.",
            },
            {
              name: "Tech Team",
              role: "Platform Development",
              desc: "Building the web platform, mobile app, and data pipeline that makes transparent impact tracking possible.",
            },
            {
              name: "Donors & Partners",
              role: "Funding & Support",
              desc: "Individuals and organizations who make this work possible through financial contributions and advocacy.",
            },
          ].map((member) => (
            <div key={member.name} className="bg-muted rounded-xl p-5 border border-border">
              <h3 className="font-semibold text-ink">{member.name}</h3>
              <p className="text-xs text-primary font-medium mt-0.5">{member.role}</p>
              <p className="text-sm text-muted-foreground mt-2">{member.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-paper-depth border border-border rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-ink">Join the Fight Against Malaria</h2>
        <p className="text-muted-foreground mt-2">
          Whether you donate, share our story, or simply explore the map — you're part of the solution.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-5">
          <Link
            href="/donate"
            className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Donate Now
          </Link>
          <Link
            href="/map"
            className="px-6 py-2.5 border border-primary text-primary font-medium rounded-lg hover:bg-primary/10 transition-colors"
          >
            Explore the Map
          </Link>
        </div>
      </section>
    </div>
  );
}
