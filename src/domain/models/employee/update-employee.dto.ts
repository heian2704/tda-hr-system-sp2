import { EmpStatus } from "@/constants/employee-status.enum";

export interface UpdateEmployeeDto {
  name?: string;
  phoneNumber?: string;
  address?: string;
  position?: string;
  status?: EmpStatus; 
  joinedDate?: string; 
}

export interface UpdateEmpStatus {
    status: EmpStatus
}