import { useState } from "react";
import { CreateAttendanceDto } from "@/domain/models/attendance/create-attendance.dto";
import { BearerTokenedRequest } from "@/domain/models/common/header-param";
import { Attendance } from "@/domain/models/attendance/get-attendance-by-id.model";
import { CreateAttendanceUseCase } from "@/data/usecases/attendance.usecase";

export const useCreateAttendance = (useCase: CreateAttendanceUseCase) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [createdAttendance, setCreatedAttendance] = useState<Attendance | null>(null);

    const create = async (token: BearerTokenedRequest, data: CreateAttendanceDto) => {
        setLoading(true);
        try {
            const res = await useCase.execute(token, data);
            setCreatedAttendance(res);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { create, loading, error, createdAttendance };
};