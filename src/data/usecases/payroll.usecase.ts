import { PayrollInterface } from "@/domain/interfaces/payroll/PayrollInterface";

export class GetAllPayrollUseCase {
    constructor(private payrollInterface: PayrollInterface) {}

    async execute(query?: string) {
        return this.payrollInterface.getAllPayrolls(query);
    }
}

export class GetPayrollsByEmployeeIdUseCase {
    constructor(private payrollInterface: PayrollInterface) {}

    async execute(employeeId: string) {
        return this.payrollInterface.getPayrollByEmployeeId(employeeId);
    }
}