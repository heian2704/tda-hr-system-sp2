import React, { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Employee from '@/pages/employee/Employee';
import { EmployeeInterfaceImpl } from '@/data/interface-implementation/employee';
import { EmployeeInterface } from '@/domain/interfaces/employee/EmployeeInterface';
import { DeleteEmployeeUseCase } from '@/data/usecases/employee.usecase';
import { TokenedRequest } from '@/domain/models/common/header-param';
import { on } from 'events';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string | null;
  employeeName: string;
  onUpdate: () => void;
  showDeleteAlert: (show: boolean) => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  onUpdate,
  showDeleteAlert
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const employeeInterface : EmployeeInterface = new EmployeeInterfaceImpl();
  const deleteEmployeeUseCase = new DeleteEmployeeUseCase(employeeInterface);
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem('token');
  const translations = useLanguage();
  const employeePageTranslations = translations.translations.employeePage;
  if(!token)
  {
    throw new Error('ID Token is required for authentication');
  }

  const makeTokenedRequest = (id: string): TokenedRequest => ({
    id,
    token: token,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen || !employeeId) return null;

  const handleConfirm = async () => {
    if (!employeeId) return;
    if (submitting) return;
    try{
      setSubmitting(true);
      const result = await deleteEmployeeUseCase.execute(makeTokenedRequest(employeeId));
      if(result)
      {
      showDeleteAlert(true);
      setTimeout(() => showDeleteAlert(false), 3000);
      }
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting employee:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Confirm Delete
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Are you sure you want to delete employee "{employeeName}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleConfirm()}
            disabled={submitting}
            className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            {submitting ? employeePageTranslations.saving : employeePageTranslations.deleteButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;