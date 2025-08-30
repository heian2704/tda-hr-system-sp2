import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Expense } from '@/domain/models/income-expense/expense/get-expense.dto';
import { Income } from '@/domain/models/income-expense/income/get-income.dto';
import { useLanguage } from '@/contexts/LanguageContext';
import { EntryForm } from './EntryForm';
import { CreateExpenseUseCase } from '@/data/usecases/expense.usecase';
import { CreateIncomeUseCase } from '@/data/usecases/income.usecase';
interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryType: 'expense' | 'income';
  useCase: CreateExpenseUseCase | CreateIncomeUseCase;
  setShowCreatedAlert?: (show: boolean) => void;
  onUpdate: () => void;
}

const AddEntryModal = ({ isOpen, onClose, entryType, useCase, setShowCreatedAlert, onUpdate }: AddEntryModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { translations } = useLanguage();
  const modalTranslations = translations.expenseIncomePage;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {entryType === 'expense' ? modalTranslations.addNewExpenseTitle : modalTranslations.addNewIncomeTitle}
        </h2>

        <EntryForm
          onClose={onClose}
          createUseCase={useCase}
          entryType={entryType}
          translations={modalTranslations}
          setShowCreatedAlert={setShowCreatedAlert}
          onUpdate={onUpdate}
        />
      </div>
    </div>
  );
};

export default AddEntryModal;
