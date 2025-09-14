import { useState } from "react";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { Employee } from "@/domain/models/employee/get-employee.model";
import { DeleteEmployeeUseCase } from "@/data/usecases/employee.usecase";

export const useDeleteEmployee = (useCase: DeleteEmployeeUseCase) => {
  const [loading, setLoading] = useState(false);
  const [deletedEmployee, setDeletedEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);

  const remove = async (idToken: TokenedRequest) => {
    setLoading(true);
    try {
      const res = await useCase.execute(idToken);
      setDeletedEmployee(res);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { remove, loading, error, deletedEmployee };
};