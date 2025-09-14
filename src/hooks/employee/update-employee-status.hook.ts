import { useState } from "react";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { EmpStatus } from "@/constants/employee-status.enum";
import { Employee } from "@/domain/models/employee/get-employee.model";
import { UpdateEmployeeStatusUseCase } from "@/data/usecases/employee.usecase";
import { UpdateEmpStatus } from "@/domain/models/employee/update-employee.dto";

export const useUpdateEmployeeStatus = (useCase: UpdateEmployeeStatusUseCase) => {
  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (idToken: TokenedRequest, status: UpdateEmpStatus) => {
    setLoading(true);
    try {
      const res = await useCase.execute(idToken, status);
      setEmployee(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading, error, employee };
};