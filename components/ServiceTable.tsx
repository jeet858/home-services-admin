"use client";

import Link from "next/link";
import { FaEdit, FaTrash } from "react-icons/fa";
import { del } from "@/utils/axiosIntersepcer";
import { useState } from "react";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { toast } from "react-toastify";

interface ServiceDetail {
  _id?: string;
  name?: string;
  description?: string;
  originalPrice?: number;
  discountedPrice?: number;
  duration?: string;
}

export default function ServiceTable({
  services,
}: {
  services: ServiceDetail[];
}) {
  const [localServices, setLocalServices] = useState(services);
  const [deleteService, setDeleteService] = useState<ServiceDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      await del(`/api/services/${id}`);
      toast.success(`${deleteService?.name} deleted successfully!`);
      setLocalServices((prev) => prev.filter((s) => s._id !== id));
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
            <th className="p-4">Description</th>
            <th className="p-4">Original Price</th>
            <th className="p-4">Discounted Price</th>
            <th className="p-4">Duration</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {localServices.map((service, idx) => (
            <tr key={service._id} className="border-t hover:bg-gray-50 transition">
              <td className="p-4">{idx + 1}</td>
              <td className="p-4 font-medium">{service.name}</td>
              <td className="p-4 font-medium">{service.description}</td>
              <td className="p-4 font-medium">₹{service.originalPrice}</td>
              <td className="p-4 font-medium">₹{service.discountedPrice}</td>
              <td className="p-4 text-blue-900 font-bold">{service.duration}</td>
              <td className="p-4 flex gap-2">
                <Link
                  href={`/services/edit-service/${service._id}`}
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 text-xs"
                >
                  <FaEdit /> Edit
                </Link>
                <button
                  className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                  onClick={() => {
                    setDeleteService(service);
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
        name={deleteService?.name as string}
        onConfirm={() => {
          if (deleteService?._id) {
            handleDelete(deleteService?._id);
          }
        }}
      />
    </>
  );
}
