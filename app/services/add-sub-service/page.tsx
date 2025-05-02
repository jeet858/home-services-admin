"use client";

import { useState } from "react";
import { FaUserCircle, FaBell, FaSearch, FaChevronLeft } from "react-icons/fa";

export default function AddSubServicePage() {
  const [selectedService, setSelectedService] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files).slice(0, 3));
    }
  };

  const services = ["Web Development", "Graphic Design", "Consulting"]; // Replace with dynamic fetch if needed

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Add Sub Service Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Add Sub Service</h2>
          <p className="text-sm text-gray-500 mb-4">
            Upload your media. The first image will be used as the thumbnail in
            feed. Drag and drop up to
            <span className="font-semibold"> 3 images/videos </span>
            to create a multi-shot.
          </p>

          {/* Upload Box */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-100 flex items-center justify-center h-60 mb-4 cursor-pointer relative">
            <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
              <input
                type="file"
                multiple
                onChange={handleUpload}
                className="hidden"
              />
              <p className="text-center text-gray-600">
                <span className="text-2xl">🖼️</span>
                <br />
                Click to upload or drag and drop.
                <br />
                <span className="text-xs text-gray-400">
                  Maximum file size 50MB
                </span>
              </p>
            </label>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-4 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center"
              >
                {files[i] ? (
                  <img
                    src={URL.createObjectURL(files[i])}
                    alt="preview"
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <span className="text-gray-400">🖼️</span>
                )}
              </div>
            ))}
          </div>

          {/* Select Parent Service */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Select Service</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full border rounded-lg p-3 bg-gray-100 text-sm"
            >
              <option value="">-- Choose a Service --</option>
              {services.map((service, index) => (
                <option key={index} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block mb-1 font-medium">Title</label>
            <input
              type="text"
              placeholder="Name of your service"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded-lg p-3 bg-gray-100 text-sm"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">Description box</label>
            <textarea
              rows={4}
              placeholder="Describe your services here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg p-3 bg-gray-100 text-sm"
            />
          </div>

          {/* Price */}
          <div className="mb-6">
            <label className="block mb-1 font-medium">Add price</label>
            <input
              type="number"
              placeholder="₹00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border rounded-lg p-3 bg-gray-100 text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between">
            <button className="border border-gray-300 px-6 py-2 rounded-full">
              Cancel
            </button>
            <button className="bg-black text-white px-6 py-2 rounded-full">
              Add
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
