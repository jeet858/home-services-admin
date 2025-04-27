"use client";
import { usePathname } from "next/navigation";

const Header: React.FunctionComponent = () => {
  const pathname = usePathname();
  return (
    <header
      className={`flex items-center justify-between rounded-2xl m-5 p-4 border-b bg-[#EBEBEBB2] border-[#75757566] ${
        pathname === "/login" ? "hidden" : ""
      }`}
    >
      <h1 className="text-xl font-semibold">Home</h1>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
