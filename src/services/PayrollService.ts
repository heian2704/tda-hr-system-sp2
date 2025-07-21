import { PayrollDto } from "@/dtos/payroll/PayrollDto";

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

export const PayrollService = {
    getAllPayrolls: async (employeeId?: string, month?: number, year?: number): Promise<PayrollDto[]> => {
        try {
            let api_route = `${API_BASE_URL}/payroll`;
            if(employeeId != null && month != null && year != null) {
                api_route += `?employeeId=${employeeId}&month=${month}&year=${year}`;
            }

            const response = await fetch(api_route, {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch payrolls: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching payrolls:', error);
            throw error;
        }
    },

    getPayrollByEmployeeId: async (employeeId: string): Promise<PayrollDto[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/payroll/${employeeId}`, {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch payroll for employee ${employeeId}: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching payroll for employee ${employeeId}:`, error);
            throw error;
        }
    }
}