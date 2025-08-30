import ServiceProviderForm from "@/components/ServiceProviderForm";
import { Service } from "@/types/serviceProviderType";
import { get } from "@/utils/axiosIntersepcer";
import { cookies } from "next/headers";

export default async function AddServiceProvider() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const response = await get(`/api/services`, token);
  const services: Service[] = response.data.data.services;

  return (
    <>
      <ServiceProviderForm services={services} />
    </>
  );
}
