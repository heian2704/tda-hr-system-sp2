import { UpdateWorklogUseCase } from "@/data/usecases/worklog.usecase";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { Worklog } from "@/domain/models/worklog/get-worklog.dto";
import { UpdateWorklogDto } from "@/domain/models/worklog/update-worklog.dto";
import { useState } from "react";

export const useUpdateWorklog = (useCase: UpdateWorklogUseCase) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null> (null);
    const [updatedWorklog, setUpdatedWorklog] = useState<Worklog | null>(null);

    const update = async (idToken: TokenedRequest, updateWorklogDto: UpdateWorklogDto) => {
        setLoading(true);
        try {
            const res = await useCase.execute(idToken, updateWorklogDto);
            setUpdatedWorklog(res);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, updatedWorklog, update };
};