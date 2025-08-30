"use client";
import { ServiceProvider } from "@/types/serviceProviderType";
import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import Link from "next/link";
import { del } from "@/utils/axiosIntersepcer";
import { toast } from "react-toastify";

interface ServiceProvidersTableprops {
  data: ServiceProvider[];
}

const ServiceProvidersTable: React.FunctionComponent<
  ServiceProvidersTableprops
> = ({ data }) => {
    const [localServices, setLocalServices] = useState(data);
    const [deleteServiceProvider, setDeleteServiceProvider] = useState<ServiceProvider | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = async (id: string) => {
        try {
          await del(`/api/service-providers/${id}`);
          toast.success(`${deleteServiceProvider?.name} deleted successfully!`);
          setLocalServices((prev) => prev.filter((s) => s.id !== id));
        } catch (error) {
          console.error("Delete failed", error);
          toast.error("Failed to delete service.");
        }
      };
  return (
    <>
      <table className="min-w-full bg-white rounded-xl shadow">
        <thead>
          <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
            <th className="p-4">#</th>
            <th className="p-4">Service Name</th>
            <th className="p-4">Category</th>
            <th className="p-4">Phone Number</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {localServices.map((provider, idx) => (
            <tr
              key={provider.id}
              className="border-t hover:bg-gray-50 transition"
            >
              <td className="p-4">{idx + 1}</td>
              <td className="p-4 font-medium">{provider?.name}</td>
              <td className="p-4 font-medium">
                {provider.services?.map(service => service.name).join(", ")}
              </td>
              <td className="p-4 font-medium">{provider?.phoneNumber}</td>

              <td className="p-4 flex gap-2">
                <Link
                  href={`/service-providers/edit-service-providers/${provider?.id}`}
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-xs"
                >
                  <FaEdit /> Edit
                </Link>
                <button
                  className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                  onClick={() => {
                    setDeleteServiceProvider(provider);
                    setIsModalOpen(true);
                  }}
                >
                  <FaTrash /> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmDeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        name={deleteServiceProvider?.name as string}
        page="Service Provider"
        onConfirm={() => {
          if (deleteServiceProvider?.id) {
            handleDelete(deleteServiceProvider?.id);
          }
        }}
      />
    </>
  );
};

export default ServiceProvidersTable;
