import { GetAllPayrollUseCase } from "@/data/usecases/payroll.usecase";
import { Payroll } from "@/domain/models/payroll/get-payroll.dto";
import { set } from "date-fns";
import { useEffect, useState } from "react";

export const useGetAllPayroll = (useCase: GetAllPayrollUseCase) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  
  useEffect(() => {
    const fetchPayrolls = async () => {
      setLoading(true);
      try {
        const payrolls = await useCase.execute();
        setPayrolls(payrolls);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPayrolls();
  }, [useCase]);

  return { loading, error, payrolls };
};
