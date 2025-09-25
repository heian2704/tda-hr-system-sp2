import { GetWorklogsByEmployeeIdUseCase } from "@/data/usecases/worklog.usecase";
import { Worklog } from "@/domain/models/worklog/get-worklog.dto";
import { useState } from "react";

export const useGetWorklogsByEmployeeId = (useCase: GetWorklogsByEmployeeIdUseCase) => {
    const [worklogs, setWorklogs] = useState<Worklog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getWorklogsByEmployeeId = async (employeeId: string) => {
        setLoading(true);
        try {
            const result = await useCase.execute(employeeId);
            setWorklogs(result);
        } catch (error) {
            setError("Failed to fetch worklogs");
        } finally {
            setLoading(false);
        }
    };

    return { worklogs, loading, error, getWorklogsByEmployeeId };
};