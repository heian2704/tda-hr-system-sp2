
import { worklogCreateDto } from "@/dtos/worklog/worklogCreateDto";
import { worklogDto } from "@/dtos/worklog/worklogDto";
import { worklogUpdateDto } from "@/dtos/worklog/worklogUpdateDto";
import { get } from "http";

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

export const worklogService = {
  getAllWorklogs: async (): Promise<worklogDto[]> => {
    try {

      const response = await fetch(`${API_BASE_URL}/employee-product`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch worklogs: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching worklogs:', error);
      throw error;
    }
  },

  getWorkLogById: async (id: string): Promise<worklogDto> => {
    try {
      
        const response = await fetch(`${API_BASE_URL}/employee-product/${id}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch worklog: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching worklog by ID:', error);
        throw error;
    }
  },

  createWorkLog: async (worklog: worklogCreateDto): Promise<worklogDto> => {
      try {
        console.log("Creating worklog with data:", worklog);

        const response = await fetch(`${API_BASE_URL}/employee-product`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(worklog),
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Create worklog error:', errorText);
          throw new Error(`Failed to create worklog: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error creating worklog:', error);
        throw error;
      }
    },
  
    updateWorkLog: async (id: string, worklog: Partial<worklogUpdateDto>): Promise<worklogDto> => {
      try {
          if (!id) {
            throw new Error('No worklog ID provided for update');
          }
        const response = await fetch(`${API_BASE_URL}/employee-product/${id}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(worklog),
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Update worklog error response:', errorText);
          throw new Error(`Failed to update worklog: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error updating worklog:', error);
        throw error;
      }
    },
  
  
    deleteWorkLog: async (id: string): Promise<void> => {
      try {
        if (!id) {
          throw new Error('No worklog ID provided for deletion');
        }
  
        const response = await fetch(`${API_BASE_URL}/employee-product/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });
  
        if (!response.ok) {
          throw new Error(`Failed to delete worklog: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error deleting worklog:', error);
        throw error;
      }
    }
};
