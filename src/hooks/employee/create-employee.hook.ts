import { useState } from "react";
import { CreateEmployeeDto } from "@/domain/models/employee/create-employee.dto";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { Employee } from "@/domain/models/employee/get-employee.model";
import { CreateEmployeeUseCase } from "@/data/usecases/employee.usecase";

export const useCreateEmployee = (useCase: CreateEmployeeUseCase) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdEmployee, setCreatedEmployee] = useState<Employee | null>(null);

  const create = async (idToken: TokenedRequest, data: CreateEmployeeDto) => {
    setLoading(true);
    try {
      const res = await useCase.execute(idToken, data);
      setCreatedEmployee(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, createdEmployee };
};