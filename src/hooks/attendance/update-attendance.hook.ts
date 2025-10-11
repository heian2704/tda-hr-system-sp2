import { UpdateAttendanceUseCase } from "@/data/usecases/attendance.usecase";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { UpdateAttendanceDto } from "@/domain/models/attendance/update-attendance.dto";
import { useState } from "react";
import { Attendance } from "@/domain/models/attendance/get-attendance-by-id.model";

export const useUpdateAttendance = (useCase: UpdateAttendanceUseCase) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updatedAttendance, setUpdatedAttendance] = useState<Attendance | null>(null);

    const update = async (idToken: TokenedRequest, dto: UpdateAttendanceDto) => {
        setLoading(true);
        try {
            const res = await useCase.execute(idToken, dto);
            setUpdatedAttendance(res);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { update, loading, error, updatedAttendance };
};