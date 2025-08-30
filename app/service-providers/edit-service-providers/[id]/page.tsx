import EditServiceProviderForm from "@/components/EditServiceProviderForm";
import ServiceProviderForm from "@/components/ServiceProviderForm";
import { Service, ServiceProvider } from "@/types/serviceProviderType";
import { get } from "@/utils/axiosIntersepcer";
import { cookies } from "next/headers";


export default async function EditServiceProvider({ params }: { params: any }) {
  // const router = useRouter()
  const { id } = await params;
  const cookieStore = await cookies();
  const token = await cookieStore.get("token")?.value;

  const providerResponse = await get(`/api/service-providers/${id}`, token);
  console.log('providerResponse',providerResponse?.data?.data?.serviceProvider)
  const provider:ServiceProvider = await providerResponse?.data?.data?.serviceProvider
  const servicesResponse = await get(`/api/services`, token);
  const services: Service[] = await servicesResponse?.data?.data?.services;

  return (
    <>
      <EditServiceProviderForm services={services} data={provider} id={id}/>
    </>
  );
}
