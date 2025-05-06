import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { BriefcaseBusiness, House, UserCog } from "lucide-react";
import Image from "next/image";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  console.log("token", token?.value);
  if (!token) {
    redirect("/login");
  }

  return <></>;
}
