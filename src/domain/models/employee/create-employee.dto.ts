import { EmpStatus } from "@/constants/employee-status.enum";

export interface CreateEmployeeDto {
  name: string;
  phoneNumber: string;
  address: string;
  position: string;
  status: EmpStatus; 
  joinedDate: string; 
}
