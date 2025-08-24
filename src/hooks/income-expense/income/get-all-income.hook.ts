import { GetAllIncomesUseCase } from "@/data/usecases/income.usecase";
import { Income } from "@/domain/models/income-expense/income/get-income.dto";
import { set } from "date-fns";
import { useEffect, useState } from "react";

export const useGetAllIncome = (useCase: GetAllIncomesUseCase) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [incomes, setIncomes] = useState<Income[]>([]);


    useEffect(() => {
        useCase.execute()
          .then(setIncomes)
          .catch(err => setError(err.message))
          .finally(() => setLoading(false));
      }, [useCase]);

    return { loading, error, incomes };
}
