import { get } from "@/utils/axiosIntersepcer";
import { cookies } from "next/headers";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";
interface ServiceDetail {
  _id?: string;
  name?: string;
  description?: string;
  process?: string;
  originalPrice?: number;
  discountedPrice?: number;
  duration?: string;
  image?: string; // You may want to convert this into an array if storing multiple image URLs
  subservices?: any[]; // Consider defining a specific Subservice interface if known
  createdAt?: string; // ISO date string
  __v?: number;
}

export default async function AllServicesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const response = await get(`/api/services`, token);
  console.log("services", response.data.data.services);
  const services: ServiceDetail[] = response.data.data.services;
  return (
    <div className="flex h-full w-full">
      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Title & Add Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">All Services</h2>
          <Link
            className="flex items-center gap-2 bg-blue-800 text-white text-sm px-4 py-2 rounded-full shadow hover:bg-blue-900"
            href={"services/add-service"}
          >
            <FaPlus /> Add Services
          </Link>
        </div>

        {/* Service Cards */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
                <th className="p-4">#</th>
                <th className="p-4">Service Name</th>
                <th className="p-4">Description</th>
                <th className="p-4">Original Price</th>
                <th className="p-4">Discounted Price</th>
                <th className="p-4">Duration</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50 transition">
                  <td className="p-4">{idx + 1}</td>
                  <td className="p-4 font-medium">{service.name}</td>
                  <td className="p-4 font-medium">{service.description}</td>
                  <td className="p-4 font-medium">₹{service.originalPrice}</td>
                  <td className="p-4 font-medium">
                    ₹{service.discountedPrice}
                  </td>
                  <td className="p-4 text-blue-900 font-bold">
                    {service.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
