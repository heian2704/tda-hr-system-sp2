import { GetTotalPayrollByMonthYearUseCase } from "@/data/usecases/payroll.usecase";
import { useEffect, useState } from "react";

export const useGetAllPayroll = (
  useCase: GetTotalPayrollByMonthYearUseCase,
  month: number,
  year: number
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    const fetchAmount = async () => {
      setLoading(true);
      try {
        const result = await useCase.execute(month, year);
        setAmount(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAmount();
  }, [useCase, month, year]);

  return { loading, error, amount };
};
