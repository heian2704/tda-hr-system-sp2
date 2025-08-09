import { GetAllWorklogUseCase } from "@/data/usecases/worklog.usecase";
import { Worklog } from "@/domain/models/worklog/get-worklog.dto";
import { useEffect, useState } from "react";

export const useGetAllWorklogs = (useCase: GetAllWorklogUseCase) => {
    const [worklogs, setWorklogs] = useState<Worklog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        useCase.execute()
            .then(setWorklogs)
            .catch(setError)
            .finally(() => setLoading(false));
    }, [useCase]);

    return { worklogs, loading, error };
};