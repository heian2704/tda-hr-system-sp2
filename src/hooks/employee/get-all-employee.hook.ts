import { ITEMS_PER_PAGE } from "@/constants/page-utils";
import { GetAllEmployeeUseCase } from "@/data/usecases/employee.usecase";
import { Employees } from "@/domain/models/employee/get-employees.model";
import { useEffect, useState } from "react";

export const useGetAllEmployees = (useCase: GetAllEmployeeUseCase) => {
  const [employees, setEmployees] = useState<Employees | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getEmployees = async (limit: number, page: number) => {
    setLoading(true);
    try {
      const res = await useCase.execute(limit, page);
      setEmployees(res);
      return res;
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
      return null;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getEmployees(ITEMS_PER_PAGE, 1);
  }, []);

  return { employees, loading, error };
};

