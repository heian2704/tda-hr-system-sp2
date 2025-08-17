import { GetAllExpenseUseCase } from "@/data/usecases/expense.usecase";
import { Expense } from "@/domain/models/income-expense/expense/get-expense.dto";
import { useState } from "react";

export const useGetAllExpense = (useCase: GetAllExpenseUseCase) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getAllExpenses = async () => {
        setLoading(true);
        try {
            const result = await useCase.execute();
            setExpenses(result);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return { expenses, error, loading, getAllExpenses };
}