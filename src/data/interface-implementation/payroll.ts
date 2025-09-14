import { PayrollInterface } from "@/domain/interfaces/payroll/PayrollInterface";
import { Payroll } from "@/domain/models/payroll/get-payroll.dto";
import { apiGetRequestsHandler } from "@/network/api";

export class PayrollInterfaceImpl implements PayrollInterface {
    async getAllPayrolls(query?: string): Promise<Payroll[]> {
        return apiGetRequestsHandler<Payroll[]>({
            endpoint: `/payroll${query ? `?${query}` : ''}`
        });
    }

    async getPayrollByEmployeeId(employeeId: string): Promise<Payroll> {
        return apiGetRequestsHandler<Payroll>({
            endpoint: `/payroll/${employeeId}`
        });
    }
}