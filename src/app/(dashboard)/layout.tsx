import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { protectServer } from "@/features/auth/utils";
import { getAppSettings } from "@/lib/settings";

interface DashboardLayoutProps {
  children: React.ReactNode;
};

const DashboardLayout = async ({ children }: DashboardLayoutProps) => {
  await protectServer();
  const settings = await getAppSettings();
  return ( 
    <div className="bg-[var(--bg)] h-full text-foreground">
      <Sidebar />
      <div className="lg:pl-[300px] flex flex-col h-full">
        <Navbar settings={settings} />
        <main className="bg-[var(--panel1)] flex-1 overflow-auto p-8 lg:rounded-tl-2xl border-l border-t border-[var(--stroke)]">
          {children}
        </main>
      </div>
    </div>
  );
};
 
export default DashboardLayout;
