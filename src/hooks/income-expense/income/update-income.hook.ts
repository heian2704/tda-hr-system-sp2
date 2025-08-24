import { UpdateIncomeUseCase } from "@/data/usecases/income.usecase";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { Income } from "@/domain/models/income-expense/income/get-income.dto";
import { useState } from "react";

export const useUpdateIncome = (useCase: UpdateIncomeUseCase) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [income, setIncome] = useState<Income | null>(null);

    const updateIncome = async (idToken: TokenedRequest, data: Income) => {
        setLoading(true);
        try {
            const income = await useCase.execute(idToken, data);
            setIncome(income);
        } catch (error) {
            setError("Failed to update income");
        } finally {
            setLoading(false);
        }
    }

    return { loading, error, income, updateIncome };
}