import { get } from "@/utils/axiosIntersepcer";
import { cookies } from "next/headers";
import Link from "next/link";

interface Service {
  _id: string;
  name: string;
  description: string;
}
interface Booking {
  _id: string;
  userId: string;
  services: Service[];
  subservices: Service[];
  date: string; // ISO string
  time: string; // e.g., "08:00 PM"
  status: string; // e.g., "pending", "completed"
  discount: number;
  finalPrice: number;
  createdAt: string; // ISO string
  __v: number;
}
export default async function CompletedOrderPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const orders = await get("/api/booking", token);
  const bookings: Booking[] = orders.data.data.bookings;
  return (
    <div className="flex w-full h-full bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 p-10 w-full h-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Oders</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-10 border-b mb-6">
          <Link
            className="pb-2  text-gray-400 font-semibold"
            href={"/upcoming-orders"}
          >
            Upcoming Orders
          </Link>
          <p className="pb-2 border-blue-600 text-blue-600 font-semibold border-b-2">
            Completed Orders
          </p>
        </div>

        {/* Order Card */}
        {bookings
          .filter((booking) => {
            const bookingDateTime = new Date(booking.date);
            const now = new Date();
            return bookingDateTime < now;
          })
          .map((booking, index) => {
            const bookingDate = new Date(booking.date);
            return (
              <div
                className="bg-blue-100 p-6 rounded-lg flex justify-between items-center mb-2"
                key={index}
              >
                <div>
                  <p className="font-bold">
                    {bookingDate.getDate()},
                    {bookingDate.toLocaleString("en-US", { month: "short" })}
                  </p>
                  <p className="font-bold">
                    {bookingDate.toLocaleString("en-US", {
                      weekday: "long",
                    })}
                  </p>
                  <ul className="mt-4 text-gray-600 space-y-1 text-sm">
                    <li>{booking.services[0].description}</li>
                  </ul>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <span className="text-gray-700 font-semibold">
                    {booking.services[0].name}
                  </span>
                  <Link
                    className="bg-blue-700 text-white px-6 py-2 rounded-md cursor-pointer hover:bg-blue-900"
                    href={`/order-details/${booking._id}`}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
      </main>
    </div>
  );
}
