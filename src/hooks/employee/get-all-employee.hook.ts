import { GetAllEmployeeUseCase } from "@/data/usecases/employee.usecase";
import { Employee } from "@/domain/models/employee/get-employee.model"
import { useEffect, useState } from "react";

export const useGetAllEmployees = (useCase: GetAllEmployeeUseCase) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    useCase.execute()
      .then(setEmployees)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [useCase]);

  return { employees, loading, error };
};

