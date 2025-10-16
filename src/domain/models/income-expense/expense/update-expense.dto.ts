import { ExpenseCategory } from "@/constants/category.enum";

export interface UpdateExpenseDto {
    title?: string;
    category?: ExpenseCategory;
    description?: string;
    amount?: number;
    date?: string;
}
