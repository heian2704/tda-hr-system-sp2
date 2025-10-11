import { useState } from "react";
import { TokenedRequest } from "@/domain/models/common/header-param";
import { Attendance } from "@/domain/models/attendance/get-attendance-by-id.model";
import { DeleteAttendanceUseCase } from "@/data/usecases/attendance.usecase";

export const useDeleteAttendance = (useCase: DeleteAttendanceUseCase) => {
    const [loading, setLoading] = useState(false);
    const [deletedAttendance, setDeletedAttendance] = useState<Attendance | null>(null);
    const [error, setError] = useState<string | null>(null);

    const remove = async (idToken: TokenedRequest) => {
        setLoading(true);
        try {
            const res = await useCase.execute(idToken);
            setDeletedAttendance(res);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { remove, loading, error, deletedAttendance };
};