import { useRef, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { WorkLogForm } from './WorkLogForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { CreateWorklogUseCase } from '@/data/usecases/worklog.usecase';
import { Employee } from '@/domain/models/employee/get-employee.model';
import { Product } from '@/domain/models/product/get-product.dto';

interface AddWorkLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  products: Product[];
  createWorklogUseCase: CreateWorklogUseCase;
  setShowCreatedAlert: React.Dispatch<React.SetStateAction<boolean>>;
  onUpdate: () => void;
}

export const AddWorkLogModal = ({
  isOpen,
  onClose,
  employees,
  products,
  createWorklogUseCase,
  setShowCreatedAlert,
  onUpdate
}: AddWorkLogModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { translations } = useLanguage();
  const worklogTranslation = translations.workLogPage;
  const [loading, setLoading] = useState(false);
  const [inActiveStatusAlert, setInActiveStatusAlert] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        if (!loading) onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {inActiveStatusAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out">
          {worklogTranslation.inActiveStatus || 'Selected employee is not active.'}
        </div>
      )}
      <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={() => !loading && onClose()}
          disabled={loading}
          className={`absolute top-4 right-4 text-gray-500 hover:text-gray-700 ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">
          {worklogTranslation.addNewWorkLogTitle}
        </h2>

        <WorkLogForm
            employees={employees}
            products={products}
            translations={worklogTranslation}
            onClose={onClose}
            createWorklogUseCase={createWorklogUseCase}
            setShowCreatedAlert={setShowCreatedAlert}
            setInActiveStatusAlert={setInActiveStatusAlert}
            onUpdate={onUpdate}
          />
      </div>
    </div>
  );
};