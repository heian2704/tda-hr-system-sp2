import { ReportDto } from "@/dtos/report/ReportDto";

const API_BASE_URL = 'https://tda-backend-khaki.vercel.app/_api';
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found. Please log in.');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

export const ReportService = {
    getAllReports: async (month: string, year: string): Promise<ReportDto> => {
        try {

        const response = await fetch(`${API_BASE_URL}/finance?month=${month}&year=${year}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });
    
        if (!response.ok) {
            throw new Error(`Failed to fetch reports: ${response.status} ${response.statusText}`);
        }
        
        console.log("Response from getAllReports:", response);

        const data = await response.json();
        return data;
        } catch (error) {
        console.error('Error fetching reports:', error);
        throw error;
        }
    },
}