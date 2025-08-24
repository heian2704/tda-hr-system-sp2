import { GetWorklogByIdUseCase } from "@/data/usecases/worklog.usecase";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { Worklog } from "@/domain/models/worklog/get-worklog.dto";
import { useEffect, useState } from "react";

export const useGetWorklogById = (useCase: GetWorklogByIdUseCase, idToken: TokenedRequest) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [worklog, setWorklog] = useState<Worklog | null>(null);

    useEffect(() => {
        useCase.execute(idToken)
        .then(setWorklog)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }, [useCase, idToken]);

    return { loading, error, worklog };
};