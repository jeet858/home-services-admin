import ServiceProvidersTable from "@/components/ServiceProviderTable";
import { ServiceProvider } from "@/types/serviceProviderType";
import { get } from "@/utils/axiosIntersepcer";
import { cookies } from "next/headers";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";

export default async function ServiceProviderPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const response = await get(`/api/service-providers`, token);
  const serviceProvider: ServiceProvider[] =
    response.data.data.serviceProviders;
  return (
    <div className="flex h-full w-full">
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">All Services</h2>
          <Link
            className="flex items-center gap-2 bg-blue-800 text-white text-sm px-4 py-2 rounded-full shadow hover:bg-blue-900"
            href={"service-providers/add-service-providers"}
          >
            <FaPlus /> Add Service Providers
          </Link>
        </div>
        <div className="overflow-x-auto">
          <ServiceProvidersTable data={serviceProvider} />
        </div>
      </main>
    </div>
  );
}
