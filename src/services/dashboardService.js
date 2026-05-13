import api from './authService';

export const getDashboardSummary = async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
};

export const getDashboardOverview = async () => {
    const response = await api.get('/dashboard/overview');
    return response.data;
};

export const getDashboardAnalytics = async () => {
    const response = await api.get('/dashboard/analytics');
    return response.data;
};
