"use client";

import { get, post } from "@/utils/axiosIntersepcer";
import { MouseEvent, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaUserCircle, FaBell, FaSearch, FaChevronLeft } from "react-icons/fa";
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
interface SubServiceData {
  name: string;
  description: string;
  process: string;
  originalPrice: string;
  discountedPrice: string;
  duration: string;
  serviceId: string;
  image: string;
}
export default function AddSubServicePage() {
  const [selectedService, setSelectedService] = useState("");
  const [subServiceData, setSubServiceData] = useState<SubServiceData>({
    name: "",
    description: "",
    process: "",
    originalPrice: "",
    discountedPrice: "",
    duration: "",
    serviceId: "",
    image: "https://demo.link",
  });

  const [services, setServices] = useState<ServiceDetail[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await get("/api/services"); // adjust endpoint as needed
        setServices(response.data.data.services);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
  }, []);
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setSubServiceData((prev) => ({ ...prev, [name]: value }));
  };
  const onSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const response = await post("/api/subservice/", subServiceData);
    if (response.status === 201 || response.status === 200) {
      toast.success("Service added successfully");
    } else {
      toast.error("Error Occured");
    }
    console.log("res43", response);
  };
  return (
    <div className="flex h-full w-full bg-gray-50">
      <Toaster />
      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Add Sub Service Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Add Sub Service</h2>

          {/* Select Parent Service */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Select Service</label>
            <select
              value={subServiceData.serviceId}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 bg-gray-100 text-sm"
              name="serviceId"
            >
              <option value="">-- Choose a Service --</option>
              {services.map((service, index) => (
                <option key={index} value={service._id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div className="mb-6">
            <label className="block mb-1 font-medium">Service Name</label>
            <input
              name="name"
              type="text"
              placeholder="Name of your service"
              value={subServiceData.name}
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
              value={subServiceData.description}
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
              value={subServiceData.process}
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
              value={subServiceData.duration}
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
              value={subServiceData.originalPrice}
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
              value={subServiceData.discountedPrice}
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
                setSubServiceData({
                  name: "",
                  description: "",
                  process: "",
                  originalPrice: "",
                  discountedPrice: "",
                  duration: "",
                  serviceId: "",
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
