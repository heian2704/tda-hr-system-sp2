import { useState } from "react";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { Application } from "@/domain/models/application/get-application-by-id.model";
import { UpdateApplicationStatusUseCase } from "@/data/usecases/application.usecase";
import { UpdateApplicationStatus } from "@/domain/models/application/update-application.dto";

export const useUpdateApplicationStatus = (useCase: UpdateApplicationStatusUseCase) => {
    const [loading, setLoading] = useState(false);
    const [application, setApplication] = useState<Application | null>(null);
    const [error, setError] = useState<string | null>(null);

    const updateStatus = async (idToken: TokenedRequest, status: UpdateApplicationStatus) => {
        setLoading(true);
        try {
            const res = await useCase.execute(idToken, status);
            setApplication(res);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { updateStatus, loading, error, application };
};