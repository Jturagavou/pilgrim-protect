import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
  light?: boolean;
};

export default function BrandLogo({
  className,
  compact = false,
  light = false,
}: BrandLogoProps) {
  const textClass = light ? "text-white" : "text-ink";
  const accentClass = light ? "text-pilgrim-gold" : "text-pilgrim-orange";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative h-11 w-11 shrink-0 rounded-full bg-pilgrim-orange shadow-[0_8px_24px_rgba(255,109,35,0.28)]">
        <div className="absolute left-[15px] top-[5px] h-[30px] w-[14px] rounded-full bg-ink-deep/90 rotate-[18deg]" />
        <div className="absolute left-[19px] top-[12px] h-[20px] w-[7px] rounded-full bg-pilgrim-orange rotate-[18deg]" />
      </div>
      <div
        className={cn(
          "font-display font-bold uppercase leading-none tracking-[-0.04em]",
          compact ? "text-[1.75rem]" : "text-[2rem]"
        )}
      >
        <span className={textClass}>Pilgrim</span>{" "}
        <span className={accentClass}>Protect</span>
      </div>
    </div>
  );
}
