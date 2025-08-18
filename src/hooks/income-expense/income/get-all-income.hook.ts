import { GetAllIncomesUseCase } from "@/data/usecases/income.usecase";
import { Income } from "@/domain/models/income-expense/income/get-income.dto";
import { useState } from "react";

export const useGetAllIncome = (useCase: GetAllIncomesUseCase) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [incomes, setIncomes] = useState<Income[]>([]);

    const getAllIncomes = async () => {
        setLoading(true);
        try{
            const incomes = await useCase.execute();
            setIncomes(incomes);
        } catch (error) {
            setError("Failed to fetch incomes");
        } finally {
            setLoading(false);
        }
    }

    return { loading, error, incomes, getAllIncomes };
}