import { EmpStatus } from "@/constants/employee-status.enum";

export class CreateAttendanceDto {
  employeeId: string;
  checkInTime: string;
  checkOutTime: string;
  attendanceStatus: EmpStatus;
}