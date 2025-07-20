import { IncomeDto } from '@/dtos/income/IncomeDto';
import { IncomeCreateDto } from '@/dtos/income/IncomeCreateDto';
import { IncomeUpdateDto } from '@/dtos/income/IncomeUpdateDto';
import { IncomeResponse } from '@/dtos/income/IncomeResponse';

const API_BASE_URL = 'https://tda-backend-khaki.vercel.app';

export const incomeService = {
  // Get all incomes
  async getAllIncomes(): Promise<IncomeDto[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/income`);
      if (!response.ok) {
        throw new Error(`Failed to fetch incomes: ${response.statusText}`);
      }
      const data: IncomeResponse = await response.json();
      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error('Error fetching incomes:', error);
      throw error;
    }
  },

  // Get income by ID
  async getIncomeById(id: string): Promise<IncomeDto> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/income/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch income: ${response.statusText}`);
      }
      const data: IncomeResponse = await response.json();
      if (!data.data || Array.isArray(data.data)) {
        throw new Error('Invalid income data received');
      }
      return data.data;
    } catch (error) {
      console.error('Error fetching income by ID:', error);
      throw error;
    }
  },

  // Create new income
  async createIncome(incomeData: IncomeCreateDto): Promise<IncomeDto> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/income`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(incomeData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create income: ${response.statusText}`);
      }
      
      const data: IncomeResponse = await response.json();
      if (!data.data || Array.isArray(data.data)) {
        throw new Error('Invalid income data received');
      }
      return data.data;
    } catch (error) {
      console.error('Error creating income:', error);
      throw error;
    }
  },

  // Update income
  async updateIncome(id: string, incomeData: IncomeUpdateDto): Promise<IncomeDto> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/income/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(incomeData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update income: ${response.statusText}`);
      }
      
      const data: IncomeResponse = await response.json();
      if (!data.data || Array.isArray(data.data)) {
        throw new Error('Invalid income data received');
      }
      return data.data;
    } catch (error) {
      console.error('Error updating income:', error);
      throw error;
    }
  },

  // Delete income
  async deleteIncome(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/income/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete income: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting income:', error);
      throw error;
    }
  },
};