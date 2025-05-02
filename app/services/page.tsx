"use client";

import { FaPlus } from "react-icons/fa";

export default function AllServicesPage() {
  const services = [
    {
      name: "Facial for glow",
      price: 599,
      image: "/facial.jpg",
    },
    {
      name: "Manicure",
      price: 499,
      image: "/manicure.jpg",
    },
    {
      name: "Pediure",
      price: 499,
      image: "/pediure.jpg",
    },
    {
      name: "Threading",
      price: 59,
      image: "/threading.jpg",
    },
  ];

  return (
    <div className="flex h-full w-full">
      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Title & Add Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">All Services</h2>
          <button className="flex items-center gap-2 bg-blue-800 text-white text-sm px-4 py-2 rounded-full shadow hover:bg-blue-900">
            <FaPlus /> Add Services
          </button>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition"
            >
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold">{service.name}</h3>
                <p className="text-sm text-blue-900 font-bold mt-1">
                  ₹{service.price} onwards
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
