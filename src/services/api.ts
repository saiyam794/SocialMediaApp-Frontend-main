import axios, { AxiosInstance } from "axios";
import { Feed, Comment, PaginatedResponse } from "@/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add ngrok bypass header if using ngrok
if (/ngrok(?:-free)?\.(?:app|io|dev)/i.test(API_URL) || /ngrok(?:-free)?\.(?:app|io|dev)/i.test(BACKEND_URL)) {
  api.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';
}

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Ensure ngrok header is always present for ngrok URLs
  if (config.url && (/ngrok(?:-free)?\.(?:app|io|dev)/i.test(config.url) || 
      /ngrok(?:-free)?\.(?:app|io|dev)/i.test(config.baseURL || ''))) {
    config.headers['ngrok-skip-browser-warning'] = 'true';
  }
  
  return config;
});

/**
 * Feed API calls
 */
export const feedAPI = {
  /**
   * Get all feeds with pagination
   */
  getFeeds: async (page: number = 1, limit: number = 10) => {
    const response = await api.get<PaginatedResponse<Feed>>("/feeds", {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Get single feed by ID
   */
  getFeed: async (id: string) => {
    const response = await api.get<Feed>(`/feeds/${id}`);
    return response.data;
  },

  /**
   * Create new feed
   */
  createFeed: async (data: {
    content: string;
    images?: string[];
    imageLayout?: string;
  }) => {
    const response = await api.post<Feed>("/feeds", data);
    return response.data;
  },

  /**
   * Update feed
   */
  updateFeed: async (
    id: string,
    data: Partial<{ content: string; images: string[] }>
  ) => {
    const response = await api.put<Feed>(`/feeds/${id}`, data);
    return response.data;
  },

  /**
   * Delete feed
   */
  deleteFeed: async (id: string) => {
    const response = await api.delete(`/feeds/${id}`);
    return response.data;
  },
};

/**
 * Comment API calls
 */
export const commentAPI = {
  /**
   * Get comments for a feed
   */
  getComments: async (feedId: string, page: number = 1, limit: number = 20) => {
    const response = await api.get<PaginatedResponse<Comment>>(
      `/comments/feed/${feedId}`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  /**
   * Create comment on a feed
   */
  createComment: async (feedId: string, content: string) => {
    const response = await api.post<Comment>(`/comments/feed/${feedId}`, {
      content,
    });
    return response.data;
  },

  /**
   * Update comment
   */
  updateComment: async (id: string, content: string) => {
    const response = await api.put<Comment>(`/comments/${id}`, { content });
    return response.data;
  },

  /**
   * Delete comment
   */
  deleteComment: async (id: string) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },
};

/**
 * Report API calls
 */
export const reportAPI = {
  reportFeed: async (feedId: string, reason?: string) => {
    try {
      console.log("📡 API: Reporting feed", feedId, reason);
      const response = await api.post(`/reports/feed/${feedId}`, {
        reason: reason || "Other",
      });
      console.log("📡 API: Report response", response.data);
      alert("Feed reported successfully!");
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        alert("You have already reported this feed.");
      } else if (error.response?.status === 404) {
        alert("Feed not found.");
      } else {
        alert("Something went wrong while reporting this feed.");
      }
      console.error("🚨 Report feed error:", error);
      throw error;
    }
  },

  removeReport: async (feedId: string) => {
    const response = await api.delete(`/reports/feed/${feedId}`);
    return response.data;
  },

  getReports: async (feedId: string) => {
    const response = await api.get(`/reports/feed/${feedId}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get("/reports/statistics/overview");
    return response.data;
  },
};

/**
 * Upload API calls
 */
export const uploadAPI = {
  /**
   * Upload single image
   */
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Return full URL to backend
      return {
        ...response.data,
        url: response.data.url.startsWith("http")
          ? response.data.url
          : `${BACKEND_URL}${response.data.url}`,
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  },

  /**
   * Upload multiple images
   */
  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    try {
      const response = await api.post("/upload/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Convert all URLs to full backend URLs
      return {
        ...response.data,
        urls: (response.data.urls || []).map((url: string) =>
          url.startsWith("http") ? url : `${BACKEND_URL}${url}`
        ),
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  },

  /**
   * Crop and upload image
   */
  cropImage: async (
    file: File,
    cropData: { x: number; y: number; width: number; height: number }
  ) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("x", String(cropData.x));
    formData.append("y", String(cropData.y));
    formData.append("width", String(cropData.width));
    formData.append("height", String(cropData.height));

    try {
      const response = await api.post("/upload/crop", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Return full URL to backend
      return {
        ...response.data,
        url: response.data.url.startsWith("http")
          ? response.data.url
          : `${BACKEND_URL}${response.data.url}`,
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  },
};

export default api;