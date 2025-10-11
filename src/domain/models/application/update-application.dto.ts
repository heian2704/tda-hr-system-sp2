import { EmpStatus } from "@/constants/employee-status.enum";

export interface UpdateApplicationDto {
  name?: string;
  phoneNumber?: string;
  address?: string;
  information?: string;
  position?: string;
  status?: EmpStatus;
  date?: Date;
}

export interface UpdateApplicationStatus {
    status: EmpStatus
}
