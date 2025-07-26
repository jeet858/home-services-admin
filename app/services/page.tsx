import ServiceTable from "@/components/ServiceTable";
import { del, get } from "@/utils/axiosIntersepcer";
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

export default async function AllServicesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const response = await get(`/api/services`, token);
  const services: ServiceDetail[] = response.data.data.services;
  
  return (
    <div className="flex h-full w-full">
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">All Services</h2>
          <Link
            className="flex items-center gap-2 bg-blue-800 text-white text-sm px-4 py-2 rounded-full shadow hover:bg-blue-900"
            href={"services/add-service"}
          >
            <FaPlus /> Add Services
          </Link>
        </div>
        <div className="overflow-x-auto">
          <ServiceTable services={services} />
        </div>
      </main>
    </div>
  );
}
