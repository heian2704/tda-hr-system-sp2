import { BaseResponse } from "../common/base-response";
import { Employee } from "./get-employee.model";

export interface Employees extends BaseResponse<Employee[]> {
    data: Employee[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}