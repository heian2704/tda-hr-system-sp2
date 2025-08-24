import { GetExpenseByIdUseCase } from "@/data/usecases/expense.usecase";
import { Expense } from "@/domain/models/income-expense/expense/get-expense.dto";
import { useState } from "react";

export const useGetExpenseById = (useCase: GetExpenseByIdUseCase) => {
    const [expense, setExpense] = useState<Expense | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getExpenseById = async (id: string) => {
        setLoading(true);
        try {
            const result = await useCase.execute(id);
            setExpense(result);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return { expense, error, loading, getExpenseById };
}