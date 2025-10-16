import { ExpenseCategory } from "@/constants/category.enum";

export interface CreateExpenseDto {
    title: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    date: string;
}
