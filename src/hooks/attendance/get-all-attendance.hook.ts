import { GetAllAttendanceUseCase } from "@/data/usecases/attendance.usecase";
import { AllAttendances } from "@/domain/models/attendance/get-all-attendance.model";
import { useEffect, useState, useCallback } from "react";

export const useGetAllAttendances = (useCase: GetAllAttendanceUseCase) => {
    const [attendances, setAttendances] = useState<AllAttendances | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getAttendances = useCallback(async () => {
        setLoading(true);
        try {
            const res = await useCase.execute();
            setAttendances(res);
            return res;
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : String(err));
            return null;
        } finally {
            setLoading(false);
        }
    }, [useCase]);

    useEffect(() => {
        getAttendances();
    }, [getAttendances]);

    return { attendances, loading, error };
};
