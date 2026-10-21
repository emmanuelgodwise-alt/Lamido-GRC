import { cn } from "@/lib/utils";
import { eyebrow } from "@/lib/styles";

/**
 * Consistent section heading: gold eyebrow label, serif title, optional intro.
 * `tone="dark"` renders light text for use on navy backgrounds.
 */
export function SectionHeading({
  eyebrow: eyebrowText,
  title,
  intro,
  tone = "light",
  align = "center",
  level = 2,
  className,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  tone?: "light" | "dark";
  align?: "center" | "left";
  /** Heading level: 1 for the page title, 2 for in-page sections. */
  level?: 1 | 2;
  className?: string;
}) {
  const Title = level === 1 ? "h1" : "h2";
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <p className={cn(eyebrow, "flex items-center gap-3", align === "center" && "justify-center", tone === "light" && "text-gold-ink")}>
        {align === "center" && <span aria-hidden className="h-px w-8 bg-gold/70" />}
        {eyebrowText}
        <span aria-hidden className="h-px w-8 bg-gold/70" />
      </p>
      <Title
        className={cn(
          "mt-4 font-display text-2xl font-semibold leading-tight sm:text-3xl lg:text-[34px] lg:leading-[1.2]",
          tone === "light" ? "text-navy" : "text-white"
        )}
      >
        {title}
      </Title>
      {intro && (
        <p
          className={cn(
            "mt-4 text-[15px] leading-relaxed",
            tone === "light" ? "text-ink/70" : "text-white/70"
          )}
        >
          {intro}
        </p>
      )}
    </div>
  );
}
