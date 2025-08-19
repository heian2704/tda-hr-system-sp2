import { UpdateExpenseUseCase } from "@/data/usecases/expense.usecase";
import { UpdateIncomeUseCase } from "@/data/usecases/income.usecase";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { UpdateExpenseDto } from "@/domain/models/income-expense/expense/update-expense.dto";
import { UpdateIncomeDto } from "@/domain/models/income-expense/income/update-income.dto";
import { useState } from "react";

interface EditEntryFormProps {
  onClose: () => void;
  translations: any;
  entryType: "expense" | "income";
  entryId: string;
  entry: UpdateExpenseDto | UpdateIncomeDto;
  updateUseCase: UpdateExpenseUseCase | UpdateIncomeUseCase;
  setShowEditAlert: (show: boolean) => void;
  onUpdated: any;
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
  const [amount, setAmount] = useState<number>(Number(entry.amount) ?? 0);
  const [date, setDate] = useState<string>(
    typeof entry.date === "string" ? entry.date.slice(0, 10) : ""
  );
  const [description, setDescription] = useState(entry.description ?? "");
  const [submitting, setSubmitting] = useState(false);

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

  const t = translations?.expenseIncomePage ?? translations ?? {};

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          {(t.descriptionColumn || "Description")} ({t.optional || "optional"})
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