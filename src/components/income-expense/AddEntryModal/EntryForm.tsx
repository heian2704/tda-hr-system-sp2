import { CreateExpenseUseCase } from "@/data/usecases/expense.usecase";
import { CreateIncomeUseCase } from "@/data/usecases/income.usecase";
import { BearerTokenedRequest } from "@/domain/models/common/header-param";
import type { ExpenseIncomePageTranslations } from "@/contexts/LanguageContext";
import { useState } from "react";

interface EntryFormProps {
  onClose: () => void;
  translations: ExpenseIncomePageTranslations;
  entryType: 'expense' | 'income';
  createUseCase: CreateExpenseUseCase | CreateIncomeUseCase;
  setShowCreatedAlert: (show: boolean) => void;
  onUpdate: () => void;
}

export function EntryForm({ onClose, createUseCase, translations, entryType, setShowCreatedAlert, onUpdate }: EntryFormProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) return;

    const token = localStorage.getItem("token");
    const useTokenRequest = { token } as BearerTokenedRequest;

    const createEntryDto = {
        title: title,
        amount: amount,
        date: date,
        description: description
    }

    try {
      setSubmitting(true);
      const result = await createUseCase.execute(useTokenRequest, createEntryDto);
      if(result)
      {
        setShowCreatedAlert(true);
        setTimeout(() => setShowCreatedAlert(false), 3000);
      }
      onClose();
      onUpdate();
    } catch (error) {
      console.error("Error creating entry:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-1">
              {entryType === 'income' ? translations.incomeTitleColumn : translations.expenseTitleColumn}
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
              required
              min="0.01"
              step="any"
            />
          </div>
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-600 mb-1">
              {translations.amountColumn}
            </label>
            <input
              type="number"
              id="amount"
              placeholder={translations.amountPlaceholder}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
              required
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-600 mb-1">{translations.dateColumn}</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">{translations.noteColumn}</label>
            <textarea
              id="description"
              placeholder={translations.notePlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 resize-y min-h-[80px]"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              disabled={submitting}
            >
              {translations.cancelButton}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#FF6767] text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              disabled={submitting}
            >
              {submitting ? translations.saving : translations.addButton}
            </button>
          </div>
        </form>
  );
}