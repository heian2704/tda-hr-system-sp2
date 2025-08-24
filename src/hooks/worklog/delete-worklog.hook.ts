import { DeleteWorklogUseCase } from "@/data/usecases/worklog.usecase";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { Worklog } from "@/domain/models/worklog/get-worklog.dto";
import { useState } from "react";

export const useDeleteWorklog = (useCase: DeleteWorklogUseCase) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deletedWorklog, setDeletedWorklog] = useState<Worklog | null>(null);

    const remove = async (idToken: TokenedRequest) => {
        setLoading(true);
        try {
            const res = await useCase.execute(idToken);
            setDeletedWorklog(res);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, deletedWorklog, remove };
};