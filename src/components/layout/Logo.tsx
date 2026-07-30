import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  locale?: string;
}

export default function Logo({ locale = "en" }: LogoProps) {
  return (
    <Link href={`/${locale}`} className="flex items-center shrink-0">
      <Image
        src="/images/logo.jpg"
        alt="Vision Values Holdings Limited"
        width={220}
        height={80}
        className="h-12 w-auto object-contain"
        priority
      />
    </Link>
  );
}