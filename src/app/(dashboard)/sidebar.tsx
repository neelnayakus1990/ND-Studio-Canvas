import { Logo } from "./logo";
import { SidebarRoutes } from "./sidebar-routes";

export const Sidebar = () => {
  return (
    <aside className="hidden lg:flex fixed flex-col w-[300px] left-0 shrink-0 h-full bg-[var(--panel2)] border-r border-[var(--stroke)]">
      <Logo />
      <SidebarRoutes />
    </aside>
  );
};
