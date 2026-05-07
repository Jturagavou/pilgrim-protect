import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-12 rounded-[2rem] border border-border bg-card/80 px-6 py-10 shadow-[0_18px_45px_rgba(45,45,45,0.06)]">
        <p className="font-condensed text-xs uppercase tracking-[0.24em] text-pilgrim-orange">
          Who we are
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-ink">
          About Pilgrim Protect
        </h1>
        <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-lg">
          A Pilgrim Africa initiative helping schools reduce malaria risk
          through indoor residual spraying, prevention education, and practical
          follow-up around the cost of illness.
        </p>
      </div>

      {/* Mission */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-ink mb-4">Our Mission</h2>
        <p className="text-muted-foreground leading-relaxed">
          In high-transmission areas, malaria can disrupt an entire school year:
          Pilgrim Africa notes that a school with 1,000 students can record
          1,200 or more malaria cases in a year. Pilgrim Protect exists to
          reduce the mosquitoes that spread malaria, limit student-mosquito
          contact, and educate students about prevention.
        </p>
        <p className="text-muted-foreground leading-relaxed mt-3">
          The program focuses on primary and secondary schools, using IRS along
          with prevention materials, malaria clubs, youth champion activities,
          and in some schools preventive treatment at the start of term.
        </p>
      </section>

      {/* How it works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-ink mb-6">How Spraying Works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              title: "Start with service",
              desc: "Pilgrim Africa offers a first term of spray and protection service so under-resourced schools can begin.",
            },
            {
              step: "2",
              title: "Measure the case",
              desc: "Schools share de-identified malaria case information and compare prevention costs with the cost of illness.",
            },
            {
              step: "3",
              title: "Build prevention habits",
              desc: "Spraying is paired with education, school malaria clubs, and follow-up so schools can budget for prevention over time.",
            },
          ].map((item) => (
            <div key={item.step} className="text-center rounded-[1.5rem] border border-border bg-card/70 p-6 shadow-sm">
              <div className="w-12 h-12 bg-pilgrim-orange/15 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-pilgrim-orange font-bold text-lg">{item.step}</span>
              </div>
              <h3 className="font-semibold text-ink mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The Team */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-ink mb-6">The Team</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              name: "Pilgrim Africa",
              role: "Parent Organization",
              desc: "The parent organization behind Pilgrim Protect, with offices in Kampala and Seattle.",
            },
            {
              name: "Field Workers",
              role: "Spray Teams",
              desc: "Teams carrying out school protection activities, including IRS and follow-up documentation.",
            },
            {
              name: "Tech Team",
              role: "Platform Development",
              desc: "Building the donor-facing map, school profiles, reporting tools, and data pipeline around the real program.",
            },
            {
              name: "Donors & Partners",
              role: "Funding & Support",
              desc: "Supporters who help cover direct school implementation costs for Pilgrim Protect.",
            },
          ].map((member) => (
            <div key={member.name} className="bg-card/80 rounded-[1.5rem] p-5 border border-border shadow-sm">
              <h3 className="font-semibold text-ink">{member.name}</h3>
              <p className="text-xs text-pilgrim-orange font-medium mt-0.5 uppercase tracking-[0.14em]">{member.role}</p>
              <p className="text-sm text-muted-foreground mt-2">{member.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-paper-depth border border-border rounded-[2rem] p-8 text-center shadow-[0_18px_40px_rgba(45,45,45,0.05)]">
        <h2 className="text-2xl font-bold text-ink">Join the Fight Against Malaria</h2>
        <p className="text-muted-foreground mt-2">
          Whether you donate, share our story, or simply explore the map - you&apos;re part of the solution.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-5">
          <Link
            href="/donate"
            className="px-6 py-2.5 bg-pilgrim-orange text-white font-medium rounded-lg hover:bg-pilgrim-orange-deep transition-colors"
          >
            Donate Now
          </Link>
          <Link
            href="/map"
            className="px-6 py-2.5 border border-border text-ink font-medium rounded-lg hover:border-pilgrim-orange/40 hover:bg-paper-soft transition-colors"
          >
            Explore the Map
          </Link>
        </div>
      </section>
    </div>
  );
}
