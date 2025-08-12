import { PayrollInterface } from "@/domain/interfaces/payroll/PayrollInterface";
import { Payroll } from "@/domain/models/payroll/get-payroll.dto";
import { apiGetRequestsHandler } from "@/services/network/api";

export class PayrollInterfaceImpl implements PayrollInterface {
    async getAllPayrolls(employeeId?: string, month?: string, year?: string): Promise<Payroll[]> {
        return apiGetRequestsHandler<Payroll[]>({
            endpoint: `/payroll?employeeId=${employeeId}&month=${month}&year=${year}`
        });
    }

    async getPayrollByEmployeeId(employeeId: string): Promise<Payroll> {
        return apiGetRequestsHandler<Payroll>({
            endpoint: `/payroll/${employeeId}`
        });
    }
}