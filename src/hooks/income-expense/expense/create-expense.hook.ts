import { CreateExpenseUseCase } from "@/data/usecases/expense.usecase";
import { BearerTokenedRequest } from "@/domain/models/common/header-param";
import { Expense } from "@/domain/models/income-expense/expense/get-expense.dto";
import { useState } from "react";

export const useCreateExpense = (useCase: CreateExpenseUseCase) => {
    const [expense, setExpense] = useState<Expense | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const createExpense = async (token: BearerTokenedRequest, expense: Expense) => {
        setLoading(true);
        try {
            const result = await useCase.execute(token, expense);
            setExpense(result);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return { expense, error, loading, createExpense };
}
