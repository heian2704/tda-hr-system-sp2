import { CreateExpenseUseCase } from "@/data/usecases/expense.usecase";
import { CreateIncomeUseCase } from "@/data/usecases/income.usecase";
import { BearerTokenedRequest } from "@/domain/models/common/header-param";
import type { ExpenseIncomePageTranslations } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { IncomeCategory, ExpenseCategory } from "@/constants/category.enum";
import type { CreateIncomeDto } from "@/domain/models/income-expense/income/create-income.dto";
import type { CreateExpenseDto } from "@/domain/models/income-expense/expense/create-expense.dto";

// Enum-based categories
const CATEGORY_OPTIONS = {
  income: Object.values(IncomeCategory),
  expense: Object.values(ExpenseCategory)
} as const;

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
  // Category state (enum-based, required)
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    // Load enum categories for the selected type; default to Other
    const opts = CATEGORY_OPTIONS[entryType] as string[];
    setCategories(opts);
    setSelectedCategory(opts.includes('Other') ? 'Other' : (opts[0] || ''));
  }, [entryType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) return;

    const token = localStorage.getItem("token");
    const useTokenRequest = { token } as BearerTokenedRequest;

    // Build typed DTO with enum category
    const categoryValue = selectedCategory as (IncomeCategory | ExpenseCategory);
    const base = { title, amount, date, description };
    const createEntryDto: CreateIncomeDto | CreateExpenseDto =
      entryType === 'income'
        ? ({ ...base, category: categoryValue as IncomeCategory } as CreateIncomeDto)
        : ({ ...base, category: categoryValue as ExpenseCategory } as CreateExpenseDto);

    try {
      setSubmitting(true);
  let result: unknown;
  if (entryType === 'income') {
    result = await (createUseCase as CreateIncomeUseCase).execute(useTokenRequest, createEntryDto as CreateIncomeDto);
  } else {
    result = await (createUseCase as CreateExpenseUseCase).execute(useTokenRequest, createEntryDto as CreateExpenseDto);
  }
      if (result) {
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
          {/* Category selection (enum-based, required) */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Category (optional)</label>
            <div className="flex flex-col gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                title="Select category"
                required
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
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