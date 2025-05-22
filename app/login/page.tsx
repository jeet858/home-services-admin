"use client";
import { post, postWithoutAuth } from "@/utils/axiosIntersepcer";
import React, { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await post("/api/admin/login", {
        email,
        password,
      });

      if (response?.status === 200) {
        const token = response.data.data.token;
        console.log("token in login", token);
        console.log("res", response.data.data.token);

        Cookies.set("token", token, { expires: 7 }); // 7 days expiry
        console.log("Login successful. Token saved in cookies.");
        router.push("/");
        // Redirect or store token if needed
      } else {
        console.error("Login failed:", response?.data || response);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

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
        <div className="w-48 h-48 bg-blue-100 rounded-full flex justify-center items-center mb-8">
          <h2 className="text-2xl font-bold text-blue-800 text-center">
            Admin <br /> Login
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col space-y-4 justify-center items-center"
        >
          <input
            type="text"
            placeholder="User Id"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 w-3/5"
          />
          <div className="relative w-3/5">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
            />
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
