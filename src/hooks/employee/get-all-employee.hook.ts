import { GetAllEmployeeUseCase } from "@/data/usecases/employee.usecase";
import { Employee } from "@/domain/models/employee/get-employee.model"
import { useEffect, useState } from "react";

export const useGetAllEmployees = (getAllEmployeeUseCase: GetAllEmployeeUseCase) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true);
                const data = await getAllEmployeeUseCase.execute();
                setEmployees(data);
            } catch(err: any) {
                setError(err.message || "Failed to fetch employees")
            } finally {
                setLoading(false)
            }
        };

        fetchEmployees();
    }, [getAllEmployeeUseCase]);

    return {
        employees,
        loading,
        error
    }
}