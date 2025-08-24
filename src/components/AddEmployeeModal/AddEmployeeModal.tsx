import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { AddEmployeeModalProps } from './types';
import EmployeeForm from './EmployeeForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { EmployeeInterface } from '@/domain/interfaces/employee/EmployeeInterface';
import { EmployeeInterfaceImpl } from '@/data/interface-implementation/employee';
import { CreateEmployeeUseCase } from '@/data/usecases/employee.usecase';

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  addEmployeeDto,
  onUpdate,
  showCreateAlert
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { translations } = useLanguage();
  const modalTranslations = translations.employeePage;
  const employeeInterface: EmployeeInterface = new EmployeeInterfaceImpl();
  const createEmployeeUseCase = new CreateEmployeeUseCase(employeeInterface)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="relative bg-white w-full max-w-md rounded-2xl shadow-lg p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">
          {modalTranslations.addNewEmployeeTitle || 'Add New Employee'}
        </h2>

        <EmployeeForm
          addEmployeeDto={addEmployeeDto}
          onClose={onClose}
          translations={modalTranslations}
          createEmployeeUseCase={createEmployeeUseCase}
          onUpdate={onUpdate}
          showCreateAlert={showCreateAlert}
        />
      </div>
    </div>
  );
};

export default AddEmployeeModal;
