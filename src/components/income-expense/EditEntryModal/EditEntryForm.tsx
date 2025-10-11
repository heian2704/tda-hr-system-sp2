import { ExpenseIncomePageTranslations } from "@/contexts/LanguageContext";
import { UpdateExpenseUseCase } from "@/data/usecases/expense.usecase";
import { UpdateIncomeUseCase } from "@/data/usecases/income.usecase";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { UpdateExpenseDto } from "@/domain/models/income-expense/expense/update-expense.dto";
import { UpdateIncomeDto } from "@/domain/models/income-expense/income/update-income.dto";
import { useEffect, useState } from "react";

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
  // Category editing state
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [customCategoryName, setCustomCategoryName] = useState<string>("");
  const OTHER_VALUE = "__other";

  // Default category seeds per type
  // Default category seeds per type (used inside effect)

  // LocalStorage helpers
  const catKey = (type: "income" | "expense") => `ei:categories:${type}`;
  const mapKey = (type: "income" | "expense") => `ei:categoryMap:${type}`;
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

  const isReservedOther = (s: string) => s.trim().toLowerCase() === "other";
  const includesCI = (arr: string[], val: string) => arr.some((x) => x.toLowerCase() === val.toLowerCase());

  // Load categories and current mapping
  useEffect(() => {
    const stored = readJson<string[]>(catKey(entryType), []);
    const defaults = entryType === "income"
      ? ["Salary", "Bonus", "Investment", "Other"]
      : ["Food", "Transport", "Utilities", "Entertainment", "Other"];
    const dedupe = (arr: string[]) => Array.from(new Set(arr.map((x) => x.trim()).filter((x) => x.length > 0)));
    const merged = dedupe([...stored, ...defaults]).filter((x) => !isReservedOther(x));
    setCategories(merged);
    // write back defaults if needed
    const storedNorm = dedupe(stored).filter((x) => !isReservedOther(x));
    if (merged.length !== storedNorm.length || merged.some((c) => !includesCI(storedNorm, c))) {
      writeJson(catKey(entryType), merged);
    }
    // Preselect current category mapping
    const cmap = readJson<Record<string, string>>(mapKey(entryType), {});
    const current = cmap[entryId] || "";
    setSelectedCategory(current);
  }, [entryId, entryType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const token = localStorage.getItem("token");
    const makeTokenedRequest = (id: string): TokenedRequest => ({ id, token });

    const updateEntryDto = {
      title,
      amount,
      date,
      description
    };

    try {
      setSubmitting(true);
      await updateUseCase.execute(makeTokenedRequest(entryId), updateEntryDto);
      // Persist category mapping if provided
      const chosen = selectedCategory === OTHER_VALUE ? customCategoryName.trim() : selectedCategory;
      if (chosen) {
        if (!isReservedOther(chosen)) {
          // ensure category list contains chosen
          if (!includesCI(categories, chosen)) {
            const dedupe = (arr: string[]) => Array.from(new Set(arr.map((x) => x.trim()).filter((x) => x.length > 0)));
            const nextCats = dedupe([...categories, chosen]).filter((x) => !isReservedOther(x));
            setCategories(nextCats);
            writeJson(catKey(entryType), nextCats);
          }
        }
        // update id -> category map (empty string means Uncategorized)
        const cmap = readJson<Record<string, string>>(mapKey(entryType), {});
        cmap[entryId] = isReservedOther(chosen) ? "" : chosen;
        writeJson(mapKey(entryType), cmap);
      }
      setShowEditAlert(true);
      setTimeout(() => setShowEditAlert(false), 1500);
      onClose();
      onUpdated();
    } catch (error) {
      console.error("Error updating entry:", error);
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