import { EmpStatus } from '@/constants/employee-status.enum';
import { WorkLogPageTranslations } from '@/contexts/LanguageContext';
import { CreateWorklogUseCase } from '@/data/usecases/worklog.usecase';
import { BearerTokenedRequest } from '@/domain/models/common/header-param';
import { Employee } from '@/domain/models/employee/get-employee.model';
import { Product } from '@/domain/models/product/get-product.dto';
import { set } from 'date-fns';
import { on } from 'events';
import { ChevronDown } from 'lucide-react';
import { use, useState } from 'react';
import toast from 'react-hot-toast';

interface WorkLogFormProps {
  employees: Employee[];
  products: Product[];
  translations: WorkLogPageTranslations;
  onClose: () => void;
  createWorklogUseCase: CreateWorklogUseCase;
  setShowCreatedAlert?: React.Dispatch<React.SetStateAction<boolean>>;
  setInActiveStatusAlert?: React.Dispatch<React.SetStateAction<boolean>>;
  onUpdate: (page: number) => void;
}

export function WorkLogForm({ employees, products, translations, onClose, createWorklogUseCase, setShowCreatedAlert, onUpdate, setInActiveStatusAlert }: WorkLogFormProps) {
  const translation = translations;
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const token = localStorage.getItem('token');
  const [submitting, setSubmitting] = useState(false);
  const useTokenRequest = { token } as BearerTokenedRequest;

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find(emp => emp._id === employeeId);
    if (!employee) {
      toast.error(translation.selectEmployee || "Please select an employee.");
      return;
    }
    // allow selecting inactive employees; submission will validate
    setSelectedEmployeeId(employee._id);
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    
    // Validation
    if (!selectedEmployeeId) {
      toast.error(translation.selectEmployee || "Please select an employee.");
      return;
    }
    // If selected employee is inactive, show alert and don't submit
    const selectedEmployee = employees.find(emp => emp._id === selectedEmployeeId);
    if (selectedEmployee && selectedEmployee.status !== EmpStatus.ACTIVE) {
      setInActiveStatusAlert(true);
      setTimeout(() => {setInActiveStatusAlert(false);}, 3000);
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
    try {
      setSubmitting(true);
      const createWorklogDto = {
        employeeId: selectedEmployeeId,
        productId: selectedProductId,
        quantity: quantity,
      };

      const result = await createWorklogUseCase.execute(useTokenRequest, createWorklogDto);
      if(result) {
        setShowCreatedAlert(true);
        setTimeout(() => setShowCreatedAlert(false), 3000);
      }
    } catch (error) {
      toast.error("Error creating worklog.");
    } finally {
      setSubmitting(false);
    }
    const page = 1;
    onUpdate(page);
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
              disabled={submitting}
              className={`px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100`}
            >
              {translation.cancelButton}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-2 bg-[#FF6767] text-white rounded-lg hover:bg-red-600 flex items-center justify-center`}
            >
              {submitting ? translation.saving : translation.addWorkLogButton}
            </button>
          </div>
    </form>
  );
}
