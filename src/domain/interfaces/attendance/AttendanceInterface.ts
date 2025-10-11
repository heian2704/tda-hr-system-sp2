import { CreateAttendanceDto } from "@/domain/models/attendance/create-attendance.dto";
import { AllAttendances } from "@/domain/models/attendance/get-all-attendance.model";
import { Attendance } from "@/domain/models/attendance/get-attendance-by-id.model";
import { UpdateAttendanceDto } from "@/domain/models/attendance/update-attendance.dto";
import { BearerTokenedRequest } from "@/domain/models/common/header-param";

export interface AttendanceInterface {
    getAllAttendance(): Promise<AllAttendances>;
    getAttendanceById(id: string): Promise<Attendance>;
    createAttendance(token: BearerTokenedRequest, createAttendanceDto: CreateAttendanceDto): Promise<Attendance>;
    updateAttendance(idToken: BearerTokenedRequest, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance>;
    deleteAttendance(idToken: BearerTokenedRequest): Promise<Attendance>;
}
