import { ProductCreateDto } from "@/dtos/product/ProductCreateDto";
import { ProductDto } from "@/dtos/product/productDto";
import { ProductUpdateDto } from "@/dtos/product/ProductUpdateDto";
import { get } from "http";

const API_BASE_URL = 'https://tda-backend-khaki.vercel.app/_api';

export const ProductService = {
  getAllProducts: async (): Promise<ProductDto[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/product`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  getProductById: async (id: string): Promise<ProductDto> => {
    try {
        const response = await fetch(`${API_BASE_URL}/product/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        });
        if(!response.ok) {
            throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
  },

  createProduct: async (product: Omit<ProductDto, '_id'>): Promise<ProductCreateDto> => {
    try {
        const response = await fetch(`${API_BASE_URL}/product`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(product),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Create product error:', errorText);
            throw new Error(`Failed to create product: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
  },

  updateProduct: async (id: string, product: Partial<ProductDto>): Promise<ProductUpdateDto> => {
    try {
      const response = await fetch(`${API_BASE_URL}/product/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(product),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update product error:', errorText);
        throw new Error(`Failed to update product: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/product/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete product error:', errorText);
        throw new Error(`Failed to delete product: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}