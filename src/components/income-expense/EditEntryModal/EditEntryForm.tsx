import { ExpenseIncomePageTranslations } from "@/contexts/LanguageContext";
import { UpdateExpenseUseCase } from "@/data/usecases/expense.usecase";
import { UpdateIncomeUseCase } from "@/data/usecases/income.usecase";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { UpdateExpenseDto } from "@/domain/models/income-expense/expense/update-expense.dto";
import { UpdateIncomeDto } from "@/domain/models/income-expense/income/update-income.dto";
import { useEffect, useState } from "react";
import { IncomeCategory, ExpenseCategory } from "@/constants/category.enum";

interface EditEntryFormProps {
  onClose: () => void;
  translations: ExpenseIncomePageTranslations;
  entryType: "expense" | "income";
  entryId: string;
  entry: UpdateExpenseDto | UpdateIncomeDto;
  updateUseCase: UpdateExpenseUseCase | UpdateIncomeUseCase;
  setShowEditAlert: (show: boolean) => void;
  onUpdated: () => void;
}

// Enum-based category options
const CATEGORY_OPTIONS = {
  income: Object.values(IncomeCategory),
  expense: Object.values(ExpenseCategory),
} as const;

export function EditEntryForm({
  onClose,
  updateUseCase,
  translations,
  entryId,
  entry,
  entryType,
  setShowEditAlert,
  onUpdated
}: EditEntryFormProps) {
  const [title, setTitle] = useState(entry.title ?? "");
  const [amount, setAmount] = useState<number>(Number(entry.amount));
  const [date, setDate] = useState<string>(
    typeof entry.date === "string" ? entry.date.slice(0, 10) : ""
  );
  const [description, setDescription] = useState(entry.description ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  // Category editing state
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Load enum categories and preselect from entry
  useEffect(() => {
    const opts = CATEGORY_OPTIONS[entryType] as string[];
    setCategories(opts);
    const current = (entry as { category?: string }).category || '';
    if (current && opts.includes(current)) {
      setSelectedCategory(current);
    } else {
      // Default to "Uncategorized" (empty) instead of forcing "Other"
      setSelectedCategory("");
    }
  }, [entryId, entryType, entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const token = localStorage.getItem("token");
    const makeTokenedRequest = (id: string): TokenedRequest => ({ id, token });

    try {
      setSubmitting(true);
      setErrorMsg("");
      if (entryType === 'income') {
        const dto: UpdateIncomeDto = {
          title,
          amount,
          date,
          description,
          ...(selectedCategory ? { category: selectedCategory as IncomeCategory } : {})
        };
        await (updateUseCase as UpdateIncomeUseCase).execute(makeTokenedRequest(entryId), dto);
      } else {
        const dto: UpdateExpenseDto = {
          title,
          amount,
          date,
          description,
          ...(selectedCategory ? { category: selectedCategory as ExpenseCategory } : {})
        };
        await (updateUseCase as UpdateExpenseUseCase).execute(makeTokenedRequest(entryId), dto);
      }
      setShowEditAlert(true);
      setTimeout(() => setShowEditAlert(false), 1500);
      onClose();
      onUpdated();
    } catch (error) {
      console.error("Error updating entry:", error);
      setErrorMsg("Failed to update. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const t = translations;

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
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-1">
          {entryType === "income" ? t.incomeTitleColumn || "Income Title" : t.expenseTitleColumn || "Expense Title"}
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
          required
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-600 mb-1">
          {t.amountColumn || "Amount"}
        </label>
        <input
          type="number"
          id="amount"
          value={Number.isFinite(amount) ? amount : 0}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300"
          required
          min="0"
          step="0.01"
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-600 mb-1">
          {t.dateColumn || "Date"}
        </label>
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
        <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">
          {(t.noteColumn || "Description")}
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 resize-y min-h-[80px]"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        {errorMsg && (
          <div className="flex-1 text-sm text-red-600 self-center">{errorMsg}</div>
        )}
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          disabled={submitting}
        >
          {t.cancelButton || "Cancel"}
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-[#FF6767] text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          disabled={submitting}
        >
          {submitting ? (t.saving || "Saving...") : (t.editButton || "Save")}
        </button>
      </div>
    </form>
  );
}