import { UpdateWorklogUseCase } from "@/data/usecases/worklog.usecase";
import { Employee } from "@/domain/models/employee/get-employee.model";
import { Product } from "@/domain/models/product/get-product.dto";
import { UpdateWorklogDto } from "@/domain/models/worklog/update-worklog.dto";

export interface EditWorkLogModalProps {
  worklogid: string;
  isOpen: boolean;
  onClose: () => void;
  workLogToEdit?: UpdateWorklogDto;
  employees: Employee[];
  products: Product[];
  updateWorklogUseCase: UpdateWorklogUseCase;
  setShowEditAlert?: React.Dispatch<React.SetStateAction<boolean>>;
}