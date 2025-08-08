import { CreateEmployeeDto } from "@/domain/models/employee/create-employee.dto";
import { Employee } from "@/domain/models/employee/get-employee.model";
import { EmployeeDto } from "@/dtos/employee/EmployeeDto";

export interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  addEmployeeDto?: CreateEmployeeDto;
}
