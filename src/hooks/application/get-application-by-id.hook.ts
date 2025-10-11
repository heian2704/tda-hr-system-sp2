import { useEffect, useState } from "react";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { Application } from "@/domain/models/application/get-application-by-id.model";
import { GetApplicationByIdUseCase } from "@/data/usecases/application.usecase";

export const useGetApplicationById = (useCase: GetApplicationByIdUseCase, idToken: TokenedRequest) => {
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        useCase.execute(idToken)
            .then(setApplication)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [useCase, idToken]);

    return { application, loading, error };
};