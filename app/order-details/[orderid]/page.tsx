"use client";

import { FaChevronLeft, FaUserCircle, FaBell } from "react-icons/fa";

export default function OrderDetailsPage() {
  return (
    <div className="flex min-h-full w-full justify-center">
      {/* Main content */}
      <main className="flex-1 p-8">
        {/* Order Details Section */}
        <h2 className="text-3xl font-bold mb-6 text-center">Oder Details</h2>
        <div className="flex flex-wrap gap-8 w-full justify-center">
          {/* Left Content */}
          <div className="flex flex-col gap-4 w-full max-w-xl">
            <h3 className="font-semibold text-lg">22nd Nov, Tuesday</h3>

            {/* Service Cards */}
            <div className="bg-white p-4 rounded-lg shadow-md flex gap-4 items-center">
              <img
                src="/diamond-facial.jpg"
                alt="Diamond Facial"
                className="w-20 h-20 rounded-md object-cover"
              />
              <div>
                <h4 className="font-bold">Diamond Facial</h4>
                <p className="text-sm text-gray-500">
                  • 2 hrs
                  <br />• Includes lorem ipsum
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md flex gap-4 items-center">
              <img
                src="/cleanup.jpg"
                alt="Cleanup"
                className="w-20 h-20 rounded-md object-cover"
              />
              <div>
                <h4 className="font-bold">Cleanup</h4>
                <p className="text-sm text-gray-500">
                  • 30 mins
                  <br />• Includes lorem
                </p>
              </div>
            </div>
          </div>

          {/* Billing Details */}
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
            <h4 className="font-semibold mb-4">Billing Details</h4>
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span>₹699</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Item Discount</span>
                <span>-₹50</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span>₹50</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-black">
                <span>Grand Total</span>
                <span>₹699</span>
              </div>
              <div className="flex justify-between pt-2 border-t text-gray-700">
                <span>Payment mode</span>
                <span className="font-semibold">Paytm UPI</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
