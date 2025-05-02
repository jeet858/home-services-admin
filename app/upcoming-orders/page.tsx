export default function UpcomingOrderPage() {
  return (
    <div className="flex w-full h-full bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 p-10 w-full h-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Oders</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-10 border-b mb-6">
          <button className="pb-2 border-b-2 border-blue-600 text-blue-600 font-semibold">
            Upcoming Orders
          </button>
          <button className="pb-2 text-gray-400 font-semibold">
            Completed Orders
          </button>
        </div>

        {/* Order Card */}
        <div className="bg-blue-100 p-6 rounded-lg flex justify-between items-center">
          <div>
            <p className="font-bold">22nd</p>
            <p className="font-bold">Nov, Tuesday</p>
            <ul className="mt-4 text-gray-600 space-y-1 text-sm">
              <li>• Diamond Facial</li>
              <li>• Cleanup</li>
            </ul>
          </div>

          <div className="flex flex-col items-end gap-4">
            <span className="text-gray-700 font-semibold">Salon for Woman</span>
            <button className="bg-blue-700 text-white px-6 py-2 rounded-md">
              View Details
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
