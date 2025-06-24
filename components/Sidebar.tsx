"use client";
import { BriefcaseBusiness, House, UserCog } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar: React.FunctionComponent = () => {
  const pathname = usePathname();

  return (
    <div
      className={`w-64 bg-[#EBEBEBB2] rounded-br-2xl rounded-tr-2xl border-[#75757566] border-r flex flex-col p-6 ${
        pathname === "/login" ? "hidden" : ""
      }`}
    >
      <div className="text-2xl font-bold mb-10">logo</div>
      <nav className="flex-1 space-y-6 text-gray-700 text-sm">
        <div>
          <p className="font-bold mb-2">General Menu</p>
          <ul className="space-y-4 text-xl">
            <li className="flex items-center gap-2 cursor-pointer hover:underline">
              <House /> <span>Home</span>
            </li>
            <li className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <BriefcaseBusiness /> <span>Orders</span>
              </div>
              <ul className="pl-6 text-gray-500 space-y-1">
                <Link
                  className="cursor-pointer hover:underline"
                  href={"/upcoming-orders"}
                >
                  All Order
                </Link>
                {/* <li className="cursor-pointer hover:underline">
                  Order Details
                </li> */}
              </ul>
            </li>
            <li className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <UserCog /> <span>Services</span>
              </div>
              <ul className="pl-6 text-gray-500 space-y-1">
                <li>
                  <Link
                    className="cursor-pointer hover:underline"
                    href={"/services"}
                  >
                    All Services
                  </Link>
                </li>
                <li>
                  <Link
                    className="cursor-pointer hover:underline"
                    href={"/services/sub-services"}
                  >
                    Sub Services
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/services/add-service"}
                    className="cursor-pointer hover:underline"
                  >
                    Add Services
                  </Link>
                </li>
                <li>
                  <Link
                    href={"/services/add-sub-service"}
                    className="cursor-pointer hover:underline"
                  >
                    Add Sub Services
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
