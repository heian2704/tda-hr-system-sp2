import { ITEMS_PER_PAGE } from "@/constants/page-utils";
import { GetAllPayrollUseCase } from "@/data/usecases/payroll.usecase";
import { Payroll } from "@/domain/models/payroll/get-payroll.dto";
import { Payrolls } from "@/domain/models/payroll/get-payrolls.dto";
import { set } from "date-fns";
import { useEffect, useState } from "react";

export const useGetAllPayroll = (useCase: GetAllPayrollUseCase) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payrolls, setPayrolls] = useState<Payrolls | null>(null);
  
  useEffect(() => {
    const fetchPayrolls = async (limit: number, page: number) => {
      setLoading(true);
      try {
        const payrolls = await useCase.execute(limit, page);
        setPayrolls(payrolls);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPayrolls(ITEMS_PER_PAGE, 1);
  }, [useCase]);

  return { loading, error, payrolls };
};
