import { DeleteExpenseUseCase } from "@/data/usecases/expense.usecase";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { useState } from "react";

export const useDeleteExpense = (useCase: DeleteExpenseUseCase) => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const deleteExpense = async (idtoken: TokenedRequest) => {
        setLoading(true);
        try {
            await useCase.execute(idtoken);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return { error, loading, deleteExpense };
}
