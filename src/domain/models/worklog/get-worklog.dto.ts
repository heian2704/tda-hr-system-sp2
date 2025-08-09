export interface Worklog {
    _id: string;
    employeeId: string;
    productId: string;
    quantity: number;
    totalPrice: number;
    updatedAt: Date;
}