import { GetAllExpenseUseCase } from "@/data/usecases/expense.usecase";
import { Expense } from "@/domain/models/income-expense/expense/get-expense.dto";
import { useEffect, useState } from "react";

export const useGetAllExpense = (useCase: GetAllExpenseUseCase) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        useCase.execute()
          .then(setExpenses)
          .catch(err => setError(err.message))
          .finally(() => setLoading(false));
      }, [useCase]);

    return { expenses, error, loading };
}