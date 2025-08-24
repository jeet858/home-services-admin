import AssignProvider from "@/components/AssignProvider";
import { Booking, ServiceProvider } from "@/types/serviceProviderType";
import { get } from "@/utils/axiosIntersepcer";
import { cookies } from "next/headers";

interface OrderDetailsPageProps {
  params: { orderid: string };
}
interface Service {
  _id?: string;
  name?: string;
  description?: string;
}

interface Address {
  _id?: string;
  userId?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  createdAt?: string; // ISO date string
  __v?: number;
}

export default async function OrderDetailsPage({ params }: { params: any }) {
  const { orderid } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const response = await get(`/api/booking/${orderid}`, token);
  const booking: Booking = response.data.data.booking;
  const addressResponse = await get(
    `/api/addresses/admin/${response.data.data.booking.addressId}`,
    token
  );
  const res = await get(`/api/service-providers`, token);
  const serviceProvider: ServiceProvider[] = res.data.data.serviceProviders;
  const address: Address = addressResponse?.data?.data?.address;
  const bookingDate = new Date(booking.date as string);
  return (
    <div className="flex min-h-full w-full items-center flex-col">
      {/* Main content */}
      <main className="p-8 w-full justify-center">
        {/* Order Details Section */}
        <h2 className="text-3xl font-bold mb-6 text-center">Oder Details</h2>
        <div className="flex flex-wrap gap-8 w-full justify-center">
          {/* Left Content */}
          <div className="flex flex-col gap-4 w-full max-w-xl">
            <h3 className="font-semibold text-lg">
              {bookingDate.getDate()},{" "}
              {bookingDate.toLocaleString("en-US", { month: "short" })},{" "}
              {bookingDate.toLocaleString("en-US", {
                weekday: "long",
              })}
            </h3>

            {/* Service Cards */}
            {booking?.subservices?.map((service, index) => {
              return (
                <div
                  className="bg-white p-4 rounded-lg shadow-md flex gap-4 items-center"
                  key={index}
                >
                  <div>
                    <h4 className="font-bold">{service.name}</h4>
                    <p className="text-sm text-gray-500">
                      {service.description}
                    </p>
                  </div>
                </div>
              );
            })}

            <div className="bg-white p-4 rounded-lg shadow-md grid grid-cols-2 gap-4 items-center">
              <p className="font-bold">Service Category</p>
              <p>{booking.services?.[0]?.name}</p>
              <p className="font-bold">Address</p>
              <p>{`${address?.street}, ${address?.city}, ${address?.state}, ${address?.zip}`}</p>
            </div>
          </div>

          {/* Billing Details */}
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
            <h4 className="font-semibold mb-4">Billing Details</h4>
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span>{`${
                  (booking.finalPrice as number) + (booking.discount as number)
                }`}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Item Discount</span>
                <span>{booking?.discount}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>₹50</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-black">
                <span>Grand Total</span>
                <span>{`${(booking.finalPrice as number) + 50}`}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="flex flex-wrap gap-8 w-full justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
          <h4 className="font-semibold mb-4">Servide Provider Details</h4>
          <div className="text-sm text-gray-700 space-y-2">
            <div className="flex justify-between">
              <span>Name</span>
              <span>{booking?.serviceProviderId?.name}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Phone Number</span>
              <span>
                <span>{booking?.serviceProviderId?.phoneNumber}</span>
              </span>
            </div>
            {/* <div className="flex justify-between">
                <span>Rating</span>
                <span>{booking?.serviceProviderId?.rating}</span>
              </div> */}
          </div>
        </div>
        <AssignProvider bookingId={orderid} providers={serviceProvider} />
      </div>
    </div>
  );
}
