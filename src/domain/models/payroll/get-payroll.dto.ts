export interface Payroll {
    _id: string;
    employeeId: string;
    totalQuantity: number;
    totalSalary: number;
    period: Date;
}