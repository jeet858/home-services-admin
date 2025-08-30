"use client";

import { useState } from "react";
import { Save, ChevronDown, Search } from "lucide-react"; // icons
import { ServiceProvider } from "@/types/serviceProviderType";
import { put } from "@/utils/axiosIntersepcer";

interface Props {
  bookingId: string;
  providers: ServiceProvider[];
}

export default function AssignProvider({ bookingId, providers }: Props) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(""); // search state

  const handleAssign = (id: string) => {
    setSelectedProvider(id);
    setDropdownOpen(false); // close dropdown after selecting
    setSearch(""); // clear search after selection
  };

  const handleSave = async () => {
    if (!selectedProvider)
      return alert("Please assign a provider before saving");
    try {
      setLoading(true);
      await put(`/api/booking/${bookingId}/assign-provider`, {
        providerId: selectedProvider,
      });
      alert("Provider assigned successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to assign provider ❌");
    } finally {
      setLoading(false);
    }
  };

  const selectedName =
    providers.find((provider) => provider?.id === selectedProvider)?.name ||
    "Select service provider";

  // filter providers by search
  const filteredProviders = providers.filter((provider) =>
    provider?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative bg-white shadow-md rounded-lg p-4 w-full max-w-md">
      <h2 className="text-lg font-semibold">Service providers</h2>
      <p className="text-sm text-gray-500 mb-4">
        Select your service provider based on your requirements.
      </p>

      {/* Dropdown Trigger */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex justify-between items-center w-full border px-4 py-2 rounded-md text-left text-gray-700 bg-gray-50 hover:bg-gray-100"
        >
          <span>{selectedName}</span>
          <ChevronDown
            className={`w-5 h-5 transform transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown List */}
        {dropdownOpen && (
          <div className="absolute z-10 mt-2 w-full bg-white border rounded-md shadow-lg max-h-72 overflow-y-auto">
            {/* Search Input */}
            <div className="flex items-center gap-2 px-3 py-2 border-b">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search provider..."
                className="w-full outline-none text-sm text-gray-700"
              />
            </div>

            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 border-b last:border-none"
                >
                  <div>
                    <p className="font-medium">{provider?.name}</p>
                    <p className="text-sm text-gray-500">
                      {provider?.phoneNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAssign(provider?.id ?? "")}
                    className={`px-4 py-1 rounded-md text-white text-sm ${
                      selectedProvider === provider?.id
                        ? "bg-green-600"
                        : "bg-blue-600"
                    }`}
                  >
                    {selectedProvider === provider?.id ? "Assigned" : "Assign"}
                  </button>
                </div>
              ))
            ) : (
              <p className="px-4 py-3 text-sm text-gray-500">
                No providers found
              </p>
            )}
          </div>
        )}
      </div>

      {/* Save button at bottom-right */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
