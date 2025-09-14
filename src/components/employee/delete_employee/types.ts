export interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (employeeId: string) => void;
    employeeId: string;
    employeeName: string;
  }
  