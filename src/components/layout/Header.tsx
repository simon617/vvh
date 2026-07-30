import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenuToggle from "./MobileMenuToggle";

interface HeaderProps {
  locale: string;
}

export default function Header({ locale }: HeaderProps) {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
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