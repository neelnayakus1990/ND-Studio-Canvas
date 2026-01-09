import { UserButton } from "@/features/auth/components/user-button"

export const Navbar = () => {
  return (
    <nav className="w-full flex items-center p-4 h-[68px] bg-[var(--panel1)] border-b border-[var(--stroke)]">
      <div className="ml-auto">
        <UserButton />
      </div>
    </nav>
  );
};
