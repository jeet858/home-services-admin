import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import rateLimit from "axios-rate-limit";
import { logToFile } from "./logger"; // ✅ import our logger

export const dynamic = "force-dynamic";

let axiosBase: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
});

const axiosInstance: AxiosInstance = rateLimit(axiosBase, {
  maxRequests: 5,
  perMilliseconds: 1000,
  maxRPS: 5,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const logMsg = `[Request] ${config.method?.toUpperCase()} ${
      config.url
    } | headers: ${JSON.stringify(config.headers)} | params: ${JSON.stringify(
      config.params
    )} | data: ${JSON.stringify(config.data)}`;

    logToFile(logMsg); // ✅ save to file
    return config;
  },
  (error) => {
    logToFile(`[Request Error] ${error.message}`);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const logMsg = `[Response] ${response.status} ${
      response.config.url
    } | data: ${JSON.stringify(response.data)}`;

    logToFile(logMsg); // ✅ save to file
    return response;
  },
  (error) => {
    if (error.response) {
      const logMsg = `[Error Response] ${error.response.status} ${
        error.config.url
      } | data: ${JSON.stringify(error.response.data)}`;

      logToFile(logMsg);
    } else {
      const logMsg = `[Network Error] ${error.message}`;

      logToFile(logMsg);
    }
    return Promise.reject(error);
  }
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
// Form data POST request
export const formDataPost = async <T = any>(
  url: string,
  data: any
): Promise<AxiosResponse<T> | any> => {
  try {
    const token = Cookies.get("token");
    const headers = {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    };

    const response = await axiosInstance.post<T>(url, data, { headers });
    return response;
  } catch (error: any) {
    return error;
  }
};
// Form data PUT request
export const formDataPut = async <T = any>(
  url: string,
  data: any
): Promise<AxiosResponse<T> | any> => {
  try {
    const token = Cookies.get("token");
    const headers = {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    };

    const response = await axiosInstance.put<T>(url, data, { headers });
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
