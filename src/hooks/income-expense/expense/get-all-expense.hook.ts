import { GetAllExpenseUseCase } from "@/data/usecases/expense.usecase";
import { Expense } from "@/domain/models/income-expense/expense/get-expense.dto";
import { useEffect, useState } from "react";

// Mirrors useGetAllEmployees: auto-fetches on mount and returns a simple { data, loading, error } shape
export const useGetAllExpense = (useCase: GetAllExpenseUseCase) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        useCase
            .execute()
            .then((result) => {
                if (isMounted) setExpenses(result);
            })
            .catch((err: any) => {
                if (isMounted) setError(err?.message ?? String(err));
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });
        return () => {
            isMounted = false;
        };
    }, [useCase]);

    return { expenses, loading, error };
};