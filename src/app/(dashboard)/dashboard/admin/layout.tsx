import { requireAdmin } from "@/features/auth/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = async ({ children }: AdminLayoutProps) => {
  await requireAdmin();

  return <>{children}</>;
};

export default AdminLayout;
