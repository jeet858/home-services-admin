"use client";
import { BriefcaseBusiness, House, UserCog } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useEffect } from "react";
interface SidebarProps {
  token?: string;
}
const Sidebar: React.FunctionComponent<SidebarProps> = ({ token }) => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token]);

  return (
    <div
      className={`w-64 bg-[#EBEBEBB2] rounded-br-2xl rounded-tr-2xl border-[#75757566] border-r flex flex-col ${
        pathname === "/login" ? "hidden" : ""
      }`}
    >
      <nav className="flex-1 space-y-6 text-gray-700 text-sm p-6">
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
          <li className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <BriefcaseBusiness /> <span>Service Providers</span>
            </div>
            <ul className="pl-6 text-gray-500 space-y-1">
              <li>
                <Link
                  className="cursor-pointer hover:underline"
                  href={"/service-providers"}
                >
                  All Service Providers
                </Link>
              </li>
              <li>
                <Link
                  href={"service-providers/add-service-providers"}
                  className="cursor-pointer hover:underline"
                >
                  Add Service Providers
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
