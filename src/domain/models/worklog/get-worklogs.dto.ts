import { BaseResponse } from "../common/base-response";
import { Worklog } from "./get-worklog.dto";

export interface Worklogs extends BaseResponse<Worklog[]> {
    data: Worklog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}