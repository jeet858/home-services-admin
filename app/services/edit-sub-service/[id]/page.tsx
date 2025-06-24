import EditSubServiceForm from "@/components/EditSubServiceForm";
import { post, get } from "@/utils/axiosIntersepcer";
import { cookies } from "next/headers";

interface ServiceData {
  name: string;
  description: string;
  process: string;
  originalPrice: string;
  discountedPrice: string;
  duration: string;
  image: string;
}

export default async function EditSubServicesPage({ params }: { params: any }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const response = await get(`/api/subservice/${id}`, token);

  console.log("res 123", response?.data?.data?.subservice);
  return (
    <EditSubServiceForm
      data={response?.data?.data?.subservice as ServiceData}
    />
  );
}
