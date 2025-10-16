import { ExpenseCategory } from "@/constants/category.enum";

export interface Expense {
    _id: string;
    title: string;
    category?: ExpenseCategory;
    description: string;
    amount: number;
    date: string;
}