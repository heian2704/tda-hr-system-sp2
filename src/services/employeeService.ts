import { EmployeeResponse } from "@/dtos/employee/EmployeeResponse";
import { EmployeeDto } from "@/dtos/employee/EmployeeDto";
import {EmployeeUpdateDto} from "@/dtos/employee/EmployeeUpdateDto.ts";

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

export const employeeService = {
  getAllEmployees: async (): Promise<EmployeeResponse[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/employee`, {
        method: 'GET',
          headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  },

  createEmployee: async (employee: Omit<EmployeeDto, '_id'>): Promise<EmployeeResponse> => {
    try {
      console.log("Creating employee with data:", employee);

      const response = await fetch(`${API_BASE_URL}/employee`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(employee),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Create employee error:', errorText);
        throw new Error(`Failed to create employee: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  },

  updateEmployee: async (id: string, employee: Partial<EmployeeUpdateDto>): Promise<EmployeeResponse> => {
    try {
        if (!id) {
          throw new Error('No employee ID provided for update');
        }

      const response = await fetch(`${API_BASE_URL}/employee/${id}`, {
        method: 'PATCH', 
        headers: getAuthHeaders(),
        body: JSON.stringify(employee),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update employee error response:', errorText);
        throw new Error(`Failed to update employee: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  },


  deleteEmployee: async (id: string): Promise<void> => {
    try {
      if (!id) {
        throw new Error('No employee ID provided for deletion');
      }

      const response = await fetch(`${API_BASE_URL}/employee/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete employee: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  },

  updateEmployeeStatus: async (id: string, status: string): Promise<EmployeeResponse> => {
    try {
      if (!id) {
        throw new Error('No employee ID provided for status update');
      }

      const response = await fetch(`${API_BASE_URL}/employee/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update employee status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating employee status:', error);
      throw error;
    }
  },
};
