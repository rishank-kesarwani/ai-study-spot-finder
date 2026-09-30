import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  ApiResponse,
  PaginatedResult,
  Spot,
  Review,
  User,
  StudyList,
  ChatResponse,
  ChatMessage,
  SpotCategory,
  NoiseLevel,
  WifiSpeed,
  OutletDensity,
  PriceLevel,
} from '../types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const api: AxiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('study_access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Auto Refresh Token Handling
api.interceptors.response.use(
  (response) => {
    // Unpack NestJS TransformInterceptor ApiResponse
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (typeof window === 'undefined') {
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem('study_refresh_token');
      if (!refreshToken) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(`${BACKEND_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const data = response.data.data || response.data;
        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        localStorage.setItem('study_access_token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('study_refresh_token', newRefreshToken);
        }

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('study_access_token');
        localStorage.removeItem('study_refresh_token');
        localStorage.removeItem('study_user');
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export interface SpotsQueryParams {
  query?: string;
  category?: SpotCategory;
  noiseLevel?: NoiseLevel;
  wifiSpeed?: WifiSpeed;
  outletDensity?: OutletDensity;
  priceLevel?: PriceLevel;
  minRating?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  openNow?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'popularity' | 'distance' | 'newest';
}

export const spotsApi = {
  getSpots: (params?: SpotsQueryParams): Promise<PaginatedResult<Spot>> =>
    api.get('/spots', { params }),

  getFeatured: (): Promise<Spot[]> => api.get('/spots/featured'),

  getCategories: (): Promise<Array<{ _id: SpotCategory; count: number; avgRating: number }>> =>
    api.get('/spots/categories'),

  getById: (id: string): Promise<Spot> => api.get(`/spots/${id}`),

  getBySlug: (slug: string): Promise<Spot> => api.get(`/spots/slug/${slug}`),

  checkIn: (id: string): Promise<{ success: boolean; message: string; checkInCount: number }> =>
    api.post(`/spots/${id}/check-in`),

  toggleSave: (id: string): Promise<{ success: boolean; isSaved: boolean; savedSpotIds: string[]; message: string }> =>
    api.post(`/spots/${id}/save`),
};

export const reviewsApi = {
  getSpotReviews: (spotId: string, page = 1, limit = 10): Promise<PaginatedResult<Review>> =>
    api.get(`/reviews/spot/${spotId}`, { params: { page, limit } }),

  createReview: (
    spotId: string,
    review: {
      rating: number;
      noiseReported: NoiseLevel;
      wifiReported: WifiSpeed;
      outletsReported: OutletDensity;
      content: string;
      proTip?: string;
      photos?: string[];
    },
  ): Promise<Review> => api.post(`/reviews/spot/${spotId}`, review),

  toggleHelpful: (reviewId: string): Promise<{ helpfulCount: number; isHelpful: boolean }> =>
    api.post(`/reviews/${reviewId}/helpful`),
};

export const aiConciergeApi = {
  chat: (payload: {
    messages: ChatMessage[];
    useRag?: boolean;
    latitude?: number;
    longitude?: number;
  }): Promise<ChatResponse> => api.post('/ai/concierge/chat', payload),

  getHealth: (): Promise<{ connected: boolean; service: string }> =>
    api.get('/ai/health'),
};

export const savedSpotsApi = {
  getSavedSpots: (): Promise<Spot[]> => api.get('/saved-spots'),

  getLists: (): Promise<StudyList[]> => api.get('/saved-spots/lists'),

  createList: (data: {
    title: string;
    description?: string;
    icon?: string;
    color?: string;
    isPublic?: boolean;
  }): Promise<StudyList> => api.post('/saved-spots/lists', data),

  getListById: (id: string): Promise<StudyList> => api.get(`/saved-spots/lists/${id}`),

  deleteList: (id: string): Promise<{ success: boolean }> =>
    api.delete(`/saved-spots/lists/${id}`),

  toggleSpotInList: (listId: string, spotId: string): Promise<StudyList> =>
    api.post(`/saved-spots/lists/${listId}/toggle/${spotId}`),
};

export const authApi = {
  register: (data: any): Promise<any> => api.post('/auth/register', data),
  login: (data: any): Promise<any> => api.post('/auth/login', data),
  logout: (): Promise<any> => api.post('/auth/logout'),
  forgotPassword: (email: string): Promise<any> =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any): Promise<any> => api.post('/auth/reset-password', data),
  getMe: (): Promise<User> => api.get('/users/me'),
  updateProfile: (data: any): Promise<User> => api.put('/users/me', data),
  updatePreferences: (data: any): Promise<User> => api.put('/users/me/preferences', data),
};

export default api;
