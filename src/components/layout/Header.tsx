import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenuToggle from "./MobileMenuToggle";

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="flex items-center justify-between h-20 pl-1 sm:pl-2 pr-4 sm:pr-6 lg:pr-8">
        <div className="flex items-center">
          <Logo locale={locale} />
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          <MobileMenuToggle locale={locale} />
        </div>
      </div>
    </header>
  );
}