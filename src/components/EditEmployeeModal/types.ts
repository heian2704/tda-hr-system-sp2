import {EmployeeUpdateDto} from "@/dtos/employee/EmployeeUpdateDto.ts";

export interface EditEmployeeModalProps {
    employeeId?: string;
    isOpen: boolean;
    onClose: () => void;
    editEmployeeDto?: EmployeeUpdateDto;
}