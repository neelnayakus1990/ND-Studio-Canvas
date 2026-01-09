import { protectServer } from "@/features/auth/utils";

interface EditorLayoutProps {
  children: React.ReactNode;
}

const EditorLayout = async ({ children }: EditorLayoutProps) => {
  await protectServer();

  return <>{children}</>;
};

export default EditorLayout;
