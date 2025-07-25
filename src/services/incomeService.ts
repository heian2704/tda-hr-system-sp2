import { IncomeDto } from '@/dtos/income/IncomeDto';
import { IncomeCreateDto } from '@/dtos/income/IncomeCreateDto';
import { IncomeUpdateDto } from '@/dtos/income/IncomeUpdateDto';

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

export const incomeService = {
  // GET: All Incomes (with optional date range)
  getAllIncomes: async (startDate?: string, endDate?: string): Promise<IncomeDto[]> => {
    try {
      let url = `${API_BASE_URL}/income`;

      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch incomes: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('Error fetching incomes:', error);
      throw error;
    }
  },

  // GET: Income by ID
  getIncomeById: async (id: string): Promise<IncomeDto> => {
    try {
      const response = await fetch(`${API_BASE_URL}/income/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch income ${id}: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      console.error(`Error fetching income ${id}:`, error);
      throw error;
    }
  },

  // POST: Create Income
  createIncome: async (incomeData: IncomeCreateDto): Promise<IncomeDto> => {
    try {
      const response = await fetch(`${API_BASE_URL}/income`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(incomeData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create income: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      console.error('Error creating income:', error);
      throw error;
    }
  },

  // PATCH: Update Income
  updateIncome: async (id: string, incomeData: IncomeUpdateDto): Promise<IncomeDto> => {
    try {
      const response = await fetch(`${API_BASE_URL}/income/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(incomeData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update income ${id}: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      console.error(`Error updating income ${id}:`, error);
      throw error;
    }
  },

  // DELETE: Remove Income
  deleteIncome: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/income/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete income: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error(`Error deleting income ${id}:`, error);
      throw error;
    }
  },
};
