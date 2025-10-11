import { useEffect, useState } from "react";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { Attendance } from "@/domain/models/attendance/get-attendance-by-id.model";
import { GetAttendanceByIdUseCase } from "@/data/usecases/attendance.usecase";

export const useGetAttendanceById = (useCase: GetAttendanceByIdUseCase, idToken: TokenedRequest) => {
    const [attendance, setAttendance] = useState<Attendance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        useCase.execute(idToken)
            .then(setAttendance)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [useCase, idToken]);

    return { attendance, loading, error };
};