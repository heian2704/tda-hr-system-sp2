import { PayrollInterface } from "@/domain/interfaces/payroll/PayrollInterface";
import { Payroll } from "@/domain/models/payroll/get-payroll.dto";
import { Payrolls } from "@/domain/models/payroll/get-payrolls.dto";
import { apiGetRequestsHandler } from "@/network/api";

export class PayrollInterfaceImpl implements PayrollInterface {
    async getAllPayrolls(limit: number, page: number, query?: string): Promise<Payrolls> {
        return apiGetRequestsHandler<Payrolls>({
            endpoint: `/payroll?${query ? `${query}&` : ''}limit=${limit}&page=${page}`,
        });
    }

    async getPayrollByEmployeeId(employeeId: string): Promise<Payroll> {
        return apiGetRequestsHandler<Payroll>({
            endpoint: `/payroll/${employeeId}`
        });
    }
}