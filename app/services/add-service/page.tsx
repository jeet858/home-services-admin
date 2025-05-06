"use client";

import { post } from "@/utils/axiosIntersepcer";
import { MouseEvent, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

interface ServiceData {
  name: string;
  description: string;
  process: string;
  originalPrice: string;
  discountedPrice: string;
  duration: string;
  image: string;
}

export default function AddServicesPage() {
  const [serviceData, setServiceData] = useState<ServiceData>({
    name: "",
    description: "",
    process: "",
    originalPrice: "",
    discountedPrice: "",
    duration: "",
    image: "https://demo.link",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setServiceData((prev) => ({ ...prev, [name]: value }));
  };
  const onSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const response = await post("/api/services", serviceData);
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
          <div className="mb-6">
            <label className="block mb-1 font-medium">Original Price</label>
            <input
              name="originalPrice"
              type="number"
              placeholder="₹1500"
              value={serviceData.originalPrice}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 bg-gray-100 text-sm"
            />
          </div>

          {/* Discounted Price */}
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

          {/* Buttons */}
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
