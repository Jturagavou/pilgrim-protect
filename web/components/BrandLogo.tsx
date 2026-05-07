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
  const logoSrc = light
    ? "/brand/pilgrim-africa-logo-white.svg"
    : "/brand/pilgrim-africa-logo-dark.svg";

  return (
    <img
      src={logoSrc}
      alt="Pilgrim Africa"
      className={cn(
        "block h-auto w-auto",
        compact ? "max-h-10 max-w-[210px]" : "max-h-12 max-w-[260px]",
        className
      )}
    />
  );
}
