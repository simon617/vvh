import Link from "next/link";

interface LogoProps {
  locale?: string;
}

export default function Logo({ locale = "en" }: LogoProps) {
  return (
    <Link href={`/${locale}`} className="flex items-center shrink-0">
      <img
        src="/logo.svg"
        alt="Vision Values Holdings Limited"
        width={280}
        height={80}
        className="h-16 w-auto"
      />
    </Link>
  );
}
