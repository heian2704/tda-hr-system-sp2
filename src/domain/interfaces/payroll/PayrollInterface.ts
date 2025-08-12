import { BearerTokenedRequest } from "@/domain/models/common/header-param";
import { Payroll } from "@/domain/models/payroll/get-payroll.dto";

export interface PayrollInterface {
    getAllPayrolls(employeeId?: string, month?: string, year?: string): Promise<Payroll[]>;
    getPayrollByEmployeeId(employeeId: string): Promise<Payroll>;
}