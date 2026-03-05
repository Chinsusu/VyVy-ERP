import { useQuery } from '@tanstack/react-query';
import axios from '../lib/axios';

export interface UserBrief {
    id: number;
    username: string;
    full_name: string;
    email?: string;
    role?: string;
}

const fetchUsers = async (): Promise<UserBrief[]> => {
    const response = await axios.get('/users');
    return response.data.data;
};

export const useUsers = () => {
    return useQuery<UserBrief[], Error>({
        queryKey: ['users'],
        queryFn: fetchUsers,
        staleTime: 5 * 60 * 1000, // cache 5 minutes
    });
};
