"use client";
import { Service, ServiceProvider } from "@/types/serviceProviderType";
import { formDataPost } from "@/utils/axiosIntersepcer";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ServiceProviderFormProp {
  services: Service[];
}
const ServiceProviderForm: React.FunctionComponent<ServiceProviderFormProp> = ({
  services,
}) => {
  const [formValues, setFormValues] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    address: "",
    aadhaarCardNumber: "",
    aadhaarCard: "",
    services: "",
  });


  const [aadhaarCardImage, setAadhaarCardImage] = useState<File | null>(null);
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    Object.entries(formValues).forEach(([key, value]) =>
      formData.append(key, value)
    );

    if (aadhaarCardImage) formData.append("aadhaarCardImage", aadhaarCardImage);
    if (passportPhoto) formData.append("passportPhoto", passportPhoto);

    const res = await formDataPost(`/api/service-providers`, formData);

    console.log("res", res);
    if (res.status === 200 || res.status === 201) {
      toast.info("Service Provider Added");
    } else {
      toast.error("Error occured");
    }
  };

  return (
    <div className="flex justify-center items-center w-full ">
      <form
        onSubmit={handleSubmit}
        className="p-8 rounded-lg w-full space-y-4 "
      >
        <h2 className="text-xl font-bold text-center">Add service providers</h2>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formValues.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          
        />

        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={formValues.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          type="tel"
          name="phoneNumber"
          placeholder="Phone number"
          value={formValues.phoneNumber}
          onChange={handleChange}
          className="w-full border p-2 rounded"
         
        />

        <select
          name="services"
          value={formValues.services}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          
        >
          <option value="">Select your service type</option>
          {services.map((service, index) => {
            return (
              <option key={index} value={service?._id}>
                {service?.name}
              </option>
            );
          })}
        </select>

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formValues.address}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          name="aadhaarCard"
          placeholder="Aadhaar Card No."
          value={formValues.aadhaarCard}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        {/* Aadhaar upload */}
        <div className="flex gap-x-4">
          <label className="flex items-center justify-center w-fit h-fit p-4 border-2 bg-gray-400  rounded-lg cursor-pointer hover:bg-gray-100">
            <span className="text-white hover:text-black">
              Upload Aadhaar Card Image
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => setAadhaarCardImage(e.target.files?.[0] || null)}
            />
          </label>
          {aadhaarCardImage && (
            <div className="w-40 h-40 border rounded overflow-hidden">
              <img
                src={URL.createObjectURL(aadhaarCardImage)}
                alt="Aadhaar preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Passport upload */}
        <div className="flex gap-x-4">
          <label className="flex flex-col items-center justify-center w-fit h-fit p-4 border-2 bg-gray-400  rounded-lg cursor-pointer hover:bg-gray-100">
            <span className="text-white hover:text-black">
              Upload Passport Photo
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => setPassportPhoto(e.target.files?.[0] || null)}
            />
          </label>
          {passportPhoto && (
            <div className="w-40 h-40 border rounded overflow-hidden">
              <img
                src={URL.createObjectURL(passportPhoto)}
                alt="Passport preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition"
        >
          Add
        </button>
      </form>
    </div>
  );
};

export default ServiceProviderForm;
