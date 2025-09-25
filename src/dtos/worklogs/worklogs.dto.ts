export interface WorklogDto {
    _id: string;
    employeeId: string;
    productId: string;
    fullname: string;
    position: string;
    productName: string;
    quantity: number;
    totalPrice: number;
    updatedAt: Date;
}