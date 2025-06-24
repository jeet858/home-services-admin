"use client";
import { useState } from "react";
import Link from "next/link";
import { FaEdit, FaTrash } from "react-icons/fa";

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

export interface Subservice {
  _id?: string;
  name?: string;
  serviceId?: {
    _id?: string;
    name?: string;
    description?: string;
  };
  description?: string;
  process?: string;
  image?: string;
  originalPrice?: number;
  discountedPrice?: number;
  duration?: string;
  createdAt?: string;
  __v?: number;
}

interface SubServiceTableProps {
  services: ServiceDetail[];
  subServices: Subservice[];
}

export default function SubServiceTable({
  services,
  subServices,
}: SubServiceTableProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<
    string | undefined
  >(services?.[0]?._id);

  const filteredSubservices = subServices.filter(
    (sub) => sub?.serviceId?._id === selectedServiceId
  );

  return (
    <div className="flex h-full w-full space-y-4 flex-col p-8">
      {/* Dropdown to select service */}
      <div>
        <label className="block mb-2 font-semibold text-sm text-gray-700">
          Select Service:
        </label>
        <select
          value={selectedServiceId}
          onChange={(e) => setSelectedServiceId(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-sm"
        >
          {services.map((service) => (
            <option key={service._id} value={service._id}>
              {service.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table of Subservices */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
              <th className="p-4">#</th>
              <th className="p-4">Subservice Name</th>
              <th className="p-4">Description</th>
              <th className="p-4">Original Price</th>
              <th className="p-4">Discounted Price</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubservices.length > 0 ? (
              filteredSubservices.map((sub, idx) => (
                <tr
                  key={sub._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-4">{idx + 1}</td>
                  <td className="p-4 font-medium">{sub?.name}</td>
                  <td className="p-4 font-medium">{sub?.description}</td>
                  <td className="p-4 font-medium">₹{sub?.originalPrice}</td>
                  <td className="p-4 font-medium">₹{sub?.discountedPrice}</td>
                  <td className="p-4 text-blue-900 font-bold">
                    {sub?.duration}
                  </td>
                  <td className="p-4 flex gap-2">
                    <Link
                      href={`/services/edit-sub-service/${sub?._id}`}
                      className="flex items-center gap-1 px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-xs"
                    >
                      <FaEdit /> Edit
                    </Link>
                    <button
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                      // onClick={() => handleDelete(sub?._id)} // Implement delete logic
                      type="button"
                    >
                      <FaTrash /> Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No subservices found for this service.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
