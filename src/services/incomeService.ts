import { IncomeDto } from '@/dtos/income/IncomeDto';
import { IncomeCreateDto } from '@/dtos/income/IncomeCreateDto';
import { IncomeUpdateDto } from '@/dtos/income/IncomeUpdateDto';
import { IncomeResponse } from '@/dtos/income/IncomeResponse';

const API_BASE_URL = 'https://tda-backend-khaki.vercel.app/_api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

const handleApiResponse = async (response: Response): Promise<any> => {
  const raw = await response.text();
  console.log('Raw API response:', raw);

  if (!response.ok) {
    console.error(`❌ API Error ${response.status}:`, raw);
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  // Handle empty response
  if (!raw || raw.trim() === '') {
    console.warn('Empty response received');
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (parseError) {
    console.error('Failed to parse JSON response:', parseError);
    throw new Error('Invalid JSON response from server');
  }
};

const normalizeToArray = (data: any): any[] => {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
};

export const incomeService = {
  // Get all incomes
async getAllIncomes(filterParams?: { startDate?: string; endDate?: string }): Promise<IncomeDto[]> {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No auth token found.');

    // Build query string if filters exist
    let url = `${API_BASE_URL}/income`;
    if (filterParams) {
      const query = new URLSearchParams();
      if (filterParams.startDate) query.append('startDate', filterParams.startDate);
      if (filterParams.endDate) query.append('endDate', filterParams.endDate);
      url += `?${query.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });

    const parsedResponse = await handleApiResponse(response);

    let incomeData;
    if (parsedResponse && typeof parsedResponse === 'object') {
      incomeData = parsedResponse.data || parsedResponse;
    } else {
      incomeData = parsedResponse;
    }

    const incomes = normalizeToArray(incomeData);

    console.log('✅ Successfully fetched all incomes');
    return incomes as IncomeDto[];
  } catch (error) {
    console.error('Error fetching all incomes:', error);
    return [];
  }
},



  // Get income by ID
  async getIncomeById(id: string): Promise<IncomeDto> {
    try {
      if (!id || id.trim() === '') {
        throw new Error('Income ID is required');
      }

      const response = await fetch(`${API_BASE_URL}/income/${id}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const parsedResponse = await handleApiResponse(response);
      
      let incomeData;
      if (parsedResponse && typeof parsedResponse === 'object') {
        incomeData = parsedResponse.data || parsedResponse;
      } else {
        incomeData = parsedResponse;
      }

      const income = Array.isArray(incomeData) ? incomeData[0] : incomeData;

      if (!income || typeof income !== 'object') {
        throw new Error('Invalid income data received or income not found');
      }

      console.log('✅ Successfully fetched income by ID:', id);
      return income;

    } catch (error) {
      console.error(`Error fetching income by ID (${id}):`, error);
      throw error;
    }
  },

  // Create income
  async createIncome(incomeData: IncomeCreateDto): Promise<IncomeDto> {
    try {
      if (!incomeData || typeof incomeData !== 'object') {
        throw new Error('Valid income data is required');
      }

      const response = await fetch(`${API_BASE_URL}/income`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(incomeData),
      });

      const parsedResponse = await handleApiResponse(response);
      
      let responseData;
      if (parsedResponse && typeof parsedResponse === 'object') {
        responseData = parsedResponse.data || parsedResponse;
      } else {
        responseData = parsedResponse;
      }

      const income = Array.isArray(responseData) ? responseData[0] : responseData;

      if (!income || typeof income !== 'object') {
        throw new Error('Invalid income data received after creation');
      }

      console.log('✅ Successfully created income');
      return income;

    } catch (error) {
      console.error('Error creating income:', error);
      throw error;
    }
  },

  // Update income
  async updateIncome(id: string, incomeData: IncomeUpdateDto): Promise<IncomeDto> {
    try {
      if (!id || id.trim() === '') {
        throw new Error('Income ID is required');
      }
      
      if (!incomeData || typeof incomeData !== 'object') {
        throw new Error('Valid income data is required');
      }

      const response = await fetch(`${API_BASE_URL}/income/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(incomeData),
      });

      const parsedResponse = await handleApiResponse(response);
      
      let responseData;
      if (parsedResponse && typeof parsedResponse === 'object') {
        responseData = parsedResponse.data || parsedResponse;
      } else {
        responseData = parsedResponse;
      }

      const income = Array.isArray(responseData) ? responseData[0] : responseData;

      if (!income || typeof income !== 'object') {
        throw new Error('Invalid income data received after update');
      }

      console.log('✅ Successfully updated income:', id);
      return income;

    } catch (error) {
      console.error(`Error updating income (${id}):`, error);
      throw error;
    }
  },

  // Delete income
  async deleteIncome(id: string): Promise<void> {
    try {
      if (!id || id.trim() === '') {
        throw new Error('Income ID is required');
      }

      const response = await fetch(`${API_BASE_URL}/income/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Delete income failed:', errorText);
        throw new Error(`Failed to delete income: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Successfully deleted income:', id);

    } catch (error) {
      console.error(`Error deleting income (${id}):`, error);
      throw error;
    }
  },
};