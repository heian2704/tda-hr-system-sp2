import { UpdateExpenseUseCase } from "@/data/usecases/expense.usecase";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { Expense } from "@/domain/models/income-expense/expense/get-expense.dto";
import { useState } from "react";

export const useUpdateExpense = (useCase: UpdateExpenseUseCase) => {
    const [expense, setExpense] = useState<Expense | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const updateExpense = async (idtoken: TokenedRequest, expense: Expense) => {
        setLoading(true);
        try {
            const result = await useCase.execute(idtoken, expense);
            setExpense(result);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return { expense, error, loading, updateExpense };
}
