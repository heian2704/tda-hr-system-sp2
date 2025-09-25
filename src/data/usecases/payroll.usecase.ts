import { PayrollInterface } from "@/domain/interfaces/payroll/PayrollInterface";

export class GetAllPayrollUseCase {
    constructor(private payrollInterface: PayrollInterface) {}

    async execute(limit?: number, page?: number, query?: string) {
        return this.payrollInterface.getAllPayrolls(limit, page, query);
    }
}

export class GetPayrollsByEmployeeIdUseCase {
    constructor(private payrollInterface: PayrollInterface) {}

    async execute(employeeId: string) {
        return this.payrollInterface.getPayrollByEmployeeId(employeeId);
    }
}