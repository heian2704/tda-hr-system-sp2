import { UpdateExpenseUseCase } from "@/data/usecases/expense.usecase";
import { UpdateIncomeUseCase } from "@/data/usecases/income.usecase";
import { UpdateExpenseDto } from "@/domain/models/income-expense/expense/update-expense.dto";
import { UpdateIncomeDto } from "@/domain/models/income-expense/income/update-income.dto";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { EditEntryForm } from "./EditEntryForm"; // <-- import the form
import { Expense } from "@/domain/models/income-expense/expense/get-expense.dto";
import { ExpenseIncomePageTranslations } from "@/contexts/LanguageContext";

interface EditEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  translations: ExpenseIncomePageTranslations;
  entryId: string;
  entry: UpdateIncomeDto | UpdateExpenseDto | null;
  entryType: "income" | "expense";
  useCase: UpdateIncomeUseCase | UpdateExpenseUseCase;
  showEditAlert: (show: boolean) => void;
  onUpdated: () => void;
}

export const EditEntryModal = ({
  isOpen,
  onClose,
  translations,
  entryId,
  entry,
  entryType,
  useCase,
  showEditAlert,
  onUpdated
}: EditEntryModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen || !entry) return null;

  const t = translations;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {entryType === "expense"
            ? t.editExpenseTitle || "Edit Expense"
            : t.editIncomeTitle || "Edit Income"}
        </h2>

        <EditEntryForm
          onClose={onClose}
          translations={t}
          entryType={entryType}
          entryId={entryId}
          entry={entry}
          updateUseCase={useCase}
          setShowEditAlert={showEditAlert}
          onUpdated={onUpdated}
        />
      </div>
    </div>
  );
};
