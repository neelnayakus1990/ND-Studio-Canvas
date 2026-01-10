import Link from "next/link";
import Image from "next/image";
export const Logo = () => {
  return (
    <Link href="/dashboard">
      <div className="flex items-center gap-x-2 hover:opacity-75 transition h-[68px] px-4">
        <div className="size-8 relative">
          <Image src="/logo.svg" alt="Image AI" fill />
        </div>
        <h1 className="text-lg font-semibold tracking-[0.14em]">
          ND STUDIO
        </h1>
      </div>
    </Link>
  );
};
