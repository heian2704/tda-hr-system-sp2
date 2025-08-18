import { DeleteIncomeUseCase } from "@/data/usecases/income.usecase";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { Income } from "@/domain/models/income-expense/income/get-income.dto";
import { useState } from "react";

export const useDeleteIncome = (useCase: DeleteIncomeUseCase) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [income, setIncome] = useState<Income | null>(null);

    const deleteIncome = async (idToken: TokenedRequest) => {
        setLoading(true);
        try {
            const income = await useCase.execute(idToken);
            setIncome(income);
        } catch (error) {
            setError("Failed to delete income");
        } finally {
            setLoading(false);
        }
    }

    return { loading, error, income, deleteIncome };
}