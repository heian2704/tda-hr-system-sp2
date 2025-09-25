import { ITEMS_PER_PAGE } from "@/constants/page-utils";
import { GetAllWorklogUseCase } from "@/data/usecases/worklog.usecase";
import { Worklogs } from "@/domain/models/worklog/get-worklogs.dto";
import { useCallback, useEffect, useState } from "react";

export const useGetAllWorklogs = (useCase: GetAllWorklogUseCase) => {
    const defaultWorklogs: Worklogs = { data: [], total: 0, page: 1, limit: ITEMS_PER_PAGE, totalPages: 0 };
    const [worklogs, setWorklogs] = useState<Worklogs>(defaultWorklogs);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

        const getWorklogs = useCallback(async (limit: number, page: number) => {
            setLoading(true);
            try {
                const res = await useCase.execute(limit, page);
                setWorklogs(res);
                return res;
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : String(err));
                return null;
            } finally {
                setLoading(false);
            }
        }, [useCase]);

        useEffect(() => {
            void getWorklogs(ITEMS_PER_PAGE, 1);
        }, [getWorklogs]);

        const refetch = (page = 1, limit = ITEMS_PER_PAGE) => getWorklogs(limit, page);
        return { worklogs, loading, error, refetch };
};