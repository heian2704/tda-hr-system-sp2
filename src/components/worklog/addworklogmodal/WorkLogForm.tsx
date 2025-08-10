import { EmployeePageTranslations } from '@/contexts/LanguageContext';
import { CreateWorklogUseCase } from '@/data/usecases/worklog.usecase';
import { BearerTokenedRequest } from '@/domain/models/common/header-param';
import { Employee } from '@/domain/models/employee/get-employee.model';
import { Product } from '@/domain/models/product/get-product.dto';
import { useCreateWorklog } from '@/hooks/worklog/create-worklog.hook';
import { ChevronDown } from 'lucide-react';
import { use, useState } from 'react';
import toast from 'react-hot-toast';

interface WorkLogFormProps {
  employees: Employee[];
  products: Product[];
  translations: any;
  onClose: () => void;
  createWorklogUseCase: CreateWorklogUseCase;
}

export function WorkLogForm({ employees, products, translations, onClose, createWorklogUseCase }: WorkLogFormProps) {
  const translation = translations.workLogPage;
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const token = localStorage.getItem('token');
  const useTokenRequest = { token } as BearerTokenedRequest;

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedEmployeeId) {
      toast.error("Please select an employee.");
      return;
    }
    if (!selectedProductId) {
      toast.error("Please select a product.");
      return;
    }
    if (quantity <= 0) {
      toast.error("Please enter a valid quantity.");
      return;
    }

    const createWorklogDto = {
      employeeId: selectedEmployeeId,
      productId: selectedProductId,
      quantity: quantity,
    };

    console.log('Creating worklog with data:', createWorklogDto);
    const result = createWorklogUseCase.execute(useTokenRequest, createWorklogDto);
    console.log("Worklog created successfully:", result);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="employee" className="block text-sm font-medium">{translation.fullNameColumn}</label>
        <div className="relative">
          <select
            id="employee"
            value={selectedEmployeeId}
            onChange={e => handleEmployeeSelect(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg appearance-none"
            required
          >
            <option value="" disabled>{translation.selectEmployee}</option>
            {employees.map(emp => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Role */}
      {/* <div>
        <label className="block text-sm font-medium">{t.roleColumn}</label>
        <input
          type="text"
          value={formData.role}
          onChange={e => setters.setRole(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg"
          required
        />
      </div> */}

      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium">{translation.productNameColumn}</label>
        <div className="relative">
          <select
            id="product"
            value={selectedProductId}
            onChange={e => handleProductSelect(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg appearance-none"
            required
          >
            <option value="" disabled>{translation.selectProduct}</option>
            {products.map(prod => (
              <option key={prod._id} value={prod._id}>
                {prod.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium">{translation.quantityColumn}</label>
          <input
            type="number"
            value={quantity ?? ''}   // fallback to empty string if undefined
            onChange={e => setQuantity(Number(e.target.value))}
            className="w-full px-4 py-3 border rounded-lg"
            required
          />              
      </div>

      {/* Date */}
      {/* <div>
        <label className="block text-sm font-medium">{t.dateColumn}</label>
        <input
          type="date"
          value={formData.date}
          onChange={e => setters.setDate(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg"
          required
        />
      </div> */}

      <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100`}
            >
              {translation.cancelButton}
            </button>
            <button
              type="submit"
              className={`px-6 py-2 bg-[#FF6767] text-white rounded-lg hover:bg-red-600 flex items-center justify-center`}
            >
              {translation.addWorkLogButton}
            </button>
          </div>
    </form>
  );
}
