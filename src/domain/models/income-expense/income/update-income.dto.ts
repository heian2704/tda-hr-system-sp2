import { IncomeCategory } from "@/constants/category.enum";

export interface UpdateIncomeDto {
    title?: string;
    category?: IncomeCategory;
    description?: string;
    amount?: number;
    date?: string;
}