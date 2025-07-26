import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";

export const dynamic = "force-dynamic";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
});

export const extraHeaders: Record<string, string> = {
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
  (response: AxiosResponse) => response,
  (error) => Promise.reject(error)
);

// GET request
export const get = async <T = any>(
  url: string,
  token?: string,
  params?: Record<string, any>
): Promise<AxiosResponse<T> | any> => {
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await axiosInstance.get<T>(url, {
      params,
      headers,
    });

    return response;
  } catch (error: any) {
    return error;
  }
};

// POST request for login
export const postWithoutAuth = async <T = any>(
  url: string,
  data: any
): Promise<AxiosResponse<T> | any> => {
  console.log("env", process.env.BASE_API_URL);
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    const response = await axiosInstance.post<T>(url, data, { headers });
    return response;
  } catch (error: any) {
    return error;
  }
};

// POST request
export const post = async <T = any>(
  url: string,
  data: any
): Promise<AxiosResponse<T> | any> => {
  try {
    const token = Cookies.get("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await axiosInstance.post<T>(url, data, { headers });
    return response;
  } catch (error: any) {
    return error;
  }
};
// PUT request
export const put = async <T = any>(
  url: string,
  data: any
): Promise<AxiosResponse<T> | any> => {
  try {
    const token = Cookies.get("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const response = await axiosInstance.put<T>(url, data, { headers });
    return response;
  } catch (error: any) {
    return error;
  }
};

// DELETE request
export const del = async <T = any>(
  url: string
): Promise<AxiosResponse<T> | any> => {
  try {
    const token = Cookies.get("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    

    const response = await axiosInstance.delete<T>(url, { headers });
    return response;
  } catch (error: any) {
    return error;
  }
};

// Error handling
const createError = (message: any): any => {
  console.log(message);
  const status = message?.response?.status;
  const msg = message?.response?.data?.message;

  switch (status) {
    case 500:
    case 502:
      console.log("Internal server error", "error");
      break;
    case 400:
      console.log(msg, "error");
      break;
    case 401:
      if (msg !== "Invalid credentials") console.log(msg, "error");
      break;
    case 404:
      if (msg !== "User not found.") console.log(msg, "error");
      break;
    case 504:
      console.log("oops! Something went wrong", "error");
      break;
    default:
      console.log("An error occurred", "error");
  }

  return message?.response;
};

export default axiosInstance;
