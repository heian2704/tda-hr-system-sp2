import { useEffect, useState } from "react";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { Employee } from "@/domain/models/employee/get-employee.model";
import { GetEmployeeByIdUseCase } from "@/data/usecases/employee.usecase";

export const useGetEmployeeById = (useCase: GetEmployeeByIdUseCase, idToken: TokenedRequest) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    useCase.execute(idToken)
      .then(setEmployee)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [useCase, idToken]);

  return { employee, loading, error };
};