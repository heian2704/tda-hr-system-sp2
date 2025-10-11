import { AttendanceInterface } from "@/domain/interfaces/attendance/AttendanceInterface";
import { BearerTokenedRequest, TokenedRequest } from "@/domain/models/common/header-param";
import { CreateAttendanceDto } from "@/domain/models/attendance/create-attendance.dto";
import { Attendance } from "@/domain/models/attendance/get-attendance-by-id.model";
import { AllAttendances } from "@/domain/models/attendance/get-all-attendance.model";
import { UpdateAttendanceDto } from "@/domain/models/attendance/update-attendance.dto";

export class GetAllAttendanceUseCase {
    constructor(private attendanceInterface: AttendanceInterface) {}

    execute(): Promise<AllAttendances> {
        return this.attendanceInterface.getAllAttendance();
    }
}

export class GetAttendanceByIdUseCase {
    constructor(private attendanceInterface: AttendanceInterface) {}

    execute(idToken: TokenedRequest): Promise<Attendance> {
        return this.attendanceInterface.getAttendanceById(idToken.id);
    }
}

export class CreateAttendanceUseCase {
    constructor(private attendanceInterface: AttendanceInterface){}

    execute(idToken: BearerTokenedRequest, createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
        return this.attendanceInterface.createAttendance(idToken, createAttendanceDto);
    }
}

export class UpdateAttendanceUseCase {
    constructor(private attendanceInterface: AttendanceInterface) {}

    execute(idToken: TokenedRequest, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance> {
        return this.attendanceInterface.updateAttendance(idToken, updateAttendanceDto);
    }
}

export class DeleteAttendanceUseCase {
    constructor(private attendanceInterface: AttendanceInterface) {}

    execute(idToken: TokenedRequest): Promise<Attendance> {
        return this.attendanceInterface.deleteAttendance(idToken);
    }
}
