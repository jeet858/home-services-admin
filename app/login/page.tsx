export default function LoginPage() {
    return (
      <div className="flex min-h-screen min-w-screen">
        {/* Left Section */}
        <div className="w-1/2 bg-gradient-to-br from-blue-400 to-blue-700 text-white flex flex-col justify-center items-center p-8">
          <div className="text-2xl font-bold mb-8">LOGO</div>
          <h1 className="text-4xl font-bold">U</h1>
          <h2 className="text-2xl font-semibold mt-2">Home Services</h2>
          <p className="text-sm mt-20 opacity-75">Only admin can login here.</p>
        </div>
  
        {/* Right Section */}
        <div className="w-1/2 bg-white flex flex-col justify-center items-center p-8">
          {/* Circle with Admin Login */}
          <div className="w-48 h-48 bg-blue-100 rounded-full flex justify-center items-center mb-8">
            <h2 className="text-2xl font-bold text-blue-800 text-center">
              Admin <br /> Login
            </h2>
          </div>
  
          {/* Form */}
          <form className="w-full flex flex-col space-y-4 justify-center items-center">
            <input
              type="text"
              placeholder="User Id"
              className="border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 w-3/5"
            />
            <div className="relative w-3/5">
              <input
                type="password"
                placeholder="Password"
                className="border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
              />
              {/* Eye Icon Placeholder */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                👁️
              </div>
            </div>
  
            <button
              type="submit"
              className="bg-blue-800 text-white py-3 rounded-md hover:bg-blue-900 transition w-3/5"
            >
              Login
            </button>
          </form>
  
          
        </div>
      </div>
    );
  }
  