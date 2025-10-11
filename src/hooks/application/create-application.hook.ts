import { useState } from "react";
import { CreateApplicationDto } from "@/domain/models/application/create-application.dto";
import { BearerTokenedRequest } from "@/domain/models/common/header-param";
import { Application } from "@/domain/models/application/get-application-by-id.model";
import { CreateApplicationUseCase } from "@/data/usecases/application.usecase";

export const useCreateApplication = (useCase: CreateApplicationUseCase) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdApplication, setCreatedApplication] = useState<Application | null>(null);

    const create = async (token: BearerTokenedRequest, data: CreateApplicationDto) => {
        setLoading(true);
        try {
            const res = await useCase.execute(token, data);
            setCreatedApplication(res);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { create, loading, error, createdApplication };
};