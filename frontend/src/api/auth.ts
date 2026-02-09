import api from '../lib/axios';
import type { LoginRequest, LoginResponse, APIResponse, User } from '../types/auth';

export const authApi = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<APIResponse<LoginResponse>>('/auth/login', credentials);
        return response.data.data!;
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<APIResponse<User>>('/auth/me');
        return response.data.data!;
    },

    refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
        const response = await api.post<APIResponse<LoginResponse>>('/auth/refresh', {
            refresh_token: refreshToken,
        });
        return response.data.data!;
    },
};
