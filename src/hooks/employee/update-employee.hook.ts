import { UpdateEmployeeUseCase } from "@/data/usecases/employee.usecase";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { Employee } from "@/domain/models/employee/get-employee.model";
import { UpdateEmployeeDto } from "@/domain/models/employee/update-employee.dto";
import { useState } from "react";

export const useUpdateEmployee = (useCase: UpdateEmployeeUseCase) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedEmployee, setUpdatedEmployee] = useState<Employee | null>(null);

  const update = async (idToken: TokenedRequest, dto: UpdateEmployeeDto) => {
    setLoading(true);
    try {
      const res = await useCase.execute(idToken, dto);
      setUpdatedEmployee(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error, updatedEmployee };
};