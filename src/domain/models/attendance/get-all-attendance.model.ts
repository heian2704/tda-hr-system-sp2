import { BaseResponse } from "../common/base-response";
import { Attendance } from "./get-attendance-by-id.model";

export interface AllAttendances extends BaseResponse<Attendance[]>{
    data: Attendance[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}