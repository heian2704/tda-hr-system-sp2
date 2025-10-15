import { CreateExpenseUseCase } from "@/data/usecases/expense.usecase";
import { CreateIncomeUseCase } from "@/data/usecases/income.usecase";
import { BearerTokenedRequest } from "@/domain/models/common/header-param";
import type { ExpenseIncomePageTranslations } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

// Fixed default categories per type (no persistence to avoid duplication)
const DEFAULT_CATEGORIES: Record<'income' | 'expense', string[]> = {
  income: ['Product Sold', 'Investment'],
  expense: ['Supply Purchased', 'Salary', 'Food', 'Transport', 'Utilities'],
};

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
  // Category state (fixed list + per-entry custom via Other)
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customCategoryName, setCustomCategoryName] = useState<string>('');
  const OTHER_VALUE = '__other';

  // Helpers for category normalization/merge
  const isReservedOther = (s: string) => s.trim().toLowerCase() === 'other';
  const includesCI = (arr: string[], val: string) => arr.some((x) => x.toLowerCase() === val.toLowerCase());

  const mapKey = (type: 'income' | 'expense') => `ei:categoryMap:${type}`;
  const readJson = <T,>(key: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  };
  const writeJson = (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // Load fixed categories for the selected type
    setCategories(DEFAULT_CATEGORIES[entryType] || []);
    setSelectedCategory('');
    setCustomCategoryName('');
  }, [entryType]);

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
      if (result) {
        // Persist per-entry category mapping only (do not expand global categories)
        const chosen = selectedCategory === OTHER_VALUE
          ? customCategoryName.trim()
          : selectedCategory;
        if (chosen) {
          // write mapping for the created entry id
          const cmap = readJson<Record<string, string>>(mapKey(entryType), {});
          const createdId = (result as { _id?: string })._id;
          if (createdId) {
            // if chosen is 'Other' but custom is empty, save as Uncategorized
            if (isReservedOther(chosen) || (selectedCategory === OTHER_VALUE && !customCategoryName.trim())) {
              cmap[createdId] = '';
            } else {
              cmap[createdId] = chosen;
            }
            writeJson(mapKey(entryType), cmap);
          }
        }
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
          {/* Category selection with 'Other' option */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Category (optional)</label>
            <div className="flex flex-col gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                title="Select category"
              >
                <option value="">Uncategorized</option>
                {categories
                  .filter((c) => !isReservedOther(c))
                  .map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                <option value={OTHER_VALUE}>Other (type custom)</option>
              </select>
              {selectedCategory === OTHER_VALUE && (
                <input
                  type="text"
                  value={customCategoryName}
                  onChange={(e) => setCustomCategoryName(e.target.value)}
                  placeholder="Type custom category"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              )}
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