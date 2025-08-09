import { CreateWorklogUseCase } from "@/data/usecases/worklog.usecase";
import { BearerTokenedRequest } from "@/domain/models/common/header-param";
import { CreateWorklogDto } from "@/domain/models/worklog/create-worklog.dto";
import { Worklog } from "@/domain/models/worklog/get-worklog.dto";
import { useState } from "react";

export const useCreateWorklog = (useCase: CreateWorklogUseCase) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdWorklog, setCreatedWorklog] = useState<Worklog | null>(null);

    const createWorklog = async (token: BearerTokenedRequest, createWorklogDto: CreateWorklogDto) => {
        setLoading(true);
        setError(null);
        try {
            const worklog = await useCase.execute(token, createWorklogDto);
            setCreatedWorklog(worklog);
        } catch (err) {
            setError("Failed to create worklog");
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, createdWorklog, createWorklog };
};