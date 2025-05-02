import axios from "axios";
export const dynamic = "force-dynamic";

const axiosInstance = axios.create({
  baseURL: process.env.RPC_URL,
});

export const extraHeaders = {
  "Cache-Control": "no-cache, no-store, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export const get = async (url, params) => {
  try {
    const password = process.env.RPC_PASSWORD;
    const user = process.env.RPC_USER;

    if (!user || !password) {
      throw new Error("Missing RPC credentials in environment variables");
    }

    const headers = {
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Content-Type": "application/json",
      Authorization:
        "Basic " + Buffer.from(`${user}:${password}`).toString("base64"),
    };

    const response = await axiosInstance.get(url, {
      params,
      headers: headers,
    });

    return response;
  } catch (error) {
    return error;
  }
};
export const post = async (url, data) => {
  try {
    const password = process.env.RPC_PASSWORD;
    const user = process.env.RPC_USER;

    if (!user || !password) {
      throw new Error("Missing RPC credentials in environment variables");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization:
        "Basic " + Buffer.from(`${user}:${password}`).toString("base64"),
    };
    const response = await axiosInstance.post(url, data, { headers });
    return response;
  } catch (error) {
    return error;
  }
};
const createError = (message) => {
  console.log(message);
  if (message?.response?.status === 500) {
    console.log("Internal server error", "error");
  } else if (message?.response?.status === 400) {
    console.log(message?.response?.data?.message, "error");
  } else if (message?.response?.status === 401) {
    if (message?.response?.data?.message !== "Invalid credentials") {
      console.log(message?.response?.data?.message, "error");
    }
  } else if (message?.response?.status === 404) {
    if (message?.response?.data?.message !== "User not found.") {
      console.log(message?.response?.data?.message, "error");
    }
  } else if (message?.response?.status === 502) {
    console.log("Internal server error", "error");
  } else if (message?.response?.status === 504) {
    console.log("oops! Something went wrong", "error");
  } else {
    console.log("An error occurred", "error");
  }
  return message?.response;
};

export default axiosInstance;
