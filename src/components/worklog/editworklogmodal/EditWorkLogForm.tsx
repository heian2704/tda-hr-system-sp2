// EmployeeForm.tsx
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UpdateWorklogDto } from '@/domain/models/worklog/update-worklog.dto';
import { Employee } from '@/domain/models/employee/get-employee.model';
import { Product } from '@/domain/models/product/get-product.dto';
import { UpdateWorklogUseCase } from '@/data/usecases/worklog.usecase';
import { TokenedRequest } from '@/domain/models/common/header-param';

interface Props {
    worklogid?: string;
    worklogToEdit?: UpdateWorklogDto;
    onClose: () => void;
    employees: Employee[];
    products: Product[];
    updateWorklogUseCase: UpdateWorklogUseCase;
    setShowEditAlert?: React.Dispatch<React.SetStateAction<boolean>>;
    onUpdate: any;
}

const EditWorkLogForm: React.FC<Props> = ({ worklogid, worklogToEdit, onClose, employees, products, updateWorklogUseCase, setShowEditAlert, onUpdate }) => {
    const [employeeId, setEmployeeId] = useState<string>(worklogToEdit?.employeeId || '');
    const [productId, setProductId] = useState<string>(worklogToEdit?.productId || '');
    const [quantity, setQuantity] = useState<number>(worklogToEdit?.quantity ?? 0);
    const [submitting, setSubmitting] = useState(false);
    const token = localStorage.getItem('token');
    const idToken = (id: string): TokenedRequest => ({
      id,
      token: token,
    });
    const t = useLanguage().translations.workLogPage;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      if (!worklogid) {
        console.error("Missing worklog id");
        return;
      }
      if (!employeeId) {
        console.error("No employee ID provided for update");
        return;
      }
      if (!productId) {
        console.error("No product ID provided for update");
        return;
      }

      (async () => {
        try {
          setSubmitting(true);
          const dto: UpdateWorklogDto = {
            ...worklogToEdit,
            employeeId,
            productId,
            quantity,
          } as UpdateWorklogDto;
          const result = await updateWorklogUseCase.execute(idToken(worklogid), dto);
          if (result) {
            setShowEditAlert?.(true);
            setTimeout(() => setShowEditAlert?.(false), 3000);
          }
          onUpdate?.();
          onClose();
        } catch (error) {
          console.error("Error saving worklog:", error);
        } finally {
          setSubmitting(false);
        }
      })();
    };


    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="employee" className="block text-sm font-medium">
            {t.fullNameColumn}
          </label>
          <div className="relative">
            <select
              id="employee"
              value={employeeId} // Use state variable
              onChange={(e) => {
                setEmployeeId(e.target.value);
                const selectedEmployee = employees.find(
                  (emp) => emp._id === e.target.value
                );
              }}
              className="w-full px-4 py-3 border rounded-lg appearance-none"
              required
            >
              <option value="" disabled>
                {t.selectEmployee}
              </option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Role - intentionally omitted in this form */}

        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium">
            {t.productNameColumn}
          </label>
          <div className="relative">
            <select
              id="product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg appearance-none"
              required
            >
              {products.map((prod) => (
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
          <label className="block text-sm font-medium">
            {t.quantityColumn}
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-4 py-3 border rounded-lg"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            {t.cancelButton}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-[#FF6767] text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            {submitting ? t.saving : t.editButton}
          </button>
        </div>
      </form>
    );
};

export default EditWorkLogForm;
