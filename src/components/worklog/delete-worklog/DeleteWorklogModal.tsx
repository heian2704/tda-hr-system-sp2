import { useLanguage } from "@/contexts/LanguageContext";
import { DeleteWorklogUseCase } from "@/data/usecases/worklog.usecase";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workLogId: string | null;
  deleteWorklogUseCase: DeleteWorklogUseCase;
  onUpdate: any;
}

export const ConfirmDeleteModal = ({ isOpen, onClose, workLogId, deleteWorklogUseCase, onUpdate }: ConfirmDeleteModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [showDeletedAlert, setShowDeletedAlert] = useState(false);
  const { translations } = useLanguage();
  const modalTranslations = translations.workLogPage;
  const token = localStorage.getItem("token");
  const [submitting, setSubmitting] = useState(false);
  const idToken = (id: string): TokenedRequest => ({
      id,
      token: token,
    });

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

  if (!isOpen) return (
    <>
      {showDeletedAlert && (
        <div
          role="alert"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out"
        >
          {modalTranslations?.deletedMessage || 'Deleted successfully'}
        </div>
      )}
    </>
  );

  const handleConfirm = async () => {
    if (!workLogId) return;
    if (submitting) return;
    try {
      setSubmitting(true);
      const result = await deleteWorklogUseCase.execute(idToken(workLogId));
      if (result) {
        setShowDeletedAlert(true);
      }
    } catch (error) {
      console.error('Error deleting work log:', error);
    } finally {
      setSubmitting(false);
    }
    setTimeout(() => {setShowDeletedAlert(false);}, 3000);
    onUpdate();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {showDeletedAlert && (
        <div
          role="alert"
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out"
        >
          {modalTranslations?.deletedMessage || 'Deleted successfully'}
        </div>
      )}
      <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <Trash2 className="mx-auto text-red-500 w-16 h-16 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {modalTranslations.confirmDeleteTitle}
        </h2>
        <p className="text-gray-600 mb-6">
          {modalTranslations.confirmDeleteMessage1} <span className="font-semibold text-red-600"></span>{modalTranslations.confirmDeleteMessage2}
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            {modalTranslations.cancelButton}
          </button>
          <button
            onClick={() => {
              if (workLogId) {
                handleConfirm();
              }
              onClose();
            }}
            disabled={submitting}
            className="px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            {submitting ? modalTranslations.deleting : modalTranslations.deleteButton}
          </button>
        </div>
      </div>
    </div>
  );
};