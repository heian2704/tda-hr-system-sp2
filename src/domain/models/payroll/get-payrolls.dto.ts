import { BaseResponse } from "../common/base-response";
import { Payroll } from "./get-payroll.dto";

export interface Payrolls extends BaseResponse<Payroll[]> {
    data: Payroll[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}