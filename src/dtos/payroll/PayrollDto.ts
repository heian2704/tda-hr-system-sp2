export interface PayrollDto {
    _id: string;
    employeeId: string;
    totalQuantity: number;
    totalSalary: number;
    period: Date;
}