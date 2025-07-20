import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext'; 

interface IncomeEntry {
  id: string;
  name: string;
  amount: number;
  date: string;
  note: string;
}

interface AddEditIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  incomeEntryToEdit: IncomeEntry | null;
  onSave: (entry: IncomeEntry, isEditing: boolean) => void;
}

const AddEditIncomeModal = ({ isOpen, onClose, incomeEntryToEdit, onSave }: AddEditIncomeModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { translations } = useLanguage();
  const modalTranslations = translations.expenseIncomePage;

  const isEditing = !!incomeEntryToEdit;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  // Set initial form values when modal opens or entryToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (incomeEntryToEdit) {
        setName(incomeEntryToEdit.name);
        setAmount(incomeEntryToEdit.amount.toString());
        setDate(incomeEntryToEdit.date);
        setNote(incomeEntryToEdit.note);
      } else {
        setName('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setNote('');
      }
    }
  }, [isOpen, incomeEntryToEdit]);

  // Close modal on outside click
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submittedAmount = parseFloat(amount);
    if (isNaN(submittedAmount) || submittedAmount <= 0) {
      alert(modalTranslations.invalidAmount);
      return;
    }

    const id = isEditing ? incomeEntryToEdit!.id : `income-${Date.now()}`;
    const newEntry: IncomeEntry = { id, name, amount: submittedAmount, date, note };

    console.log(`[UI-ONLY] ${isEditing ? 'Editing' : 'Adding'} Income entry. Data captured for backend:`, newEntry);
    onSave(newEntry, isEditing);
    onClose();
  };

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
          {isEditing ? modalTranslations.editIncomeTitle : modalTranslations.addNewIncomeTitle}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="incomeName" className="block text-sm font-medium text-gray-600 mb-1">
              {modalTranslations.incomeNameColumn}
            </label>
            <input
              type="text"
              id="incomeName"
              placeholder={modalTranslations.incomeNamePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
              required
            />
          </div>
          <div>
            <label htmlFor="incomeAmount" className="block text-sm font-medium text-gray-600 mb-1">{modalTranslations.amountColumn}</label>
            <input
              type="number"
              id="incomeAmount"
              placeholder="e.g., 100000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
              required
              min="0.01"
              step="any"
            />
          </div>
          <div>
            <label htmlFor="incomeDate" className="block text-sm font-medium text-gray-600 mb-1">{modalTranslations.dateColumn}</label>
            <input
              type="date"
              id="incomeDate"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
              required
            />
          </div>
          <div>
            <label htmlFor="incomeNote" className="block text-sm font-medium text-gray-600 mb-1">{modalTranslations.noteColumn} ({modalTranslations.optional})</label>
            <textarea
              id="incomeNote"
              placeholder={modalTranslations.notePlaceholder}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 resize-y min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              {modalTranslations.cancelButton}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#FF6767] text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              {isEditing ? modalTranslations.saveChangesButton : modalTranslations.addButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditIncomeModal;
