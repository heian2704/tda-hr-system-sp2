import { IncomeCategory } from "@/constants/category.enum";
import { Income } from "./get-income.dto";

export interface CreateIncomeDto {
    title: string;
    category: IncomeCategory;
    description: string;
    amount: number;
    date: string;
}
