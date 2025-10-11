import { BaseResponse } from "../common/base-response";
import { Application } from "./get-application-by-id.model";

export interface AllApplications extends BaseResponse<Application[]>{
    data: Application[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}


