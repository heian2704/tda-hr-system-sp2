import { ITEMS_PER_PAGE } from "@/constants/page-utils";
import { GetAllApplicationUseCase } from "@/data/usecases/application.usecase";
import { AllApplications } from "@/domain/models/application/get-all-applications.model";
import { Application } from "@/domain/models/application/get-application-by-id.model";
import { useEffect, useState, useCallback } from "react";

export const useGetAllApplications = (useCase: GetAllApplicationUseCase) => {
    const [applications, setApplications] = useState<Application[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getApplications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await useCase.execute();
            setApplications(res);
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
        getApplications();
    }, [getApplications]);

    return { applications, loading, error, refetch: getApplications };
};
