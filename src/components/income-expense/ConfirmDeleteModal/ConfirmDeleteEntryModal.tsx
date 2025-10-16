import React, { useRef, useEffect, useState } from "react";
import { X } from "lucide-react";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { DeleteExpenseUseCase } from "@/data/usecases/expense.usecase";
import { DeleteIncomeUseCase } from "@/data/usecases/income.usecase";
import { useLanguage } from "@/contexts/LanguageContext";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryId: string | null;
  entryTitle: string;
  entryType: "income" | "expense";
  deleteUseCase: DeleteIncomeUseCase | DeleteExpenseUseCase;
  onUpdate: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  entryId,
  entryTitle,
  entryType,
  deleteUseCase,
  onUpdate
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [showDeletedAlert, setShowDeletedAlert] = useState(false);
  const { translations } = useLanguage();
  const modalTranslations = translations.expenseIncomePage;
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("ID Token is required for authentication");
  }

  const makeTokenedRequest = (id: string): TokenedRequest => ({
    id,
    token: token,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return (
    <>
      {showDeletedAlert && (
        <div
          role="alert"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out"
        >
          {modalTranslations?.deleteMessage}
        </div>
      )}
    </>
  );

  const handleConfirm = async () => {
    if (!entryId) return;
    const result = await deleteUseCase.execute(makeTokenedRequest(entryId));
    if (result) {
      setShowDeletedAlert(true);
      setTimeout(() => {setShowDeletedAlert(false);}, 3000);
    }
    onClose();
    onUpdate();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {showDeletedAlert && (
        <div
          role="alert"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out"
        >
          {modalTranslations?.deleteMessage}
        </div>
      )}
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Confirm Delete
        </h2>
        <p className="text-gray-600 mb-6 text-center">
          Successfully deleted "{entryTitle}" {entryType}.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleConfirm();
              onClose();
            }}
            className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
