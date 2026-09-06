import { cx } from "@/lib/utils";

/** Small gold-rule eyebrow used above section titles. */
export function Kicker({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return <span className={cx("kicker", gold && "gold")}>{children}</span>;
}

/** Consistent section header (eyebrow + serif title + optional blurb). */
export function SectionHeading({
  kicker,
  title,
  description,
  gold,
  action,
  className,
}: {
  kicker: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  gold?: boolean;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("mb-9 flex flex-wrap items-end justify-between gap-6", className)}>
      <div>
        <Kicker gold={gold}>{kicker}</Kicker>
        <h2 className="serif-gold-em mt-2.5 font-serif text-[clamp(1.7rem,3.2vw,2.6rem)] font-semibold leading-tight text-ink text-balance">
          {title}
        </h2>
        {description ? <p className="mt-2 max-w-xl text-[0.96rem] text-mut">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** Rounded full-width brand button; renders as <a> or <button>. */
export function BrandButton({
  variant = "emerald",
  size = "md",
  children,
  href,
  className,
  ...rest
}: {
  variant?: "gold" | "emerald" | "ghost" | "light" | "wa";
  size?: "sm" | "md";
  children: React.ReactNode;
  href?: string;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = cx(
    "btn",
    variant === "gold" && "btn-gold",
    variant === "emerald" && "btn-emerald",
    variant === "ghost" && "btn-ghost",
    variant === "light" && "btn-light",
    variant === "wa" && "btn-wa",
    size === "sm" && "btn-sm",
    className,
  );
  if (href) {
    return (
      <a href={href} className={cls} {...(rest as object)}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

export function Section({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cx("px-6", className)}>{children}</section>;
}
