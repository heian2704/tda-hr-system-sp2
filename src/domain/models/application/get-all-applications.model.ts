import { BaseResponse } from "../common/base-response";
import { Application } from "./get-application.model";

export interface GetAllApplications extends BaseResponse<Application[]>{
    data: Application[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}


