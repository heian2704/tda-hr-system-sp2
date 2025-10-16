import { IncomeCategory } from "@/constants/category.enum";

export interface Income {
    _id: string;
    title: string;
    category?: IncomeCategory;
    description: string;
    amount: number;
    date: string;
}