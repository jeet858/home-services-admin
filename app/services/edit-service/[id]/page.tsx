import { post, get } from "@/utils/axiosIntersepcer";
import { cookies } from "next/headers";
import EditServiceForm from "@/components/EditServiceForm";

interface ServiceData {
  name: string;
  description: string;
  process: string;
  originalPrice: string;
  discountedPrice: string;
  duration: string;
  image: string;
}

export default async function EditServicesPage({ params }: { params: any }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const response = await get(`/api/services/${id}`, token);
  console.log("res", response?.data?.data?.service);
  return (
    <EditServiceForm data={response?.data?.data?.service as ServiceData} />
  );
}
