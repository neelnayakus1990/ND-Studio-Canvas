import { ChevronsLeft } from "lucide-react";

interface ToolSidebarCloseProps {
  onClick: () => void;
};

export const ToolSidebarClose = ({
  onClick,
}: ToolSidebarCloseProps) => {
  return (
    <button
      onClick={onClick}
      className="absolute -right-[1.80rem] h-[70px] bg-[var(--panel2)] top-1/2 transform -translate-y-1/2 flex items-center justify-center rounded-r-xl px-1 pr-2 border-r border-y border-[var(--stroke)] group"
    >
      <ChevronsLeft className="size-4 text-[var(--gold)] group-hover:opacity-75 transition" />
    </button>
  );
};
