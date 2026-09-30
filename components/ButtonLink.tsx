import Link from "next/link";

const styles = {
  gold: "bg-gold text-ink hover:bg-gold-light",
  outline: "border-2 border-white text-white hover:bg-white hover:text-forest",
  green: "bg-forest text-white hover:bg-olive",
};

export function ButtonLink({
  href,
  children,
  variant = "gold",
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof styles;
}) {
  return (
    <Link href={href} className={`block px-5 py-3 text-center font-bold sm:inline-block ${styles[variant]}`}>
      {children}
    </Link>
  );
}
