import { GetAllEmployeeUseCase } from "@/data/usecases/employee.usecase";
import { Employee } from "@/domain/models/employee/get-employee.model"
import { useEffect, useState } from "react";

export const useGetAllEmployees = (useCase: GetAllEmployeeUseCase) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    useCase.execute()
      .then(setEmployees)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [useCase]);

  return { employees, loading, error };
};

