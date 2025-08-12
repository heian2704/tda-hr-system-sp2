import { PayrollInterface } from "@/domain/interfaces/payroll/PayrollInterface";

export class GetAllPayrollUseCase {
    constructor(private payrollInterface: PayrollInterface) {}

    async execute(employeeId?: string, month?: string, year?: string) {
        return this.payrollInterface.getAllPayrolls(employeeId, month, year);
    }
}

export class GetPayrollsByEmployeeIdUseCase {
    constructor(private payrollInterface: PayrollInterface) {}

    async execute(employeeId: string) {
        return this.payrollInterface.getPayrollByEmployeeId(employeeId);
    }
}