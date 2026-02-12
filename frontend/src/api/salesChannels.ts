import axios from '../lib/axios';
import type {
    SalesChannel,
    CreateSalesChannelInput,
    UpdateSalesChannelInput,
    SalesChannelFilters,
    SalesChannelListResponse,
} from '../types/salesChannel';

const BASE_URL = '/sales-channels';

export const salesChannelsAPI = {
    /**
     * Get sales channels list with filters
     */
    getSalesChannels: async (filters?: SalesChannelFilters): Promise<SalesChannelListResponse> => {
        const { data } = await axios.get(BASE_URL, { params: filters });
        return data;
    },

    /**
     * Get single sales channel by ID
     */
    getSalesChannelById: async (id: number): Promise<SalesChannel> => {
        const { data } = await axios.get(`${BASE_URL}/${id}`);
        return data.data;
    },

    /**
     * Create new sales channel
     */
    createSalesChannel: async (input: CreateSalesChannelInput): Promise<SalesChannel> => {
        const { data } = await axios.post(BASE_URL, input);
        return data.data;
    },

    /**
     * Update sales channel
     */
    updateSalesChannel: async (id: number, input: UpdateSalesChannelInput): Promise<SalesChannel> => {
        const { data } = await axios.put(`${BASE_URL}/${id}`, input);
        return data.data;
    },

    /**
     * Delete sales channel
     */
    deleteSalesChannel: async (id: number): Promise<void> => {
        await axios.delete(`${BASE_URL}/${id}`);
    },
};
