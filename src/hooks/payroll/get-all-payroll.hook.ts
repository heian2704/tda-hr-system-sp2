import { GetAllPayrollUseCase } from "@/data/usecases/payroll.usecase";
import { Payroll } from "@/domain/models/payroll/get-payroll.dto";
import { useEffect, useState } from "react";

export const useGetAllPayroll = (useCase: GetAllPayrollUseCase) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  
  const getAllPayrolls = async (
    employeeId?: string,
    month?: string,
    year?: string
  ) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (employeeId) query.append("employeeId", employeeId);
      if (month) query.append("month", month);
      if (year) query.append("year", year);
      const payrolls = await useCase.execute(query.toString());
      setPayrolls(payrolls);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, payrolls, getAllPayrolls };
};
