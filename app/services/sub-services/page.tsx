import SubServiceTable from "@/components/SubServiceTable";
import { get } from "@/utils/axiosIntersepcer";
import { cookies } from "next/headers";
import Link from "next/link";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
interface ServiceDetail {
  _id?: string;
  name?: string;
  description?: string;
  process?: string;
  originalPrice?: number;
  discountedPrice?: number;
  duration?: string;
  image?: string;
  subservices?: any[];
  createdAt?: string;
  __v?: number;
}

export default async function AllSubServicesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const response = await get(`/api/services`, token);
  const res = await get(`/api/subservice`, token);
  // console.log("services", response.data.data.services);
  const services: ServiceDetail[] = response?.data?.data?.services;
  console.log("sub-services", res?.data?.data?.subservices);
  const subServices = res?.data?.data?.subservices;
  return (
    <div className="flex h-full w-full">
      <SubServiceTable services={services} subServices={subServices} />
    </div>
  );
}
