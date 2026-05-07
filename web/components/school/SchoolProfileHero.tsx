import DonateButton from "@/components/DonateButton";

interface SchoolProfileHeroProps {
  name: string;
  district: string;
  subCounty?: string;
  heroImageUrl: string | null;
  schoolId: string;
}

export default function SchoolProfileHero({
  name,
  district,
  subCounty,
  heroImageUrl,
  schoolId,
}: SchoolProfileHeroProps) {
  const img = heroImageUrl || "/images/pilgrim-protect/protect.jpg";
  const districtLabel = /district$/i.test(district) ? district : `${district} District`;

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch mb-10">
      <div
        className="flex flex-col justify-center order-2 lg:order-1"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
          Pilgrim Protect
        </p>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.35rem] text-ink leading-tight tracking-tight">
          {name}
        </h1>
        <p className="mt-2 h-px w-16 bg-primary rounded-full" aria-hidden />
        <p className="mt-4 text-muted-foreground text-base leading-relaxed">
          {districtLabel}{subCounty ? ` · ${subCounty}` : ""}, Uganda. Your
          gift helps fund indoor residual spraying so students can learn without
          the threat of malaria.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <DonateButton schoolId={schoolId} size="lg" />
          <a
            href="#story"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Read the story
          </a>
        </div>
      </div>

      <div
        className="relative order-1 lg:order-2 min-h-[260px] lg:min-h-[380px]"
      >
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden bg-paper-depth shadow-md border border-border"
          style={{
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 92%)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
