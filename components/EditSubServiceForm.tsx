"use client";
import { post, get, put } from "@/utils/axiosIntersepcer";
import { MouseEvent, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "next/navigation";
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
  originalPrice?: string;
  discountedPrice?: string;
  duration?: string;
  createdAt?: string;
  __v?: number;
}

interface EditServiceFormProps {
  data: Subservice;
}

export default function EditSubServiceForm({ data }: EditServiceFormProps) {
  const [serviceData, setServiceData] = useState(data);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setServiceData((prev) => ({ ...prev, [name]: value }));
  };
  const onSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const response = await put(
      `/api/subservice/${serviceData?._id}`,
      serviceData
    );
    if (response.status === 201 || response.status === 200) {
      toast.success("Service added successfully");
    } else {
      toast.error("Error Occured");
    }
    console.log("res42", response);
  };
  return (
    <div className="flex size-full">
      <Toaster />
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Add Service</h2>
          <p className="text-sm text-gray-500 mb-4">
            Fill in the details of the service you'd like to add.
          </p>

          {/* Name */}
          <div className="mb-6">
            <label className="block mb-1 font-medium">Service Name</label>
            <input
              name="name"
              type="text"
              placeholder="Name of your service"
              value={serviceData.name}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 bg-gray-100 text-sm"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              rows={4}
              placeholder="Describe your service here..."
              value={serviceData.description}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 bg-gray-100 text-sm"
            />
          </div>

          {/* Image */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Image</label>
            <input
              name="image"
              placeholder="Describe your service here..."
              value={serviceData.image}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 bg-gray-100 text-sm"
            />
          </div>

          {/* Process */}
          <div className="mb-6">
            <label className="block mb-1 font-medium">Process</label>
            <input
              name="process"
              type="text"
              placeholder="e.g. Cleanse, Massage, Steam..."
              value={serviceData.process}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 bg-gray-100 text-sm"
            />
          </div>

          {/* Duration */}
          <div className="mb-6">
            <label className="block mb-1 font-medium">Duration</label>
            <input
              name="duration"
              type="text"
              placeholder="e.g. 1 hour"
              value={serviceData.duration}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 bg-gray-100 text-sm"
            />
          </div>

          {/* Original Price */}
          <div className="mb-6"></div>
          <label className="block mb-1 font-medium">Original Price</label>
          <input
            name="originalPrice"
            type="number"
            placeholder="₹1500"
            value={serviceData.originalPrice}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 bg-gray-100 text-sm"
          />
          <div className="mb-6">
            <label className="block mb-1 font-medium">Discounted Price</label>
            <input
              name="discountedPrice"
              type="number"
              placeholder="₹999"
              value={serviceData.discountedPrice}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 bg-gray-100 text-sm"
            />
          </div>
          <div className="flex justify-between">
            <button
              className="border border-gray-300 px-6 py-2 rounded-full cursor-pointer hover:bg-gray-100"
              onClick={(e) => {
                e.preventDefault();
                setServiceData({
                  name: "",
                  description: "",
                  process: "",
                  originalPrice: "",
                  discountedPrice: "",
                  duration: "",
                  image: "https://demo.link",
                });
              }}
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="bg-black text-white px-6 py-2 rounded-full cursor-pointer hover:bg-gray-900"
            >
              Add
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
