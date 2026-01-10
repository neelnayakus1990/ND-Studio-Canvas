import { UserButton } from "@/features/auth/components/user-button"
import type { AppSettings } from "@/lib/settings";

interface NavbarProps {
  settings: AppSettings;
}

export const Navbar = ({ settings }: NavbarProps) => {
  return (
    <nav className="w-full flex items-center p-4 h-[68px] bg-[var(--panel1)] border-b border-[var(--stroke)]">
      <div className="text-xs text-[var(--muted-text)]">
        Free plan: {settings.freeProjectLimit} projects / {settings.freeTemplateLimit} templates
      </div>
      <div className="ml-auto">
        <UserButton />
      </div>
    </nav>
  );
};
