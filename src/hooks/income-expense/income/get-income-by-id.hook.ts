import { GetIncomeByIdUseCase } from "@/data/usecases/income.usecase";
import { Income } from "@/domain/models/income-expense/income/get-income.dto";
import { useState } from "react";

export const useGetIncomeById = (useCase: GetIncomeByIdUseCase) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [income, setIncome] = useState<Income | null>(null);

    const getIncomeById = async (id: string) => {
        setLoading(true);
        try {
            const income = await useCase.execute(id);
            setIncome(income);
        } catch (error) {
            setError("Failed to fetch income");
        } finally {
            setLoading(false);
        }
    }

    return { loading, error, income, getIncomeById };
}