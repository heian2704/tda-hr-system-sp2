import { AttendanceInterface } from "@/domain/interfaces/attendance/AttendanceInterface";
import { BearerTokenedRequest, TokenedRequest } from "@/domain/models/common/header-param";
import { CreateAttendanceDto } from "@/domain/models/attendance/create-attendance.dto";
import { Attendance } from "@/domain/models/attendance/get-attendance-by-id.model";
import { AllAttendances } from "@/domain/models/attendance/get-all-attendance.model";
import { UpdateAttendanceDto } from "@/domain/models/attendance/update-attendance.dto";
import { apiDeleteRequestsHandler, apiGetRequestsHandler, apiPatchRequestsHandler, apiPostRequestsHandler } from "@/network/api";

export class AttendanceInterfaceImpl implements AttendanceInterface {
    getAllAttendance(): Promise<AllAttendances> {
        return apiGetRequestsHandler<AllAttendances>({
            endpoint: '/attendance'
        });
    }

    getAttendanceById(id: string): Promise<Attendance> {
        return apiGetRequestsHandler<Attendance>({
            endpoint: `/attendance/${id}`
        });
    }

    createAttendance(idToken: BearerTokenedRequest, createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
        return apiPostRequestsHandler<Attendance>({
            endpoint: '/attendance',
            body: createAttendanceDto,
            token: idToken.token
        });
    }

    updateAttendance(idToken: TokenedRequest, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
        return apiPatchRequestsHandler<Attendance>({
            endpoint: `/attendance/${idToken.id}`,
            body: updateAttendanceDto,
            token: idToken.token
        });
    }

    deleteAttendance(idToken: TokenedRequest): Promise<Attendance> {
        return apiDeleteRequestsHandler<Attendance>({
            endpoint: `/attendance/${idToken.id}`,
            token: idToken.token,
        });
    }
}