import { CreateIncomeUseCase } from "@/data/usecases/income.usecase";
import { BearerTokenedRequest } from "@/domain/models/common/header-param";
import { Income } from "@/domain/models/income-expense/income/get-income.dto";
import { useState } from "react";

export const useCreateIncome = (useCase: CreateIncomeUseCase) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [income, setIncome] = useState<Income | null>(null);

    const createIncome = async (token: BearerTokenedRequest, data: Income) => {
        setLoading(true);
        try {
            const income = await useCase.execute(token, data);
            setIncome(income);
        } catch (error) {
            setError("Failed to create income");
        } finally {
            setLoading(false);
        }
    }

    return { loading, error, income, createIncome };
}