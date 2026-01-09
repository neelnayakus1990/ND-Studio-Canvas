import { UserButton } from "@/features/auth/components/user-button"
import { FREE_PROJECT_LIMIT, FREE_TEMPLATE_LIMIT } from "@/lib/free-tier";

export const Navbar = () => {
  return (
    <nav className="w-full flex items-center p-4 h-[68px] bg-[var(--panel1)] border-b border-[var(--stroke)]">
      <div className="text-xs text-[var(--muted-text)]">
        Free plan: {FREE_PROJECT_LIMIT} projects / {FREE_TEMPLATE_LIMIT} templates
      </div>
      <div className="ml-auto">
        <UserButton />
      </div>
    </nav>
  );
};
