import { Payroll } from "@/domain/models/payroll/get-payroll.dto";
import { Payrolls } from "@/domain/models/payroll/get-payrolls.dto";

export interface PayrollInterface {
    getAllPayrolls(limit?: number, page?: number, query?: string): Promise<Payrolls>;
    getPayrollByEmployeeId(employeeId: string): Promise<Payroll[]>;
}